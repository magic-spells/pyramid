---
name: CreateTaskInput
status: planned
connections:
  - DOC-NAME-RESOLUTION
  - DATATYPE-TASK-DETAIL
---

Input for [[API-TOOL-CREATE-TASK]]. All references are **names**, resolved to UUIDs before the call
([[DOC-NAME-RESOLUTION]]). Only `title` is required. Placement is by `status` (stage is derived — a
`stage` only picks that stage's first status when `status` is omitted; an inconsistent pair →
`status_not_in_stage`).

```ts
interface CreateTaskInput {
  project: string;            // slug / name / fuzzy
  title: string;              // the ONLY required field
  description?: string;
  status?: string;            // name/key/category — drives placement (carries the stage)
  stage?: string;             // name/key — only used to derive a default status
  priority?: "none" | "low" | "medium" | "high" | "urgent"; // "normal" → "medium"; default "none"
  due_date?: string;          // YYYY-MM-DD or RFC3339 (stored as a date)
  estimate_hours?: number;
  labels?: string[];          // label names
  // Assignment is PER-STAGE — the server has NO top-level owner/assignee field:
  assignments?: { stage: string; owner?: string; reporter?: string }[]; // → stage_responsibilities[]
  custom_fields?: { field: string; value: unknown }[]; // MCP validates value against field_type
  client_visible?: boolean; client_title?: string; client_description?: string;
}
```

**Assignment quirk:** "assign to Bob" must target a stage; if the user names none, default to the
task's stage (the one derived from `status`). **Dependencies are NOT settable at create** — separate
call. The server stores `custom_fields` raw with no type check on create, so the MCP validates each
value against the field's `field_type` first ([[DOC-DESIGN-RULES]] rule 8).
