import { Effect } from "effect";
import type { InsertSegment, Segment } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { SegmentRepository } from "../repo/segment-repo";

export const listSegmentsByDocument = (
  documentId: string,
): Effect.Effect<ReadonlyArray<Segment>, PersistenceError, SegmentRepository> =>
  Effect.gen(function* () {
    const repository = yield* SegmentRepository;
    return yield* repository.listByDocumentId(documentId);
  });

export const createSegmentsBatch = (
  items: ReadonlyArray<InsertSegment>,
): Effect.Effect<ReadonlyArray<Segment>, PersistenceError, SegmentRepository> =>
  Effect.gen(function* () {
    const repository = yield* SegmentRepository;
    return yield* repository.createBatch(items);
  });
