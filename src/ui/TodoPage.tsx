import { useAtomValue, useAtomSet } from "@effect/atom-react";
import { Container, Title, Stack, Text, Loader, Alert } from "@mantine/core";
import {
  tasksAtom,
  tasksLoadingAtom,
  tasksLoadErrorAtom,
  createTaskAtom,
  toggleTaskAtom,
  deleteTaskAtom,
} from "../routes/_classimed/todo/-atoms";
import { AddTaskForm } from "./components/AddTaskForm";
import { TaskItem } from "./components/TaskItem";

export function TodoPage() {
  const tasks = useAtomValue(tasksAtom);
  const loading = useAtomValue(tasksLoadingAtom);
  const error = useAtomValue(tasksLoadErrorAtom);

  const addTask = useAtomSet(createTaskAtom, { mode: "promise" });
  const toggleTask = useAtomSet(toggleTaskAtom, { mode: "promise" });
  const removeTask = useAtomSet(deleteTaskAtom, { mode: "promise" });

  const handleAdd = (title: string) => { addTask(title); };
  const handleToggle = (id: string, completed: boolean) => { toggleTask({ id, completed }); };
  const handleDelete = (id: string) => { removeTask(id); };

  return (
    <Container size="sm" py="xl">
      <Title order={1} mb="xl">
        TODO
      </Title>

      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}

      <AddTaskForm onAdd={handleAdd} loading={false} />

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
