import { Data } from "effect";

export class BootError extends Data.TaggedError("BootError")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class PersistenceError extends Data.TaggedError("PersistenceError")<{
  readonly cause?: unknown;
}> {}
