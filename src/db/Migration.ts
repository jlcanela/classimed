import { Context, Effect, Layer } from "effect";
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

                    for (const migration of getOrderedMigrationFiles()) {
                        const appliedResult = yield* client.query<{ count: number | string }>(
                            "SELECT COUNT(*)::int AS count FROM __drizzle_migrations_browser WHERE id = $1",
                            [migration.id],
                        );

                        const alreadyApplied = Number(appliedResult.rows[0]?.count ?? 0) > 0;
                        if (alreadyApplied) {
                            continue;
                        }

                        yield* client.exec("BEGIN");

                        const applyMigration = Effect.gen(function* () {
                            for (const statement of splitMigrationStatements(migration.sql)) {
                                yield* client.exec(statement);
                            }

                            yield* client.query(
                                "INSERT INTO __drizzle_migrations_browser (id) VALUES ($1)",
                                [migration.id],
                            );
                        });

                        yield* applyMigration.pipe(
                            Effect.tapError(() => client.exec("ROLLBACK")),
                            Effect.andThen(client.exec("COMMIT")),
                        );
                    }
                });

            return Migration.of({
                migrate,
            });
        }),
    );
}
