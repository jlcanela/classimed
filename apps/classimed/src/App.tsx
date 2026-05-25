import { RouterProvider } from "@tanstack/react-router";
import type { AppRuntime } from "./app/boot";
import { router } from "./router";

export default function App({ runtime }: { runtime: AppRuntime }) {
  return <RouterProvider router={router} context={{ runtime }} />;
}
