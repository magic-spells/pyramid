---
name: create_tasks_bulk
kind: mcp-tool
status: built
methods:
  POST:
    request_schema: DATATYPE-CREATE-TASKS-BULK-INPUT
    response_schema: DATATYPE-TASK-DETAIL
connections:
  - FILE-TOOLS-TASKS
  - PLAN-PHASE-2-CORE-TOOLS
---

`create_tasks_bulk` — create many tasks atomically ([[DATATYPE-CREATE-TASKS-BULK-INPUT]]).
Handles "create these tasks and put them in the ready-for-design phase". Wraps
`POST /v1/tasks/bulk`, which requires a **top-level `project_id` + `template_id`** (one
template for the whole batch) and per-row `{title, status_id?, stage_responsibilities,
label_ids, field_values}` ([[DOC-BACKEND-CONTRACT]]) — so the tool input resolves a single
project + template, not per row. Cap **100** rows; any row's validation failure rolls back the
whole batch; returns `{created:[…], errors:[]}` → the created [[DATATYPE-TASK-DETAIL]] list.
