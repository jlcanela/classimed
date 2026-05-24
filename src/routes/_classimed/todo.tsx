import { createFileRoute } from "@tanstack/react-router";
import { RegistryProvider } from "@effect/atom-react";
import { TodoPage } from "../../ui/TodoPage";

export const Route = createFileRoute("/_classimed/todo")({
  component: TodoRoute,
});

function TodoRoute() {
  return (
    <RegistryProvider>
      <TodoPage />
    </RegistryProvider>
  );
}
