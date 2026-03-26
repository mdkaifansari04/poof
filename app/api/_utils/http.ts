import { ApiRouteError } from './errors'
import { fail } from './response'

export async function parseJsonBody<T>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    throw new ApiRouteError('VALIDATION_ERROR', 'Invalid JSON body', 422)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiRouteError) {
    return fail(error.code, error.message, error.status)
  }

  console.error(error)
  return fail('INTERNAL_ERROR', 'Unexpected server error', 500)
}
