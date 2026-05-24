import { Context, Effect, Layer } from "effect";
import { asc, eq } from "drizzle-orm";
import { type InsertSegment, type Segment, segments } from "../db/schema";
import { DatabaseError, makeEffectDrizzle, type DBType } from "../db/DB";
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
          .run((typedDb) =>
            typedDb
              .select()
              .from(segments)
              .where(eq(segments.documentId, documentId))
              .orderBy(asc(segments.position)),
          )
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      createBatch: (items) =>
        items.length === 0
          ? Effect.succeed([])
          : effectDb
              .run((typedDb) => typedDb.insert(segments).values(Array.from(items)).returning())
              .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      updateTexts: (input) =>
        effectDb
          .run((typedDb) =>
            typedDb
              .update(segments)
              .set({ glossText: input.glossText, frText: input.frText, updatedAt: new Date() })
              .where(eq(segments.id, input.segmentId))
              .returning(),
          )
          .pipe(
            Effect.flatMap((rows) =>
              rows[0]
                ? Effect.succeed(rows[0])
                : Effect.fail(new DatabaseError({ cause: new Error("Segment not found for text update") })),
            ),
            Effect.mapError((cause) => new PersistenceError({ cause })),
          ),

      setFlagged: (input) =>
        effectDb
          .run((typedDb) =>
            typedDb
              .update(segments)
              .set({ isFlagged: input.isFlagged, updatedAt: new Date() })
              .where(eq(segments.id, input.segmentId))
              .returning(),
          )
          .pipe(
            Effect.flatMap((rows) =>
              rows[0]
                ? Effect.succeed(rows[0])
                : Effect.fail(new DatabaseError({ cause: new Error("Segment not found for flag update") })),
            ),
            Effect.mapError((cause) => new PersistenceError({ cause })),
          ),
    });
  }
}
