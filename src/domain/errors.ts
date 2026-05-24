import { Schema } from "effect";

export class BootError extends Schema.TaggedErrorClass<BootError>()("BootError", {
  message: Schema.String,
  cause: Schema.optional(Schema.Defect),
}) {}

export class PersistenceError extends Schema.TaggedErrorClass<PersistenceError>()("PersistenceError", {
  cause: Schema.optional(Schema.Defect),
}) {}
