import {
  pgTable,
  text,
  jsonb,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * ClassiMed relational schema.
 *
 * This file defines the persistent data model used by the app and exports
 * both table definitions and inferred TypeScript types.
 *
 * Convention notes:
 * - All IDs are text to support readable slugs and UUIDs.
 * - Most relations use ON DELETE CASCADE to keep derived records consistent.
 * - Timestamps use timezone-aware columns.
 */

// ── Documents ────────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  // Stable document identifier (slug or UUID).
  id: text("id").primaryKey(),
  // Source title in Chinese (for example, 黃帝內經).
  title: text("title").notNull(),
  // Optional French title used in library cards and exports.
  titleFr: text("title_fr"),
  // Historical period label (for example, Han occidentaux).
  period: text("period"),
  // Document category: canon, manuscript, commentary, etc.
  type: text("type").notNull().default("canon"),
  // User-defined tags for filtering in the library UI.
  tags: text("tags").array().notNull().default([]),
  // Approximate page count for metadata display.
  pages: integer("pages").notNull().default(0),
  // Lifecycle status in the user workspace.
  status: text("status").notNull().default("active"),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last update timestamp.
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ── Segments ─────────────────────────────────────────────────────────────────

export const segments = pgTable("segments", {
  // Stable segment identifier.
  id: text("id").primaryKey(),
  // Parent document owning this segment.
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  // 1-based order of the segment inside the document.
  position: integer("position").notNull(),
  // Language variety detected or assigned by user: classical, modern, french.
  lang: text("lang").notNull(),
  // Confidence score associated with detection or segmentation.
  confidence: real("confidence").notNull().default(1.0),
  // Original source text (column A).
  srcText: text("src_text").notNull(),
  // AI or user-edited modern Chinese gloss (column B).
  glossText: text("gloss_text"),
  // AI or user-edited French translation (column C).
  frText: text("fr_text"),
  // Marks editorial annotation-style rows in the text flow.
  isAnnotation: boolean("is_annotation").notNull().default(false),
  // Marks rows that require follow-up review.
  isFlagged: boolean("is_flagged").notNull().default(false),
  // Optional note explaining why the segment was flagged.
  flagReason: text("flag_reason"),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last update timestamp.
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

// ── Glossary terms ────────────────────────────────────────────────────────────

export const glossaryTerms = pgTable("glossary_terms", {
  // Stable term identifier.
  id: text("id").primaryKey(),
  // Chinese form of the term. Unique so one canonical entry exists per spelling.
  char: text("char").notNull().unique(),
  // Pinyin representation used for search and display.
  pinyin: text("pinyin").notNull(),
  // Domain category used for filtering and visual badges.
  category: text("category").notNull(),
  // Alternative French renderings.
  fr: text("fr").array().notNull().default([]),
  // Preferred French rendering to enforce consistency.
  frPrimary: text("fr_primary").notNull(),
  // Structured reference translations (author -> rendering).
  refs: jsonb("refs").$type<Record<string, string>>(),
  // Freeform user notes (etymology, usage, caveats).
  note: text("note"),
  // True if bundled with initial seed data.
  isPreseeded: boolean("is_preseeded").notNull().default(false),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last update timestamp.
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;

// ── French translations (one per rendering, multiple per term) ────────────────

export const termFrTranslations = pgTable("term_fr_translations", {
  // Stable translation row identifier.
  id: text("id").primaryKey(),
  // Parent glossary term.
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  // One concrete French rendering for the term.
  frText: text("fr_text").notNull(),
  // Optional guidance describing preferred context of use.
  contextNote: text("context_note"),
  // Ordering index for deterministic display.
  displayOrder: integer("display_order").notNull().default(0),
});

export type TermFrTranslation = typeof termFrTranslations.$inferSelect;
export type InsertTermFrTranslation = typeof termFrTranslations.$inferInsert;

// ── Reference translations (Larre, Husson, Andrès…) ──────────────────────────

export const termReferences = pgTable("term_references", {
  // Stable reference row identifier.
  id: text("id").primaryKey(),
  // Parent glossary term.
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  // Reference source key (for example Larre, Husson).
  authorKey: text("author_key").notNull(),
  // Rendering used by the referenced author/source.
  translation: text("translation").notNull(),
});

export type TermReference = typeof termReferences.$inferSelect;
export type InsertTermReference = typeof termReferences.$inferInsert;

// ── Term occurrences (segment × glossary term) ────────────────────────────────

export const termOccurrences = pgTable("term_occurrences", {
  // Stable occurrence identifier.
  id: text("id").primaryKey(),
  // Segment where the term appears.
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  // Glossary term detected in the segment.
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  // Rendering actually used in French output for this occurrence.
  frRendering: text("fr_rendering"),
  // True when rendering conflicts with the preferred glossary convention.
  hasConflict: boolean("has_conflict").notNull().default(false),
});

export type TermOccurrence = typeof termOccurrences.$inferSelect;
export type InsertTermOccurrence = typeof termOccurrences.$inferInsert;

// ── Annotations (margin notes) ────────────────────────────────────────────────

export const annotations = pgTable("annotations", {
  // Stable annotation identifier.
  id: text("id").primaryKey(),
  // Segment receiving this margin note.
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  // Annotation body text.
  text: text("text").notNull(),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  // Last update timestamp.
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = typeof annotations.$inferInsert;

// ── Review queue ──────────────────────────────────────────────────────────────

export const reviewQueue = pgTable("review_queue", {
  // Stable queue item identifier.
  id: text("id").primaryKey(),
  // Segment under review.
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  // Parent document, denormalized for fast queue listing.
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  // Optional reason or context entered by the user.
  note: text("note"),
  // Resolution timestamp. Null means the item is still open.
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewQueueItem = typeof reviewQueue.$inferSelect;
export type InsertReviewQueueItem = typeof reviewQueue.$inferInsert;

// ── Legacy tasks table (kept for existing TodoPage) ───────────────────────────

export const tasks = pgTable("tasks", {
  // Stable task identifier.
  id: text("id").primaryKey(),
  // Task title shown in the legacy Todo page.
  title: text("title").notNull(),
  // Completion state.
  completed: boolean("completed").notNull().default(false),
  // Creation timestamp.
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;

export const schema = {
  // Keep this export in sync with tables needed by boot/migrations.
  glossaryTerms,
}