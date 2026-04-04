import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { afterEach, describe, expect, test } from 'bun:test'
import { buildShareUrl, buildSharedImageProxyPath } from '@/app/api/_utils/shared'

const originalNextPublicAppUrl = process.env.NEXT_PUBLIC_APP_URL
const originalBetterAuthUrl = process.env.BETTER_AUTH_URL

afterEach(() => {
  if (originalNextPublicAppUrl === undefined) {
    delete process.env.NEXT_PUBLIC_APP_URL
  } else {
    process.env.NEXT_PUBLIC_APP_URL = originalNextPublicAppUrl
  }

  if (originalBetterAuthUrl === undefined) {
    delete process.env.BETTER_AUTH_URL
  } else {
    process.env.BETTER_AUTH_URL = originalBetterAuthUrl
  }
})

describe('share URL origin hardening', () => {
  test('buildShareUrl prefers configured app URL instead of request host', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://poof.k04.tech'
    delete process.env.BETTER_AUTH_URL

    const request = new Request('https://attacker.invalid/api/shared-resources')
    const shareUrl = buildShareUrl(request, 'resource_123')

    expect(shareUrl).toBe('https://poof.k04.tech/shared/resource_123')
  })
})

describe('service worker cache isolation', () => {
  test('service worker explicitly skips API routes from runtime cache handling', () => {
    const swPath = join(process.cwd(), 'public', 'sw.js')
    const source = readFileSync(swPath, 'utf8')
    expect(source.includes("url.pathname.startsWith('/api/')")).toBe(true)
  })
})

describe('shared media delivery hardening', () => {
  test('shared image URLs resolve via existing shared-resource endpoint', () => {
    const proxyUrl = buildSharedImageProxyPath('resource_123', 'image_456')
    expect(proxyUrl).toBe('/api/shared-resources/resource_123?imageId=image_456')
  })

  test('public shared-resource responses do not expose durable upstream object URLs', () => {
    const routePath = join(process.cwd(), 'app', 'api', 'shared-resources', '[resourceId]', 'route.ts')
    const source = readFileSync(routePath, 'utf8')
    expect(source.includes('r2Url: true')).toBe(false)
  })

  test('shared-resource route handles image proxy requests via query param', () => {
    const routePath = join(process.cwd(), 'app', 'api', 'shared-resources', '[resourceId]', 'route.ts')
    const source = readFileSync(routePath, 'utf8')
    expect(source.includes("searchParams.get('imageId')")).toBe(true)
    expect(source.includes('NextResponse.redirect')).toBe(true)
  })
})
