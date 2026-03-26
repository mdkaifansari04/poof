# SPECIFICATION.md — Poof

> Complete technical specification for the Poof photo-sharing platform.
> This is the single source of truth for architecture, schema, API design, and business logic.
> All implementation decisions must reference this document first.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Authentication](#4-authentication)
5. [Database Schema](#5-database-schema)
6. [Upload Service](#6-upload-service)
7. [API Routes](#7-api-routes)
8. [Sharing Mechanism](#8-sharing-mechanism)
9. [React Query — Frontend Data Layer](#9-react-query--frontend-data-layer)
10. [Business Rules & Limits](#10-business-rules--limits)
11. [Deletion Strategy](#11-deletion-strategy)
12. [Expiry Strategy](#12-expiry-strategy)
13. [Use Case Scenarios](#13-use-case-scenarios)
14. [Environment Variables](#14-environment-variables)
15. [Cron Jobs](#15-cron-jobs)

---

## 1. Project Overview

**Poof** is a photo-sharing platform where authenticated users can:
- Create galleries and upload photos into them
- Generate expiring share links for a full gallery, a single image, or a custom selection of images
- Share those links with anyone (no account required to view)
- Revoke links manually at any time before expiry
- Have multiple active share links pointing to the same content simultaneously

When a share link expires or is revoked, the shared page becomes inaccessible. The content itself (photos, galleries) is not deleted — only the share link is invalidated. The owner's content persists until they explicitly delete it.

---

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 15 (App Router) | All routes under `app/` |
| Language | TypeScript (strict) | End-to-end |
| Auth | Better Auth | Database sessions, email+password, Google OAuth |
| Database | PostgreSQL via Neon | Serverless Postgres |
| ORM | Prisma | Schema-first, migrations via `prisma migrate` |
| Storage | Cloudflare R2 | Presigned URL upload pattern |
| Upload Abstraction | Custom class-based `UploadService` | Wraps R2, swappable |
| HTTP Client | Axios | All frontend API calls |
| Server State | TanStack React Query v5 | Queries in `hooks/queries.ts`, mutations in `hooks/mutations.ts` |
| Deployment | Vercel | Standard (non-edge) serverless functions |
| Styling | Tailwind CSS | Per COPILOT.md design tokens |

---

## 3. Project Structure

```
poof/
├── app/
│   ├── (auth)/
│   │   ├── signin/page.tsx
│   │   ├── signup/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (app)/                          # Protected — requires session
│   │   ├── layout.tsx                  # Auth guard, app shell
│   │   ├── dashboard/page.tsx
│   │   ├── gallery/[id]/page.tsx
│   │   └── settings/
│   │       ├── page.tsx
│   │       └── [tab]/page.tsx
│   ├── shared/[resourceId]/page.tsx    # Public — no auth required
│   └── api/
│       ├── auth/[...all]/route.ts      # Better Auth handler
│       ├── galleries/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts            # GET, PATCH, DELETE
│       │       └── images/
│       │           ├── route.ts        # GET list, POST (presign init)
│       │           └── [imageId]/route.ts
│       ├── images/
│       │   └── [imageId]/route.ts      # GET, DELETE
│       ├── upload/
│       │   └── presign/route.ts        # POST — generate presigned URL
│       └── shared-resources/
│           ├── route.ts                # POST create
│           └── [resourceId]/
│               ├── route.ts            # GET (public), DELETE (revoke)
│               └── revoke/route.ts     # POST revoke
│
├── lib/
│   ├── auth.ts                         # Better Auth server config
│   ├── auth-client.ts                  # Better Auth client config
│   ├── prisma.ts                       # Prisma client singleton
│   ├── axios.ts                        # Axios instance with interceptors
│   └── upload/
│       ├── UploadService.ts            # Abstract base class
│       ├── R2UploadService.ts          # Cloudflare R2 implementation
│       └── index.ts                    # Exports active service instance
│
├── hooks/
│   ├── queries.ts                      # All TanStack Query useQuery hooks
│   └── mutations.ts                    # All TanStack Query useMutation hooks
│
├── components/                         # UI components (per COPILOT.md)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── .env.local
└── SPECIFICATION.md
```

---

## 4. Authentication

### Provider: Better Auth

Better Auth is configured with:
- **Email + password** strategy
- **Google OAuth** strategy
- **Database sessions** (session stored in `Session` table, not JWT)
- No email verification on signup — users get immediate access

### Session Flow

```
User signs up / signs in
  → Better Auth creates a Session record in DB
  → Session cookie set (httpOnly, secure, sameSite=lax)
  → All protected API routes read session via Better Auth's server helper
  → Session expires after 30 days (sliding window — refreshed on activity)
```

### Auth Files

**`lib/auth.ts`** — server-side Better Auth config:
```typescript
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { prisma } from './prisma'

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,      // 30 days
    updateAge: 60 * 60 * 24,            // Refresh if > 1 day old
  },
})
```

**`lib/auth-client.ts`** — client-side Better Auth config:
```typescript
import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({ baseURL: process.env.NEXT_PUBLIC_APP_URL })
```

**`app/api/auth/[...all]/route.ts`**:
```typescript
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'
export const { GET, POST } = toNextJsHandler(auth)
```

### Route Protection

- `app/(app)/layout.tsx` — server component that calls `auth.api.getSession()`, redirects to `/signin` if no session
- All `app/api/` routes (except `/api/auth/**` and `/api/shared-resources/[resourceId]` GET) call `auth.api.getSession()` and return 401 if unauthenticated
- `app/shared/[resourceId]/page.tsx` — fully public, no auth check

### Auth Schema (managed by Better Auth — do not edit manually)

Better Auth auto-creates and manages these tables via its Prisma adapter:
- `User` — id, email, name, image, createdAt, updatedAt
- `Session` — id, userId, token, expiresAt, createdAt, updatedAt
- `Account` — id, userId, provider, providerAccountId, ...OAuth fields
- `Verification` — for future email verification if enabled

---

## 5. Database Schema

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── Better Auth managed tables ──────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  sessions        Session[]
  accounts        Account[]
  galleries       Gallery[]
  sharedResources SharedResource[]
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  ipAddress String?
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id                    String  @id @default(cuid())
  userId                String
  accountId             String
  providerId            String
  accessToken           String?
  refreshToken          String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  idToken               String?
  password              String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

// ── Poof application tables ─────────────────────────────────────────────────

model Gallery {
  id          String    @id @default(cuid())
  userId      String
  name        String
  description String?
  coverImageId String?  // imageId of the chosen cover — nullable
  deletedAt   DateTime? // soft delete
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  user            User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  images          Image[]
  sharedResources SharedResource[]

  @@index([userId])
  @@index([deletedAt])
}

model Image {
  id         String    @id @default(cuid())
  galleryId  String
  userId     String
  fileName   String                        // original file name
  fileSize   Int                           // bytes
  mimeType   String                        // image/jpeg, image/png, etc.
  r2Key      String    @unique             // storage key in R2
  r2Url      String                        // public/CDN URL (or constructed)
  width      Int?                          // px — populated after upload confirms
  height     Int?                          // px
  uploadStatus UploadStatus @default(PENDING)
  deletedAt  DateTime?                     // soft delete
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  gallery Gallery @relation(fields: [galleryId], references: [id], onDelete: Cascade)

  @@index([galleryId])
  @@index([userId])
  @@index([deletedAt])
}

enum UploadStatus {
  PENDING     // presigned URL issued, upload not yet confirmed
  CONFIRMED   // client confirmed upload complete
  FAILED      // upload timed out or failed
}

model SharedResource {
  id          String              @id @default(cuid())
  userId      String
  type        SharedResourceType
  galleryId   String?             // set when type = GALLERY
  imageIds    String[]            // set when type = IMAGE or MULTI_IMAGE
  expiresAt   DateTime
  revokedAt   DateTime?           // set when manually revoked
  viewCount   Int                 @default(0)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  user    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  gallery Gallery? @relation(fields: [galleryId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@index([expiresAt])
  @@index([galleryId])
}

enum SharedResourceType {
  GALLERY      // entire gallery shared — galleryId set, imageIds empty
  IMAGE        // single image shared — imageIds has exactly one entry
  MULTI_IMAGE  // user-selected images — imageIds has multiple entries
}
```

### Schema Relationships

```
User
  ├── has many Gallery
  │     └── has many Image
  └── has many SharedResource
            ├── optionally references one Gallery (type: GALLERY)
            └── references one or more Image IDs (type: IMAGE | MULTI_IMAGE)
```

**Notes on `imageIds`:**
- Stored as `String[]` (Postgres array) for simplicity in v1
- Each value is a valid `Image.id`
- For `type: GALLERY`, `imageIds` is always `[]` — the gallery images are resolved at read time
- For `type: IMAGE`, `imageIds` has exactly one entry
- For `type: MULTI_IMAGE`, `imageIds` has 2–N entries

**Notes on soft delete:**
- `Gallery.deletedAt` and `Image.deletedAt` are set on deletion, never actually removed from DB
- All queries filter `WHERE deletedAt IS NULL` unless explicitly fetching deleted records
- R2 cleanup happens via cron (see Section 15)

---

## 6. Upload Service

### Design: Abstract Class Pattern

The upload service is a **swappable abstraction**. Today it wraps Cloudflare R2. Tomorrow it can wrap S3, Supabase Storage, or anything else — without touching a single API route.

### `lib/upload/UploadService.ts`

```typescript
export interface PresignedUrlResult {
  presignedUrl: string   // PUT URL — client uploads directly to this
  r2Key: string          // storage key — save this in DB
  publicUrl: string      // final access URL after upload completes
}

export interface DeleteResult {
  success: boolean
}

export abstract class UploadService {
  /**
   * Generate a presigned PUT URL for direct client-to-storage upload.
   * @param key      - Storage key (e.g. "galleries/abc123/img_xyz.jpg")
   * @param mimeType - File MIME type for Content-Type header enforcement
   * @param expiresIn - Seconds until the presigned URL expires (default: 300)
   */
  abstract getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn?: number
  ): Promise<PresignedUrlResult>

  /**
   * Delete a single object from storage by its key.
   */
  abstract deleteObject(key: string): Promise<DeleteResult>

  /**
   * Delete multiple objects in a single operation (batch delete).
   */
  abstract deleteObjects(keys: string[]): Promise<DeleteResult>
}
```

### `lib/upload/R2UploadService.ts`

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { UploadService, PresignedUrlResult, DeleteResult } from './UploadService'

export class R2UploadService extends UploadService {
  private client: S3Client
  private bucket: string
  private publicBaseUrl: string

  constructor() {
    super()
    this.bucket = process.env.R2_BUCKET_NAME!
    this.publicBaseUrl = process.env.R2_PUBLIC_URL!
    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT!,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn = 300
  ): Promise<PresignedUrlResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    })
    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn })
    return {
      presignedUrl,
      r2Key: key,
      publicUrl: `${this.publicBaseUrl}/${key}`,
    }
  }

  async deleteObject(key: string): Promise<DeleteResult> {
    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucket, Key: key }))
    return { success: true }
  }

  async deleteObjects(keys: string[]): Promise<DeleteResult> {
    await this.client.send(new DeleteObjectsCommand({
      Bucket: this.bucket,
      Delete: { Objects: keys.map(Key => ({ Key })) },
    }))
    return { success: true }
  }
}
```

### `lib/upload/index.ts`

```typescript
import { R2UploadService } from './R2UploadService'
// To swap: import { S3UploadService } from './S3UploadService'

export const uploadService = new R2UploadService()
```

### Upload Flow (Presigned URL Pattern)

```
1. Client selects files
2. Client calls POST /api/upload/presign
   → Body: { fileName, mimeType, fileSize, galleryId }
   → Server validates: auth, file type, file size, gallery ownership
   → Server generates R2 key: "galleries/{galleryId}/{cuid()}.{ext}"
   → Server calls uploadService.getPresignedUploadUrl(key, mimeType)
   → Server creates Image record in DB with uploadStatus: PENDING
   → Server returns: { presignedUrl, imageId, publicUrl }

3. Client PUTs file directly to presignedUrl (no server in the middle)
   → Uses XMLHttpRequest for progress events

4. On upload success, client calls POST /api/images/{imageId}/confirm
   → Server sets Image.uploadStatus = CONFIRMED

5. On upload failure, client calls POST /api/images/{imageId}/fail
   → Server sets Image.uploadStatus = FAILED
   → FAILED images are cleaned up by cron after 24h

Key format: galleries/{galleryId}/{imageId}.{ext}
Presigned URL expiry: 5 minutes (300 seconds)
```

### Storage Key Convention

```
galleries/{galleryId}/{imageId}.{extension}

Examples:
  galleries/clx123abc/clx456def.jpg
  galleries/clx123abc/clx789ghi.webp
```

---

## 7. API Routes

All routes return JSON. All protected routes return `401` if session is missing.

### Auth
| Method | Route | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/auth/[...all]` | — | Better Auth handler (all auth operations) |

### Galleries
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/galleries` | ✅ | List user's galleries (excludes soft-deleted) |
| POST | `/api/galleries` | ✅ | Create a new gallery |
| GET | `/api/galleries/:id` | ✅ | Get single gallery + images |
| PATCH | `/api/galleries/:id` | ✅ | Update name, description, coverImageId |
| DELETE | `/api/galleries/:id` | ✅ | Soft delete gallery + its images |

### Images
| Method | Route | Auth | Description |
|---|---|---|---|
| DELETE | `/api/images/:imageId` | ✅ | Soft delete single image |
| POST | `/api/images/:imageId/confirm` | ✅ | Mark upload as CONFIRMED |
| POST | `/api/images/:imageId/fail` | ✅ | Mark upload as FAILED |

### Upload
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/presign` | ✅ | Request presigned URL + create PENDING Image record |

### Shared Resources
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/shared-resources` | ✅ | Create a new share link |
| GET | `/api/shared-resources` | ✅ | List user's share links |
| GET | `/api/shared-resources/:resourceId` | ❌ public | Resolve shared resource for public view |
| POST | `/api/shared-resources/:resourceId/revoke` | ✅ | Revoke (invalidate) a share link |
| DELETE | `/api/shared-resources/:resourceId` | ✅ | Delete share link record (owner only) |

### API Response Envelope

All responses follow this shape:

```typescript
// Success
{ data: T, error: null }

// Error
{ data: null, error: { code: string, message: string } }
```

### Error Codes

| Code | HTTP Status | Meaning |
|---|---|---|
| `UNAUTHORIZED` | 401 | No session |
| `FORBIDDEN` | 403 | Session exists but resource doesn't belong to user |
| `NOT_FOUND` | 404 | Resource doesn't exist or is soft-deleted |
| `EXPIRED` | 410 | Shared resource has passed its expiresAt |
| `REVOKED` | 410 | Shared resource was manually revoked |
| `VALIDATION_ERROR` | 422 | Invalid request body |
| `FILE_TOO_LARGE` | 422 | Exceeds 10 MB limit |
| `UNSUPPORTED_TYPE` | 422 | File type not in allowed list |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 8. Sharing Mechanism

### Share Link Structure

```
https://{domain}/shared/{resourceId}
```

The `resourceId` is the `SharedResource.id` (cuid). The URL itself is opaque — it does not reveal whether it's a gallery, single image, or multi-image. The type is resolved server-side when the page loads.

### Creating a Share Link

**Request: `POST /api/shared-resources`**

```typescript
// Body
{
  type: 'GALLERY' | 'IMAGE' | 'MULTI_IMAGE'
  galleryId?: string       // required when type = GALLERY
  imageIds?: string[]      // required when type = IMAGE or MULTI_IMAGE
  expiresAt: string        // ISO 8601 datetime — required, no default
}

// Response
{
  data: {
    id: string             // the resourceId — append to /shared/ for the URL
    type: SharedResourceType
    expiresAt: string
    shareUrl: string       // full constructed URL — convenience field
    createdAt: string
  }
}
```

**Server-side validation on create:**
- Session required
- `expiresAt` must be in the future
- If `type = GALLERY`: `galleryId` must exist and belong to the authenticated user, gallery must not be soft-deleted
- If `type = IMAGE`: `imageIds` must have exactly 1 entry, image must exist, belong to user, not soft-deleted, uploadStatus must be `CONFIRMED`
- If `type = MULTI_IMAGE`: `imageIds` must have 2–100 entries, all images must pass same checks as IMAGE
- All images in `imageIds` must belong to the same gallery (enforced)
- No limit on how many `SharedResource` records can point to the same gallery/image

### Resolving a Share Link (Public)

**Request: `GET /api/shared-resources/:resourceId`**

No authentication required.

**Server logic:**
1. Find `SharedResource` by `id`
2. If not found → `NOT_FOUND`
3. If `revokedAt` is set → `REVOKED`
4. If `expiresAt < now()` → `EXPIRED`
5. Increment `viewCount` by 1
6. Resolve content based on `type`:
   - `GALLERY` → fetch gallery + all non-deleted images (ordered by createdAt)
   - `IMAGE` → fetch single image record
   - `MULTI_IMAGE` → fetch image records for all `imageIds` (preserve order from array)
7. Return resolved content

**Response shape:**

```typescript
{
  data: {
    resourceId: string
    type: SharedResourceType
    expiresAt: string
    viewCount: number

    // When type = GALLERY
    gallery?: {
      id: string
      name: string
      description: string | null
      images: ImageRecord[]
    }

    // When type = IMAGE
    image?: ImageRecord

    // When type = MULTI_IMAGE
    images?: ImageRecord[]
  }
}
```

```typescript
type ImageRecord = {
  id: string
  fileName: string
  r2Url: string
  width: number | null
  height: number | null
  mimeType: string
}
```

### Revoking a Share Link

**Request: `POST /api/shared-resources/:resourceId/revoke`**

- Auth required
- Only the owner (matching `userId`) can revoke
- Sets `revokedAt = now()`
- Subsequent GET requests for that resourceId return `REVOKED`
- Revoked links remain in DB (owner can see them in their link list)

### Multiple Active Links

A user can create as many `SharedResource` records as they want for the same gallery or image. Each gets its own `id`, its own `expiresAt`, and its own `viewCount`. They are fully independent.

---

## 9. React Query — Frontend Data Layer

### Axios Instance

**`lib/axios.ts`**

```typescript
import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Response interceptor — unwrap envelope, surface errors
api.interceptors.response.use(
  (res) => res.data.data,         // unwrap { data, error } → return data directly
  (err) => {
    const message = err.response?.data?.error?.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)
```

### `hooks/queries.ts` — All Read Queries

```typescript
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

// Query key factory — centralised
export const queryKeys = {
  galleries: () => ['galleries'],
  gallery: (id: string) => ['galleries', id],
  galleryImages: (id: string) => ['galleries', id, 'images'],
  sharedResources: () => ['shared-resources'],
  sharedResource: (resourceId: string) => ['shared-resources', resourceId],
  publicSharedResource: (resourceId: string) => ['public', 'shared-resources', resourceId],
}

export function useGalleries() {
  return useQuery({
    queryKey: queryKeys.galleries(),
    queryFn: () => api.get('/galleries'),
  })
}

export function useGallery(id: string) {
  return useQuery({
    queryKey: queryKeys.gallery(id),
    queryFn: () => api.get(`/galleries/${id}`),
    enabled: !!id,
  })
}

export function useSharedResources() {
  return useQuery({
    queryKey: queryKeys.sharedResources(),
    queryFn: () => api.get('/shared-resources'),
  })
}

export function usePublicSharedResource(resourceId: string) {
  return useQuery({
    queryKey: queryKeys.publicSharedResource(resourceId),
    queryFn: () => api.get(`/shared-resources/${resourceId}`),
    enabled: !!resourceId,
    retry: false,    // don't retry 410 expired/revoked errors
  })
}
```

### `hooks/mutations.ts` — All Write Mutations

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { queryKeys } from './queries'

export function useCreateGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name: string; description?: string }) =>
      api.post('/galleries', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.galleries() }),
  })
}

export function useUpdateGallery(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; description?: string; coverImageId?: string }) =>
      api.patch(`/galleries/${id}`, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.gallery(id) })
      qc.invalidateQueries({ queryKey: queryKeys.galleries() })
    },
  })
}

export function useDeleteGallery() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/galleries/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.galleries() }),
  })
}

export function useRequestPresignedUrl() {
  return useMutation({
    mutationFn: (body: {
      fileName: string
      mimeType: string
      fileSize: number
      galleryId: string
    }) => api.post('/upload/presign', body),
  })
}

export function useConfirmUpload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ imageId, galleryId }: { imageId: string; galleryId: string }) =>
      api.post(`/images/${imageId}/confirm`),
    onSuccess: (_, { galleryId }) =>
      qc.invalidateQueries({ queryKey: queryKeys.gallery(galleryId) }),
  })
}

export function useDeleteImage(galleryId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (imageId: string) => api.delete(`/images/${imageId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.gallery(galleryId) }),
  })
}

export function useCreateSharedResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: {
      type: 'GALLERY' | 'IMAGE' | 'MULTI_IMAGE'
      galleryId?: string
      imageIds?: string[]
      expiresAt: string
    }) => api.post('/shared-resources', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sharedResources() }),
  })
}

export function useRevokeSharedResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: string) =>
      api.post(`/shared-resources/${resourceId}/revoke`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sharedResources() }),
  })
}

export function useDeleteSharedResource() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (resourceId: string) => api.delete(`/shared-resources/${resourceId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sharedResources() }),
  })
}
```

---

## 10. Business Rules & Limits

| Rule | Value |
|---|---|
| Max file size | 10 MB per image |
| Supported MIME types | `image/jpeg`, `image/png`, `image/webp`, `image/heic` |
| Max images per gallery | 10 (temporary free-plan cap) |
| Max galleries per user | 3 (temporary free-plan cap) |
| Max images in a MULTI_IMAGE share | 100 |
| Max active share links per gallery | 20 |
| Presigned URL TTL | 5 minutes (300 seconds) |
| Minimum expiry | 1 hour from now |
| Maximum expiry | 1 year from now |
| Session duration | 30 days (sliding) |

These limits are enforced **server-side** in API routes. The UI also validates them for UX but server validation is authoritative.

---

## 11. Deletion Strategy

### Soft Delete (DB layer)

When a user deletes a gallery or image:
1. API route sets `deletedAt = now()` on the record
2. Returns success immediately
3. The R2 object still exists — it is **not** deleted immediately
4. All queries filter `WHERE deletedAt IS NULL` — the record is invisible to the user

### R2 Cleanup (Async via Cron)

A Vercel cron job runs nightly to clean up R2 objects for soft-deleted records:
1. Query all `Image` records where `deletedAt IS NOT NULL AND deletedAt < now() - 24h`
2. Batch call `uploadService.deleteObjects(keys)` in chunks of 100
3. Hard-delete the DB records after confirmed R2 deletion

### Cascade Rules

- Deleting a `Gallery` → sets `deletedAt` on all its `Image` records
- Deleting a `Gallery` → does NOT auto-revoke its `SharedResource` records, but the share page will fail to find non-deleted images and show an empty state (or the API should detect this and return `NOT_FOUND`)
- Deleting an `Image` → does NOT auto-revoke any `SharedResource` that references it — the image simply won't appear in the share page response

### PENDING/FAILED Upload Cleanup

Images with `uploadStatus: PENDING` for > 30 minutes → cron marks them `FAILED`.
Images with `uploadStatus: FAILED` for > 24 hours → cron deletes from DB (no R2 cleanup needed as upload never completed).

---

## 12. Expiry Strategy

### How Expiry Works

- `SharedResource.expiresAt` is a hard timestamp set at creation time
- There is no background job that "expires" links — expiry is checked at **read time**
- When `GET /api/shared-resources/:resourceId` is called:
  - If `now() > expiresAt` → return `{ error: { code: 'EXPIRED' } }` with HTTP 410
  - The record is never deleted — it stays in DB with its original `expiresAt`
- Expired links remain visible in the owner's link list (marked "Poofed")

### Frontend Expiry Display

- Public share pages (`/shared/[resourceId]`) show a live countdown rendered client-side
- Countdown is calculated from `expiresAt` returned by the API
- When countdown hits zero → client shows the expired state immediately (no page reload needed)
- Owner's dashboard shows expiry badge per link:
  - `expiresAt > now + 24h` → mint badge, relative time ("Expires in 3 days")
  - `expiresAt < now + 24h` → peach badge ("Expiring in 4 hours")
  - `expiresAt < now` → muted grey badge ("Poofed")
  - `revokedAt` set → muted grey badge ("Revoked")

---

## 13. Use Case Scenarios

### UC-01: User signs up with Google

1. User clicks "Continue with Google" on `/signup`
2. Better Auth redirects to Google consent screen
3. Google redirects back to `/api/auth/callback/google`
4. Better Auth creates `User` + `Account` records, creates a `Session`
5. User is redirected to `/dashboard`

### UC-02: User creates a gallery and uploads photos

1. User clicks "+ New Gallery" → modal appears → enters name → submits
2. `POST /api/galleries` creates `Gallery` record → dashboard re-queries
3. User opens gallery → drops 3 files onto upload zone
4. For each file, client calls `POST /api/upload/presign` → gets `{ presignedUrl, imageId, publicUrl }`
5. Client PUTs file to `presignedUrl` with XHR (tracks progress)
6. On XHR success → client calls `POST /api/images/{imageId}/confirm`
7. Gallery query invalidated → images appear in grid

### UC-03: User shares an entire gallery

1. User clicks "Share gallery" inside `/gallery/[id]`
2. Share modal opens — user selects expiry (e.g. "7 days from now")
3. Client computes `expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()`
4. `POST /api/shared-resources` with `{ type: 'GALLERY', galleryId, expiresAt }`
5. Server validates, creates `SharedResource`, returns `shareUrl`
6. URL displayed: `https://poof.k04.tech/shared/clx_abc123`
7. User copies link → shares it

### UC-04: Unknown user opens a gallery share link

1. Recipient opens `https://poof.k04.tech/shared/clx_abc123`
2. Page server component (or client) calls `GET /api/shared-resources/clx_abc123`
3. API checks: exists ✓, not revoked ✓, not expired ✓ → increments viewCount → returns gallery data
4. Page renders gallery grid with expiry countdown at top
5. Recipient can view photos, open lightbox, download (always allowed in v1)

### UC-05: Recipient opens an expired link

1. Recipient opens share URL
2. API returns HTTP 410 with `{ error: { code: 'EXPIRED' } }`
3. Page renders the expired state: animated poof cloud, "This already poofed."

### UC-06: User shares a single image

1. User hovers photo in gallery → clicks "Share photo"
2. Share modal opens with type pre-set to `IMAGE`
3. User sets expiry → submits
4. `POST /api/shared-resources` with `{ type: 'IMAGE', imageIds: [imageId], expiresAt }`
5. Returns `shareUrl` → user copies

### UC-07: User shares a custom selection of images

1. User selects multiple photos in gallery (checkboxes)
2. Bulk action bar appears → "Share selected (4)"
3. Share modal opens with type pre-set to `MULTI_IMAGE`, imageIds pre-populated
4. User sets expiry → submits
5. `POST /api/shared-resources` with `{ type: 'MULTI_IMAGE', imageIds: [...], expiresAt }`
6. Public share page shows a mini grid of those specific images

### UC-08: User revokes a share link

1. User opens gallery → Links tab → finds active link
2. Clicks "Revoke" → confirmation prompt
3. `POST /api/shared-resources/{resourceId}/revoke`
4. Server sets `revokedAt = now()`
5. Link list updates — link shows "Revoked" badge
6. Any subsequent access to that share URL returns `REVOKED` (HTTP 410)

### UC-09: User deletes a gallery

1. User clicks delete on gallery card → confirmation modal
2. `DELETE /api/galleries/{id}`
3. Server sets `gallery.deletedAt = now()`, sets `deletedAt` on all child images
4. Dashboard re-queries → gallery disappears
5. Nightly cron picks up soft-deleted images → removes from R2 → hard-deletes records

### UC-10: User creates multiple share links for same gallery

1. User creates share link A — expires in 1 day
2. User creates share link B — expires in 7 days
3. Both appear in the Links tab — independent records
4. Link A expires after 1 day — Link B still works for 6 more days
5. Either can be revoked independently

---

## 14. Environment Variables

```bash
# App
NEXT_PUBLIC_APP_URL=https://poof.k04.tech

# Database (Neon)
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=                    # Random 32+ char string
BETTER_AUTH_URL=https://poof.k04.tech

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=poof-photos
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_PUBLIC_URL=https://your-r2-public-domain.com   # Custom domain or R2 public URL
```

---

## 15. Cron Jobs

Defined in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-storage",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/cleanup-pending-uploads",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

### `/api/cron/cleanup-storage` (nightly at 2am UTC)

1. Query images: `deletedAt IS NOT NULL AND deletedAt < now() - interval '24 hours'`
2. Extract `r2Key` from each
3. Batch delete from R2 in chunks of 100 using `uploadService.deleteObjects(keys)`
4. Hard-delete those Image records from DB
5. Log count of cleaned records

### `/api/cron/cleanup-pending-uploads` (every 30 min)

1. Query images: `uploadStatus = PENDING AND createdAt < now() - interval '30 minutes'`
2. Mark them `FAILED`
3. Query images: `uploadStatus = FAILED AND updatedAt < now() - interval '24 hours'`
4. Hard-delete those DB records (no R2 cleanup — upload never completed so no object exists)

Both cron routes must validate a `CRON_SECRET` header to prevent unauthorized invocation:
```typescript
if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
  return Response.json({ error: 'Unauthorized' }, { status: 401 })
}
```

---

*This specification covers v1 of the Poof platform.*
*Update this file as architectural decisions change — do not let it drift from implementation.*
