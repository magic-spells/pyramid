---
name: src/resources/index.ts
status: planned
path: src/resources/index.ts
language: typescript
summary: 'MCP resources: me, projects, project workflow.'
connections:
  - DATATYPE-WHOAMI
  - DATATYPE-PROJECT-SUMMARY
  - DATATYPE-WORKFLOW
  - DOC-TOOLS-DISCOVERY
---

MCP resources (read-only context the AI can auto-load): `pyramid://me` ([[DATATYPE-WHOAMI]]),
`pyramid://projects` ([[DATATYPE-PROJECT-SUMMARY]]), `pyramid://projects/{slug}/workflow`
([[DATATYPE-WORKFLOW]], cached). Loading the workflow resource once eliminates most
name-resolution errors ([[DOC-NAME-RESOLUTION]]).
