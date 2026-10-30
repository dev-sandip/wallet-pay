import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  bigint,
  timestamp,
  pgEnum,
  index,
  check,
} from 'drizzle-orm/pg-core';

import { wallets } from './wallet.schema.js';
import { transfers } from './transfer.schema.js';

export const ledgerEntryType = pgEnum('ledger_entry_type', ['DEBIT', 'CREDIT']);

export const ledgerTransactions = pgTable('ledger_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),

  transferId: uuid('transfer_id')
    .notNull()
    .unique()
    .references(() => transfers.id),

  reference: varchar('reference', { length: 100 }).notNull().unique(),

  description: varchar('description', { length: 255 }),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),
});

export const ledgerEntries = pgTable(
  'ledger_entries',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    transactionId: uuid('transaction_id')
      .notNull()
      .references(() => ledgerTransactions.id),

    walletId: uuid('wallet_id')
      .notNull()
      .references(() => wallets.id),

    type: ledgerEntryType('type').notNull(),

    amountMinor: bigint('amount_minor', {
      mode: 'bigint',
    }).notNull(),

    currency: varchar('currency', { length: 3 }).notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('ledger_entries_wallet_created_idx').on(
      table.walletId,
      table.createdAt,
    ),

    index('ledger_entries_transaction_idx').on(table.transactionId),

    check('ledger_entries_amount_positive', sql`${table.amountMinor} > 0`),
  ],
);

export const ledgerTransactionsRelations = relations(
  ledgerTransactions,
  ({ one, many }) => ({
    transfer: one(transfers, {
      fields: [ledgerTransactions.transferId],
      references: [transfers.id],
    }),

    entries: many(ledgerEntries),
  }),
);

export const ledgerEntriesRelations = relations(ledgerEntries, ({ one }) => ({
  transaction: one(ledgerTransactions, {
    fields: [ledgerEntries.transactionId],
    references: [ledgerTransactions.id],
  }),

  wallet: one(wallets, {
    fields: [ledgerEntries.walletId],
    references: [wallets.id],
  }),
}));

export type LedgerTransaction = typeof ledgerTransactions.$inferSelect;

export type NewLedgerTransaction = typeof ledgerTransactions.$inferInsert;

export type LedgerEntry = typeof ledgerEntries.$inferSelect;

export type NewLedgerEntry = typeof ledgerEntries.$inferInsert;
