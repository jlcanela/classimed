import "@mantine/core/styles.css";
import "./styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { Effect } from "effect";
import { MantineProvider } from "@mantine/core";
import { boot } from "./app/boot";
import App from "./App";

Effect.runFork(
  Effect.gen(function* () {
    const runtime = yield* boot;
    yield* Effect.sync(() => {
      ReactDOM.createRoot(document.getElementById("app") as HTMLElement).render(
        <React.StrictMode>
          <MantineProvider>
            <App runtime={runtime} />
          </MantineProvider>
        </React.StrictMode>,
      );
    });
  }).pipe(
    Effect.catchDefect((defect) =>
      Effect.sync(() => {
        (document.getElementById("app") as HTMLElement).innerHTML =
          `<div style="padding:24px;color:red;font-family:sans-serif">
            <strong>Failed to start application</strong><br/>${String(defect)}
          </div>`;
      }),
    ),
  ),
);
