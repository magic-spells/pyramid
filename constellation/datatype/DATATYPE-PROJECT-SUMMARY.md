---
name: ProjectSummary
status: planned
connections:
  - DATATYPE-WORKFLOW
---

Compact project shape for `list_projects` and the `pyramid://projects` resource.

```ts
interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  task_prefix: string; // e.g. "WEB" — the human-key prefix
  role: "admin" | "pm" | "member" | "viewer" | "client"; // caller's project role
  archived: boolean;
}
```
