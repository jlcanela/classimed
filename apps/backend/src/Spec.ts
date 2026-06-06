import * as Schema from "effect/Schema";
import * as HttpApi from "effect/unstable/httpapi/HttpApi";
import * as HttpApiEndpoint from "effect/unstable/httpapi/HttpApiEndpoint";
import * as HttpApiGroup from "effect/unstable/httpapi/HttpApiGroup";

export class LlmResponse extends Schema.Class<LlmResponse>("LlmResponse")({
  message: Schema.Any,
}) {}

export const ChatPayloadSchema = Schema.Struct({
  model: Schema.Literal("Qwen/Qwen2.5-7B-Instruct-AWQ"),
  temperature: Schema.Literal(0.1),
  response_format: Schema.Struct({
    type: Schema.Literal("json_object"),
  }),
  messages: Schema.Tuple([
    Schema.Struct({
      role: Schema.Literal("system"),
      content: Schema.String,
    }),
    Schema.Struct({
      role: Schema.Literal("user"),
      content: Schema.String,
    }),
  ]),
});

export type ChatPayload = Schema.Schema.Type<typeof ChatPayloadSchema>;

export const llmCall = HttpApiEndpoint.post("llmCall", "/chat", {
  payload: ChatPayloadSchema,
  success: LlmResponse,
});

export class LlmGroup extends HttpApiGroup.make("LlmGroup").add(llmCall) {}

export class BackendApi extends HttpApi.make("BackendApi").add(LlmGroup) {}

