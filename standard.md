# Poof — Integration Standard

A reference for the clean client-server integration pattern used across this codebase.

---

## Architecture at a Glance

```
API Routes (app/api/)          → NextResponse envelopes { data, error }
        ↕
lib/api-client.ts              → Thin fetch wrapper, auto-unwraps envelopes
        ↕
lib/types/                     → Shared input/output type contracts
        ↕
hooks/queries.ts               → All read operations (useQuery)
hooks/mutations.ts             → All write operations (useMutation)
        ↕
Components / Pages             → Consume hooks, never call fetch directly
```

---

## 1. API Envelope — Single Contract for Every Response

Every API route returns a uniform `ApiEnvelope<T>`:

```ts
type ApiEnvelope<T> = {
  data: T | null
  error: { code: ApiErrorCode; message: string } | null
}
```

**Success:** `{ data: <payload>, error: null }` — returned via `ok(data)`.  
**Failure:** `{ data: null, error: { code, message } }` — returned via `fail(code, message, status)`.

This means the client never has to guess the response shape. One envelope, everywhere.

---

## 2. API Client — Fetch Wrapper That Unwraps for You

`lib/api-client.ts` exports a single `api` instance:

```ts
export const api = createApiClient({ baseURL: '/api' })
```

The client:

- Auto-serializes JSON bodies and sets `Content-Type`.
- Auto-unwraps `ApiEnvelope` → returns `data` directly or throws `ApiClientError` with the envelope's error.
- Supports timeout, abort signals, and query params out of the box.
- Exposes `get`, `post`, `patch`, `put`, `delete` — mirrors REST semantics exactly.

**What this means for hooks:** Every `api.get(...)` or `api.post(...)` call returns the **unwrapped data type** directly, not the envelope. Errors surface as thrown `ApiClientError` instances with `.code`, `.status`, and `.message`.

---

## 3. Type Contracts — `lib/types/`

Each domain has its own file (`gallery.ts`, `shared-resource.ts`, etc.) containing:

- **Input types** — what the client sends (`CreateGalleryInput`, `PresignUploadInput`)
- **Output types** — what the server returns (`GalleryListItem`, `GalleryDetail`)

These types are imported by **both** the hooks and the API routes, acting as the shared contract between client and server. No `any`, no guessing.

```
lib/types/
  gallery.ts           → GalleryListItem, GalleryDetail, CreateGalleryInput, etc.
  shared-resource.ts   → SharedResourceListItem, PublicSharedResource, etc.
  agent-api-key.ts     → AgentApiKey types
```

---

## 4. Query Hooks — `hooks/queries.ts`

### Query Key Factory

A single `queryKeys` object defines every cache key in one place:

```ts
export const queryKeys = {
  galleries: ()              => ['galleries'] as const,
  gallery: (id: string)      => ['galleries', id] as const,
  sharedResources: ()        => ['shared-resources'] as const,
  sharedResource: (id: string) => ['shared-resources', id] as const,
  // ...
}
```

**Why:** Cache invalidation in mutations references these same keys — no magic strings scattered across files.

### Hook Shape

Each query hook is a thin, single-purpose function:

```ts
export function useGalleries() {
  return useQuery({
    queryKey: queryKeys.galleries(),
    queryFn: () => api.get('/galleries') as Promise<GalleryListItem[]>,
    ...realtimeQueryOptions,
  })
}
```

Rules:
- **One hook per endpoint.** No multi-purpose "useFetch" abstractions.
- **Typed return.** The `as Promise<T>` cast matches the API contract from `lib/types/`.
- **`enabled` guard** when the query depends on a parameter: `enabled: Boolean(id)`.
- **Shared options** (`realtimeQueryOptions`) keep refetch behavior consistent without repeating config.

---

## 5. Mutation Hooks — `hooks/mutations.ts`

### Hook Shape

```ts
export function useCreateGallery() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateGalleryInput) =>
      api.post('/galleries', body) as Promise<GalleryListItem>,
    onSuccess: async () => {
      await invalidateGalleryData(queryClient)
    },
  })
}
```

Rules:
- **One hook per action.** `useCreateGallery`, `useDeleteGallery`, `useRevokeSharedResource`, etc.
- **Input is typed.** The `mutationFn` parameter matches the input type from `lib/types/`.
- **Cache invalidation lives in `onSuccess`.** The component doesn't touch the query cache — ever.
- **Invalidation helpers** (`invalidateGalleryData`, `invalidateShareData`) group related cache busts and run them in parallel.

### Invalidation Helpers

```ts
async function invalidateGalleryData(queryClient, galleryId?: string) {
  const tasks: Promise<unknown>[] = []
  tasks.push(
    queryClient.invalidateQueries({ queryKey: queryKeys.galleries() }),
    queryClient.refetchQueries({ queryKey: queryKeys.galleries() }),
  )
  if (galleryId) {
    tasks.push(
      queryClient.invalidateQueries({ queryKey: queryKeys.gallery(galleryId) }),
      queryClient.refetchQueries({ queryKey: queryKeys.gallery(galleryId) }),
    )
  }
  await Promise.all(tasks)
}
```

This keeps cache logic DRY — multiple mutations that affect galleries share the same invalidation path.

---

## 6. Component Consumption — The Rules

### Queries

```tsx
const galleriesQuery = useGalleries()
const sharedResourcesQuery = useSharedResources()
```

- Access data via `query.data`, fallback with `?? []`.
- Show skeletons with `query.isPending`.
- Show error state with `query.isError` + `query.error?.message`.
- Offer retry via `query.refetch()`.
- Derive computed state with `useMemo` over `query.data`.

### Mutations

```tsx
const deleteGallery = useDeleteGallery()
```

- **Always use `mutateAsync`** inside async handlers with `try/catch`:

```tsx
const handleDelete = async (id: string) => {
  try {
    await deleteGallery.mutateAsync(id)
    toast.success('Gallery deleted')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to delete gallery')
  }
}
```

- Disable buttons with `mutation.isPending`.
- Show spinners with `mutation.isPending`.
- **Never call `api.post(...)` directly in a component.** Always go through a mutation hook.

---

## 7. The Layered Responsibility

| Layer | Responsibility | Does NOT do |
|---|---|---|
| **API Route** | Validate, query DB, return `ApiEnvelope` | Touch React, manage cache |
| **API Client** | Serialize, fetch, unwrap envelope, throw errors | Know about React or TanStack Query |
| **Type Contracts** | Define shapes for inputs and outputs | Contain logic |
| **Query Hooks** | Declare cache keys, fetch via `api.get` | Mutate data, manage UI state |
| **Mutation Hooks** | Write via `api.post/patch/delete`, invalidate cache | Manage UI state, show toasts |
| **Components** | Call hooks, handle loading/error/success UI | Call `fetch`, touch cache directly |

---

## 8. Checklist for Adding a New Feature

1. **Define types** in `lib/types/<domain>.ts` — inputs and outputs.
2. **Build the API route** in `app/api/<domain>/` — use `ok()` and `fail()` helpers.
3. **Add query key** to `queryKeys` in `hooks/queries.ts`.
4. **Add query hook** if it's a read operation.
5. **Add mutation hook** if it's a write operation — include `onSuccess` cache invalidation.
6. **Consume in component** — use the hook, handle `isPending`/`isError`, show toasts on mutation results.

No step touches another layer's concern. That's the whole point.

---

## 9. Anti-Patterns to Avoid

| Don't | Do Instead |
|---|---|
| `fetch('/api/...')` in a component | Use a query or mutation hook |
| Inline cache invalidation in components | Put it in the mutation hook's `onSuccess` |
| Magic string query keys like `['galleries']` | Use `queryKeys.galleries()` |
| `any` on API responses | Type the return with shared contracts from `lib/types/` |
| Giant multi-purpose hooks | One hook per endpoint/action |
| Swallowing errors silently | `try/catch` + `toast.error(error.message)` |
| Duplicating invalidation logic | Use shared helpers like `invalidateGalleryData` |

---

## 10. QueryProvider Setup

The `QueryClient` is configured once in `components/providers/query-provider.tsx`:

```tsx
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: 'always',
      retry: 1,
    },
  },
})
```

This means queries are always fresh on mount/focus/reconnect by default — individual hooks can override as needed.
