---
name: Discovery & profile tools
kind: guide
status: planned
connections:
  - DATATYPE-WHOAMI
  - DATATYPE-PROJECT-SUMMARY
  - DATATYPE-WORKFLOW
  - DATATYPE-TASK-SUMMARY
  - FILE-TOOLS-DISCOVERY
  - PLAN-PHASE-2-CORE-TOOLS
---

# Discovery & profile tools

Grouped read tools that orient the AI. Built in [[FILE-TOOLS-DISCOVERY]].

| Tool | Returns | Notes |
|---|---|---|
| `whoami()` | [[DATATYPE-WHOAMI]] | current user + the key's one workspace + accessible projects |
| `list_projects(filter?)` | [[DATATYPE-PROJECT-SUMMARY]][] | projects in the workspace |
| `get_project_workflow(project)` | [[DATATYPE-WORKFLOW]] | stages/statuses/labels/members/templates; warms the resolver cache (60s) |
| `list_my_tasks(filter?)` | [[DATATYPE-TASK-SUMMARY]][] | tasks owned or reported by me across accessible projects |

Also surfaced as resources ([[FILE-RESOURCES]]).
