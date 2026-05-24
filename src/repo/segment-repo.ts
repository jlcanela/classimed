import { Context, Effect, Layer } from "effect";
import { asc, eq } from "drizzle-orm";
import { type InsertSegment, type Segment, segments } from "../db/schema";
import { makeEffectDrizzle, type DBType } from "../db/DB";
import { PersistenceError } from "../domain/errors";

type AppDb = DBType;

export interface ISegmentRepository {
  readonly listByDocumentId: (documentId: string) => Effect.Effect<ReadonlyArray<Segment>, PersistenceError>;
  readonly createBatch: (items: ReadonlyArray<InsertSegment>) => Effect.Effect<ReadonlyArray<Segment>, PersistenceError>;
  readonly updateTexts: (input: {
    segmentId: string;
    glossText: string | null;
    frText: string | null;
  }) => Effect.Effect<Segment, PersistenceError>;
  readonly setFlagged: (input: {
    segmentId: string;
    isFlagged: boolean;
  }) => Effect.Effect<Segment, PersistenceError>;
}

export class SegmentRepository extends Context.Service<SegmentRepository, ISegmentRepository>()("SegmentRepository") {
  static layer(db: AppDb): Layer.Layer<SegmentRepository> {
    const effectDb = makeEffectDrizzle(db);

    return Layer.succeed(SegmentRepository, {
      listByDocumentId: (documentId) =>
        effectDb
          .select((typedDb) => typedDb
            .select()
            .from(segments)
            .where(eq(segments.documentId, documentId))
            .orderBy(asc(segments.position)))
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      createBatch: (items) =>
        effectDb
          .insert(async (typedDb) => {
            if (items.length === 0) {
              return [];
            }

            return typedDb
              .insert(segments)
              .values(Array.from(items))
              .returning();
          })
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      updateTexts: (input) =>
        effectDb
          .update(async (typedDb) => {
            const [updated] = await typedDb
              .update(segments)
              .set({
                glossText: input.glossText,
                frText: input.frText,
                updatedAt: new Date(),
              })
              .where(eq(segments.id, input.segmentId))
              .returning();

            if (!updated) throw new Error("Segment not found for text update");
            return updated;
          })
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      setFlagged: (input) =>
        effectDb
          .update(async (typedDb) => {
            const [updated] = await typedDb
              .update(segments)
              .set({
                isFlagged: input.isFlagged,
                updatedAt: new Date(),
              })
              .where(eq(segments.id, input.segmentId))
              .returning();

            if (!updated) throw new Error("Segment not found for flag update");
            return updated;
          })
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),
    });
  }
}
