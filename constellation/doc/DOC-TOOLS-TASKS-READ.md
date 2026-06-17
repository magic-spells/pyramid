---
name: Task read tools
kind: guide
status: built
connections:
  - DATATYPE-TASK-SUMMARY
  - DATATYPE-TASK-DETAIL
  - DOC-NAME-RESOLUTION
  - FILE-TOOLS-TASKS
  - PLAN-PHASE-2-CORE-TOOLS
---

# Task read tools

Built in [[FILE-OPERATIONS]]; the writes are the per-tool `API-TOOL-*` cards.

| Tool | Returns | Notes |
|---|---|---|
| `list_tasks(project, filter?)` | [[DATATYPE-TASK-SUMMARY]] page | filter by status/stage/assignee(owner)/label/query; `archived=false` default ([[DOC-DESIGN-RULES]] rule 9); paginated |
| `get_task(task, expand?)` | [[DATATYPE-TASK-DETAIL]] | `task` = `WEB-42` or UUID; `expand: true` requests owner/reporter/labels |
| `search_tasks(query, limit?)` | [[DATATYPE-TASK-SUMMARY]] page | full-text workspace search; wraps `GET /v1/search/tasks` |

All inputs accept names; all outputs hydrate ([[DOC-NAME-RESOLUTION]]).
