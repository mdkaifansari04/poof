# Poof Implementation Plan (4 Phases)

## Goal
Implement the full product backend and data flows from `.agents/spec.md` while keeping the current UI/components unchanged.

## Working Principles
- Follow the spec as source of truth for API shape, schema, rules, and limits.
- Preserve current visual components; implement logic, data wiring, and server functionality behind them.
- Keep each phase shippable with clear acceptance criteria.
- Use strict TypeScript and server-authoritative validation.

## Phase 1: Platform Foundation (Auth + Data + App Skeleton)

### Outcome
A secure, running app foundation with authentication, database models, and consistent API conventions.

### Scope
- Add and configure core dependencies:
  - `better-auth`, `prisma`, `@prisma/client`, `axios`, `@tanstack/react-query`, `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`.
- Create backend foundations:
  - `prisma/schema.prisma` exactly aligned with spec models/enums.
  - Prisma client singleton (`lib/prisma.ts`).
  - Better Auth server/client config (`lib/auth.ts`, `lib/auth-client.ts`).
  - Auth API handler (`app/api/auth/[...all]/route.ts`).
- Build base app wiring:
  - Protected app layout session guard.
  - Shared API helpers for envelope responses and error codes.
  - Axios instance with envelope unwrapping (`lib/axios.ts`).
  - React Query provider setup in root layout.
  - Query key factory scaffold and empty query/mutation modules.
- Add environment template (`.env.example`) with all required variables.

### Acceptance Criteria
- Prisma schema validates and migration can be generated.
- Auth routes compile and session can be read server-side.
- Protected app routes redirect unauthenticated users.
- API responses follow `{ data, error }` envelope consistently.

## Phase 2: Gallery + Image Lifecycle (CRUD + Upload Pipeline)

### Outcome
Authenticated users can create/manage galleries and upload images via presigned URL flow.

### Scope
- Implement upload abstraction:
  - `lib/upload/UploadService.ts` (abstract contract).
  - `lib/upload/R2UploadService.ts` and `lib/upload/index.ts`.
- Implement gallery and image APIs:
  - `GET/POST /api/galleries`
  - `GET/PATCH/DELETE /api/galleries/:id`
  - `DELETE /api/images/:imageId`
  - `POST /api/upload/presign`
  - `POST /api/images/:imageId/confirm`
  - `POST /api/images/:imageId/fail`
- Enforce server-side validations from spec:
  - Ownership checks, deleted records exclusion, size/type limits, gallery/image limits.
  - Upload status transitions: `PENDING -> CONFIRMED | FAILED`.
- Add React Query data layer for gallery/image operations:
  - `hooks/queries.ts` for galleries/gallery detail.
  - `hooks/mutations.ts` for create/update/delete/presign/confirm/fail.
- Connect existing gallery UI pages to real APIs without component redesign.

### Acceptance Criteria
- User can create, edit, and soft-delete galleries.
- User can request presigned URLs and complete confirm/fail upload flow.
- Gallery pages render live DB-backed images and statuses.
- Unauthorized and forbidden access paths return correct error codes.

## Phase 3: Share Links + Public Resolution

### Outcome
Users can generate/manage expiring share links for gallery/image/multi-image and public users can consume them.

### Scope
- Implement shared resource APIs:
  - `POST /api/shared-resources`
  - `GET /api/shared-resources` (owner list)
  - `GET /api/shared-resources/:resourceId` (public resolver)
  - `POST /api/shared-resources/:resourceId/revoke`
  - `DELETE /api/shared-resources/:resourceId`
- Implement full share validation rules:
  - Type-specific body constraints.
  - Future expiry with min/max window.
  - Same-gallery constraint for multi-image shares.
  - Max active links per gallery and max images per shared selection.
- Implement resolver behavior:
  - `NOT_FOUND`, `REVOKED`, `EXPIRED` handling.
  - `viewCount` increment.
  - Type-based payload resolution with ordering guarantees.
- Wire share management UI flows to mutations/queries.
- Wire public `/shared/[resourceId]` page to resolver API and error states.

### Acceptance Criteria
- All three share modes (gallery/single/multi-image) work end-to-end.
- Revoked and expired links return HTTP 410 with correct error code.
- Public shared page renders only valid, non-deleted, confirmed images.
- Owner dashboard shows link list with accurate state.

## Phase 4: Cleanup, Cron, Hardening, and Release Readiness

### Outcome
System is operationally safe: data cleanup, lifecycle enforcement, and production-level quality checks are in place.

### Scope
- Implement cron routes:
  - `/api/cron/cleanup-storage`
  - `/api/cron/cleanup-pending-uploads`
  - `Authorization: Bearer ${CRON_SECRET}` validation.
- Implement deletion and retention behavior:
  - Hard-delete soft-deleted images after R2 cleanup window.
  - Mark stale `PENDING` uploads as `FAILED`.
  - Remove old `FAILED` uploads.
- Add comprehensive validation + error coverage across all endpoints.
- Add core test coverage:
  - API route behavior tests for happy path and edge cases.
  - Share resolver expiry/revoke tests.
  - Upload lifecycle and cleanup tests.
- Add implementation documentation:
  - Setup, migrations, env vars, local run flow, deployment checklist.

### Acceptance Criteria
- Cron routes are secure and idempotent.
- Storage cleanup and upload cleanup run as specified.
- Core user journeys from spec use cases (UC-01 to UC-10) pass manual verification.
- Build passes with no schema drift and no route-level type errors.

## Phase Independence Contract
- Phase 1 delivers platform primitives only (auth/data/contracts).
- Phase 2 delivers gallery/image domain without share-link dependency.
- Phase 3 delivers sharing/public access on top of finalized gallery/image contracts.
- Phase 4 delivers operations and hardening without changing feature contracts.

This keeps each phase independently reviewable and allows implementation in strict sequence without UI redesign.
