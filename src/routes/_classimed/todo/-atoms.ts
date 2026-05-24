import { AsyncResult, Atom } from "effect/unstable/reactivity";
import { Effect } from "effect";
import { atomRuntime } from "@/app/boot";
import type { Task } from "@/db/schema";
import { listTasks, createTask, setTaskCompleted, deleteTask } from "@/usecase/tasks";

export const tasksAsyncAtom = atomRuntime.atom(listTasks)
  .pipe(Atom.withReactivity(["tasks"]));

export const tasksAtom = Atom.readable((get): ReadonlyArray<Task> => {
  const result = get(tasksAsyncAtom);
  return AsyncResult.isSuccess(result) ? result.value : [];
});

export const tasksLoadingAtom = Atom.readable((get): boolean =>
  AsyncResult.isInitial(get(tasksAsyncAtom)),
);

export const tasksLoadErrorAtom = Atom.readable((get): string | null => {
  const result = get(tasksAsyncAtom);
  return AsyncResult.isFailure(result) ? String(result.cause) : null;
});

export const createTaskAtom = atomRuntime.fn<string>()(
  Effect.fn(function* (title) {
    yield* createTask(title);
  }),
  { reactivityKeys: ["tasks"] },
);

export const toggleTaskAtom = atomRuntime.fn<{ id: string; completed: boolean }>()(
  Effect.fn(function* (input) {
    yield* setTaskCompleted(input.id, input.completed);
  }),
  { reactivityKeys: ["tasks"] },
);

export const deleteTaskAtom = atomRuntime.fn<string>()(
  Effect.fn(function* (id) {
    yield* deleteTask(id);
  }),
  { reactivityKeys: ["tasks"] },
);
