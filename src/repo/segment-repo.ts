import { Context, Effect, Layer } from "effect";
import { asc, eq } from "drizzle-orm";
import { type InsertSegment, type Segment, segments } from "../db/schema";
import { makeEffectDrizzle, type DBType } from "../db/DB";
import { PersistenceError } from "../domain/errors";

type AppDb = DBType;

export interface ISegmentRepository {
  readonly listByDocumentId: (documentId: string) => Effect.Effect<ReadonlyArray<Segment>, PersistenceError>;
  readonly createBatch: (items: ReadonlyArray<InsertSegment>) => Effect.Effect<ReadonlyArray<Segment>, PersistenceError>;
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
    });
  }
}
