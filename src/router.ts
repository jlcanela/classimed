import { createRouter } from "@tanstack/react-router";
import type { AppRuntime } from "./app/boot";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  runtime: AppRuntime;
};

export const router = createRouter({
  routeTree,
  context: {
    runtime: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
