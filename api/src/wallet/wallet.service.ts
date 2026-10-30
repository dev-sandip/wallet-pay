import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, desc, eq, lt, or } from 'drizzle-orm';

import * as schema from '../db/schema.js';
import { CreateWalletDto } from './dtos/create-wallet.dto.js';
import { MoneyUtil } from '../common/utils/money.js';
import {
  TransactionQueryDto,
  TransactionType,
} from './dtos/transaction-query.dto.js';
import { alias } from 'drizzle-orm/pg-core';

@Injectable()
export class WalletService {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async createWallet(
    dto: CreateWalletDto,
    userId: string,
  ): Promise<schema.Wallet> {
    const [existingWallet] = await this.db
      .select({ id: schema.wallets.id })
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId))
      .limit(1);

    if (existingWallet) {
      throw new ConflictException('User already has a wallet');
    }

    try {
      const [newWallet] = await this.db
        .insert(schema.wallets)
        .values({
          userId,
          phoneNumber: dto.phoneNumber,
          currency: dto.currency ?? 'NPR',
        })
        .returning();

      if (!newWallet) {
        throw new InternalServerErrorException('Failed to create wallet');
      }

      return newWallet;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new ConflictException('A wallet or phone number already exists');
      }

      throw error;
    }
  }

  async getUserWallet(userId: string): Promise<schema.Wallet[]> {
    return this.db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId));
  }

  async getWalletById(walletId: string): Promise<schema.Wallet | null> {
    const [wallet] = await this.db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.id, walletId))
      .limit(1);

    return wallet ?? null;
  }

  async getWalletByPhoneNumber(
    phoneNumber: string,
  ): Promise<schema.Wallet | null> {
    const [wallet] = await this.db
      .select()
      .from(schema.wallets)
      .where(eq(schema.wallets.phoneNumber, phoneNumber))
      .limit(1);

    return wallet ?? null;
  }

  async deleteWallet(walletId: string, userId: string): Promise<void> {
    const [deletedWallet] = await this.db
      .delete(schema.wallets)
      .where(
        and(eq(schema.wallets.id, walletId), eq(schema.wallets.userId, userId)),
      )
      .returning({ id: schema.wallets.id });

    if (!deletedWallet) {
      throw new NotFoundException(
        'Wallet not found or does not belong to this user',
      );
    }
  }

  async getBalance(phoneNumber: string, userId: string) {
    const [wallet] = await this.db
      .select({
        balance: schema.wallets.balanceMinor,
        currency: schema.wallets.currency,
      })
      .from(schema.wallets)
      .where(
        and(
          eq(schema.wallets.phoneNumber, phoneNumber),
          eq(schema.wallets.userId, userId),
        ),
      )
      .limit(1);

    if (!wallet) {
      throw new NotFoundException(
        'Wallet not found or does not belong to this user',
      );
    }

    return {
      balanceMinor: wallet.balance,
      balance: MoneyUtil.toRupees(wallet.balance),
      currency: wallet.currency,
      formattedBalance: MoneyUtil.formatNPR(wallet.balance),
    };
  }

  async getRecentTransactions(userId: string, query: TransactionQueryDto) {
    interface TransactionCursor {
      id: string;
      createdAt: string;
    }
    const limit = query.limit ?? 10;

    const [wallet] = await this.db
      .select({
        id: schema.wallets.id,
      })
      .from(schema.wallets)
      .where(eq(schema.wallets.userId, userId))
      .limit(1);

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    let cursor: TransactionCursor | undefined;

    if (query.cursor) {
      try {
        const decoded = Buffer.from(query.cursor, 'base64url').toString('utf8');

        const parsed: unknown = JSON.parse(decoded);

        if (
          typeof parsed !== 'object' ||
          parsed === null ||
          !('id' in parsed) ||
          !('createdAt' in parsed) ||
          typeof parsed.id !== 'string' ||
          typeof parsed.createdAt !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            parsed.id,
          ) ||
          Number.isNaN(Date.parse(parsed.createdAt))
        ) {
          throw new Error('Invalid cursor');
        }

        cursor = {
          id: parsed.id,
          createdAt: parsed.createdAt,
        };
      } catch {
        throw new BadRequestException('Invalid transaction cursor');
      }
    }

    const senderWallet = alias(schema.wallets, 'sender_wallet');

    const receiverWallet = alias(schema.wallets, 'receiver_wallet');

    const senderUser = alias(schema.user, 'sender_user');

    const receiverUser = alias(schema.user, 'receiver_user');

    const conditions = [];

    if (query.type === TransactionType.SENT) {
      conditions.push(eq(schema.transfers.senderWalletId, wallet.id));
    } else if (query.type === TransactionType.RECEIVED) {
      conditions.push(eq(schema.transfers.receiverWalletId, wallet.id));
    } else {
      conditions.push(
        or(
          eq(schema.transfers.senderWalletId, wallet.id),
          eq(schema.transfers.receiverWalletId, wallet.id),
        )!,
      );
    }

    if (cursor) {
      const cursorDate = new Date(cursor.createdAt);

      conditions.push(
        or(
          lt(schema.transfers.createdAt, cursorDate),
          and(
            eq(schema.transfers.createdAt, cursorDate),
            lt(schema.transfers.id, cursor.id),
          ),
        )!,
      );
    }
    try {
      const rows = await this.db
        .select({
          id: schema.transfers.id,

          senderWalletId: schema.transfers.senderWalletId,
          receiverWalletId: schema.transfers.receiverWalletId,

          amountMinor: schema.transfers.amountMinor,
          status: schema.transfers.status,
          createdAt: schema.transfers.createdAt,

          senderName: senderUser.name,
          senderPhoneNumber: senderWallet.phoneNumber,
          senderCurrency: senderWallet.currency,

          receiverName: receiverUser.name,
          receiverPhoneNumber: receiverWallet.phoneNumber,
          receiverCurrency: receiverWallet.currency,
        })
        .from(schema.transfers)

        .innerJoin(
          senderWallet,
          eq(schema.transfers.senderWalletId, senderWallet.id),
        )

        .innerJoin(
          receiverWallet,
          eq(schema.transfers.receiverWalletId, receiverWallet.id),
        )

        .innerJoin(senderUser, eq(senderWallet.userId, senderUser.id))

        .innerJoin(receiverUser, eq(receiverWallet.userId, receiverUser.id))

        .where(and(...conditions))

        .orderBy(desc(schema.transfers.createdAt), desc(schema.transfers.id))

        .limit(limit + 1);

      const hasMore = rows.length > limit;

      const transactions = rows.slice(0, limit);

      const data = transactions.map((transaction) => {
        const isSender = transaction.senderWalletId === wallet.id;

        return {
          id: transaction.id,

          type: isSender ? 'SENT' : 'RECEIVED',

          amountMinor: transaction.amountMinor,

          currency: isSender
            ? transaction.senderCurrency
            : transaction.receiverCurrency,

          status: transaction.status,

          counterparty: {
            name: isSender ? transaction.receiverName : transaction.senderName,

            phoneNumber: isSender
              ? transaction.receiverPhoneNumber
              : transaction.senderPhoneNumber,
          },

          createdAt: transaction.createdAt,
        };
      });

      const lastTransaction = transactions[transactions.length - 1];

      const nextCursor =
        hasMore && lastTransaction
          ? Buffer.from(
              JSON.stringify({
                id: lastTransaction.id,
                createdAt: lastTransaction.createdAt.toISOString(),
              }),
            ).toString('base64url')
          : null;

      return {
        //dont pass the data objeect instead pass the transactions array directly to avoid confusion with the pagination object

        data,

        pagination: {
          limit,
          hasMore,
          nextCursor,
        },
      };
    } catch (error) {
      console.error('Error fetching recent transactions:', error);

      throw new InternalServerErrorException(
        'Failed to fetch recent transactions',
      );
    }
  }
}
