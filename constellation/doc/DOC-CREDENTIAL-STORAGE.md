---
name: Decision — store the API key in the OS keychain
kind: decision
status: built
connections:
  - FILE-CONFIG
  - FILE-KEYCHAIN
  - FILE-AUTH-COMMANDS
  - FILE-BIN
  - DATATYPE-MCP-CONFIG
  - DOC-AUTH-WORKSPACE
  - FLOW-CREDENTIAL-RESOLUTION
  - FLOW-CLI-BROWSER-LOGIN
  - PLAN-V2-ROADMAP
  - DOC-ONBOARDING
---

# Decision — store the API key in the OS keychain

**Context.** A `pyk_` key is password-equivalent ([[DOC-AUTH-WORKSPACE]]). Plain env storage is still supported for CI/headless MCP clients, but local users should not have to keep the key in a readable shell profile or MCP config dotfile.

**Decision.** OS-keychain storage is the preferred local at-rest location, while `env` remains the explicit override. Startup resolution order ([[FLOW-CREDENTIAL-RESOLUTION]], [[FILE-CONFIG]]):

> `PYRAMID_API_KEY` (env) -> OS keychain -> error

- **Store ([[FILE-KEYCHAIN]]):** macOS via the built-in `/usr/bin/security` generic-password (service `pyramid`, account `default`) — no native dependency. Non-macOS falls back to a `chmod 600` file at `~/.config/pyramid/credentials.json`. Full Windows / Linux secret-service support is later polish.
- **Write path:** `pyramid set-key <pyk_...>` (aliases `set-api-key` / `set-token`) -> `setKey`; `pyramid logout` -> `deleteKey`; `pyramid show-key` -> masked status ([[FILE-AUTH-COMMANDS]], [[FILE-BIN]]). These are bin built-ins handled before config load so a user can store a key without already having one.
- **Reserved browser path:** `pyramid login` is a stub today; it points users to `set-key`. The real browser handoff is [[FLOW-CLI-BROWSER-LOGIN]].
- **MCP never writes credentials.** A non-interactive stdio process only reads through [[FILE-CONFIG]]; there is deliberately no model-callable "set key" tool.

**Caveats (documented, accepted):**

- A subprocess keychain read, such as `pyramid mcp` launched by Claude Code, may show a one-time macOS allow-access prompt. Headless / CI has no keychain, which is why `env` stays the override.
- `security add-generic-password -w <key>` briefly exposes the key in the local process list during an interactive one-time `set-key`; acceptable for this local setup flow.

**Why.** Moves the password-equivalent out of plaintext dotfiles into OS-encrypted, OS-gated storage on the common macOS path, with a dependency-free fallback elsewhere. OAuth/browser login remains a separate v2 item ([[PLAN-V2-ROADMAP]], [[FLOW-CLI-BROWSER-LOGIN]]).
