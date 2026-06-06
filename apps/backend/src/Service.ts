import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Etag from "effect/unstable/http/Etag";
import * as HttpPlatform from "effect/unstable/http/HttpPlatform";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpApiBuilder from "effect/unstable/httpapi/HttpApiBuilder";
import {
  BackendApi,
  LlmResponse,
} from "./Spec.ts";
import type { ChatPayload } from "./Spec.ts";

const upstreamUrl = "http://internal/v1/chat/completions";

const fetchLllmResponse = (payload: ChatPayload, env: Record<string, any>) =>
  Effect.gen(function* () {
   
    const upstreamResp: any = yield* Effect.tryPromise({
      try: () =>
        env.VPC_SERVICE.fetch(
          new Request(upstreamUrl, {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "x-request-id": "dummy-requestId",
            },
            body: JSON.stringify(payload),
          })),
      catch: (cause) => cause,
    });

    if (!upstreamResp.ok) {
      const text = yield* Effect.tryPromise({
        try: () => upstreamResp.text(),
        catch: (cause) => cause,
      });

      return new LlmResponse({
        message: {
          error: "upstream_error",
          status: upstreamResp.status,
          body: text,
        },
      });
    }

    const message = yield* Effect.tryPromise({
      try: () => upstreamResp.json(),
      catch: (cause) => cause,
    });

    return new LlmResponse({ message });
  }).pipe(
    Effect.tapError((error) =>
      Effect.sync(() =>
        console.error("Error fetching LLM response:", {
          error: error instanceof Error ? error.message : String(error),
        }),
      ),
    ),
    Effect.orElseSucceed(() =>
      new LlmResponse({
        message: {
          error: "upstream_fetch_failed",
        },
      }),
    ),
  );

export default class Service extends Cloudflare.Worker<Service>()(
  "Service",
  {
    main: import.meta.filename,
  },
  Effect.gen(function* () {
    const env = yield* Cloudflare.WorkerEnvironment;

    const llmGroup = HttpApiBuilder.group(BackendApi, "LlmGroup", (handlers) =>
      handlers.handle("llmCall", ({ payload }) => fetchLllmResponse(payload, env)),
    );

    return {
      fetch: HttpApiBuilder.layer(BackendApi).pipe(
        Layer.provide(llmGroup),
        Layer.provide([HttpPlatform.layer, Etag.layer]),
        HttpRouter.toHttpEffect,
      ),
    };
  }),
) {}


