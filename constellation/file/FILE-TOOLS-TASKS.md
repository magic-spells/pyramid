---
name: src/tools/tasks.ts
status: planned
path: src/tools/tasks.ts
language: typescript
summary: Task read + write tools.
connections:
  - API-TOOL-CREATE-TASK
  - API-TOOL-CREATE-TASKS-BULK
  - API-TOOL-UPDATE-TASK
  - API-TOOL-MOVE-TASK
  - API-TOOL-ARCHIVE-TASK
  - DOC-TOOLS-TASKS-READ
---

Task tools. Read: `list_tasks`, `get_task`, `search_tasks` ([[DOC-TOOLS-TASKS-READ]]).
Write: [[API-TOOL-CREATE-TASK]], [[API-TOOL-CREATE-TASKS-BULK]], [[API-TOOL-UPDATE-TASK]],
[[API-TOOL-MOVE-TASK]], [[API-TOOL-ARCHIVE-TASK]]. Returns [[DATATYPE-TASK-SUMMARY]] /
[[DATATYPE-TASK-DETAIL]].
