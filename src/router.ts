import { createRouter } from "@tanstack/react-router";
import type { AppRuntime } from "./app/boot";
import { routeTree } from "./routeTree.gen";

export type RouterContext = {
  runtime: AppRuntime;
};

const baseUrl = import.meta.env.BASE_URL;
const routerBasepath = baseUrl.endsWith("/")
  ? baseUrl.slice(0, -1) || "/"
  : baseUrl;

export const router = createRouter({
  routeTree,
  basepath: routerBasepath,
  context: {
    runtime: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
