import {
  pgTable,
  timestamp,
  uuid,
  varchar,
  integer,
  pgEnum,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';
import { wallets } from './wallet.schema.js';

export const transferStatus = pgEnum('transfer_status', [
  'PENDING',
  'COMPLETED',
  'FAILED',
]);

export const transfers = pgTable(
  'transfers',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    senderWalletId: varchar('sender_wallet_id', {
      length: 255,
    })
      .notNull()
      .references(() => wallets.id),

    receiverWalletId: varchar('receiver_wallet_id', {
      length: 255,
    })
      .notNull()
      .references(() => wallets.id),

    amountMinor: integer('amount_minor').notNull(),

    status: transferStatus('status').notNull().default('PENDING'),

    createdAt: timestamp('created_at').notNull().defaultNow(),

    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index('transfers_sender_created_idx').on(
      table.senderWalletId,
      table.createdAt,
    ),

    index('transfers_receiver_created_idx').on(
      table.receiverWalletId,
      table.createdAt,
    ),

    index('transfers_status_created_idx').on(table.status, table.createdAt),

    check('transfers_amount_positive', sql`${table.amountMinor} > 0`),

    check(
      'transfers_different_wallets',
      sql`${table.senderWalletId} <> ${table.receiverWalletId}`,
    ),
  ],
);

export const transfersRelations = relations(transfers, ({ one }) => ({
  sender: one(wallets, {
    fields: [transfers.senderWalletId],
    references: [wallets.id],
    relationName: 'sentTransfers',
  }),

  receiver: one(wallets, {
    fields: [transfers.receiverWalletId],
    references: [wallets.id],
    relationName: 'receivedTransfers',
  }),
}));

export type Transfer = typeof transfers.$inferSelect;
export type NewTransfer = typeof transfers.$inferInsert;
