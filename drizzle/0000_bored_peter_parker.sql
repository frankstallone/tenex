CREATE TABLE "analysis_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"total_records" integer NOT NULL,
	"anomalies_summary" jsonb DEFAULT '[]'::jsonb,
	"analysis_result" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
