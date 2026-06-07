#!/usr/bin/env bun
// Generates Mermaid state diagrams from all XState -machine.ts files.

// --- Block extractors ---

function extractBraceBlock(src: string, startIdx: number): string {
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}" && --depth === 0) return src.slice(startIdx, i + 1);
  }
  return src.slice(startIdx);
}

function extractBracketBlock(src: string, startIdx: number): string {
  let depth = 0;
  for (let i = startIdx; i < src.length; i++) {
    if (src[i] === "[") depth++;
    else if (src[i] === "]" && --depth === 0) return src.slice(startIdx, i + 1);
  }
  return src.slice(startIdx);
}

function findBraceBlock(src: string, keyword: string): string | null {
  const m = new RegExp(`\\b${keyword}\\s*:\\s*\\{`).exec(src);
  if (!m) return null;
  return extractBraceBlock(src, m.index + m[0].length - 1);
}

// All top-level { } objects inside a [ ] block.
function topLevelObjectsOf(bracketBlock: string): string[] {
  const inner = bracketBlock.slice(1, -1);
  const blocks: string[] = [];
  let i = 0;
  let parenDepth = 0;
  let bracketDepth = 0;
  while (i < inner.length) {
    const ch = inner[i];
    if (ch === "(") parenDepth++;
    else if (ch === ")") parenDepth--;
    else if (ch === "[") bracketDepth++;
    else if (ch === "]") bracketDepth--;
    else if (ch === "{" && parenDepth === 0 && bracketDepth === 0) {
      const block = extractBraceBlock(inner, i);
      blocks.push(block);
      i += block.length;
      continue;
    }
    i++;
  }
  return blocks;
}

// All top-level UPPERCASE_KEY: {value} or [value] entries in an on: { } block.
function eventsOf(onBlock: string): Array<{ name: string; valueBlock: string }> {
  const inner = onBlock.slice(1, -1);
  const events: Array<{ name: string; valueBlock: string }> = [];
  let i = 0;
  while (i < inner.length) {
    const m = /^([A-Z][A-Z0-9_]*)\s*:\s*([{[])/.exec(inner.slice(i));
    if (m) {
      const valueStart = i + m[0].length - 1;
      const valueBlock = m[2] === "["
        ? extractBracketBlock(inner, valueStart)
        : extractBraceBlock(inner, valueStart);
      events.push({ name: m[1], valueBlock });
      i = valueStart + valueBlock.length;
    } else {
      i++;
    }
  }
  return events;
}

// Top-level identifier keys of an object block (used to extract state names).
function keysOf(objBlock: string): string[] {
  const inner = objBlock.slice(1, -1);
  const keys: string[] = [];
  let i = 0;
  while (i < inner.length) {
    const m = /^(\w+)\s*:\s*\{/.exec(inner.slice(i));
    if (m) {
      const valueStart = i + m[0].length - 1;
      keys.push(m[1]);
      i = valueStart + extractBraceBlock(inner, valueStart).length;
    } else {
      i++;
    }
  }
  return keys;
}

// --- Parse ---

interface Transition { from: string; to: string; label: string; guard?: string }

interface MachineData {
  initial: string;
  invokeMap: Map<string, string>;
  selfEventMap: Map<string, string[]>;
  transitions: Transition[];
}

function parseGuard(block: string): string | undefined {
  const m = block.match(/\bguard:\s*\(\{[^}]+\}\)\s*=>\s*([^\n,}]+)/);
  if (!m) return undefined;
  return m[1].trim()
    .replace(/context\.(\w+)\s*===\s*"(\w+)"/g, "$1=$2")
    .replace(/context\.(\w+)\s*===\s*(\w+)/g, "$1=$2");
}

function parseMachine(source: string): MachineData | null {
  const initial = source.match(/\binitial:\s*"(\w+)"/)?.[1];
  const statesBlock = findBraceBlock(source, "states");
  if (!initial || !statesBlock) return null;

  const transitions: Transition[] = [];
  const invokeMap = new Map<string, string>();
  const selfEventMap = new Map<string, string[]>();

  for (const stateName of keysOf(statesBlock)) {
    const stateBlock = findBraceBlock(statesBlock, stateName);
    if (!stateBlock) continue;

    const invokeBlock = findBraceBlock(stateBlock, "invoke");
    if (invokeBlock) {
      const src = invokeBlock.match(/\bsrc:\s*"(\w+)"/)?.[1];
      if (src) invokeMap.set(stateName, src);

      const onDoneTarget = findBraceBlock(invokeBlock, "onDone")?.match(/\btarget:\s*"(\w+)"/)?.[1];
      if (onDoneTarget) transitions.push({ from: stateName, to: onDoneTarget, label: "onDone" });

      const onErrorTarget = findBraceBlock(invokeBlock, "onError")?.match(/\btarget:\s*"(\w+)"/)?.[1];
      if (onErrorTarget) transitions.push({ from: stateName, to: onErrorTarget, label: "onError" });
    }

    const onBlock = findBraceBlock(stateBlock, "on");
    if (!onBlock) continue;

    for (const { name: eventName, valueBlock } of eventsOf(onBlock)) {
      const objs = valueBlock[0] === "[" ? topLevelObjectsOf(valueBlock) : [valueBlock];
      for (const obj of objs) {
        const target = obj.match(/\btarget:\s*"(\w+)"/)?.[1];
        const guard = parseGuard(obj);
        if (target) {
          transitions.push({ from: stateName, to: target, label: eventName, guard });
        } else {
          const self = selfEventMap.get(stateName) ?? [];
          if (!self.includes(eventName)) self.push(eventName);
          selfEventMap.set(stateName, self);
        }
      }
    }
  }

  return { initial, invokeMap, selfEventMap, transitions };
}

// --- Render ---

function renderMermaid(data: MachineData): string {
  const lines: string[] = ["stateDiagram-v2", `    [*] --> ${data.initial}`, ""];

  for (const [state, src] of data.invokeMap)
    lines.push(`    state ${state} : invoke ${src}`);
  if (data.invokeMap.size > 0) lines.push("");

  for (const [state, events] of data.selfEventMap)
    lines.push(`    ${state} --> ${state} : ${events.join(" / ")}`);
  if (data.selfEventMap.size > 0) lines.push("");

  for (const t of data.transitions) {
    const guard = t.guard ? ` [${t.guard}]` : "";
    lines.push(`    ${t.from} --> ${t.to} : ${t.label}${guard}`);
  }

  return ["```mermaid", ...lines, "```"].join("\n");
}

function renderMarkdown(machinePath: string, data: MachineData): string {
  const name = machinePath.split("/").at(-2) ?? "unknown";
  const title = name.charAt(0).toUpperCase() + name.slice(1);
  return [
    `# ${title} Machine — State Diagram`,
    "",
    `_Generated from \`${machinePath}\`._`,
    "",
    renderMermaid(data),
    "",
  ].join("\n");
}

function outputPath(machinePath: string): string {
  const name = machinePath.split("/").at(-2) ?? "unknown";
  return `doc/${name}-machine.md`;
}

// --- Main ---

const glob = new Bun.Glob("**/-machine.ts");
const machineFiles = [...glob.scanSync({ cwd: ".", dot: false })]
  .filter(f => !f.includes("node_modules"))
  .sort();

if (machineFiles.length === 0) {
  console.error("No -machine.ts files found");
  process.exit(1);
}

for (const machinePath of machineFiles) {
  const source = await Bun.file(machinePath).text();
  const data = parseMachine(source);
  if (!data) {
    console.warn(`⚠ Skipped ${machinePath} (no initial state or states block found)`);
    continue;
  }
  await Bun.write(outputPath(machinePath), renderMarkdown(machinePath, data));
  console.log(`✓ Written to ${outputPath(machinePath)}`);
}
