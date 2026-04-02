import { describe, expect, test } from 'bun:test'
import {
  createAgentApiKeyValue,
  getAgentApiKeyPrefix,
  getRequestApiKey,
  hashAgentApiKey,
} from '@/lib/agent-api-keys'

describe('agent api key helpers', () => {
  test('creates a Poof-prefixed API key and stable preview prefix', () => {
    const value = createAgentApiKeyValue()

    expect(value.startsWith('poof_live_')).toBe(true)
    expect(getAgentApiKeyPrefix(value)).toBe(value.slice(0, 20))
  })

  test('extracts api key from x-api-key header first', () => {
    const request = new Request('https://poof.k04.tech/api/galleries', {
      headers: {
        'X-API-Key': 'poof_live_direct',
        Authorization: 'Bearer poof_live_bearer',
      },
    })

    expect(getRequestApiKey(request)).toBe('poof_live_direct')
  })

  test('extracts api key from bearer authorization header', () => {
    const request = new Request('https://poof.k04.tech/api/galleries', {
      headers: {
        Authorization: 'Bearer poof_live_bearer',
      },
    })

    expect(getRequestApiKey(request)).toBe('poof_live_bearer')
  })

  test('hashes the same API key deterministically', () => {
    const value = 'poof_live_example'

    expect(hashAgentApiKey(value)).toBe(hashAgentApiKey(value))
  })
})
