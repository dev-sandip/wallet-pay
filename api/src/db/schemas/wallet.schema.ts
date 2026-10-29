import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  integer,
  varchar,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { user } from './auth.schema.js';

export const walletStatusEnum = pgEnum('wallet_status', [
  'ACTIVE',
  'SUSPENDED',
  'CLOSED',
]);

export const wallets = pgTable(
  'wallets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    currency: varchar('currency', { length: 3 }).notNull().default('NPR'),
    balanceMinor: integer('balance_minor').notNull().default(0),
    status: walletStatusEnum('status').notNull().default('ACTIVE'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    phoneNumber: varchar('phone_number', { length: 20 }).unique().notNull(),
    updatedAt: timestamp('updated_at')
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index('wallet_user_id_idx').on(table.userId)],
);

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(user, {
    fields: [wallets.userId],
    references: [user.id],
  }),
}));

export type Wallet = typeof wallets.$inferSelect;
export type NewWallet = typeof wallets.$inferInsert;
