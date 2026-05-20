import { createFileRoute } from "@tanstack/react-router";
import { TodoPage } from "../../ui/TodoPage";

export const Route = createFileRoute("/_classimed/todo")({
  component: TodoRoute,
});

function TodoRoute() {
  const { runtime } = Route.useRouteContext();
  return <TodoPage runtime={runtime} />;
}
