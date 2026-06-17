---
name: Onboarding
kind: guide
status: built
connections:
  - DATATYPE-MCP-CONFIG
  - EXTERNAL-PYRAMID-API
  - DOC-AUTH-WORKSPACE
  - DOC-PACKAGE-RENAME
  - DOC-CLI
  - DOC-CREDENTIAL-STORAGE
  - FILE-AUTH-COMMANDS
---

# Onboarding

1. Open Pyramid (`pyramid-web`) -> **Settings -> API Keys** -> "Generate new key". A key is bound to the workspace you create it in ([[DOC-AUTH-WORKSPACE]]).
2. Name it and copy it once (`pyk_<prefix>_<secret>`).
3. Preferred local setup: store the key in the OS keychain with the `pyramid` bin ([[DOC-CREDENTIAL-STORAGE]], [[FILE-AUTH-COMMANDS]]):

```sh
npx -y @magic-spells/pyramid set-key pyk_...
```

4. Add the MCP server to the client config (`~/.claude.json` or `.mcp.json`). The server is the `mcp` subcommand of the `pyramid` bin ([[DOC-PACKAGE-RENAME]]):

```jsonc
{
  "mcpServers": {
    "pyramid": {
      "command": "npx",
      "args": ["-y", "@magic-spells/pyramid", "mcp"],
      "env": {
        "PYRAMID_BASE_URL": "https://api.pyramid.magicspells.io"
      }
    }
  }
}
```

5. Restart the AI tool.
6. Run the `pyramid:doctor` prompt or `npx -y @magic-spells/pyramid doctor` — it confirms the authenticated user, workspace, and accessible projects.

For CI, headless runs, or clients where keychain access is inconvenient, set `PYRAMID_API_KEY` in the MCP `env` block instead. Env always wins over the keychain. Local key management commands are `pyramid show-key` (masked), `pyramid logout` (clear stored key), and reserved stub `pyramid login` (future browser flow; today it points users to `set-key`).
