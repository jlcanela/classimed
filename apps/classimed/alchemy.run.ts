import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "MyApp",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
     const worker = yield* Cloudflare.Vite("classimed");

     return {
        url: worker.url,
     }
    // we'll add resources here next
  }),
);