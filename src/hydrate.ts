// Hydration — raw server rows -> strict, NAME-bearing MCP types (DOC-RENDERING,
// DOC-DESIGN-RULES rule 4).
//
// The client returns raw JSON keyed by UUID (status_id, owner_id, author_id,
// label ids …). These helpers JOIN those ids to human names via the cached
// Workflow (the Resolver is the workflow source) so that NO bare UUID remains in
// any hydrated field a model/user would read:
//   - status_id            -> { id, name }            (status.name)
//   - status.stage_id      -> stage { id, name }      (status carries its stage)
//   - owner_id/reporter_id -> UserStub | null         (member.display_name)
//   - author_id/mentions[] -> UserStub                (member.display_name)
//   - label ids            -> label names (string[])
// `key` is provided by the server and passed through. Every field is read
// defensively — missing/null inputs degrade to null / [] rather than throwing,
// because raw rows arrive in expanded and non-expanded shapes.

import type {
  TaskComment,
  TaskDetail,
  TaskReference,
  TaskSummary,
  UserStub,
  Workflow,
} from './types.js';

// ============ Public hydrators ============

export function hydrateTaskSummary(raw: any, workflow: Workflow): TaskSummary {
  const r = obj(raw);
  const statusId = statusIdOf(r);

  return {
    id: str(r.id),
    key: str(r.key),
    title: str(r.title),
    description: nullableStr(r.description),
    status: statusRef(workflow, statusId),
    stage: stageRefForStatus(workflow, statusId, r),
    owner: ownerStub(workflow, r.owner, r.owner_id),
    reporter: ownerStub(workflow, r.reporter, r.reporter_id),
    labels: labelNames(workflow, r.labels ?? r.label_ids),
    archived: r.archived_at != null || r.archived === true,
    updated_at: str(r.updated_at),
  };
}

export function hydrateTaskDetail(raw: any, workflow: Workflow): TaskDetail {
  const r = obj(raw);
  const detail: TaskDetail = hydrateTaskSummary(raw, workflow);

  // description is required on the summary already; keep it consistent here.
  detail.description = nullableStr(r.description);

  if (Array.isArray(r.field_values)) {
    detail.field_values = r.field_values.map((fv: any) => {
      const f = obj(fv);
      return {
        // Join a custom-field id to its name where possible (no bare UUID).
        field: fieldName(workflow, f.field ?? f.field_id ?? f.key),
        value: f.value,
      };
    });
  }

  if (r.estimates && typeof r.estimates === 'object') {
    const e = obj(r.estimates);
    detail.estimates = {
      total_hours: num(e.total_hours),
      by_stage: byStageNames(workflow, e.by_stage),
    };
  }

  if (Array.isArray(r.comments)) {
    detail.comments = r.comments.map((c: any) => hydrateComment(c, workflow));
  }

  if (Array.isArray(r.references)) {
    detail.references = r.references.map(hydrateReference);
  }

  if (Array.isArray(r.followers)) {
    detail.followers = r.followers
      .map((f: any) => userStubFromAny(workflow, f))
      .filter((u: UserStub | null): u is UserStub => u !== null);
  }

  if (Array.isArray(r.dependencies)) {
    detail.dependencies = r.dependencies.map((d: any) => {
      const dep = obj(d);
      return { id: str(dep.id), key: str(dep.key), type: str(dep.type) };
    });
  }

  return detail;
}

export function hydrateComment(raw: any, workflow: Workflow): TaskComment {
  const c = obj(raw);
  const replies = (Array.isArray(c.replies) ? c.replies : []).map((r: any) =>
    hydrateReply(r, workflow),
  );

  return {
    id: str(c.id),
    task_id: str(c.task_id),
    stage: stageRef(workflow, str(c.stage_id)),
    author: authorStub(workflow, c.author, c.author_id),
    content: str(c.content),
    mentions: mentionStubs(workflow, c.mentions),
    replies,
    created_at: str(c.created_at),
  };
}

// ============ Comment reply (one level; no nested replies) ============

function hydrateReply(
  raw: any,
  workflow: Workflow,
): Omit<TaskComment, 'replies'> {
  const c = obj(raw);
  return {
    id: str(c.id),
    task_id: str(c.task_id),
    stage: stageRef(workflow, str(c.stage_id)),
    author: authorStub(workflow, c.author, c.author_id),
    content: str(c.content),
    mentions: mentionStubs(workflow, c.mentions),
    created_at: str(c.created_at),
  };
}

// ============ Reference (no UUIDs to join — pass through defensively) ============

const REFERENCE_TYPES = [
  'github_pr',
  'github_commit',
  'github_branch',
  'github_issue',
  'figma',
  'url',
] as const;
type ReferenceType = (typeof REFERENCE_TYPES)[number];

function hydrateReference(raw: any): TaskReference {
  const r = obj(raw);
  const rt = str(r.reference_type);
  const reference_type: ReferenceType = (REFERENCE_TYPES as readonly string[]).includes(
    rt,
  )
    ? (rt as ReferenceType)
    : 'url';
  return {
    id: str(r.id),
    reference_type,
    title: str(r.title),
    url: str(r.url),
    external_status: nullableStr(r.external_status),
    external_sub_id: nullableStr(r.external_sub_id),
  };
}

// ============ Workflow joins (id -> name) ============

/** A task's status id may arrive as `status_id` or an expanded `status.id`. */
function statusIdOf(r: Record<string, unknown>): string {
  if (typeof r.status_id === 'string') return r.status_id;
  if (r.status && typeof r.status === 'object') {
    const s = obj(r.status);
    if (typeof s.id === 'string') return s.id;
  }
  return '';
}

function statusRef(wf: Workflow, statusId: string): { id: string; name: string } {
  const s = wf.statuses.find((x) => x.id === statusId);
  return { id: statusId, name: s?.name ?? '' };
}

/**
 * A status carries its stage — derive stage from the status's stage_id. Falls
 * back to an explicit `stage_id` on the raw row if the status isn't in the
 * workflow (defensive for partial payloads).
 */
function stageRefForStatus(
  wf: Workflow,
  statusId: string,
  r: Record<string, unknown>,
): { id: string; name: string } {
  const status = wf.statuses.find((x) => x.id === statusId);
  const stageId = status?.stage_id ?? (typeof r.stage_id === 'string' ? r.stage_id : '');
  return stageRef(wf, stageId);
}

function stageRef(wf: Workflow, stageId: string): { id: string; name: string } {
  const stage = wf.stages.find((x) => x.id === stageId);
  return { id: stageId, name: stage?.name ?? '' };
}

function displayName(wf: Workflow, userId: string): string {
  return wf.members.find((m) => m.id === userId)?.display_name ?? '';
}

/**
 * Owner/reporter -> UserStub | null. Accepts an expanded stub object
 * (`{ id, display_name }`) OR a bare id string; null/absent -> null. Always
 * joins to a display_name via the workflow so no bare UUID surfaces.
 */
function ownerStub(
  wf: Workflow,
  expanded: unknown,
  idValue: unknown,
): UserStub | null {
  const stub = userStubFromAny(wf, expanded);
  if (stub) return stub;
  if (typeof idValue === 'string' && idValue.length > 0) {
    return { id: idValue, display_name: displayName(wf, idValue) };
  }
  return null;
}

/**
 * Comment/reply author -> UserStub (required, never null). Falls back to an
 * empty display_name rather than throwing on an unknown member.
 */
function authorStub(
  wf: Workflow,
  expanded: unknown,
  idValue: unknown,
): UserStub {
  return (
    ownerStub(wf, expanded, idValue) ?? {
      id: typeof idValue === 'string' ? idValue : '',
      display_name: '',
    }
  );
}

/** A user value that may be an expanded stub or a bare id -> UserStub | null. */
function userStubFromAny(wf: Workflow, value: unknown): UserStub | null {
  if (typeof value === 'string') {
    if (value.length === 0) return null;
    return { id: value, display_name: displayName(wf, value) };
  }
  if (value && typeof value === 'object') {
    const u = obj(value);
    const id = str(u.id);
    if (id.length === 0) return null;
    const dn = typeof u.display_name === 'string' && u.display_name.length > 0
      ? u.display_name
      : displayName(wf, id);
    return { id, display_name: dn };
  }
  return null;
}

/** mentions[] (ids or stubs) -> UserStub[] (display names joined). */
function mentionStubs(wf: Workflow, value: unknown): UserStub[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((m) => userStubFromAny(wf, m))
    .filter((u): u is UserStub => u !== null);
}

/**
 * Label ids (or expanded label objects, or already-resolved names) -> names.
 * The server may return label-id strings, `{ id, name }` objects, or names; all
 * collapse to display names with no bare UUID left behind.
 */
function labelNames(wf: Workflow, labels: unknown): string[] {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((l): string => {
      if (typeof l === 'string') {
        const byId = wf.labels.find((x) => x.id === l);
        if (byId) return byId.name;
        // Not an id we know — treat as a name already (server returned names).
        return l;
      }
      if (l && typeof l === 'object') {
        const lo = obj(l);
        if (typeof lo.name === 'string' && lo.name.length > 0) return lo.name;
        if (typeof lo.id === 'string') {
          return wf.labels.find((x) => x.id === lo.id)?.name ?? '';
        }
      }
      return '';
    })
    .filter((name) => name.length > 0);
}

/** Custom-field id (or key/name) -> field name via the workflow templates. */
function fieldName(wf: Workflow, value: unknown): string {
  const v = str(value);
  if (v.length === 0) return '';
  for (const t of wf.templates) {
    const f = t.fields.find((x) => x.id === v || x.key === v);
    if (f) return f.name;
  }
  // Already a name/key — pass it through rather than emitting a bare UUID.
  return v;
}

/** estimates.by_stage keyed by stage id -> keyed by stage name. */
function byStageNames(
  wf: Workflow,
  value: unknown,
): Record<string, number> {
  const out: Record<string, number> = {};
  if (!value || typeof value !== 'object') return out;
  for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
    const stage = wf.stages.find((s) => s.id === key);
    out[stage?.name ?? key] = num(raw);
  }
  return out;
}

// ============ Primitive coercion ============

function obj(v: unknown): Record<string, unknown> {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function nullableStr(v: unknown): string | null {
  return typeof v === 'string' ? v : null;
}

function num(v: unknown): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
