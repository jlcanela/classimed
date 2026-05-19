import { Context, Layer, Effect } from "effect";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import type { EmptyRelations } from "drizzle-orm";
import { eq, asc } from "drizzle-orm";
import { tasks, type Task } from "../db/schema";
import { PersistenceError } from "../domain/errors";

type AppDb = PgliteDatabase<EmptyRelations>;

export interface ITaskRepository {
  readonly list: () => Effect.Effect<ReadonlyArray<Task>, PersistenceError>;
  readonly create: (title: string) => Effect.Effect<Task, PersistenceError>;
  readonly setCompleted: (id: string, completed: boolean) => Effect.Effect<void, PersistenceError>;
  readonly delete: (id: string) => Effect.Effect<void, PersistenceError>;
}

export class TaskRepository extends Context.Service<TaskRepository, ITaskRepository>()("TaskRepository") {}

export function makeTaskRepositoryLayer(db: AppDb): Layer.Layer<TaskRepository> {
  return Layer.succeed(TaskRepository, {
    list: () =>
      Effect.tryPromise({
        try: () => db.select().from(tasks).orderBy(asc(tasks.createdAt)),
        catch: (e) => new PersistenceError({ cause: e }),
      }),

    create: (title: string) =>
      Effect.tryPromise({
        try: async () => {
          const [task] = await db
            .insert(tasks)
            .values({ id: crypto.randomUUID(), title })
            .returning();
          if (!task) throw new Error("Insert returned no rows");
          return task;
        },
        catch: (e) => new PersistenceError({ cause: e }),
      }),

    setCompleted: (id: string, completed: boolean) =>
      Effect.tryPromise({
        try: () =>
          db
            .update(tasks)
            .set({ completed })
            .where(eq(tasks.id, id))
            .then(() => undefined),
        catch: (e) => new PersistenceError({ cause: e }),
      }),

    delete: (id: string) =>
      Effect.tryPromise({
        try: () =>
          db
            .delete(tasks)
            .where(eq(tasks.id, id))
            .then(() => undefined),
        catch: (e) => new PersistenceError({ cause: e }),
      }),
  });
}
