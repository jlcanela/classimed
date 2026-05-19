import { useState, useEffect, useCallback } from "react";
import { Container, Title, Stack, Text, Loader, Alert } from "@mantine/core";
import type { AppRuntime } from "../app/boot";
import type { Task } from "../db/schema";
import { listTasks, createTask, setTaskCompleted, deleteTask, dbAccess } from "../usecase/tasks";
import { AddTaskForm } from "./components/AddTaskForm";
import { TaskItem } from "./components/TaskItem";

interface Props {
  runtime: AppRuntime;
}

export function TodoPage({ runtime }: Props) {
  const [tasks, setTasks] = useState<ReadonlyArray<Task>>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    runtime
      .runPromise(listTasks)
      .then(setTasks)
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [runtime]);

  const dbTest = useCallback(() => {
    runtime
      .runPromise(dbAccess)
      .then((r) => console.log(r))
      .catch((e: unknown) => setError(String(e)))
      //.finally(() => setLoading(false));
  }, [runtime]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    dbTest();
  }, [dbTest]);

  const handleAdd = (title: string) => {
    setCreating(true);
    runtime
      .runPromise(createTask(title))
      .then(() => load())
      .catch((e: unknown) => setError(String(e)))
      .finally(() => setCreating(false));
  };

  const handleToggle = (id: string, completed: boolean) => {
    runtime
      .runPromise(setTaskCompleted(id, completed))
      .then(() => load())
      .catch((e: unknown) => setError(String(e)));
  };

  const handleDelete = (id: string) => {
    runtime
      .runPromise(deleteTask(id))
      .then(() => load())
      .catch((e: unknown) => setError(String(e)));
  };

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl">
        TODO
      </Title>

      {error && (
        <Alert color="red" mb="md" withCloseButton onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <AddTaskForm onAdd={handleAdd} loading={creating} />

      <Stack mt="xl" gap="sm">
        {loading ? (
          <Loader mx="auto" />
        ) : tasks.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No tasks yet — add one above!
          </Text>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))
        )}
      </Stack>
    </Container>
  );
}
