import axios from 'axios'
import type { ApiEnvelope, ApiErrorCode } from '@/app/api/_utils/response'

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

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.response.use(
  ((response: { data: ApiEnvelope<unknown> }) => {
    const payload = response.data as ApiEnvelope<unknown>
    return payload.data
  }) as unknown as Parameters<typeof api.interceptors.response.use>[0],
  (error) => {
    const code = error.response?.data?.error?.code as ApiErrorCode | undefined
    const message = error.response?.data?.error?.message ?? 'Something went wrong'
    const status = error.response?.status as number | undefined
    return Promise.reject(new ApiClientError(message, { code: code ?? null, status: status ?? null }))
  },
)
