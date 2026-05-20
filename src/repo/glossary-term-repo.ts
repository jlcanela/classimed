import { Context, Layer, Effect } from "effect";
import { asc, eq } from "drizzle-orm";
import { glossaryTerms, type GlossaryTerm } from "../db/schema";
import { PersistenceError } from "../domain/errors";
import { makeEffectDrizzle, type DBType } from "../db/DB";

type AppDb = DBType;

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

export interface IGlossaryTermRepository {
  readonly list: () => Effect.Effect<ReadonlyArray<GlossaryTerm>, PersistenceError>;
  readonly create: (term: NewGlossaryTerm) => Effect.Effect<GlossaryTerm, PersistenceError>;
  readonly update: (id: string, patch: UpdateGlossaryTerm) => Effect.Effect<GlossaryTerm, PersistenceError>;
  readonly delete: (id: string) => Effect.Effect<void, PersistenceError>;
}

export class GlossaryTermRepository extends Context.Service<GlossaryTermRepository, IGlossaryTermRepository>()("GlossaryTermRepository") {
  static layer(db: AppDb): Layer.Layer<GlossaryTermRepository> {
    const effectDb = makeEffectDrizzle(db);

    return Layer.succeed(GlossaryTermRepository, {
      list: () =>
        effectDb
          .select((typedDb) => typedDb.select().from(glossaryTerms).orderBy(asc(glossaryTerms.createdAt)))
          .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

      create: (term) =>
        effectDb
          .insert(async (typedDb) => {
            const [created] = await typedDb
              .insert(glossaryTerms)
              .values({
                ...term,
                note: term.note ?? "",
                isPreseeded: false,
              })
              .returning();

            if (!created) throw new Error("Insert returned no rows");
            return created;
          })
          .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

      update: (id, patch) =>
        effectDb
          .update(async (typedDb) => {
            const [updated] = await typedDb
              .update(glossaryTerms)
              .set({
                ...patch,
                updatedAt: new Date(),
              })
              .where(eq(glossaryTerms.id, id))
              .returning();

            if (!updated) throw new Error(`Glossary term not found: ${id}`);
            return updated;
          })
          .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

      delete: (id) =>
        effectDb
          .delete((typedDb) =>
            typedDb
              .delete(glossaryTerms)
              .where(eq(glossaryTerms.id, id))
              .then(() => undefined),
          )
          .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),
    });
  }
}

export function makeGlossaryTermRepositoryLayer(db: AppDb): Layer.Layer<GlossaryTermRepository> {
  return GlossaryTermRepository.layer(db);
}
