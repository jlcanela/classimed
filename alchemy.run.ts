import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";
import { Path } from "effect/Path";
import Service from "backend/Service";

export default Alchemy.Stack(
  "Monorepo",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const backend = yield* Service;
    const path = yield* Path;

    const website = yield* Cloudflare.Vite("Website", {
      rootDir: path.resolve(new URL(".", import.meta.url).pathname, "apps/classimed"),
      assets: {
        notFoundHandling: "single-page-application",
      },
      url: false,
    });

    const proxy = yield* Cloudflare.Worker("Proxy", {
      name: "classimed-v1",
      subdomain: {
        enabled: true,
      },
      main: "./apps/classimed/worker.ts",
      env: {
        BACKEND: backend,
        WEBSITE: website,
      },
    });

    return {
      proxyUrl: proxy.url.as<string>(),
      websiteUrl: website.url.as<string>(),
      backendUrl: backend.url.as<string | undefined>(),
    };
  }),
);
