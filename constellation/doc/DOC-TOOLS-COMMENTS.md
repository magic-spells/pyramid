---
name: Comment tools
kind: guide
status: planned
connections:
  - DATATYPE-COMMENT
  - API-TOOL-ADD-COMMENT
  - API-TOOL-REPLY-COMMENT
  - FILE-TOOLS-COMMENTS
  - PLAN-PHASE-2-CORE-TOOLS
---

# Comment tools

Mutations are [[API-TOOL-ADD-COMMENT]] + [[API-TOOL-REPLY-COMMENT]]; this card covers the
reads/reactions, all in [[FILE-TOOLS-COMMENTS]].

| Tool | Returns | Notes |
|---|---|---|
| `list_comments(task, stage?)` | [[DATATYPE-COMMENT]][] | stage-scoped; `stage` defaults to the task's current stage, `"all"` for every stage |
| `react_to_comment(comment_id, emoji)` | [[DATATYPE-COMMENT]] | unicode emoji (phase 3) |
| `unreact_to_comment(comment_id, emoji)` | [[DATATYPE-COMMENT]] | (phase 3) |
