---
name: src/server.ts
status: planned
path: src/server.ts
language: typescript
summary: 'MCP skin: builds the McpServer and registers each operation from the registry as a tool.'
connections:
  - FILE-OPERATIONS
  - FILE-RESOURCES
  - FILE-PROMPTS
  - DOC-ARCHITECTURE
  - FLOW-STARTUP-AUTH
  - FILE-BIN
  - DOC-RENDERING
---

The **MCP skin**. Builds the `McpServer` (`{ name, version, instructions }`) and registers tools by
**walking the operation registry** ([[FILE-OPERATIONS]]) — `server.tool(op.name, op.input, op.run)`
for each — plus resources ([[FILE-RESOURCES]]) and prompts ([[FILE-PROMPTS]]). Holds the shared
`PyramidClient` ([[FILE-PYRAMID-CLIENT]]) + `Resolver` ([[FILE-RESOLVER]]) in the operation context.
The `instructions` string carries the render recipe ([[DOC-RENDERING]]): the left-rail task card,
list-vs-detail, the hydration guarantee, never-auto-paginate, confirm bulk/destructive, dates UTC,
and "act on the error `code`, not the message." Invoked by the `pyramid mcp` branch of [[FILE-BIN]].
