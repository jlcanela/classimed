import { Effect } from "effect";
import type { InsertSegment, Segment } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { SegmentRepository } from "../repo/segment-repo";

export const listSegmentsByDocument = (
  documentId: string,
): Effect.Effect<ReadonlyArray<Segment>, PersistenceError, SegmentRepository> =>
  SegmentRepository.pipe(Effect.flatMap((repo) => repo.listByDocumentId(documentId)));

export const createSegmentsBatch = (
  items: ReadonlyArray<InsertSegment>,
): Effect.Effect<ReadonlyArray<Segment>, PersistenceError, SegmentRepository> =>
  SegmentRepository.pipe(Effect.flatMap((repo) => repo.createBatch(items)));

export const updateSegmentTexts = (input: {
  segmentId: string;
  glossText: string | null;
  frText: string | null;
}): Effect.Effect<Segment, PersistenceError, SegmentRepository> =>
  SegmentRepository.pipe(Effect.flatMap((repo) => repo.updateTexts(input)));

export const setSegmentFlagged = (input: {
  segmentId: string;
  isFlagged: boolean;
}): Effect.Effect<Segment, PersistenceError, SegmentRepository> =>
  SegmentRepository.pipe(Effect.flatMap((repo) => repo.setFlagged(input)));
