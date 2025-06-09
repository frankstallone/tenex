import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'
import { Anomaly } from '../parsers/zscaler'

export const logs = pgTable('logs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  totalRecords: integer('total_records').notNull(),
  anomalies: jsonb('anomalies').$type<Anomaly[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
