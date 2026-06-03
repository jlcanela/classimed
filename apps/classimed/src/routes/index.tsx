import { createFileRoute, redirect } from "@tanstack/react-router";
import { readLlmConfig } from "./_classimed/config/-atoms";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const { apiUrl } = readLlmConfig();
    throw redirect({ to: apiUrl.trim() ? "/reader" : "/config" });
  },
});
