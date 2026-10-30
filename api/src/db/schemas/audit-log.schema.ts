import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

import { user } from './auth.schema.js';

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    actorId: varchar('actor_id', { length: 255 }).references(() => user.id, {
      onDelete: 'set null',
    }),

    action: varchar('action', { length: 100 }).notNull(),

    resourceType: varchar('resource_type', {
      length: 100,
    }).notNull(),

    resourceId: varchar('resource_id', {
      length: 255,
    }).notNull(),
    oldValues: jsonb('old_values'),

    newValues: jsonb('new_values'),

    metadata: jsonb('metadata'),

    ipAddress: varchar('ip_address', { length: 45 }),

    userAgent: varchar('user_agent', { length: 500 }),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_actor_created_idx').on(table.actorId, table.createdAt),

    index('audit_logs_resource_idx').on(table.resourceType, table.resourceId),

    index('audit_logs_action_created_idx').on(table.action, table.createdAt),
  ],
);

export type AuditLog = typeof auditLogs.$inferSelect;

export type NewAuditLog = typeof auditLogs.$inferInsert;
