---
name: Task read tools
kind: guide
status: planned
connections:
  - DATATYPE-TASK-SUMMARY
  - DATATYPE-TASK-DETAIL
  - DOC-NAME-RESOLUTION
  - FILE-TOOLS-TASKS
  - PLAN-PHASE-2-CORE-TOOLS
---

# Task read tools

Built in [[FILE-TOOLS-TASKS]]; the writes are the per-tool `API-TOOL-*` cards.

| Tool | Returns | Notes |
|---|---|---|
| `list_tasks(project, filter?)` | [[DATATYPE-TASK-SUMMARY]][] | filter by status/stage/assignee/label; `archived=false` default ([[DOC-DESIGN-RULES]] rule 8); paginated |
| `get_task(task, include?)` | [[DATATYPE-TASK-DETAIL]] | `task` = `WEB-42` or UUID; `include ⊆ editor\|timeline\|comments\|estimates\|followers\|attachments` |
| `search_tasks(query, project?)` | [[DATATYPE-TASK-SUMMARY]][] | full-text; wraps `GET /v1/search/tasks` |

All inputs accept names; all outputs hydrate ([[DOC-NAME-RESOLUTION]]).
