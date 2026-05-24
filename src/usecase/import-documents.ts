import { Effect } from "effect";
import type { InsertSegment } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { DocumentRepository } from "../repo/document-repo";
import { SegmentRepository } from "../repo/segment-repo";

export type ImportMode = "paste" | "pdf" | "scan";
export type SegmentLanguage = "classical" | "modern";

export type SegmentationLine = {
  txt: string;
  lang: SegmentLanguage;
  conf: number;
};

export type CreateImportedDocumentInput = {
  mode: ImportMode;
  sourceLabel: string;
  sourcePreview: string;
  documentTitle: string;
  documentTitleFr: string;
  documentPeriod: string;
  documentType: string;
  documentTagsText: string;
  documentPages: number;
  documentActive: boolean;
  segmentationLines: ReadonlyArray<SegmentationLine>;
};

const toTitle = (input: CreateImportedDocumentInput): string => {
  const explicitTitle = input.documentTitle.trim();
  if (explicitTitle.length > 0) {
    return explicitTitle;
  }

  const withoutExtension = input.sourceLabel.replace(/\.[a-z0-9]+$/i, "").trim();
  if (withoutExtension.length > 0) {
    return withoutExtension;
  }

  const firstLine = input.sourcePreview.split("　").map((line) => line.trim()).find((line) => line.length > 0);
  return firstLine?.slice(0, 40) ?? "Document importe";
};

const toTags = (tagsText: string): string[] =>
  tagsText
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);

const toSegments = (documentId: string, lines: ReadonlyArray<SegmentationLine>): ReadonlyArray<InsertSegment> =>
  lines.map((line, index) => ({
    id: crypto.randomUUID(),
    documentId,
    position: index + 1,
    lang: line.lang,
    confidence: line.conf,
    srcText: line.txt,
    glossText: null,
    frText: null,
    isAnnotation: false,
    isFlagged: false,
    flagReason: null,
  }));

export const createImportedDocumentAndSegments = (
  input: CreateImportedDocumentInput,
): Effect.Effect<
  { documentId: string; title: string },
  PersistenceError,
  DocumentRepository | SegmentRepository
> =>
  Effect.gen(function* () {
    const documentRepository = yield* DocumentRepository;
    const segmentRepository = yield* SegmentRepository;

    const createdDocument = yield* documentRepository.create({
      id: crypto.randomUUID(),
      title: toTitle(input),
      titleFr: input.documentTitleFr.trim().length > 0 ? input.documentTitleFr.trim() : null,
      period: input.documentPeriod.trim().length > 0 ? input.documentPeriod.trim() : null,
      type: input.documentType.trim().length > 0 ? input.documentType.trim() : "canon",
      tags: toTags(input.documentTagsText),
      pages: Number.isFinite(input.documentPages) ? Math.max(0, Math.trunc(input.documentPages)) : 0,
      status: input.documentActive ? "active" : "queued",
    });

    const segmentRows = toSegments(createdDocument.id, input.segmentationLines);
    yield* segmentRepository.createBatch(segmentRows);

    yield* Effect.logInfo("import: document creation successful").pipe(
      Effect.annotateLogs({
        documentId: createdDocument.id,
        title: createdDocument.title,
        type: createdDocument.type,
        segmentCount: String(segmentRows.length),
        status: createdDocument.status,
      }),
    );

    return {
      documentId: createdDocument.id,
      title: createdDocument.title,
    };
  });
