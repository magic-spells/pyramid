---
name: update_task
kind: mcp-tool
status: built
methods:
  POST:
    request_schema: DATATYPE-UPDATE-TASK-INPUT
    response_schema: DATATYPE-TASK-DETAIL
connections:
  - FILE-TOOLS-TASKS
  - PLAN-PHASE-2-CORE-TOOLS
---

`update_task` — sparse patch of a task's **content only**: title, description, priority,
dates, estimate, client_* ([[DATATYPE-UPDATE-TASK-INPUT]] → [[DATATYPE-TASK-DETAIL]]). Wraps
`PATCH /v1/tasks/{id}`, which **requires an `If-Match` ETag** — the client does a read-first to
get it ([[DOC-CONCURRENCY]]).

The PATCH body accepts **none** of owner/reporter, labels, or custom-field values
([[DOC-BACKEND-CONTRACT]]); those have dedicated endpoints and so are separate tools (or
ride a follow-up call): owner/reporter → `PATCH …/stage-responsibilities`, labels →
`POST`/`DELETE …/labels`, fields → `PATCH …/field-values`. Status/stage and ordering go
through [[API-TOOL-MOVE-TASK]], not here.
