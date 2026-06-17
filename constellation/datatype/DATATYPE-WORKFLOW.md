---
name: Workflow
status: planned
connections:
  - DATATYPE-PROJECT-SUMMARY
  - DOC-NAME-RESOLUTION
---

The cached per-project schema behind `get_project_workflow` and the
`pyramid://projects/{slug}/workflow` resource — the in-memory shape the resolver uses to turn
names into UUIDs ([[DOC-NAME-RESOLUTION]]); cached 60s.

**Assembled from multiple backend endpoints** (the real `/workflow` returns *only* stages +
statuses, [[DOC-BACKEND-CONTRACT]]): `GET …/workflow` (stages+statuses) + `GET …/labels` +
`GET …/members` + `GET …/task-schema` (templates + `fields_by_template`). The resolver fans
these out (in parallel) on first use and caches the merged result; a partial failure degrades
that kind only (e.g. labels unavailable → `label_*` resolution errors, names still resolve).

```ts
interface Workflow {
  project: ProjectSummary;
  stages: { id: string; key: string; name: string; position: string }[];
  statuses: { id: string; key: string; name: string; stage_id: string; position: string }[];
  labels: { id: string; name: string; color: string }[];
  members: { id: string; display_name: string; email: string; role: string }[];
  templates: { id: string; name: string; fields: CustomFieldDef[] }[];
}

interface CustomFieldDef {
  id: string; key: string; name: string;
  field_type: "text" | "number" | "date" | "select" | "multiselect" | "checkbox" | "user";
  options?: string[];
}
```
