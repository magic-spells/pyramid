---
name: TaskSummary
status: planned
connections:
  - DATATYPE-WORKFLOW
  - DOC-RENDERING
---

Hydrated list-row shape for `list_tasks` / `search_tasks` / `list_my_tasks`. Every UUID is hydrated
to a name by the MCP ([[DOC-DESIGN-RULES]] rule 4) — the server returns only `status_id`/`owner_id`
and **no stage**, so the MCP joins via the cached [[DATATYPE-WORKFLOW]]. Carries everything the task
card needs ([[DOC-RENDERING]]).

```ts
interface TaskSummary {
  id: string;
  key: string;            // derived human key, e.g. "WEB-42" (task_prefix + "-" + number)
  title: string;
  description: string | null;             // truncated to one line in list render
  status: { id: string; name: string };
  stage: { id: string; name: string };    // derived from status, hydrated by the MCP
  owner: { id: string; display_name: string } | null;
  reporter: { id: string; display_name: string } | null;
  labels: string[];
  archived: boolean;
  updated_at: string;     // ISO 8601 — rendered UTC-labeled (rule 12)
}
```
