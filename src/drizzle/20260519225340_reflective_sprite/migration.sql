CREATE TABLE "annotations" (
	"id" text PRIMARY KEY,
	"segment_id" text NOT NULL,
	"text" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"title_fr" text,
	"period" text,
	"type" text DEFAULT 'canon' NOT NULL,
	"tags" text[] DEFAULT '{}'::text[] NOT NULL,
	"pages" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" text PRIMARY KEY,
	"char" text NOT NULL UNIQUE,
	"pinyin" text NOT NULL,
	"category" text NOT NULL,
	"fr_primary" text NOT NULL,
	"notes" text,
	"is_preseeded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "review_queue" (
	"id" text PRIMARY KEY,
	"segment_id" text NOT NULL,
	"document_id" text NOT NULL,
	"note" text,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "segments" (
	"id" text PRIMARY KEY,
	"document_id" text NOT NULL,
	"position" integer NOT NULL,
	"lang" text NOT NULL,
	"confidence" real DEFAULT 1 NOT NULL,
	"src_text" text NOT NULL,
	"gloss_text" text,
	"fr_text" text,
	"is_annotation" boolean DEFAULT false NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"flag_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term_fr_translations" (
	"id" text PRIMARY KEY,
	"term_id" text NOT NULL,
	"fr_text" text NOT NULL,
	"context_note" text,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term_occurrences" (
	"id" text PRIMARY KEY,
	"segment_id" text NOT NULL,
	"term_id" text NOT NULL,
	"fr_rendering" text,
	"has_conflict" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term_references" (
	"id" text PRIMARY KEY,
	"term_id" text NOT NULL,
	"author_key" text NOT NULL,
	"translation" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "annotations" ADD CONSTRAINT "annotations_segment_id_segments_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_segment_id_segments_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "review_queue" ADD CONSTRAINT "review_queue_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "segments" ADD CONSTRAINT "segments_document_id_documents_id_fkey" FOREIGN KEY ("document_id") REFERENCES "documents"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "term_fr_translations" ADD CONSTRAINT "term_fr_translations_term_id_glossary_terms_id_fkey" FOREIGN KEY ("term_id") REFERENCES "glossary_terms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "term_occurrences" ADD CONSTRAINT "term_occurrences_segment_id_segments_id_fkey" FOREIGN KEY ("segment_id") REFERENCES "segments"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "term_occurrences" ADD CONSTRAINT "term_occurrences_term_id_glossary_terms_id_fkey" FOREIGN KEY ("term_id") REFERENCES "glossary_terms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "term_references" ADD CONSTRAINT "term_references_term_id_glossary_terms_id_fkey" FOREIGN KEY ("term_id") REFERENCES "glossary_terms"("id") ON DELETE CASCADE;