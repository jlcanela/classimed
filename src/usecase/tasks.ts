import { Effect } from "effect";
import { TaskRepository } from "../repo/task-repo";
import type { Task } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { Database } from "@/db/DB";

export const listTasks: Effect.Effect<ReadonlyArray<Task>, PersistenceError, TaskRepository> =
  Effect.gen(function* () {
    const repo = yield* TaskRepository;
    return yield* repo.list();
  });

export const createTask = (
  title: string,
): Effect.Effect<Task, PersistenceError, TaskRepository> =>
  Effect.gen(function* () {
    const repo = yield* TaskRepository;
    return yield* repo.create(title);
  });

export const setTaskCompleted = (
  id: string,
  completed: boolean,
): Effect.Effect<void, PersistenceError, TaskRepository> =>
  Effect.gen(function* () {
    const repo = yield* TaskRepository;
    return yield* repo.setCompleted(id, completed);
  });

export const deleteTask = (
  id: string,
): Effect.Effect<void, PersistenceError, TaskRepository> =>
  Effect.gen(function* () {
    const repo = yield* TaskRepository;
    return yield* repo.delete(id);
  });

  export const dbAccess = Effect.gen(function* () {
    const db = yield* Database;
    return yield* Effect.promise(() =>db.$client.exec(`SELECT 1`));
    //return yield* repo.db.$client.query("SELECT * FROM tasks");
  })
  