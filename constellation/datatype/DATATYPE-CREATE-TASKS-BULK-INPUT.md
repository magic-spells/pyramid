---
name: CreateTasksBulkInput
status: planned
connections:
  - DATATYPE-CREATE-TASK-INPUT
---

Input for [[API-TOOL-CREATE-TASKS-BULK]] — handles "create these tasks and put them in the
ready-for-design phase". **Atomic**: any row failing validation rolls back the whole batch
(wraps `POST /v1/tasks/bulk`).

```ts
interface CreateTasksBulkInput {
  project: string;
  defaults?: { stage?: string; status?: string; labels?: string[] }; // applied to each row
  tasks: Array<Omit<CreateTaskInput, "project">>;
}
```
