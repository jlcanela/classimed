import { AsyncResult, Atom } from "effect/unstable/reactivity";
import { Effect } from "effect";
import { atomRuntime } from "@/app/boot";
import type { LibraryDocument } from "@/usecase/documents";
import { listDocuments } from "@/usecase/documents";

export const libraryAsyncAtom = atomRuntime.atom(
  Effect.gen(function* () {
    return yield* listDocuments;
  }),
).pipe(Atom.withReactivity(["documents"]));

export const libraryDocumentsAtom = Atom.readable((get): ReadonlyArray<LibraryDocument> => {
  const result = get(libraryAsyncAtom);
  return AsyncResult.isSuccess(result) ? result.value : [];
});

export const libraryLoadErrorAtom = Atom.readable((get): string | null => {
  const result = get(libraryAsyncAtom);
  return AsyncResult.isFailure(result) ? String(result.cause) : null;
});

export const libraryQueryAtom = Atom.make("");

export const refreshLibraryDocumentsAtom = atomRuntime.fn<void>()(
  Effect.fn(function* () {
    return;
  }),
  { reactivityKeys: ["documents"] },
);

export const filteredLibraryDocumentsAtom = Atom.readable((get) => {
  const query = get(libraryQueryAtom).trim().toLowerCase();
  const documents = get(libraryDocumentsAtom);

  if (query.length === 0) {
    return documents;
  }

  return documents.filter((document) => {
    const titleFr = document.titleFr ?? "";
    const period = document.period ?? "";
    return (
      document.title.toLowerCase().includes(query) ||
      titleFr.toLowerCase().includes(query) ||
      period.toLowerCase().includes(query) ||
      document.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });
});
