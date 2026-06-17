---
name: src/auth-commands.ts
status: built
path: src/auth-commands.ts
language: typescript
summary: Local credential commands (set-key / show-key / logout / login) for the pyramid bin.
connections:
  - FILE-KEYCHAIN
  - FILE-BIN
  - DOC-CREDENTIAL-STORAGE
  - FLOW-CLI-BROWSER-LOGIN
---

Local credential commands for the `pyramid` bin ([[DOC-CREDENTIAL-STORAGE]]). They manage the
keychain-stored API key and make **no network call**, so [[FILE-BIN]] dispatches to them BEFORE
config load (you can store a key without already having one). [[FILE-CONFIG]] later READS the key.

```ts
export function maskKey(key: string): string;            // pyk_<prefix>_…<last4> (never the full secret)
export function runSetKey(argv, io?): number;            // pyramid set-key <pyk_...>  (validate pyk_ -> setKey)
export function runShowKey(argv, io?): number;           // pyramid show-key  (masked status)
export function runLogout(argv, io?): number;            // pyramid logout   (deleteKey)
export function runLogin(argv, io?): number;             // pyramid login    (stub -> set-key; future FLOW-CLI-BROWSER-LOGIN)
export const AUTH_COMMANDS: Record<string, (argv) => number>; // incl. aliases set-api-key / set-token
```

- Side effects (keychain + output) are an injected `AuthIO`, so handlers are unit-tested without
  touching the real keychain ([[FILE-KEYCHAIN]]).
- Each returns a process exit code; [[FILE-BIN]] owns `process.exit`. Output is stderr-only.
- The full secret is NEVER printed ([[maskKey]]); validation rejects a non-`pyk_` value.
- `pyramid login` is a reserved stub today; the real browser handoff is [[FLOW-CLI-BROWSER-LOGIN]].
