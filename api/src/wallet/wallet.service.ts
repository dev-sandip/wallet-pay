import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';

import * as schema from '../db/schema.js';
import { CreateWalletDto } from './dtos/create-wallet.dto.js';

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
}
