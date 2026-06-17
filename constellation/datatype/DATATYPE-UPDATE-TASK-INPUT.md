---
name: UpdateTaskInput
status: built
connections:
  - DATATYPE-TASK-DETAIL
---

Input for [[API-TOOL-UPDATE-TASK]] — a sparse patch; only present fields change. `task`
accepts a human key or UUID. To change status/stage or ordering use [[API-TOOL-MOVE-TASK]],
not this.

```ts
interface UpdateTaskInput {
  task: string;         // "WEB-42" or UUID
  title?: string;
  description?: string | null;
  priority?: "none" | "low" | "medium" | "high" | "urgent";
  due_date?: string | null;
  start_date?: string | null;
  estimate?: number;
  client_visible?: boolean; client_title?: string; client_description?: string;
  // Convenience fields the backend PATCH does NOT accept — the MCP fans each out (see below):
  owner?: string | null;   // name; null clears
  reporter?: string | null;
  add_labels?: string[];
  remove_labels?: string[];
  custom_fields?: { field: string; value: unknown }[];
}
```

**Wire mapping ([[DOC-BACKEND-CONTRACT]]).** Only the content fields go on `PATCH /v1/tasks/{id}`
(which needs an `If-Match` read-first, [[DOC-CONCURRENCY]]). The convenience fields fan out to
their dedicated endpoints in the same tool call: `owner`/`reporter` → `PATCH
…/stage-responsibilities` (targeting the task's **current stage** unless the AI is in a move),
`add_labels`/`remove_labels` → `POST`/`DELETE …/labels`, `custom_fields` →
`PATCH …/field-values`. A partial failure reports which sub-update failed; the AI still passes
names, never UUIDs or endpoints.
