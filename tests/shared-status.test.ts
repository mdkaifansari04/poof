import { describe, expect, test } from 'bun:test'
import { getSharedResourceStatus } from '@/app/api/_utils/shared'

describe('getSharedResourceStatus', () => {
  const now = new Date('2026-03-27T00:00:00.000Z')

  test('returns REVOKED when revokedAt exists', () => {
    const status = getSharedResourceStatus(
      {
        revokedAt: new Date('2026-03-26T12:00:00.000Z'),
        expiresAt: new Date('2026-03-28T12:00:00.000Z'),
      },
      now,
    )

    expect(status).toBe('REVOKED')
  })

  test('returns EXPIRED when expiresAt is in the past', () => {
    const status = getSharedResourceStatus(
      {
        revokedAt: null,
        expiresAt: new Date('2026-03-26T23:59:59.000Z'),
      },
      now,
    )

    expect(status).toBe('EXPIRED')
  })

  test('returns ACTIVE when not revoked and not expired', () => {
    const status = getSharedResourceStatus(
      {
        revokedAt: null,
        expiresAt: new Date('2026-03-27T01:00:00.000Z'),
      },
      now,
    )

    expect(status).toBe('ACTIVE')
  })
})
