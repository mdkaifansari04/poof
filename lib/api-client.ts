import type { ApiEnvelope, ApiErrorCode } from '@/app/api/_utils/response'

type QueryParamPrimitive = string | number | boolean | null | undefined
type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[]
type QueryParams = Record<string, QueryParamValue>

type ApiRequestConfig = Omit<RequestInit, 'body' | 'headers' | 'method' | 'signal'> & {
  body?: unknown
  headers?: HeadersInit
  method?: string
  params?: QueryParams
  signal?: AbortSignal
  timeoutMs?: number
  url: string
}

type ApiMethodConfig = Omit<ApiRequestConfig, 'method' | 'url' | 'body'>

type ApiClientDefaults = {
  baseURL?: string
  headers?: HeadersInit
  timeoutMs?: number
}

type ApiClient = {
  delete<T>(url: string, config?: ApiMethodConfig): Promise<T>
  get<T>(url: string, config?: ApiMethodConfig): Promise<T>
  patch<T>(url: string, body?: unknown, config?: ApiMethodConfig): Promise<T>
  post<T>(url: string, body?: unknown, config?: ApiMethodConfig): Promise<T>
  put<T>(url: string, body?: unknown, config?: ApiMethodConfig): Promise<T>
  request<T>(config: ApiRequestConfig): Promise<T>
}

const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/

export class ApiClientError extends Error {
  readonly code: ApiErrorCode | null
  readonly status: number | null

  constructor(message: string, options?: { code?: ApiErrorCode | null; status?: number | null }) {
    super(message)
    this.name = 'ApiClientError'
    this.code = options?.code ?? null
    this.status = options?.status ?? null
  }
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return typeof value === 'object' && value !== null && 'data' in value && 'error' in value
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isBodyInit(value: unknown): value is BodyInit {
  return (
    typeof value === 'string' ||
    value instanceof Blob ||
    value instanceof FormData ||
    value instanceof URLSearchParams ||
    value instanceof ArrayBuffer ||
    ArrayBuffer.isView(value) ||
    value instanceof ReadableStream
  )
}

function joinUrls(baseURL: string | undefined, url: string) {
  if (!baseURL) {
    return url
  }

  const trimmedBase = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL
  const normalizedUrl = url.startsWith('/') ? url : `/${url}`
  return `${trimmedBase}${normalizedUrl}`
}

function appendQueryParams(url: string, params?: QueryParams) {
  if (!params) {
    return url
  }

  const searchParams = new URLSearchParams()

  for (const [key, rawValue] of Object.entries(params)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        if (value === null || value === undefined) {
          continue
        }

        searchParams.append(key, String(value))
      }

      continue
    }

    if (rawValue === null || rawValue === undefined) {
      continue
    }

    searchParams.append(key, String(rawValue))
  }

  const query = searchParams.toString()

  if (!query) {
    return url
  }

  return `${url}${url.includes('?') ? '&' : '?'}${query}`
}

function buildUrl(baseURL: string | undefined, url: string, params?: QueryParams) {
  const resolved = ABSOLUTE_URL_PATTERN.test(url) || url.startsWith('//') ? url : joinUrls(baseURL, url)
  return appendQueryParams(resolved, params)
}

function mergeHeaders(defaultHeaders?: HeadersInit, requestHeaders?: HeadersInit) {
  const headers = new Headers(defaultHeaders)

  if (requestHeaders) {
    const nextHeaders = new Headers(requestHeaders)
    nextHeaders.forEach((value, key) => {
      headers.set(key, value)
    })
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }

  return headers
}

function serializeBody(body: unknown, headers: Headers) {
  if (body === null || body === undefined) {
    return undefined
  }

  if (isBodyInit(body)) {
    return body
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

async function parseResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) {
    return null
  }

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  const bodyText = await response.text()

  if (!bodyText) {
    return null
  }

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(bodyText) as unknown
    } catch {
      return bodyText
    }
  }

  return bodyText
}

function toApiClientError(response: Response | null, payload: unknown, fallbackMessage: string) {
  if (isApiEnvelope(payload) && payload.error) {
    return new ApiClientError(payload.error.message, {
      code: payload.error.code,
      status: response?.status ?? null,
    })
  }

  if (typeof payload === 'string' && payload.trim()) {
    return new ApiClientError(payload, { status: response?.status ?? null })
  }

  if (isRecord(payload) && typeof payload.message === 'string' && payload.message.trim()) {
    return new ApiClientError(payload.message, { status: response?.status ?? null })
  }

  return new ApiClientError(fallbackMessage, { status: response?.status ?? null })
}

function createRequestSignal(sourceSignal?: AbortSignal, timeoutMs?: number) {
  const controller = new AbortController()
  let didTimeout = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const forwardAbort = () => {
    controller.abort(sourceSignal?.reason)
  }

  if (sourceSignal) {
    if (sourceSignal.aborted) {
      forwardAbort()
    } else {
      sourceSignal.addEventListener('abort', forwardAbort, { once: true })
    }
  }

  if (timeoutMs && timeoutMs > 0) {
    timeoutId = setTimeout(() => {
      didTimeout = true
      controller.abort()
    }, timeoutMs)
  }

  return {
    cleanup: () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (sourceSignal) {
        sourceSignal.removeEventListener('abort', forwardAbort)
      }
    },
    didTimeout: () => didTimeout,
    signal: controller.signal,
  }
}

export function createApiClient(defaults: ApiClientDefaults = {}): ApiClient {
  async function request<T>(config: ApiRequestConfig): Promise<T> {
    const {
      body,
      headers: requestHeaders,
      method = 'GET',
      params,
      signal: sourceSignal,
      timeoutMs = defaults.timeoutMs,
      url,
      credentials = 'same-origin',
      ...rest
    } = config

    const headers = mergeHeaders(defaults.headers, requestHeaders)
    const serializedBody = serializeBody(body, headers)
    const requestSignal = createRequestSignal(sourceSignal, timeoutMs)

    try {
      const response = await fetch(buildUrl(defaults.baseURL, url, params), {
        ...rest,
        body: serializedBody,
        credentials,
        headers,
        method,
        signal: requestSignal.signal,
      })
      const payload = await parseResponseBody(response)

      if (!response.ok) {
        throw toApiClientError(response, payload, response.statusText || 'Something went wrong')
      }

      if (isApiEnvelope(payload)) {
        if (payload.error) {
          throw toApiClientError(response, payload, 'Something went wrong')
        }

        return payload.data as T
      }

      return payload as T
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError(requestSignal.didTimeout() ? 'Request timed out' : 'Request was aborted')
      }

      if (error instanceof Error) {
        throw new ApiClientError(error.message)
      }

      throw new ApiClientError('Network request failed')
    } finally {
      requestSignal.cleanup()
    }
  }

  return {
    delete: (url, config) => request({ ...config, method: 'DELETE', url }),
    get: (url, config) => request({ ...config, method: 'GET', url }),
    patch: (url, body, config) => request({ ...config, body, method: 'PATCH', url }),
    post: (url, body, config) => request({ ...config, body, method: 'POST', url }),
    put: (url, body, config) => request({ ...config, body, method: 'PUT', url }),
    request,
  }
}

export const api = createApiClient({
  baseURL: '/api',
})
