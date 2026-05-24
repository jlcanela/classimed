import { Context, Effect, Exit, Layer } from "effect";
import type { DBType } from "./DB";
import { DatabaseError, makeEffectDbClientFromDb } from "./DB";

const migrationSqlFiles = import.meta.glob([
    "/src/drizzle/**/migration.sql",
    "/drizzle/**/migration.sql",
], {
    query: "?raw",
    import: "default",
    eager: true,
}) as Record<string, string>;

const getOrderedMigrationFiles = () =>
    Object.entries(migrationSqlFiles)
        .map(([path, sql]) => ({
            sql,
            id: path.split("/").at(-2) ?? path,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));

const splitMigrationStatements = (sql: string) =>
    sql
        .split("--> statement-breakpoint")
        .map((statement) => statement.trim())
        .filter((statement) => statement.length > 0);

export class Migration extends Context.Service<Migration, {
    migrate: (drizzleClient: DBType) => Effect.Effect<void, DatabaseError>
}>()("myapp/db/Migration") {
    static readonly layer = Layer.effect(
        Migration,
        Effect.gen(function* () {
            const migrate = (drizzleClient: DBType) =>
                Effect.gen(function* () {
                    const client = makeEffectDbClientFromDb(drizzleClient);

                    yield* client.exec(`
                        CREATE TABLE IF NOT EXISTS __drizzle_migrations_browser (
                            id TEXT PRIMARY KEY,
                            applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
                        )
                    `);

                    yield* Effect.forEach(
                        getOrderedMigrationFiles(),
                        (migration) =>
                            Effect.gen(function* () {
                                const appliedResult = yield* client.query<{ count: number | string }>(
                                    "SELECT COUNT(*)::int AS count FROM __drizzle_migrations_browser WHERE id = $1",
                                    [migration.id],
                                );

                                const alreadyApplied = Number(appliedResult.rows[0]?.count ?? 0) > 0;
                                if (alreadyApplied) return;

                                const applyMigration = Effect.gen(function* () {
                                    yield* Effect.forEach(
                                        splitMigrationStatements(migration.sql),
                                        (statement) => client.exec(statement),
                                        { concurrency: 1 },
                                    );
                                    yield* client.query(
                                        "INSERT INTO __drizzle_migrations_browser (id) VALUES ($1)",
                                        [migration.id],
                                    );
                                });

                                yield* Effect.acquireUseRelease(
                                    client.exec("BEGIN"),
                                    () => applyMigration,
                                    (_, exit) =>
                                        (Exit.isSuccess(exit)
                                            ? client.exec("COMMIT")
                                            : client.exec("ROLLBACK")
                                        ).pipe(Effect.orDie),
                                );
                            }),
                        { concurrency: 1 },
                    );
                });

            return Migration.of({
                migrate,
            });
        }),
    );
}
