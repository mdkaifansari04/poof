# GitHub Copilot Workspace Instructions for Poof

## Overview
This workspace is a Next.js (App Router) project for Poof, a photo-sharing platform with expiring share links. It uses TypeScript, Prisma, PostgreSQL (Neon), Cloudflare R2, TanStack Query, and Axios. Authentication is handled via Better Auth (email/password + Google).

## Build & Test Commands
- **Install dependencies:** `bun install`
- **Run migrations:** `bunx prisma migrate dev`
- **Generate Prisma client:** `bunx prisma generate`
- **Start development server:** `bun run dev`

## Environment Variables
See `.env.example` for required keys. All secrets must be set for local and production environments. Never commit secrets.

## Project Conventions
- Use the App Router (`app/`) for all routing and pages.
- UI components are in `components/ui/` and should be reused where possible.
- Use TanStack Query for data fetching and caching.
- Use `lib/` for shared utilities and API clients.
- Use `prisma/` for schema and migrations.
- Use `public/` for static assets.
- Use `styles/` for global and component styles.
- Use `hooks/` for custom React hooks.
- Use `tests/` for integration and unit tests.

## Development Tips
- Always run `bun install` after pulling changes that affect dependencies.
- Run migrations and generate Prisma client after schema changes.
- Use feature branches for new features or fixes.
- Keep environment variables up to date.
- Use the manual verification checklist in the README before deploying.

## Documentation
- See the [README.md](README.md) for setup, environment, and deployment details.
- Cron endpoint details and manual/deployment checklists are in the README.

## Anti-Patterns
- Do not commit secrets or `.env` files.
- Do not duplicate UI components; use or extend those in `components/ui/`.
- Do not bypass TanStack Query for server data.
- Do not edit files in `prisma/` except for schema and migrations.

---

## Example Prompts
- "How do I run the app locally?"
- "Where do I add a new API route?"
- "How do I add a new environment variable?"
- "What is the recommended way to fetch data?"

---

## Next Steps
- Consider adding agent customizations for test automation, code review, or deployment workflows.
- Example: `/create-instruction test` to enforce test conventions in `tests/`.
