import { afterEach, describe, expect, test } from 'bun:test'
import { ApiRouteError } from '@/app/api/_utils/errors'
import { requireCronAuthorization } from '@/app/api/_utils/cron'

describe('requireCronAuthorization', () => {
  const previousSecret = process.env.CRON_SECRET

  afterEach(() => {
    if (previousSecret === undefined) {
      delete process.env.CRON_SECRET
    } else {
      process.env.CRON_SECRET = previousSecret
    }
  })

  test('accepts a valid bearer token', () => {
    process.env.CRON_SECRET = 'secret-123'
    const request = new Request('https://poof.app/api/cron/cleanup-storage', {
      headers: {
        Authorization: 'Bearer secret-123',
      },
    })

    expect(() => requireCronAuthorization(request)).not.toThrow()
  })

  test('throws UNAUTHORIZED for invalid token', () => {
    process.env.CRON_SECRET = 'secret-123'
    const request = new Request('https://poof.app/api/cron/cleanup-storage', {
      headers: {
        Authorization: 'Bearer wrong-secret',
      },
    })

    try {
      requireCronAuthorization(request)
      throw new Error('Expected an authorization error')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiRouteError)
      expect((error as ApiRouteError).code).toBe('UNAUTHORIZED')
    }
  })
})
