---
name: Phase 2 — Core tools (MVP)
status: planned
connections:
  - PLAN-PROJECT
---

# Phase 2 — Core tools (MVP)

The high-value verbs that satisfy the motivating prompts ("what do I own in MOGO?",
"create these tasks in ready-for-design", "move WEB-42 to QA").

- Discovery: `whoami`, `list_projects`, `get_project_workflow` ([[DOC-TOOLS-DISCOVERY]]).
- Tasks — read: `list_tasks`, `get_task`, `search_tasks` ([[DOC-TOOLS-TASKS-READ]]).
- My work: `list_my_tasks` (in [[DOC-TOOLS-DISCOVERY]]).
- Tasks — write: [[API-TOOL-CREATE-TASK]], [[API-TOOL-CREATE-TASKS-BULK]],
  [[API-TOOL-UPDATE-TASK]], [[API-TOOL-MOVE-TASK]], [[API-TOOL-ARCHIVE-TASK]].
- Comments: [[API-TOOL-ADD-COMMENT]], [[API-TOOL-REPLY-COMMENT]], `list_comments`
  ([[DOC-TOOLS-COMMENTS]]).
- Resources: `pyramid://me`, `pyramid://projects`, `pyramid://projects/{slug}/workflow`
  ([[FILE-RESOURCES]]).

Exit criteria: end-to-end in Claude Code — create/move a task through a real workflow,
comment with a mention, reply; snapshot/contract tests per tool ([[TEST-SUITE]]).
