# @magic-spells/pyramid

An MCP server **and** CLI over one shared core for the [Pyramid](https://pyramid.magicspells.io) project-management API. Pass human names and task keys (`WEB-42`, `"In Review"`, an email) — the server resolves them to IDs and hydrates names back into every response.

## Install

No install needed — run it with `npx`:

```sh
npx -y @magic-spells/pyramid --help
```

## Onboarding

1. Open Pyramid → **Settings → API Keys** and generate a key. It looks like `pyk_<prefix>_<secret>`.
2. Give it to the CLI — either export it for the current shell:

   ```sh
   export PYRAMID_API_KEY="pyk_..."
   ```

   …or store it once in your OS keychain so every shell picks it up:

   ```sh
   npx -y @magic-spells/pyramid set-key pyk_...   # show-key (masked) / logout to manage it
   ```

   The key resolves `PYRAMID_API_KEY` (env) → OS keychain → error, so the env var always wins.

3. Confirm it works:

   ```sh
   npx -y @magic-spells/pyramid doctor
   ```

## MCP client config

Add Pyramid to your MCP client (Claude Desktop, etc.):

```json
{
  "mcpServers": {
    "pyramid": {
      "command": "npx",
      "args": ["-y", "@magic-spells/pyramid", "mcp"],
      "env": {
        "PYRAMID_API_KEY": "pyk_...",
        "PYRAMID_BASE_URL": "https://api.pyramid.magicspells.io"
      }
    }
  }
}
```

The server speaks MCP over stdio. All diagnostics go to stderr; stdout is the JSON-RPC channel.

## CLI quickstart

The CLI mirrors the MCP tools 1:1. The agent loop is **`task next → task update → task comment`**:

```sh
# What should I work on?
pyramid task next --json

# Move it forward / change owner / edit fields
pyramid task update WEB-42 --owner cory@example.com --add-labels backend

# Drop a note (stage-scoped — defaults to the task's current stage)
pyramid task comment WEB-42 "Picking this up now"
```

More commands:

```sh
pyramid whoami
pyramid project list
pyramid project workflow <PROJECT>
pyramid task next [--role owner|reporter|any] [--limit N]
pyramid task list <PROJECT> [--status S] [--stage G] [--label L] [--archived]
pyramid task show <KEY> [--expand]
pyramid task search <QUERY> [--limit N]
pyramid task create <TITLE> --project P [--status S] [--owner U] [--labels L] [--priority P] [--due-date D]
pyramid task move <KEY> --status "In Review" [--after-task KEY | --before-task KEY]
pyramid task archive <KEY>
pyramid task delete <KEY>          # gated by PYRAMID_ALLOW_DESTRUCTIVE=1
pyramid comment list <KEY> [--stage G]
pyramid comment reply <COMMENT_ID> "<TEXT>"

# Local — no network call
pyramid set-key <pyk_...>          # store the key in your OS keychain
pyramid show-key                   # print the stored key, masked
pyramid logout                     # clear the stored key
pyramid version                    # print the package version
```

Output is a compact human line in a TTY and JSON when piped or with `--json` (auto-JSON for agents). Diagnostics, prompts, and confirmations go to stderr; stdout is data only. Lists never silently truncate — they surface `next_cursor` (use `--all` to page through, `--limit` to cap).

## Doctor

```sh
pyramid doctor
```

Validates your key, calls `whoami`, lists your projects, and pings the first project's workflow endpoint — the fastest way to confirm auth and connectivity.

## Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `PYRAMID_API_KEY` | yes | — | Your `pyk_`-prefixed API key. **Env-only** — never a CLI flag, to keep it out of shell history. Falls back to the OS keychain (`pyramid set-key`) when unset. |
| `PYRAMID_BASE_URL` | no | `https://api.pyramid.magicspells.io` | API base URL — the API lives on the `api.` subdomain (override with `--base-url`). |
| `PYRAMID_ALLOW_DESTRUCTIVE` | no | — | Set to `1` to enable destructive operations (e.g. `task delete`). |

## Errors

Every failure is one shape: `{ code, message, hint?, candidates? }`. **Act on the `code`, never parse the `message`.** `ambiguous_*` errors list `candidates`; `*_not_found` errors hint the closest available names. Full code union: see [`src/errors.ts`](./src/errors.ts).

CLI exit codes encode the error class (`3` auth, `4` permission, `5` not-found, `6` ambiguous, `7` validation/conflict, `8` destructive-disabled, `9` rate-limited, `10` network, `1` unknown, `2` usage).

## License

MIT
