import { Effect, Layer, ManagedRuntime } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { makeTaskRepositoryLayer, TaskRepository } from "../repo/task-repo";
import { GlossaryTermRepository } from "../repo/glossary-term-repo";
import { Database, DatabaseLive } from "@/db/DB";
import { Migration } from "@/db/Migration";
import { Seed } from "@/db/Seed";

export type AppRuntime = ManagedRuntime.ManagedRuntime<TaskRepository | GlossaryTermRepository | Database, never>;

const repositoryLayer = Layer.unwrap(
  Effect.gen(function* () {
    const db = yield* Database;
    const { migrate } = yield* Migration;
    const { seedGlossaryTerms } = yield* Seed;

    yield* migrate(db).pipe(Effect.tapCause(Effect.logError), Effect.orDie);
    yield* seedGlossaryTerms(db).pipe(Effect.tapCause(Effect.logError), Effect.orDie);

    return Layer.merge(
      makeTaskRepositoryLayer(db),
      GlossaryTermRepository.layer(db),
    );
  }),
).pipe(Layer.provide(DatabaseLive), Layer.provide(Migration.layer), Layer.provide(Seed.layer));

export const appLayer = Layer.mergeAll(DatabaseLive, repositoryLayer);

export const atomRuntime = Atom.runtime(appLayer);

export const boot: Effect.Effect<AppRuntime, never, never> =
  Effect.succeed(ManagedRuntime.make(appLayer));
