ALTER TABLE "glossary_terms" ADD COLUMN "fr" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "glossary_terms" ADD COLUMN "refs" jsonb;--> statement-breakpoint
ALTER TABLE "glossary_terms" ADD COLUMN "note" text;--> statement-breakpoint
ALTER TABLE "glossary_terms" DROP COLUMN "notes";