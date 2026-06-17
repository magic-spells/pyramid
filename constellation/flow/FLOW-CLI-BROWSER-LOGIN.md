---
name: Browser login handoff (pyramid login) — future
status: planned
triggers:
  - kind: manual
connections:
  - FILE-AUTH-COMMANDS
  - FILE-KEYCHAIN
  - DOC-CREDENTIAL-STORAGE
  - PLAN-V2-ROADMAP
  - EXTERNAL-PYRAMID-API
---

# Browser login handoff — `pyramid login` (future, v2)

The seamless alternative to a manual `set-key` paste: obtain a key via the browser and save it to
the keychain. **Not built** — reserved by the `login` stub in [[FILE-AUTH-COMMANDS]]; depends on a
new `pyramid-server` endpoint. See [[PLAN-V2-ROADMAP]].

1. `pyramid login` starts a tiny localhost callback server + opens the browser to
   `pyramid.magicspells.io/auth/cli` (with a `state` + the loopback `redirect_uri`).
2. The user signs in (browser session cookies authenticate them at the IdP); the page **mints a
   scoped `pyk_` key** and redirects to the loopback URL with it (or a short-lived code the terminal
   exchanges).
3. The localhost server captures the key, validates `state`, shows "you can close this tab," and
   the terminal stores it via [[FILE-KEYCHAIN]] `setKey` — same store the MCP/CLI read from
   ([[DOC-CREDENTIAL-STORAGE]]).
4. `pyramid logout` revokes/clears it.

**Server dependency (`pyramid-server`):** a `/auth/cli` route that authenticates an interactive
session and returns a freshly minted, workspace-scoped key to the loopback redirect. Until that
exists, `pyramid login` points the user at `pyramid set-key`. (OAuth refresh-token flow is the
heavier variant in [[PLAN-V2-ROADMAP]].)
