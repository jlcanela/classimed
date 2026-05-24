import { Context, Effect, Layer } from "effect";
import { asc } from "drizzle-orm";
import { type Document, documents, type InsertDocument } from "../db/schema";
import { makeEffectDrizzle, type DBType } from "../db/DB";
import { PersistenceError } from "../domain/errors";

type AppDb = DBType;

type NewDocument = InsertDocument & { id: string; title: string };

export interface IDocumentRepository {
  readonly list: () => Effect.Effect<ReadonlyArray<Document>, PersistenceError>;
  readonly create: (document: NewDocument) => Effect.Effect<Document, PersistenceError>;
}

export class DocumentRepository extends Context.Service<DocumentRepository, IDocumentRepository>()("DocumentRepository") {
  static layer(db: AppDb): Layer.Layer<DocumentRepository> {
    const effectDb = makeEffectDrizzle(db);

    return Layer.succeed(DocumentRepository, {
      list: () =>
        effectDb
          .select((typedDb) => typedDb.select().from(documents).orderBy(asc(documents.updatedAt)))
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      create: (document) =>
        effectDb
          .insert(async (typedDb) => {
            const [created] = await typedDb
              .insert(documents)
              .values(document)
              .returning();

            if (!created) throw new Error("Insert returned no document row");
            return created;
          })
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),
    });
  }
}
