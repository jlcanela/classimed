import "@mantine/core/styles.css";
import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Effect } from "effect";
import { MantineProvider } from "@mantine/core";
import { boot } from "./app/boot";
import App from "./App";

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

