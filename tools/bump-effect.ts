import yaml from "yaml";

const version = Bun.argv[2];

if (!version) {
  console.error("Usage: bun run bump-effect.ts <version>");
  process.exit(1);
}

const file = Bun.file("pnpm-workspace.yaml");

if (!(await file.exists())) {
  console.error("pnpm-workspace.yaml not found");
  process.exit(1);
}

const workspace = yaml.parse(await file.text()) ?? {};
workspace.catalog ??= {};

workspace.catalog["effect"] = version;
workspace.catalog["@effect/platform-bun"] = version;
workspace.catalog["@effect/platform-node"] = version;

await Bun.write("pnpm-workspace.yaml", yaml.stringify(workspace));
