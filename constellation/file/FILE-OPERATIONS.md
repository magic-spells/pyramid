---
name: src/operations/index.ts
status: planned
path: src/operations/index.ts
language: typescript
summary: Surface-agnostic operation registry — the single source the MCP tools and the CLI both render from.
connections:
  - FILE-PYRAMID-CLIENT
  - FILE-RESOLVER
  - FILE-SERVER
  - FILE-CLI
  - DOC-DESIGN-RULES
  - API-TOOL-CREATE-TASK
---

The seam that keeps the two surfaces DRY. Each **operation** is one entry:

```ts
interface Operation<I, O> {
  name: string;                              // e.g. "task.create" — the verb shared by tool + command
  summary: string;
  input: ZodType<I>;                         // SDK emits JSON Schema (MCP); CLI derives flags/args from it
  run(input: I, ctx: OpContext): Promise<O>; // resolve names → client call → hydrate
}
```

`run` is where the Pyramid logic lives — name resolution ([[FILE-RESOLVER]]), the
[[FILE-PYRAMID-CLIENT]] call, response hydration, and the design invariants
([[DOC-DESIGN-RULES]]). The MCP layer ([[FILE-SERVER]]) maps each operation to
`server.tool(name, input, run)`; the CLI layer ([[FILE-CLI]]) maps the same entry to a
subcommand + arg parser. The `API-TOOL-*` cards (e.g. [[API-TOOL-CREATE-TASK]]) **are** these
operations — one registry, two renderings.

> **Shared seam — owned jointly with the MCP build.** Defining it here is what lets the MCP
> tools stay thin and the CLI add zero new Pyramid logic. If the MCP tools are written directly
> against `server.tool` instead, this registry must wrap them before the CLI can reuse them.
> See [[DOC-PACKAGE-RENAME]].
