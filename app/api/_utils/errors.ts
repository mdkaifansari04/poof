import type { ApiErrorCode } from './response'

export class ApiRouteError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message)
    this.name = 'ApiRouteError'
    this.code = code
    this.status = status
  }
}

export const apiErrors = {
  unauthorized(message = 'Authentication required') {
    return new ApiRouteError('UNAUTHORIZED', message, 401)
  },
  forbidden(message = 'You do not have access to this resource') {
    return new ApiRouteError('FORBIDDEN', message, 403)
  },
  notFound(message = 'Resource not found') {
    return new ApiRouteError('NOT_FOUND', message, 404)
  },
  validation(message = 'Invalid request body') {
    return new ApiRouteError('VALIDATION_ERROR', message, 422)
  },
  internal(message = 'An unexpected error occurred') {
    return new ApiRouteError('INTERNAL_ERROR', message, 500)
  },
}
