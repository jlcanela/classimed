import { Effect } from "effect";
import { GlossaryTermRepository, type NewGlossaryTerm, type UpdateGlossaryTerm } from "../repo/glossary-term-repo";
import type { GlossaryTerm } from "../db/schema";
import type { PersistenceError } from "../domain/errors";

export type { NewGlossaryTerm, UpdateGlossaryTerm };

export const listGlossaryTerms: Effect.Effect<
  ReadonlyArray<GlossaryTerm>,
  PersistenceError,
  GlossaryTermRepository
> = GlossaryTermRepository.pipe(Effect.flatMap((repo) => repo.list()));

export const createGlossaryTerm = (
  term: NewGlossaryTerm,
): Effect.Effect<GlossaryTerm, PersistenceError, GlossaryTermRepository> =>
  GlossaryTermRepository.pipe(Effect.flatMap((repo) => repo.create(term)));

export const updateGlossaryTerm = (
  id: string,
  patch: UpdateGlossaryTerm,
): Effect.Effect<GlossaryTerm, PersistenceError, GlossaryTermRepository> =>
  GlossaryTermRepository.pipe(Effect.flatMap((repo) => repo.update(id, patch)));

export const deleteGlossaryTerm = (
  id: string,
): Effect.Effect<void, PersistenceError, GlossaryTermRepository> =>
  GlossaryTermRepository.pipe(Effect.flatMap((repo) => repo.delete(id)));
