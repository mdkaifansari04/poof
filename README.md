# Poof
Poof is a photo-sharing platform with expiring share links.

<img width="1200" height="630" alt="03" src="https://github.com/user-attachments/assets/cf11b14d-9caf-4e98-ae7a-8a993736f6bc" />

## Tech Stack

- Next.js App Router + TypeScript
- Better Auth (email/password + Google)
- Prisma + PostgreSQL (Neon)
- Cloudflare R2 (presigned uploads)
- TanStack Query + internal fetch client
- Agent API keys for first-party automation

## Local Setup

1. Install dependencies:
```bash
bun install
```


2. Copy environment file and fill values:
```bash
cp .env.example .env
```

3. Run Prisma migration and client generation:
```bash
bunx prisma migrate dev
bunx prisma generate
```

4. Start the app:
```bash
bun run dev
```

## Environment Variables

See `.env.example` for required keys:

- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `R2_ENDPOINT`
- `R2_BUCKET_NAME`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_PUBLIC_URL`
- `CRON_SECRET`

## Cron Endpoints

- `GET /api/cron/cleanup-storage`
  - Auth: `Authorization: Bearer ${CRON_SECRET}`
  - Deletes R2 objects + hard-deletes images soft-deleted for >24h

- `GET /api/cron/cleanup-pending-uploads`
  - Auth: `Authorization: Bearer ${CRON_SECRET}`
  - Marks stale pending uploads (`>30m`) as `FAILED`
  - Removes old failed uploads (`>24h`)

Schedules are configured in `vercel.json`.

## Agent Access

- Signed-in users can create long-lived API keys from Settings
- Agents can authenticate with `Authorization: Bearer <key>` or `X-API-Key: <key>`
- Uploads remain direct-to-R2 via presigned `PUT` URLs, followed by Poof confirm/fail calls
- `GET /llms.txt` exposes a machine-friendly product and docs summary for LLM clients

## Manual Verification Checklist

1. Sign up/sign in and confirm protected routes redirect correctly.
2. Create gallery, upload image, confirm image status transitions.
3. Create share links for gallery, single image, and multi-image.
4. Revoke and reactivate a link; extend expiry from edit flow.
5. Open public shared page and verify status/error handling.
6. Trigger cron endpoints with `CRON_SECRET` and verify cleanup effects.

## Deployment Checklist

1. Add all env vars to Vercel project.
2. Ensure `CRON_SECRET` is set and kept private.
3. Run database migrations in production.
4. Smoke test auth, upload, sharing, and cron endpoints.
