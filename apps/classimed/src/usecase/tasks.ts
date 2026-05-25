import { Effect } from "effect";
import { TaskRepository } from "../repo/task-repo";
import type { Task } from "../db/schema";
import type { PersistenceError } from "../domain/errors";
import { Database, makeEffectDbClient } from "@/db/DB";

export const listTasks: Effect.Effect<ReadonlyArray<Task>, PersistenceError, TaskRepository> =
  TaskRepository.pipe(Effect.flatMap((repo) => repo.list()));

export const createTask = (
  title: string,
): Effect.Effect<Task, PersistenceError, TaskRepository> =>
  TaskRepository.pipe(Effect.flatMap((repo) => repo.create(title)));

export const setTaskCompleted = (
  id: string,
  completed: boolean,
): Effect.Effect<void, PersistenceError, TaskRepository> =>
  TaskRepository.pipe(Effect.flatMap((repo) => repo.setCompleted(id, completed)));

export const deleteTask = (
  id: string,
): Effect.Effect<void, PersistenceError, TaskRepository> =>
  TaskRepository.pipe(Effect.flatMap((repo) => repo.delete(id)));

export const dbAccess = Effect.gen(function* () {
  const db = yield* Database;
  const client = makeEffectDbClient(db.$client);
  return yield* client.exec(`SELECT 1`);
});
