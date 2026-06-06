import { HttpApiClient } from "effect/unstable/httpapi";
import { BackendApi } from "./Spec.ts";

export const BackendClient = (baseUrl: string) =>
  HttpApiClient.make(BackendApi, { baseUrl });