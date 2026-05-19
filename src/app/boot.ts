import { Effect, Layer, ManagedRuntime } from "effect";
import { makeTaskRepositoryLayer, TaskRepository } from "../repo/task-repo";
import { Database } from "@/db/DB";
import { Migration } from "@/db/Migration";

export type AppRuntime = ManagedRuntime.ManagedRuntime<TaskRepository | Database, never>;

export const boot: Effect.Effect<AppRuntime, never, never> = Effect.gen(function* () {
  const taskRepositoryLayer = Layer.unwrap(
    Effect.gen(function* () {
      const db = yield* Database;
      const { migrate } = yield* Migration;

      yield* migrate(db).pipe(Effect.tapCause(Effect.logError), Effect.orDie);

      return makeTaskRepositoryLayer(db);
    }),
  ).pipe(Layer.provide(Database.layer), Layer.provide(Migration.layer));

  const appLayer = Layer.mergeAll(Database.layer, taskRepositoryLayer);

  return ManagedRuntime.make(appLayer);
});
