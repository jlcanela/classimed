import { useState } from "react";
import { Group, TextInput, Button } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface Props {
  onAdd: (title: string) => void;
  loading: boolean;
}

export function AddTaskForm({ onAdd, loading }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const title = value.trim();
    if (!title) return;
    onAdd(title);
    setValue("");
  };

  return (
    <Group>
      <TextInput
        flex={1}
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        disabled={loading}
      />
      <Button
        leftSection={<IconPlus size={16} />}
        onClick={handleSubmit}
        loading={loading}
      >
        Add
      </Button>
    </Group>
  );
}
