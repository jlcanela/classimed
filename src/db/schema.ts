import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

// ── Documents ────────────────────────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  titleFr: text("title_fr"),
  period: text("period"),
  type: text("type").notNull().default("canon"),
  tags: text("tags").array().notNull().default([]),
  pages: integer("pages").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// ── Segments ─────────────────────────────────────────────────────────────────

export const segments = pgTable("segments", {
  id: text("id").primaryKey(),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  lang: text("lang").notNull(),
  confidence: real("confidence").notNull().default(1.0),
  srcText: text("src_text").notNull(),
  glossText: text("gloss_text"),
  frText: text("fr_text"),
  isAnnotation: boolean("is_annotation").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  flagReason: text("flag_reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

// ── Glossary terms ────────────────────────────────────────────────────────────

export const glossaryTerms = pgTable("glossary_terms", {
  id: text("id").primaryKey(),
  char: text("char").notNull().unique(),
  pinyin: text("pinyin").notNull(),
  category: text("category").notNull(),
  frPrimary: text("fr_primary").notNull(),
  notes: text("notes"),
  isPreseeded: boolean("is_preseeded").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type GlossaryTerm = typeof glossaryTerms.$inferSelect;
export type InsertGlossaryTerm = typeof glossaryTerms.$inferInsert;

// ── French translations (one per rendering, multiple per term) ────────────────

export const termFrTranslations = pgTable("term_fr_translations", {
  id: text("id").primaryKey(),
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  frText: text("fr_text").notNull(),
  contextNote: text("context_note"),
  displayOrder: integer("display_order").notNull().default(0),
});

export type TermFrTranslation = typeof termFrTranslations.$inferSelect;
export type InsertTermFrTranslation = typeof termFrTranslations.$inferInsert;

// ── Reference translations (Larre, Husson, Andrès…) ──────────────────────────

export const termReferences = pgTable("term_references", {
  id: text("id").primaryKey(),
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  authorKey: text("author_key").notNull(),
  translation: text("translation").notNull(),
});

export type TermReference = typeof termReferences.$inferSelect;
export type InsertTermReference = typeof termReferences.$inferInsert;

// ── Term occurrences (segment × glossary term) ────────────────────────────────

export const termOccurrences = pgTable("term_occurrences", {
  id: text("id").primaryKey(),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  termId: text("term_id")
    .notNull()
    .references(() => glossaryTerms.id, { onDelete: "cascade" }),
  frRendering: text("fr_rendering"),
  hasConflict: boolean("has_conflict").notNull().default(false),
});

export type TermOccurrence = typeof termOccurrences.$inferSelect;
export type InsertTermOccurrence = typeof termOccurrences.$inferInsert;

// ── Annotations (margin notes) ────────────────────────────────────────────────

export const annotations = pgTable("annotations", {
  id: text("id").primaryKey(),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Annotation = typeof annotations.$inferSelect;
export type InsertAnnotation = typeof annotations.$inferInsert;

// ── Review queue ──────────────────────────────────────────────────────────────

export const reviewQueue = pgTable("review_queue", {
  id: text("id").primaryKey(),
  segmentId: text("segment_id")
    .notNull()
    .references(() => segments.id, { onDelete: "cascade" }),
  documentId: text("document_id")
    .notNull()
    .references(() => documents.id, { onDelete: "cascade" }),
  note: text("note"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ReviewQueueItem = typeof reviewQueue.$inferSelect;
export type InsertReviewQueueItem = typeof reviewQueue.$inferInsert;

// ── Legacy tasks table (kept for existing TodoPage) ───────────────────────────

export const tasks = pgTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Task = typeof tasks.$inferSelect;
