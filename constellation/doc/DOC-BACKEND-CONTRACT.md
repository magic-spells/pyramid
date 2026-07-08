---
name: Real pyramid-server HTTP contract (audited)
kind: reference
status: built
connections:
  - EXTERNAL-PYRAMID-API
  - DOC-ERROR-MODEL
  - DOC-CONCURRENCY
  - DATATYPE-WORKFLOW
  - DOC-NAME-RESOLUTION
---

# Real pyramid-server HTTP contract (audited)

Ground truth read directly from the Go source (`../pyramid-server`, `app/internal/{router,handlers,service,model}`), not inferred from the plan. This supersedes earlier
guesses where they differ. All routes are under `/v1`, bearer `pyk_…`, key pinned to one
workspace (`X-Workspace-*` ignored for keys).

## Endpoints the MCP uses

| Op | Method · path | Notes |
|---|---|---|
| getMe | `GET /v1/me` | bare `User` |
| listProjects | `GET /v1/projects` | `{data:[Project], cursor}`; cursor = next project UUID or null |
| getWorkflow | `GET /v1/projects/{projectId}/workflow` | **only** `{stages:[{…Stage, statuses:[Status]}]}` |
| listLabels | `GET /v1/projects/{projectId}/labels` | separate — not in /workflow |
| listMembers | `GET /v1/projects/{projectId}/members` | separate; `ProjectMember.user` carries name/email |
| getTaskSchema | `GET /v1/projects/{projectId}/task-schema` | `{templates:[…], fields_by_template:{tplId:[CustomField]}}` |
| listTasks | `GET /v1/projects/{projectId}/tasks` | `{data:[Task], cursor}`; query `status`(UUID, **not** status_id), `stage_id`, `owner_id`, `reporter_id`, `label_id`, `q`, `limit`(≤100), `cursor`, `expand` |
| listArchived | `GET /v1/projects/{projectId}/tasks/archived` | **separate route**; query `archived_after`, `limit`, `cursor` |
| getTask | `GET /v1/tasks/{taskId}` | `Task` (or `TaskWithRelations` w/ `?expand`); **sets `ETag` header** |
| searchTasks | `GET /v1/search/tasks` | `{data:[Task+rank]}`, **no cursor**; query `q`, `limit`, `owner_id`, `reporter_id` |
| createTask | `POST /v1/projects/{projectId}/tasks` | 201 `Task`; **no If-Match** |
| bulkCreate | `POST /v1/tasks/bulk` | 201 `{created:[Task], errors:[]}`; **no If-Match**; cap 100 |
| updateTask | `PATCH /v1/tasks/{taskId}` | 200 `Task`; **If-Match REQUIRED** |
| moveTask | `PATCH /v1/tasks/{taskId}/move` | 200 **`{task, previous}`**; **no If-Match** |
| archiveTask | `POST /v1/tasks/{taskId}/archive` | 200 `Task`; needs role ≥ PM; no If-Match |
| unarchiveTask | `POST /v1/tasks/{taskId}/unarchive` | 200 `Task` |
| deleteTask | `DELETE /v1/tasks/{taskId}?hard=true` | 204; **If-Match REQUIRED**; soft=Member, hard=Admin |
| setResponsibilities | `PATCH /v1/tasks/{taskId}/stage-responsibilities` | `{responsibilities:[{stage_id, owner_id, reporter_id}]}`; the ONLY way to change owner/reporter |
| addLabel/removeLabel | `POST` / `DELETE /v1/tasks/{taskId}/labels[/{labelId}]` | label mutation on existing tasks |
| setFieldValues | `PATCH /v1/tasks/{taskId}/field-values` (bulk) · `…/custom-fields/{fieldId}` | custom-field mutation on existing tasks |
| listComments | `GET /v1/tasks/{taskId}/comments` | `{data:[Comment], cursor}`; query `stage_id`, `limit`, `cursor` |
| addComment | `POST /v1/tasks/{taskId}/comments` | 201 `Comment` |
| replyComment | `POST /v1/comments/{commentId}/replies` | 201 `Comment` |

## Write bodies (exact json fields)

- **createTask** `{ title*, description?, template_id?, status_id?, stage_id?(IGNORED — stage derived from status), stage_responsibilities:[{stage_id, owner_id, reporter_id}], label_ids:[uuid], due_date?, estimate?(float→hours), guest_visible?, guest_title?, guest_description?, priority?, field_values:{fieldId: value} }`. **No top-level owner_id/reporter_id.**
- **updateTask** `{ title?, description?, status_id?, stage_id?(IGNORED), due_date?, start_date?, estimate?, priority?, guest_visible?, guest_title?, guest_description? }`. **Accepts NO owner/reporter, NO labels, NO field_values** — use the dedicated endpoints above.
- **moveTask** `{ status_id?, before_id?, after_id?, project_id?(IGNORED) }` → returns `{task, previous:{status_id, position, completed_at}}`. Hydrate `raw.task`.
- **bulkCreate** `{ project_id*, template_id*, idempotency_key?, tasks:[{ title*, description?, status_id?, stage_responsibilities, label_ids, field_values }] }`.
- **addComment** `{ body_md OR content (req), stage_id?(defaults to task's current stage), mention_user_ids:[uuid] }`.
- **replyComment** `{ body_md OR content (req), mention_user_ids:[uuid] }` — `stage_id` ignored (inherits parent root's stage); reply-to-reply → 422 validation_failed.

## Ownership model (load-bearing)
Pyramid has **no single task owner**. Each task carries per-stage `stage_responsibilities`
(owner + reporter *per stage*). The `Task` response's `owner_id`/`reporter_id` are read-only
projections of the **current stage's** responsibility (`ApplyCurrentResponsibility`). So the
MCP's `owner`/`reporter` inputs must resolve to a stage and write a `stage_responsibilities`
entry (on create/bulk), and on an existing task go through
`PATCH /tasks/{id}/stage-responsibilities` — they can NOT ride along on `updateTask`.

## DTO hydration anchors
- `Task`: `key` (e.g. `WEB-42`) is **computed** from project `task_prefix` + `number`, not stored. `status_id` only (no inline name → hydrate from /workflow). owner/reporter names only via `?expand` → `TaskWithRelations{owner,reporter (stubs), labels}`.
- `Comment`: body wire field is `content` (+ `content_html`); `mentions:[uuid]`; `stage_id`, `parent_id`, `thread_root_id`, `author_id`, `updated_at`.
- Workflow: `Stage{id,name,key,category,position,…}` + nested `Status{id,name,key,category,stage_id,position,…}`. Labels/members/templates fetched separately.

See [[DOC-ERROR-MODEL]] for the error/status mapping and [[DOC-CONCURRENCY]] for the
ETag/If-Match flow.
