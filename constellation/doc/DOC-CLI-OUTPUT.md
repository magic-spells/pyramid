---
name: CLI output & exit contract
kind: guide
status: planned
connections:
  - DATATYPE-MCP-ERROR
  - DOC-ERROR-MODEL
  - DOC-DESIGN-RULES
  - FILE-CLI
  - DATATYPE-CLI-OPTIONS
---

# CLI output & exit contract

The CLI must be equally usable by a human reading a terminal and an agent parsing stdout.

- **Format.** `--json` forces machine output; **stdout-not-a-TTY also defaults to JSON**, so
  `pyramid task next` inside an agent's Bash tool is parseable with zero flags. A TTY gets a
  compact human table. `--json` always wins.
- **Streams.** stdout = data only; **all diagnostics, prompts, progress → stderr** (mirrors the
  MCP's "stdout is the channel" discipline). Pipes stay clean.
- **Exit codes.** `0` on success; non-zero **by error class** from [[DATATYPE-MCP-ERROR]]
  ([[DOC-ERROR-MODEL]]) — `auth_invalid`, `not_found`, `ambiguous_name`,
  `destructive_action_disabled`, … — so scripts branch on `$?` and agents get a typed signal,
  not a parsed string. Under `--json` an error prints as `{ "error": { code, message, … } }`;
  one human line otherwise.
- **No silent truncation.** Lists surface pagination / next-cursor ([[DOC-DESIGN-RULES]] r8);
  `--limit` / `--all` control volume explicitly.
- **Destructive.** `delete` and other gated verbs require `PYRAMID_ALLOW_DESTRUCTIVE=1` **and**
  an interactive confirm — or `--yes` for non-interactive callers ([[DOC-DESIGN-RULES]] r9).
