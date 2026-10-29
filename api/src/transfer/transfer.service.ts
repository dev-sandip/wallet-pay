import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { ApiTags } from '@nestjs/swagger';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq, gte, sql } from 'drizzle-orm';
import * as schema from '../db/schema.js';
import { TransferFundsDto } from '../transfer/dtos/transfer-funds.dto.js';
import { MoneyUtil } from '../common/utils/money.js';

@Injectable()
@ApiTags('Transfers')
export class TransferService {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async transferFunds(
    dto: TransferFundsDto,
    senderUserId: string,
  ): Promise<schema.Transfer> {
    const { receiverPhoneNumber, amount } = dto;
    const amountMinor = MoneyUtil.toPaisa(amount);

    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      throw new BadRequestException(
        'Transfer amount must be a positive integer',
      );
    }

    return this.db.transaction(async (tx) => {
      const [senderWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.userId, senderUserId))
        .limit(1);

      if (!senderWallet) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Find the recipient using their phone number.
      const [receiverWallet] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.phoneNumber, receiverPhoneNumber))
        .limit(1);

      if (!receiverWallet) {
        throw new NotFoundException('No wallet found for this phone number');
      }

      if (senderWallet.id === receiverWallet.id) {
        throw new BadRequestException('You cannot transfer money to yourself');
      }

      // Debit atomically to prevent concurrent overspending.
      const [debitedWallet] = await tx
        .update(schema.wallets)
        .set({
          balanceMinor: sql`
            ${schema.wallets.balanceMinor} - ${amountMinor}
          `,
        })
        .where(
          and(
            eq(schema.wallets.id, senderWallet.id),
            gte(schema.wallets.balanceMinor, amountMinor),
          ),
        )
        .returning({ id: schema.wallets.id });

      if (!debitedWallet) {
        throw new BadRequestException('Insufficient balance');
      }

      // Credit the recipient. Failure rolls back the debit.
      const [creditedWallet] = await tx
        .update(schema.wallets)
        .set({
          balanceMinor: sql`
            ${schema.wallets.balanceMinor} + ${amountMinor}
          `,
        })
        .where(eq(schema.wallets.id, receiverWallet.id))
        .returning({ id: schema.wallets.id });

      if (!creditedWallet) {
        throw new NotFoundException('Receiver wallet not found');
      }

      // Record the completed transfer.
      const [transfer] = await tx
        .insert(schema.transfers)
        .values({
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amountMinor,
          status: 'COMPLETED',
        })
        .returning();
      return transfer;
    });
  }
}
