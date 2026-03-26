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
  return NextResponse.json<ApiEnvelope<T>>({ data, error: null }, init)
}

export function fail(code: ApiErrorCode, message: string, status: number) {
  return NextResponse.json<ApiEnvelope<null>>(
    {
      data: null,
      error: { code, message },
    },
    { status },
  )
}
