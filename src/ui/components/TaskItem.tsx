import { Group, Checkbox, Text, ActionIcon, Paper } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { Task } from "../../db/schema";

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: Props) {
  return (
    <Paper p="sm" withBorder>
      <Group justify="space-between">
        <Checkbox
          checked={task.completed}
          onChange={(e) => onToggle(task.id, e.currentTarget.checked)}
          label={
            <Text
              td={task.completed ? "line-through" : undefined}
              c={task.completed ? "dimmed" : undefined}
            >
              {task.title}
            </Text>
          }
        />
        <ActionIcon
          color="red"
          variant="subtle"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
        >
          <IconTrash size={16} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
