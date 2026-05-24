import { Effect } from "effect";
import type { Document, InsertDocument } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { DocumentRepository } from "../repo/document-repo";
import { SegmentRepository } from "../repo/segment-repo";
import { listSegmentsByDocument } from "./segments";

type NewDocument = InsertDocument & { id: string; title: string };

export type LibraryDocument = Document & {
  segments: number;
  done: number;
  flagged: number;
  updated: string;
  active: boolean;
};

const formatRelativeUpdatedAt = (updatedAt: Date): string => {
  const diffMs = Date.now() - updatedAt.getTime();
  const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return diffMinutes <= 1 ? "à l'instant" : `il y a ${diffMinutes} min`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return diffHours === 1 ? "il y a 1 h" : `il y a ${diffHours} h`;
  }

  const diffDays = Math.round(diffHours / 24);
  return diffDays === 1 ? "hier" : `il y a ${diffDays} jours`;
};

export const listDocuments: Effect.Effect<ReadonlyArray<LibraryDocument>, PersistenceError, DocumentRepository | SegmentRepository> =
  Effect.gen(function* () {
    const repository = yield* DocumentRepository;
    const documents = yield* repository.list();

    return yield* Effect.forEach(documents, (document) =>
      Effect.gen(function* () {
        const segments = yield* listSegmentsByDocument(document.id);
        const segmentCount = segments.length;
        const doneCount = segments.filter((segment) => !segment.isAnnotation && segment.frText !== null && segment.frText.trim().length > 0).length;
        const flaggedCount = segments.filter((segment) => segment.isFlagged).length;

        return {
          ...document,
          segments: segmentCount,
          done: doneCount,
          flagged: flaggedCount,
          updated: formatRelativeUpdatedAt(document.updatedAt),
          active: document.status === "active",
        };
      }),
    );
  });

export const createDocument = (
  document: NewDocument,
): Effect.Effect<Document, PersistenceError, DocumentRepository> =>
  Effect.gen(function* () {
    const repository = yield* DocumentRepository;
    return yield* repository.create(document);
  });
