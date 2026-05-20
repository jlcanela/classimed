import { Context, Layer, Effect } from "effect";
import { eq, asc } from "drizzle-orm";
import { tasks, type Task } from "../db/schema";
import { PersistenceError } from "../domain/errors";
import { makeEffectDrizzle, type DBType } from "../db/DB";

type AppDb = DBType;

export interface ITaskRepository {
  readonly list: () => Effect.Effect<ReadonlyArray<Task>, PersistenceError>;
  readonly create: (title: string) => Effect.Effect<Task, PersistenceError>;
  readonly setCompleted: (id: string, completed: boolean) => Effect.Effect<void, PersistenceError>;
  readonly delete: (id: string) => Effect.Effect<void, PersistenceError>;
}

export class TaskRepository extends Context.Service<TaskRepository, ITaskRepository>()("TaskRepository") {}

export function makeTaskRepositoryLayer(db: AppDb): Layer.Layer<TaskRepository> {
  const effectDb = makeEffectDrizzle(db);

  return Layer.succeed(TaskRepository, {
    list: () =>
      effectDb
        .select((typedDb) => typedDb.select().from(tasks).orderBy(asc(tasks.createdAt)))
        .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

    create: (title: string) =>
      effectDb
        .insert(async (typedDb) => {
          const [task] = await typedDb
            .insert(tasks)
            .values({ id: crypto.randomUUID(), title })
            .returning();
          if (!task) throw new Error("Insert returned no rows");
          return task;
        })
        .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

    setCompleted: (id: string, completed: boolean) =>
      effectDb
        .update((typedDb) =>
          typedDb
            .update(tasks)
            .set({ completed })
            .where(eq(tasks.id, id))
            .then(() => undefined),
        )
        .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),

    delete: (id: string) =>
      effectDb
        .delete((typedDb) =>
          typedDb
            .delete(tasks)
            .where(eq(tasks.id, id))
            .then(() => undefined),
        )
        .pipe(Effect.mapError((e) => new PersistenceError({ cause: e }))),
  });
}
