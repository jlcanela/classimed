import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Context, Layer, Effect, Schema } from "effect";
import type { EmptyRelations } from "drizzle-orm/relations";

export type DBType = PgliteDatabase<EmptyRelations> & { $client: PGlite; };

type GlobalDbState = typeof globalThis & {
    __classimedDbClient__?: PGlite;
    __classimedDb__?: DBType;
};

const globalDbState = globalThis as GlobalDbState;

const getOrCreateSharedDb = (): DBType => {
    if (globalDbState.__classimedDb__) {
        return globalDbState.__classimedDb__;
    }

    const client = new PGlite("idb://classimed-db");
    const db: DBType = drizzle({ client });
    globalDbState.__classimedDbClient__ = client;
    globalDbState.__classimedDb__ = db;
    return db;
};

export class Database extends Context.Service<Database, DBType>()(
    "myapp/db/Database"
) {
    static readonly layer = Layer.sync(
        Database,
        () => getOrCreateSharedDb(),
    );
}

export const DatabaseLive = Database.layer;

export type DbQueryResult<TRow = unknown> = {
    rows: TRow[];
};

export type EffectDbClient = {
    exec: (sql: string) => Effect.Effect<void, DatabaseError>;
    query: <TRow = unknown>(sql: string, params?: unknown[]) => Effect.Effect<DbQueryResult<TRow>, DatabaseError>;
    close: () => Effect.Effect<void, DatabaseError>;
};

export type EffectDrizzle = {
    run: <TResult>(build: (db: DBType) => Promise<TResult>) => Effect.Effect<TResult, DatabaseError>;
};

const liftDbPromise = <TResult>(build: () => Promise<TResult>) =>
    Effect.tryPromise({
        try: build,
        catch: (cause) => new DatabaseError({ cause }),
    });

export const makeEffectDbClient = (client: PGlite): EffectDbClient => ({
    exec: (sql) => 
        Effect.tryPromise({
            try: () => client.exec(sql),
            catch: (cause) => new DatabaseError({ cause }),
        }),
    query: <TRow = unknown>(sql: string, params?: unknown[]) =>
        Effect.tryPromise({
            try: () => client.query(sql, params) as Promise<DbQueryResult<TRow>>,
            catch: (cause) => new DatabaseError({ cause }),
        }),
    close: () =>
        Effect.tryPromise({
            try: () => client.close(),
            catch: (cause) => new DatabaseError({ cause }),
        }),
});

export const makeEffectDrizzle = (db: DBType): EffectDrizzle => ({
    run: (build) => liftDbPromise(() => build(db)),
});

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
    cause: Schema.Defect
}) { }
