import axios from 'axios'
import type { ApiEnvelope } from '@/app/api/_utils/response'

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
    const message = error.response?.data?.error?.message ?? 'Something went wrong'
    return Promise.reject(new Error(message))
  },
)
