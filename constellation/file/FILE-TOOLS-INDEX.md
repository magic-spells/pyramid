---
name: src/tools/index.ts
status: planned
path: src/tools/index.ts
language: typescript
summary: registerTools(server, ctx) — single tool-registration entrypoint.
connections:
  - FILE-SERVER
  - DOC-TOOLS-DISCOVERY
  - DOC-TOOLS-TASKS-READ
  - DOC-TOOLS-COMMENTS
  - FILE-TOOLS-TASKS
  - FILE-TOOLS-COMMENTS
  - FILE-TOOLS-DISCOVERY
---

`registerTools(server, ctx)` — the single registration entrypoint called by [[FILE-SERVER]].
Imports and registers each area module: discovery ([[FILE-TOOLS-DISCOVERY]]), tasks
([[FILE-TOOLS-TASKS]]), comments ([[FILE-TOOLS-COMMENTS]]), and (phase 3) collab
([[FILE-TOOLS-COLLAB]]). Each tool: `zod` input schema → SDK JSON Schema; resolve names; call
the client; hydrate + return.
