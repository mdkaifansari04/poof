import { createHash, randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'

const API_KEY_PREFIX = 'poof_live_'
const API_KEY_RANDOM_BYTES = 32
const API_KEY_PREVIEW_LENGTH = 20

type AgentApiKeyLookup = {
  id: string
  userId: string
  name: string
  prefix: string
  revokedAt: Date | null
}

export function createAgentApiKeyValue() {
  return `${API_KEY_PREFIX}${randomBytes(API_KEY_RANDOM_BYTES).toString('base64url')}`
}

export function hashAgentApiKey(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

export function getAgentApiKeyPrefix(value: string) {
  return value.slice(0, API_KEY_PREVIEW_LENGTH)
}

export function getRequestApiKey(request: Request) {
  const directValue = request.headers.get('x-api-key')?.trim()
  if (directValue) {
    return directValue
  }

  const authorization = request.headers.get('authorization')?.trim()
  if (!authorization) {
    return null
  }

  const [scheme, token] = authorization.split(/\s+/, 2)
  if (!scheme || !token || scheme.toLowerCase() !== 'bearer') {
    return null
  }

  return token.trim() || null
}

export async function createAgentApiKey(params: { userId: string; name: string }) {
  const apiKey = createAgentApiKeyValue()

  const created = await prisma.agentApiKey.create({
    data: {
      userId: params.userId,
      name: params.name,
      prefix: getAgentApiKeyPrefix(apiKey),
      keyHash: hashAgentApiKey(apiKey),
    },
    select: {
      id: true,
      name: true,
      prefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return {
    apiKey,
    key: created,
  }
}

export async function verifyAgentApiKey(value: string): Promise<AgentApiKeyLookup | null> {
  const hashedValue = hashAgentApiKey(value)

  const key = await prisma.agentApiKey.findUnique({
    where: {
      keyHash: hashedValue,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      prefix: true,
      revokedAt: true,
    },
  })

  if (!key || key.revokedAt) {
    return null
  }

  return key
}

export async function touchAgentApiKey(keyId: string) {
  await prisma.agentApiKey.update({
    where: {
      id: keyId,
    },
    data: {
      lastUsedAt: new Date(),
    },
  })
}
