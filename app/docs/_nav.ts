export type DocsNavItem = {
  title: string
  href: string
  description: string
  external?: boolean
}

export type DocsNavSection = {
  title: string
  items: DocsNavItem[]
}

export const docsNav: DocsNavSection[] = [
  {
    title: 'Start',
    items: [
      {
        title: 'Overview',
        href: '/docs',
        description: 'Product and platform overview for Poof automation.',
      },
      {
        title: 'Starter Prompt',
        href: '/starter.md',
        description: 'Copy-paste one-prompt agent setup with API-key auth.',
      },
      {
        title: 'Authentication',
        href: '/docs/authentication',
        description: 'Session auth vs API-key auth and security posture.',
      },
    ],
  },
  {
    title: 'API',
    items: [
      {
        title: 'API Overview',
        href: '/docs/api',
        description: 'Core conventions and lifecycle behavior.',
      },
      {
        title: 'API Reference',
        href: '/docs/reference',
        description: 'Versioned endpoint map for /api/v1.',
      },
      {
        title: 'OpenAPI JSON',
        href: '/api/v1/openapi',
        description: 'Machine-readable schema surface.',
        external: true,
      },
    ],
  },
  {
    title: 'Agents',
    items: [
      {
        title: 'Agent Guide',
        href: '/docs/agents',
        description: 'End-to-end behavior for first-party agent clients.',
      },
      {
        title: 'Scopes & Ownership',
        href: '/docs/scopes',
        description: 'Read/write permissions and agent-owned-only mode.',
      },
    ],
  },
]
