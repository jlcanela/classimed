import "@mantine/core/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Effect } from "effect";
import { Box, MantineProvider, Tabs } from "@mantine/core";
import { boot, type AppRuntime } from "./app/boot";
import { TodoPage } from "./ui/TodoPage";

function App({ runtime }: { runtime: AppRuntime }) {
  return (
    <Tabs defaultValue="todo" keepMounted={false}>
      <Tabs.List>
        <Tabs.Tab value="design">Design</Tabs.Tab>
        <Tabs.Tab value="todo">TODO</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="todo" pt="md">
        <TodoPage runtime={runtime} />
      </Tabs.Panel>

      <Tabs.Panel value="design" pt="md">
        <Box h="calc(100vh - 120px)">
          <iframe
            title="ClassiMed Translate Design"
            src="/design/ClassiMed%20Translate.html"
            style={{ width: "100%", height: "100%", border: 0, background: "white" }}
          />
        </Box>
      </Tabs.Panel>
    </Tabs>
  );
}

Effect.runPromise(boot)
  .then((runtime) => {
    ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
      <React.StrictMode>
        <MantineProvider>
          <App runtime={runtime} />
        </MantineProvider>
      </React.StrictMode>,
    );
  })
  .catch((error: unknown) => {
    const root = document.getElementById("app") as HTMLElement;
    root.innerHTML = `<div style="padding:24px;color:red;font-family:sans-serif">
      <strong>Failed to start application</strong><br/>${String(error)}
    </div>`;
  });

  