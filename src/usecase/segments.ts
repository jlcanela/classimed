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

export const updateSegmentTexts = (input: {
  segmentId: string;
  glossText: string | null;
  frText: string | null;
}): Effect.Effect<Segment, PersistenceError, SegmentRepository> =>
  Effect.gen(function* () {
    const repository = yield* SegmentRepository;
    return yield* repository.updateTexts(input);
  });

export const setSegmentFlagged = (input: {
  segmentId: string;
  isFlagged: boolean;
}): Effect.Effect<Segment, PersistenceError, SegmentRepository> =>
  Effect.gen(function* () {
    const repository = yield* SegmentRepository;
    return yield* repository.setFlagged(input);
  });
