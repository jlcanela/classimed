import { AsyncResult, Atom } from "effect/unstable/reactivity";
import { Effect } from "effect";
import { atomRuntime } from "@/app/boot";
import type { Segment } from "@/db/schema";
import type { LibraryDocument } from "@/usecase/documents";
import { listDocuments } from "@/usecase/documents";
import { listSegmentsByDocument, setSegmentFlagged, updateSegmentTexts } from "@/usecase/segments";

export type ReaderSegment = {
  id: string;
  position: number;
  lang: string;
  confidence: number;
  src: string;
  gloss: string;
  fr: string;
  isAnnotation: boolean;
  flagged: boolean;
  flagReason: string | null;
};

export type ReaderWorkspaceData = {
  documents: ReadonlyArray<LibraryDocument>;
  segmentsByDocumentId: Record<string, ReadonlyArray<ReaderSegment>>;
};

const toReaderSegment = (segment: Segment): ReaderSegment => ({
  id: segment.id,
  position: segment.position,
  lang: segment.lang,
  confidence: segment.confidence,
  src: segment.srcText,
  gloss: segment.glossText ?? "",
  fr: segment.frText ?? "",
  isAnnotation: segment.isAnnotation,
  flagged: segment.isFlagged,
  flagReason: segment.flagReason,
});

export const readerWorkspaceAsyncAtom = atomRuntime.atom(
  Effect.gen(function* () {
    const documents = yield* listDocuments;

    const entries = yield* Effect.forEach(documents, (document) =>
      Effect.gen(function* () {
        const segments = yield* listSegmentsByDocument(document.id);
        return [document.id, segments.map(toReaderSegment)] as const;
      }),
    );

    return {
      documents,
      segmentsByDocumentId: Object.fromEntries(entries),
    } satisfies ReaderWorkspaceData;
  }),
).pipe(Atom.withReactivity(["documents", "segments"]));

export const readerWorkspaceAtom = Atom.readable((get): ReaderWorkspaceData => {
  const result = get(readerWorkspaceAsyncAtom);
  return AsyncResult.isSuccess(result)
    ? result.value
    : { documents: [], segmentsByDocumentId: {} };
});

export const readerLoadErrorAtom = Atom.readable((get): string | null => {
  const result = get(readerWorkspaceAsyncAtom);
  return AsyncResult.isFailure(result) ? String(result.cause) : null;
});

export const readerSelectedDocumentIdAtom = Atom.make<string | null>(null);

export const readerActiveDocumentIdAtom = Atom.readable((get): string | null => {
  const selectedId = get(readerSelectedDocumentIdAtom);
  const documents = get(readerWorkspaceAtom).documents;
  if (documents.length === 0) {
    return null;
  }

  if (selectedId && documents.some((document) => document.id === selectedId)) {
    return selectedId;
  }

  const activeDocument = documents.find((document) => document.active);
  return activeDocument?.id ?? documents[0]?.id ?? null;
});

export const readerActiveDocumentAtom = Atom.readable((get): LibraryDocument | null => {
  const activeDocumentId = get(readerActiveDocumentIdAtom);
  if (!activeDocumentId) {
    return null;
  }

  return get(readerWorkspaceAtom).documents.find((document) => document.id === activeDocumentId) ?? null;
});

export const readerSegmentsAtom = Atom.readable((get): ReadonlyArray<ReaderSegment> => {
  const activeDocumentId = get(readerActiveDocumentIdAtom);
  if (!activeDocumentId) {
    return [];
  }

  return get(readerWorkspaceAtom).segmentsByDocumentId[activeDocumentId] ?? [];
});

export const readerFocusedSegmentIdAtom = Atom.make<string | null>(null);
export const readerShowGlossAtom = Atom.make(true);

export type ReaderEditingCell = {
  segmentId: string;
  field: "gloss" | "fr";
};

export const readerEditingCellAtom = Atom.make<ReaderEditingCell | null>(null);
export const readerEditValueAtom = Atom.make("");

export const saveReaderSegmentCellAtom = atomRuntime.fn<{
  segmentId: string;
  gloss: string;
  fr: string;
}>()( 
  Effect.fn(function* (input) {
    yield* updateSegmentTexts({
      segmentId: input.segmentId,
      glossText: input.gloss.trim().length > 0 ? input.gloss : null,
      frText: input.fr.trim().length > 0 ? input.fr : null,
    });
  }),
  { reactivityKeys: ["segments", "documents"] },
);

export const toggleReaderSegmentFlagAtom = atomRuntime.fn<{ segmentId: string; isFlagged: boolean }>()(
  Effect.fn(function* (input) {
    yield* setSegmentFlagged({
      segmentId: input.segmentId,
      isFlagged: input.isFlagged,
    });
  }),
  { reactivityKeys: ["segments", "documents"] },
);
