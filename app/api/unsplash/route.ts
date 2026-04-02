import { z } from 'zod'
import { requireApiCapability, requireRequestSession } from '@/app/api/_utils/auth'
import { apiErrors } from '@/app/api/_utils/errors'
import { handleApiError } from '@/app/api/_utils/http'
import { ok } from '@/app/api/_utils/response'

const unsplashQuerySchema = z.object({
  query: z.string().trim().min(1).max(80).optional(),
  page: z.coerce.number().int().min(1).max(50).optional(),
  perPage: z.coerce.number().int().min(1).max(20).optional(),
})

const fallbackImages = [
  {
    id: 'fallback-dunes',
    thumbUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    fullUrl:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    authorName: 'NASA',
    authorLink: 'https://unsplash.com/@nasa',
  },
  {
    id: 'fallback-night',
    thumbUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=600&q=80',
    fullUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80',
    authorName: 'Luke Stackpoole',
    authorLink: 'https://unsplash.com/@withluke',
  },
  {
    id: 'fallback-water',
    thumbUrl:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=600&q=80',
    fullUrl:
      'https://images.unsplash.com/photo-1439066615861-d1af74d74000?auto=format&fit=crop&w=2000&q=80',
    authorName: 'Jeremy Bishop',
    authorLink: 'https://unsplash.com/@jeremybishop',
  },
  {
    id: 'fallback-sunset',
    thumbUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80',
    fullUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80',
    authorName: 'Eberhard Grossgasteiger',
    authorLink: 'https://unsplash.com/@eberhardgross',
  },
]

type UnsplashPhotoRecord = {
  id: string
  urls: {
    small?: string
    regular?: string
  }
  user: {
    name?: string
    links?: {
      html?: string
    }
  }
}

export async function GET(request: Request) {
  try {
    const authResult = await requireRequestSession(request)

    if (authResult.response) {
      return authResult.response
    }

    const capabilityError = requireApiCapability(authResult, 'read')
    if (capabilityError) {
      return capabilityError
    }

    const url = new URL(request.url)
    const parsed = unsplashQuerySchema.safeParse({
      query: url.searchParams.get('query') ?? undefined,
      page: url.searchParams.get('page') ?? undefined,
      perPage: url.searchParams.get('perPage') ?? undefined,
    })

    if (!parsed.success) {
      throw apiErrors.validation(parsed.error.issues[0]?.message ?? 'Invalid query')
    }

    const query = parsed.data.query ?? 'minimal abstract gradient background'
    const page = parsed.data.page ?? 1
    const perPage = parsed.data.perPage ?? 12
    const accessKey = process.env.UNSPLASH_ACCESS_KEY

    if (!accessKey) {
      return ok({
        source: 'fallback',
        results: fallbackImages,
      })
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=landscape&content_filter=high`,
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
          'Accept-Version': 'v1',
        },
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      throw apiErrors.internal('Failed to fetch Unsplash images')
    }

    const payload = (await response.json()) as {
      results?: UnsplashPhotoRecord[]
    }

    const results = (payload.results ?? [])
      .filter((photo) => Boolean(photo.urls?.small) && Boolean(photo.urls?.regular))
      .map((photo) => ({
        id: photo.id,
        thumbUrl: photo.urls.small!,
        fullUrl: photo.urls.regular!,
        authorName: photo.user?.name ?? 'Unsplash Creator',
        authorLink: photo.user?.links?.html ?? 'https://unsplash.com',
      }))

    return ok({
      source: 'unsplash',
      results,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
