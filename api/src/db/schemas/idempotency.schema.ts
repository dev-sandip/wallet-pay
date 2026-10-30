import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { user } from './auth.schema.js';
import { transfers } from './transfer.schema.js';

export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: varchar('user_id', { length: 255 })
      .notNull()
      .references(() => user.id),

    scope: varchar('scope', { length: 100 }).notNull(),

    key: varchar('key', { length: 255 }).notNull(),

    requestHash: varchar('request_hash', { length: 64 }).notNull(),

    transferId: uuid('transfer_id').references(() => transfers.id),

    response: jsonb('response'),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),

    expiresAt: timestamp('expires_at', {
      withTimezone: true,
    }),
  },
  (table) => [
    uniqueIndex('idempotency_user_scope_key_unique').on(
      table.userId,
      table.scope,
      table.key,
    ),

    index('idempotency_expires_idx').on(table.expiresAt),
  ],
);

export type IdempotencyKey = typeof idempotencyKeys.$inferSelect;
