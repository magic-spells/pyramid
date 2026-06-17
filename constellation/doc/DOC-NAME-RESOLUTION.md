---
name: Name → ID resolution
kind: rule
status: planned
connections:
  - DATATYPE-MCP-ERROR
  - DATATYPE-WORKFLOW
---

# Name → ID resolution

Inputs accept names; the resolver maps them to UUIDs with **deterministic precedence** — the
same input always resolves the same way. Backed by [[FILE-RESOLVER]] and the cached
[[DATATYPE-WORKFLOW]].

| Kind | Precedence |
|---|---|
| Project | slug (ci exact) → name (ci exact) → unique fuzzy contains |
| Stage | per project: key → name (ci) → unique fuzzy |
| Status | per project: key → name (ci); a stage name where a status is expected → first status of that stage by position |
| User | email exact → `display_name` exact → unique fuzzy |
| Label | per project: name exact → unique fuzzy |
| Custom field | per template: key → name |
| Task | human key `WEB-42` → UUID; also accepts a raw UUID |

- **Ambiguity is an error, not a guess** — two labels matching "bug" → `ambiguous_label_name`
  with `candidates` ([[DATATYPE-MCP-ERROR]]); the AI asks or picks.
- **Cache:** in-process LRU keyed by `(project_id, kind)`, 60s TTL, lazy-populated,
  invalidated when an op changes it (creating a label clears `(project,"labels")`).
- **Force-refresh:** the `doctor` prompt and a `--no-cache` debug flag bypass it.
