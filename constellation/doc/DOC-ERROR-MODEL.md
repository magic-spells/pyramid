---
name: Error model
kind: rule
status: planned
connections:
  - DATATYPE-MCP-ERROR
  - EXTERNAL-PYRAMID-API
---

# Error model

Every failure returned to the AI is one shape, [[DATATYPE-MCP-ERROR]] — never a raw HTTP
status or stack. [[FILE-ERRORS]] owns the mapping; [[FILE-PYRAMID-CLIENT]] applies it.

Mapping from the Pyramid envelope ([[EXTERNAL-PYRAMID-API]]) and the resolver:

| Source | `code` |
|---|---|
| 401 (`unauthorized`) | `auth_invalid` / `auth_expired` (+ hint: regenerate key) |
| 403 (`forbidden`) | `permission_denied` |
| 404 (`*_not_found`) | `task_not_found` / `project_not_found` / … |
| 422 (`validation_failed`) | `validation_failed` (400 only on malformed JSON) |
| 409 (`conflict`) | `conflict` — If-Match precondition or slug/prefix collision ([[DOC-CONCURRENCY]]) |
| resolver ambiguity | `ambiguous_*` (+ `candidates`) |
| resolver miss | `*_not_found` (+ `hint` listing close matches) |
| destructive + gate off | `destructive_action_disabled` |
| transport | `network` |
| anything else | `unknown` |

The backend emits **no 429** (no rate limiting), so `rate_limited` is never produced from a
response — kept in the union only as a defensive code. Backend envelope codes are
`unauthorized` / `forbidden` / `not_found` (+ `project_not_found` etc.) / `validation_failed` /
`conflict` / `internal_error` ([[DOC-BACKEND-CONTRACT]]).

Recoverable errors carry enough to self-correct: `ambiguous_project_name` lists candidates;
`status_not_found` hints the available statuses. The AI should act on `code`, not parse
`message`.
