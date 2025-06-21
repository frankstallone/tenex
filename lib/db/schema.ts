import {
  pgTable,
  serial,
  varchar,
  integer,
  jsonb,
  timestamp,
} from 'drizzle-orm/pg-core'
import { Anomaly, LogAnalysisResult } from '../parsers/zscaler'

export const analysisResults = pgTable('analysis_results', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 256 }).notNull(),
  totalRecords: integer('total_records').notNull(),
  anomaliesSummary: jsonb('anomalies_summary').$type<Anomaly[]>().default([]),
  analysisResult: jsonb('analysis_result').$type<LogAnalysisResult>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
