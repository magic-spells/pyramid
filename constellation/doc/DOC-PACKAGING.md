---
name: Decision — TypeScript, build to dist, publish dist only
kind: decision
status: planned
connections:
  - DATATYPE-MCP-CONFIG
  - DOC-PACKAGE-RENAME
---

# Decision — TypeScript, build to `dist`, publish `dist` only

**Scope:** the *build / publish mechanics*. The package **name, bin, and env var** are defined by
[[DOC-PACKAGE-RENAME]] (one public `@magic-spells/pyramid`, one `pyramid` bin) — this card no
longer names them.

**Decision.**
- **TypeScript, ESM, Node ≥ 22.** `tsc` → `dist/`. `tsx` for dev, `vitest` for tests.
- **Publish the compiled `dist/` only** — `files: ["dist"]`, `main`/`types`/`bin` → `dist/...`,
  `prepublishOnly: "npm run build"`. (Answers the open question: ship `dist`, not `src`.)
- `publishConfig.access: "public"`.

**Why.** Type safety on the shared client + operation-registry surface is worth the build step;
`dist`-only keeps the `npx` tarball small. Consistent with `@magic-spells/constellation`.
