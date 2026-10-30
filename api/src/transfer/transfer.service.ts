import { createHash } from 'node:crypto';

import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectDrizzle } from '@nestjs/drizzle';

import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import { and, asc, eq, gte, inArray, sql } from 'drizzle-orm';

import * as schema from '../db/schema.js';

import { TransferFundsDto } from '../transfer/dtos/transfer-funds.dto.js';
import { MoneyUtil } from '../common/utils/money.js';

interface TransferContext {
  idempotencyKey: string;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class TransferService {
  constructor(
    @InjectDrizzle()
    private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async transferFunds(
    dto: TransferFundsDto,
    senderUserId: string,
    context: TransferContext,
  ): Promise<schema.Transfer> {
    const { receiverPhoneNumber, amount } = dto;

    // 1. Validate amount.
    // Convert the user-facing amount into the smallest currency unit.
    const amountMinor = MoneyUtil.toPaisa(amount);

    // Reject zero, negative, unsafe, or otherwise invalid amounts.
    if (!Number.isSafeInteger(amountMinor) || amountMinor <= 0) {
      throw new BadRequestException(
        'Transfer amount must be a positive integer',
      );
    }

    // 2. Validate idempotency key.
    // Extract request metadata before entering the database transaction.
    const { idempotencyKey, ipAddress, userAgent } = context;

    // Require a bounded idempotency key for safe request retries.
    if (!idempotencyKey || idempotencyKey.length > 255) {
      throw new BadRequestException(
        'A valid Idempotency-Key header is required',
      );
    }

    // 3. Hash the request payload.
    // Bind the idempotency key to the recipient and exact minor-unit amount.
    const requestHash = createHash('sha256')
      .update(
        JSON.stringify({
          receiverPhoneNumber,
          amountMinor,
        }),
      )
      .digest('hex');

    // Keep all balance, ledger, audit, and idempotency changes atomic.
    return this.db.transaction(async (tx) => {
      /**
       * Idempotency flow:
       * 1. Create an idempotency record for this request.
       * 2. If the key already exists, verify that its payload matches.
       * 3. Return the original transfer for a matching completed request.
       * 4. Continue with the transfer only for a new idempotency key.
       */

      const [newIdempotencyKey] = await tx
        .insert(schema.idempotencyKeys)
        .values({
          userId: senderUserId,
          scope: 'CREATE_TRANSFER',
          key: idempotencyKey,
          requestHash,
        })
        .onConflictDoNothing({
          target: [
            schema.idempotencyKeys.userId,
            schema.idempotencyKeys.scope,
            schema.idempotencyKeys.key,
          ],
        })
        .returning({
          id: schema.idempotencyKeys.id,
        });

      // Existing request: return the original transfer.
      if (!newIdempotencyKey) {
        // Load the existing record for this user, scope, and key combination.
        const [existingKey] = await tx
          .select()
          .from(schema.idempotencyKeys)
          .where(
            and(
              eq(schema.idempotencyKeys.userId, senderUserId),
              eq(schema.idempotencyKeys.scope, 'CREATE_TRANSFER'),
              eq(schema.idempotencyKeys.key, idempotencyKey),
            ),
          )
          .limit(1);

        // A conflict without a record indicates an unresolved concurrent request.
        if (!existingKey) {
          throw new ConflictException('Unable to resolve idempotency request');
        }

        // Prevent reusing a key for a different transfer payload.
        if (existingKey.requestHash !== requestHash) {
          throw new ConflictException(
            'Idempotency key reused with different payload',
          );
        }

        // Only completed requests can return an original transfer.
        if (!existingKey.transferId) {
          throw new ConflictException(
            'Previous transfer has no completed result',
          );
        }

        // Fetch the transfer stored by the original request.
        const [existingTransfer] = await tx
          .select()
          .from(schema.transfers)
          .where(eq(schema.transfers.id, existingKey.transferId))
          .limit(1);

        if (!existingTransfer) {
          throw new NotFoundException('Original transfer not found');
        }

        // Return the same result for an idempotent retry.
        return existingTransfer;
      }
      /**
       * Wallet validation flow:
       * 1. Find the sender and receiver wallets.
       * 2. Reject self-transfers and missing wallets.
       * 3. Lock both wallets in a consistent order.
       * 4. Validate status, currency, and available balance.
       */

      const [sender] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.userId, senderUserId))
        .limit(1);

      // Stop when the authenticated sender has no wallet.
      if (!sender) {
        throw new NotFoundException('Sender wallet not found');
      }

      const [receiver] = await tx
        .select()
        .from(schema.wallets)
        .where(eq(schema.wallets.phoneNumber, receiverPhoneNumber))
        .limit(1);

      // Stop when the recipient phone number is not linked to a wallet.
      if (!receiver) {
        throw new NotFoundException('No wallet found for this phone number');
      }

      // Prevent debiting and crediting the same wallet.
      if (sender.id === receiver.id) {
        throw new BadRequestException('You cannot transfer money to yourself');
      }

      // Always lock wallets in ID order so concurrent transfers reduce deadlock risk.
      // Sorting ensures competing transfers acquire locks consistently.
      const walletIds = [sender.id, receiver.id].sort();

      // Lock both wallet rows before validating balances or changing them.
      const lockedWallets = await tx
        .select()
        .from(schema.wallets)
        .where(inArray(schema.wallets.id, walletIds))
        .orderBy(asc(schema.wallets.id))
        .for('update');

      // Locate the locked sender and recipient rows.
      const senderWallet = lockedWallets.find(
        (wallet) => wallet.id === sender.id,
      );

      const receiverWallet = lockedWallets.find(
        (wallet) => wallet.id === receiver.id,
      );

      // Ensure both requested wallet rows were successfully locked.
      if (!senderWallet || !receiverWallet) {
        throw new NotFoundException('Sender or receiver wallet not found');
      }

      // Reconfirm ownership using the locked row.
      if (senderWallet.userId !== senderUserId) {
        throw new NotFoundException('Sender wallet not found');
      }

      // Transfers require two active wallets.
      if (
        senderWallet.status !== 'ACTIVE' ||
        receiverWallet.status !== 'ACTIVE'
      ) {
        throw new BadRequestException('One or both wallets are inactive');
      }

      // Both wallets must use the same currency.
      if (senderWallet.currency !== receiverWallet.currency) {
        throw new BadRequestException('Wallet currencies do not match');
      }

      // Check the locked sender balance before attempting the debit.
      if (senderWallet.balanceMinor < amountMinor) {
        throw new BadRequestException('Insufficient balance');
      }

      // Atomically debit only if the sender still has sufficient funds.
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
        .returning({
          id: schema.wallets.id,
        });

      // Treat a failed conditional update as an insufficient-balance error.
      if (!debitedWallet) {
        throw new BadRequestException('Insufficient balance');
      }

      // Credit the recipient within the same transaction.
      const [creditedWallet] = await tx
        .update(schema.wallets)
        .set({
          balanceMinor: sql`
            ${schema.wallets.balanceMinor} + ${amountMinor}
          `,
        })
        .where(eq(schema.wallets.id, receiverWallet.id))
        .returning({
          id: schema.wallets.id,
        });

      // Ensure the recipient row was updated.
      if (!creditedWallet) {
        throw new NotFoundException('Receiver wallet not found');
      }

      // Record the completed transfer between the two wallet IDs.
      const [transfer] = await tx
        .insert(schema.transfers)
        .values({
          senderWalletId: senderWallet.id,
          receiverWalletId: receiverWallet.id,
          amountMinor,
          status: 'COMPLETED',
        })
        .returning();

      // Create the double-entry ledger transaction for this transfer.
      const [ledgerTransaction] = await tx
        .insert(schema.ledgerTransactions)
        .values({
          transferId: transfer.id,
          reference: `TRANSFER-${transfer.id}`,
          description: 'Wallet to wallet transfer',
        })
        .returning();

      // Add matching debit and credit entries for the transferred amount.
      await tx.insert(schema.ledgerEntries).values([
        {
          transactionId: ledgerTransaction.id,
          walletId: senderWallet.id,
          type: 'DEBIT',
          amountMinor: BigInt(amountMinor),
          currency: senderWallet.currency,
        },
        {
          transactionId: ledgerTransaction.id,
          walletId: receiverWallet.id,
          type: 'CREDIT',
          amountMinor: BigInt(amountMinor),
          currency: receiverWallet.currency,
        },
      ]);

      // Record balances and request metadata for auditability.
      await tx.insert(schema.auditLogs).values({
        actorId: senderUserId,
        action: 'TRANSFER_COMPLETED',
        resourceType: 'TRANSFER',
        resourceId: transfer.id,

        oldValues: {
          senderBalanceMinor: senderWallet.balanceMinor.toString(),
          receiverBalanceMinor: receiverWallet.balanceMinor.toString(),
        },

        newValues: {
          senderBalanceMinor: (
            senderWallet.balanceMinor - amountMinor
          ).toString(),

          receiverBalanceMinor: (
            receiverWallet.balanceMinor + amountMinor
          ).toString(),
        },

        metadata: {
          amountMinor,
          currency: senderWallet.currency,
          receiverPhoneNumber,
          ledgerTransactionId: ledgerTransaction.id,
        },

        ipAddress,
        userAgent,
      });

      // Link the idempotency record to the completed transfer.
      await tx
        .update(schema.idempotencyKeys)
        .set({
          transferId: transfer.id,
        })
        .where(eq(schema.idempotencyKeys.id, newIdempotencyKey.id));

      // Return the newly created transfer to the caller.
      return transfer;
    });
  }
}
