import { Effect } from "effect";
import { GlossaryTermRepository } from "../repo/glossary-term-repo";
import type { GlossaryTerm } from "../db/schema";
import type { PersistenceError } from "../domain/errors";

type NewGlossaryTerm = {
  id: string;
  char: string;
  pinyin: string;
  category: string;
  fr: string[];
  frPrimary: string;
  refs?: Record<string, string>;
  note?: string;
};

type UpdateGlossaryTerm = Partial<Omit<NewGlossaryTerm, "id">>;

export const listGlossaryTerms: Effect.Effect<
  ReadonlyArray<GlossaryTerm>,
  PersistenceError,
  GlossaryTermRepository
> = Effect.gen(function* () {
  const repo = yield* GlossaryTermRepository;
  return yield* repo.list();
});

export const createGlossaryTerm = (
  term: NewGlossaryTerm,
): Effect.Effect<GlossaryTerm, PersistenceError, GlossaryTermRepository> =>
  Effect.gen(function* () {
    const repo = yield* GlossaryTermRepository;
    return yield* repo.create(term);
  });

export const updateGlossaryTerm = (
  id: string,
  patch: UpdateGlossaryTerm,
): Effect.Effect<GlossaryTerm, PersistenceError, GlossaryTermRepository> =>
  Effect.gen(function* () {
    const repo = yield* GlossaryTermRepository;
    return yield* repo.update(id, patch);
  });

export const deleteGlossaryTerm = (
  id: string,
): Effect.Effect<void, PersistenceError, GlossaryTermRepository> =>
  Effect.gen(function* () {
    const repo = yield* GlossaryTermRepository;
    return yield* repo.delete(id);
  });
