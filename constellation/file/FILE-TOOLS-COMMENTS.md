---
name: src/tools/comments.ts
status: planned
path: src/tools/comments.ts
language: typescript
summary: Comment read/write tools (stage-scoped, 1-level replies).
connections:
  - API-TOOL-ADD-COMMENT
  - API-TOOL-REPLY-COMMENT
  - DOC-TOOLS-COMMENTS
---

Comment tools: `list_comments` (stage-scoped), [[API-TOOL-ADD-COMMENT]],
[[API-TOOL-REPLY-COMMENT]], plus `react_to_comment` / `unreact_to_comment` (phase 3).
Enforces the 1-level reply rule before calling ([[DOC-DESIGN-RULES]] rule 5).
