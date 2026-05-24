import { Context, Effect, Layer } from "effect";
import { asc } from "drizzle-orm";
import { type Document, documents, type InsertDocument } from "../db/schema";
import { DatabaseError, makeEffectDrizzle, type DBType } from "../db/DB";
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
          .run((typedDb) => typedDb.select().from(documents).orderBy(asc(documents.updatedAt)))
          .pipe(Effect.mapError((cause) => new PersistenceError({ cause }))),

      create: (document) =>
        effectDb
          .run((typedDb) => typedDb.insert(documents).values(document).returning())
          .pipe(
            Effect.flatMap((rows) =>
              rows[0]
                ? Effect.succeed(rows[0])
                : Effect.fail(new DatabaseError({ cause: new Error("Insert returned no document row") })),
            ),
            Effect.mapError((cause) => new PersistenceError({ cause })),
          ),
    });
  }
}
