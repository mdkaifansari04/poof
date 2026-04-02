import { NextResponse } from 'next/server'

function getServerUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://poof.k04.tech'
}

export function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Poof API',
      version: '1.0.0',
      description:
        'Versioned API for Poof gallery management, uploads, share links, and first-party agent automation.',
    },
    servers: [
      {
        url: `${getServerUrl().replace(/\/$/, '')}/api/v1`,
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'API Key',
        },
        apiKeyHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
        },
      },
    },
    security: [{ bearerAuth: [] }, { apiKeyHeader: [] }],
    paths: {
      '/agent-api-keys': {
        get: { summary: 'List API keys for the current account' },
        post: { summary: 'Create a new API key with permissions' },
      },
      '/agent-api-keys/{keyId}': {
        patch: { summary: 'Update API key name/permissions' },
        delete: { summary: 'Revoke an API key' },
      },
      '/galleries': {
        get: { summary: 'List galleries' },
        post: { summary: 'Create gallery' },
      },
      '/galleries/{id}': {
        get: { summary: 'Get gallery details' },
        patch: { summary: 'Update gallery' },
        delete: { summary: 'Soft-delete gallery and images' },
      },
      '/galleries/{id}/banner/presign': {
        post: { summary: 'Create presigned upload URL for gallery banner' },
      },
      '/upload/presign': {
        post: { summary: 'Create presigned upload URL for image upload' },
      },
      '/images/{imageId}': {
        delete: { summary: 'Soft-delete image' },
      },
      '/images/{imageId}/confirm': {
        post: { summary: 'Confirm image upload' },
      },
      '/images/{imageId}/fail': {
        post: { summary: 'Mark image upload as failed' },
      },
      '/shared-resources': {
        get: { summary: 'List share links' },
        post: { summary: 'Create share link' },
      },
      '/shared-resources/{resourceId}': {
        get: { summary: 'Resolve public share link payload' },
        patch: { summary: 'Update share link (expiry/reactivate)' },
        delete: { summary: 'Delete share link' },
      },
      '/shared-resources/{resourceId}/revoke': {
        post: { summary: 'Revoke share link' },
      },
    },
  }

  return NextResponse.json(spec, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
