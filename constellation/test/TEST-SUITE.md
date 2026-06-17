---
name: Test plan
status: planned
connections:
  - FILE-RESOLVER
  - FILE-ERRORS
  - FILE-PYRAMID-CLIENT
  - API-TOOL-CREATE-TASK
  - FLOW-CREATE-TASK
  - PLAN-PHASE-1-FOUNDATION
---

# Test plan

- **Resolver unit tests** ([[FILE-RESOLVER]]) — every kind: exact / ambiguity / miss, plus
  cache TTL + invalidation.
- **Error-mapping unit tests** ([[FILE-ERRORS]]) — each HTTP status/envelope → expected
  [[DATATYPE-MCP-ERROR]] `code`.
- **Tool contract/snapshot tests** — every tool against recorded Pyramid fixtures; snapshots
  catch silent shape drift.
- **Integration** — against a local `pyramid-server` with a test `pyk_` key: list projects,
  list my tasks, create/move through every stage ([[FLOW-CREATE-TASK]]), comment + mention,
  reply, archive/unarchive.
- **`doctor` smoke** — validates auth, prints user/workspace/projects, pings the workflow
  endpoint.

Mirrors the verification approach from the original MCP design doc, now consolidated into
this plan. `vitest` + `tsx`.
