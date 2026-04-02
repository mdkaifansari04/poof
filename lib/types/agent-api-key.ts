export type AgentApiKeyListItem = {
  id: string
  name: string
  prefix: string
  canRead: boolean
  canWrite: boolean
  agentResourcesOnly: boolean
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
  updatedAt: string
}

export type CreateAgentApiKeyInput = {
  name: string
  canRead?: boolean
  canWrite?: boolean
  agentResourcesOnly?: boolean
}

export type CreateAgentApiKeyResponse = {
  apiKey: string
  key: AgentApiKeyListItem
}

export type UpdateAgentApiKeyInput = {
  name?: string
  canRead?: boolean
  canWrite?: boolean
  agentResourcesOnly?: boolean
}
