import { Context, Layer, Effect } from "effect";
import { asc, eq } from "drizzle-orm";
import { glossaryTerms, type GlossaryTerm } from "../db/schema";
import { PersistenceError } from "../domain/errors";
import { DatabaseError, makeEffectDrizzle, type DBType } from "../db/DB";

type AppDb = DBType;

export type NewGlossaryTerm = {
  id: string;
  char: string;
  pinyin: string;
  category: string;
  fr: string[];
  frPrimary: string;
  refs?: Record<string, string>;
  note?: string;
};

export type UpdateGlossaryTerm = Partial<Omit<NewGlossaryTerm, "id">>;

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
          .run((typedDb) => typedDb.select().from(glossaryTerms).orderBy(asc(glossaryTerms.createdAt)))
          .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

      create: (term) =>
        effectDb
          .run((typedDb) =>
            typedDb
              .insert(glossaryTerms)
              .values({ ...term, note: term.note ?? "", isPreseeded: false })
              .returning(),
          )
          .pipe(
            Effect.flatMap((rows) =>
              rows[0]
                ? Effect.succeed(rows[0])
                : Effect.fail(new DatabaseError({ cause: new Error("Insert returned no rows") })),
            ),
            Effect.mapError((e) => new PersistenceError({ cause: e })),
          ),

      update: (id, patch) =>
        effectDb
          .run((typedDb) =>
            typedDb
              .update(glossaryTerms)
              .set({ ...patch, updatedAt: new Date() })
              .where(eq(glossaryTerms.id, id))
              .returning(),
          )
          .pipe(
            Effect.flatMap((rows) =>
              rows[0]
                ? Effect.succeed(rows[0])
                : Effect.fail(new DatabaseError({ cause: new Error(`Glossary term not found: ${id}`) })),
            ),
            Effect.mapError((e) => new PersistenceError({ cause: e })),
          ),

      delete: (id) =>
        effectDb
          .run((typedDb) => typedDb.delete(glossaryTerms).where(eq(glossaryTerms.id, id)))
          .pipe(
            Effect.asVoid,
            Effect.mapError((e) => new PersistenceError({ cause: e })),
          ),
    });
  }
}

export function makeGlossaryTermRepositoryLayer(db: AppDb): Layer.Layer<GlossaryTermRepository> {
  return GlossaryTermRepository.layer(db);
}
