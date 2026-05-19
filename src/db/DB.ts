// db.ts
import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Context, Layer, Effect, Schema } from "effect";
import type { EmptyRelations } from "drizzle-orm/relations";

export type DBType = PgliteDatabase<EmptyRelations> & { $client: PGlite; };

// 1. Define the Context tag for your Drizzle Database instance
export class Database extends Context.Service<Database, DBType>()(
    // The string identifier for the service, which should include the package
    // name and the subdirectory path to the service file.
    "myapp/db/Database"
) {
    // Attach a static layer to the service, which will be used to provide an
    // implementation of the service.
    static readonly layer = Layer.effect(
        Database,
        Effect.acquireRelease(
            Effect.sync(() => {
                // Create PGlite instance (e.g., 'idb://...' for browser persistence)
                const client = new PGlite("idb://classimed-db");
                const db: DBType = drizzle({ client })
                return db;
            }),
            (dbClient) =>
                // Effect cleanup: close the PGlite connection when the layer is destroyed
                Effect.promise(() => dbClient.$client.close()).pipe(
                    Effect.orDie // Fail completely if it crashes during teardown
                )
        )
    )
}

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
    cause: Schema.Defect
}) { }
