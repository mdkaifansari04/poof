function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://poof.k04.tech'
}

export function GET() {
  const appUrl = getAppUrl().replace(/\/$/, '')
  const body = `# Poof

> Poof is a photo-sharing app with expiring links, direct-to-R2 uploads, and agent-friendly account automation through API keys.

Poof is a consumer app with automation. Humans can use the web app directly, and agents can act on behalf of a user after the user creates an account API key in settings.

Important behavior:

- Agents can manage galleries, upload images through Poof's presigned upload flow, and create share links.
- Agents should only create share links when the user explicitly asks to share content.
- If the user asks to share and does not provide an expiry, use a 24 hour default.
- Uploads use a short-lived presigned R2 PUT URL followed by confirm or fail calls back to Poof.

## Product

- [Poof Home](${appUrl}/): Product homepage
- [Docs](${appUrl}/docs): Documentation entry point

## API

- [API Overview](${appUrl}/docs/api): Authentication and upload flow
- [Galleries API](${appUrl}/docs/api): Gallery CRUD and listing
- [Share Links](${appUrl}/docs/api): Share link creation, revocation, and expiry behavior

## Agents

- [Agent Guide](${appUrl}/docs/agents): How first-party agents should use Poof
- [Settings](${appUrl}/settings): Users create and revoke API keys here after signing in
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}
