import { drizzle, PgliteDatabase } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";
import { Context, Layer, Effect, Schema } from "effect";
import type { EmptyRelations } from "drizzle-orm/relations";

export type DBType = PgliteDatabase<EmptyRelations> & { $client: PGlite; };

export class Database extends Context.Service<Database, DBType>()(
    "myapp/db/Database"
) {
    static readonly layer = Layer.effect(
        Database,
        Effect.acquireRelease(
            Effect.sync(() => {
                const client = new PGlite("idb://classimed-db");
                                const db: DBType = drizzle({ client });
                return db;
            }),
                        (dbClient) => Effect.promise(() => dbClient.$client.close()).pipe(Effect.orDie),
        )
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
    select: <TResult>(build: (db: DBType) => Promise<TResult>) => Effect.Effect<TResult, DatabaseError>;
    update: <TResult>(build: (db: DBType) => Promise<TResult>) => Effect.Effect<TResult, DatabaseError>;
    delete: <TResult>(build: (db: DBType) => Promise<TResult>) => Effect.Effect<TResult, DatabaseError>;
    insert: <TResult>(build: (db: DBType) => Promise<TResult>) => Effect.Effect<TResult, DatabaseError>;
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

export const makeEffectDbClientFromDb = (db: DBType): EffectDbClient => makeEffectDbClient(db.$client);

export const makeEffectDrizzle = (db: DBType): EffectDrizzle => ({
    select: (build) => liftDbPromise(() => build(db)),
    update: (build) => liftDbPromise(() => build(db)),
    delete: (build) => liftDbPromise(() => build(db)),
    insert: (build) => liftDbPromise(() => build(db)),
});

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()("DatabaseError", {
    cause: Schema.Defect
}) { }
