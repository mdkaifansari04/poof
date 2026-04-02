# Poof Execution Plan (4 Phases)

Last updated: 2026-04-02

Status legend:
- `DONE` = implemented and merged in current code
- `IN PROGRESS` = live but still needs hardening/completeness
- `PENDING` = not implemented yet

## Goal
Ship Poof as a production-ready consumer photo-sharing app with first-party automation support, where agents can operate account workflows through secure, documented, versioned APIs.

## Current Snapshot
- Core product surface is stable: auth, gallery CRUD, upload lifecycle, sharing, and cleanup cron.
- Agent API model is now permissioned (`read`, `write`, `agentResourcesOnly`) with ownership provenance.
- `/api/v1` namespace and `/api/v1/openapi` are available.
- Docs are consolidated under a single sidebar docs hub (`/docs`) plus `GET /llms.txt`.

---

## Phase 1: Core Platform Foundation
Status: `DONE`

### Scope
- Better Auth session model and protected app shell.
- Prisma-backed domain model and API base utilities.
- Standardized API error/response patterns and client transport.

### Completed
- Auth/session stack (`lib/auth.ts`, `app/api/auth/[...all]/route.ts`, `app/(app)/layout.tsx`)
- Prisma + schema baseline (`lib/prisma.ts`, `prisma/schema.prisma`)
- Shared API utility layer (`app/api/_utils/*`)
- Query/client plumbing (`components/providers/query-provider.tsx`, `lib/api-client.ts`)

### Remaining
- None.

### Exit Criteria
- Consistent auth gating and API response shape across app routes.

---

## Phase 2: Media Domain (Galleries + Upload Lifecycle)
Status: `IN PROGRESS`

### Scope
- Gallery CRUD + image lifecycle + banner uploads via presigned URLs.
- Reliable client-side and API-side state transitions.

### Completed
- Gallery routes: `app/api/galleries/route.ts`, `app/api/galleries/[id]/route.ts`
- Upload routes: `app/api/upload/presign/route.ts`, `app/api/galleries/[id]/banner/presign/route.ts`
- Image state routes: `app/api/images/[imageId]/*`
- Upload service abstraction: `lib/upload/*`

### Remaining
- `PENDING`: idempotency strategy for retry-safe upload workflows.
- `PENDING`: optional content dedupe path (hash-based or key-based) for repeated uploads.
- `PENDING`: expanded integration tests for partial batch failures/network interruptions.

### Exit Criteria
- Upload and mutation flows are retry-safe and test-covered under degraded network conditions.

---

## Phase 3: Sharing, Retention, and Ops Reliability
Status: `IN PROGRESS`

### Scope
- Share-link lifecycle correctness, scheduled cleanup, and production diagnostics.

### Completed
- Share APIs (`app/api/shared-resources/*`) with revoke/expiry/public resolve paths.
- Shared status utility (`app/api/_utils/shared.ts`)
- Cleanup cron routes + auth (`app/api/cron/*`, `app/api/_utils/cron.ts`)
- Baseline tests (`tests/shared-status.test.ts`, `tests/cron-auth.test.ts`)

### Remaining
- `PENDING`: route-level integration tests for share + cleanup flows.
- `PENDING`: replay/idempotency protection for critical mutating endpoints.
- `PENDING`: structured observability (request correlation IDs, error-level logs, alert hooks).
- `PENDING`: finalize background workflow orchestration decision (`app/api/inngest/route.ts` currently stubbed).

### Exit Criteria
- Share and cleanup operations are observable, diagnosable, and resilient during failures.

---

## Phase 4: Agent Platform, Versioned API, and Docs Productization
Status: `IN PROGRESS`

### Scope
- Agent account access, permission boundaries, versioned external API, and consolidated docs.

### Completed
- API key permissions + ownership provenance in schema:
  - `prisma/schema.prisma`
  - `prisma/migrations/20260402203000_add_agent_scopes_and_resource_provenance/migration.sql`
- API key helpers and normalization:
  - `lib/agent-api-keys.ts`
  - `lib/types/agent-api-key.ts`
- API key CRUD with permission toggles:
  - `app/api/agent-api-keys/route.ts`
  - `app/api/agent-api-keys/[keyId]/route.ts`
  - `components/settings/agent-api-keys-card.tsx`
- API key auth + capability enforcement across core routes:
  - `app/api/_utils/auth.ts`
  - galleries/images/upload/shared-resources routes
- Agent-owned-only enforcement for scoped keys in list/read/mutate flows.
- Versioned API namespace:
  - `app/api/v1/**` wrappers
  - `app/api/v1/openapi/route.ts`
- Docs consolidation with sidebar IA:
  - `app/docs/layout.tsx`
  - `components/docs/docs-sidebar.tsx`
  - `app/docs/_nav.ts`
  - `/docs`, `/docs/api`, `/docs/reference`, `/docs/authentication`, `/docs/scopes`, `/docs/agents`
- LLM discovery update:
  - `app/llms.txt/route.ts`

### Remaining
- `PENDING`: API rate limiting and abuse controls for API-key traffic.
- `PENDING`: audit log trail for sensitive agent actions (delete/revoke/update).
- `PENDING`: optional API-key rotation/expiry policy support.
- `PENDING`: browser/device-link auth flow for agents (in addition to static API keys).
- `PENDING`: SDK-style worked examples for agent flows (upload + optional share with 24h default).

### Exit Criteria
- Agent access is least-privilege, observable, and operationally controlled.
- External integrations can rely on stable `/api/v1` contracts and complete docs.

---

## Recommended Next Sequence
1. Add API-key rate limiting + audit events (Phase 4 hardening).
2. Add integration tests for upload/share/agent ownership boundaries (Phases 2-4).
3. Implement idempotency primitives for mutation endpoints (Phases 2-3).
4. Decide Inngest/background orchestration rollout and wire first workflows (Phase 3).

## Delivery Risks
- Without rate limits/audit logs, abusive or accidental automation is harder to contain.
- Without idempotency + integration coverage, retries can create inconsistent state.
- Without observability, incident triage remains slower than needed for production automation.
