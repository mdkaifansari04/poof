export type AgentApiKeyListItem = {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateAgentApiKeyInput = {
  name: string
}

export type CreateAgentApiKeyResponse = {
  apiKey: string
  key: AgentApiKeyListItem
}
