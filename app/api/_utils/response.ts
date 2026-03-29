import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'EXPIRED'
  | 'REVOKED'
  | 'VALIDATION_ERROR'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_TYPE'
  | 'INTERNAL_ERROR'

export type ApiErrorBody = {
  code: ApiErrorCode
  message: string
}

export type ApiEnvelope<T> = {
  data: T | null
  error: ApiErrorBody | null
}

export function ok<T>(data: T, init?: ResponseInit) {
  const headers = new Headers(init?.headers)
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'no-store, max-age=0')
  }

  return NextResponse.json<ApiEnvelope<T>>(
    { data, error: null },
    {
      ...init,
      headers,
    },
  )
}

export function fail(code: ApiErrorCode, message: string, status: number) {
  const headers = new Headers()
  headers.set('Cache-Control', 'no-store, max-age=0')

  return NextResponse.json<ApiEnvelope<null>>(
    {
      data: null,
      error: { code, message },
    },
    { status, headers },
  )
}
