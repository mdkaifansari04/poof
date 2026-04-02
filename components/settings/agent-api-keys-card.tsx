'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { GlassCard } from '@/components/poof/glass-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { api } from '@/lib/api-client'
import type { CreateAgentApiKeyResponse, AgentApiKeyListItem } from '@/lib/types/agent-api-key'

function formatTimestamp(value: string | null) {
  if (!value) {
    return 'Never'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'Unknown'
  }

  return parsed.toLocaleString()
}

export function AgentApiKeysCard() {
  const [keys, setKeys] = useState<AgentApiKeyListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [savingKeyId, setSavingKeyId] = useState<string | null>(null)
  const [newKeyName, setNewKeyName] = useState('My agent')
  const [newCanRead, setNewCanRead] = useState(true)
  const [newCanWrite, setNewCanWrite] = useState(true)
  const [newAgentResourcesOnly, setNewAgentResourcesOnly] = useState(false)
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null)

  async function loadKeys() {
    setIsLoading(true)

    try {
      const nextKeys = await api.get<AgentApiKeyListItem[]>('/agent-api-keys')
      setKeys(nextKeys)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load API keys'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadKeys()
  }, [])

  const activeKeyCount = useMemo(
    () => keys.filter((key) => key.revokedAt === null).length,
    [keys],
  )

  async function handleCreateKey() {
    const trimmedName = newKeyName.trim()

    if (!trimmedName) {
      toast.error('Name is required')
      return
    }

    if (!newCanRead && !newCanWrite) {
      toast.error('Enable at least read or write access')
      return
    }

    setIsCreating(true)

    try {
      const created = await api.post<CreateAgentApiKeyResponse>('/agent-api-keys', {
        name: trimmedName,
        canRead: newCanRead,
        canWrite: newCanWrite,
        agentResourcesOnly: newAgentResourcesOnly,
      })

      setKeys((current) => [created.key, ...current])
      setRevealedApiKey(created.apiKey)
      setNewKeyName('My agent')
      setNewCanRead(true)
      setNewCanWrite(true)
      setNewAgentResourcesOnly(false)
      toast.success('API key created')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create API key'
      toast.error(message)
    } finally {
      setIsCreating(false)
    }
  }

  async function handleCopyKey() {
    if (!revealedApiKey) {
      return
    }

    try {
      await navigator.clipboard.writeText(revealedApiKey)
      toast.success('API key copied')
    } catch {
      toast.error('Failed to copy API key')
    }
  }

  async function handleUpdateKey(
    key: AgentApiKeyListItem,
    patch: Partial<Pick<AgentApiKeyListItem, 'name' | 'canRead' | 'canWrite' | 'agentResourcesOnly'>>,
  ) {
    setSavingKeyId(key.id)
    try {
      const updated = await api.patch<AgentApiKeyListItem>(`/agent-api-keys/${key.id}`, patch)
      setKeys((current) => current.map((item) => (item.id === key.id ? updated : item)))
      toast.success('API key updated')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update API key'
      toast.error(message)
    } finally {
      setSavingKeyId(null)
    }
  }

  async function handleRevokeKey(keyId: string) {
    setRevokingId(keyId)

    try {
      const revoked = await api.delete<{ id: string; revokedAt: string }>(`/agent-api-keys/${keyId}`)
      setKeys((current) =>
        current.map((key) =>
          key.id === revoked.id
            ? {
                ...key,
                revokedAt: revoked.revokedAt,
              }
            : key,
        ),
      )
      toast.success('API key revoked')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke API key'
      toast.error(message)
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <GlassCard className="p-5 space-y-5" hover={false}>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-white">Agent API keys</h2>
            <p className="text-poof-mist text-sm mt-1">
              Create long-lived account keys for first-party agents and automation.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-poof-mist">Active keys</p>
            <p className="text-2xl font-heading font-bold text-white">{activeKeyCount}</p>
          </div>
        </div>
        <p className="text-xs text-poof-mist/80">
          Keys have full access to your Poof account until revoked. The raw secret is shown only once.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center">
        <div className="flex-1 space-y-3">
          <Input
            value={newKeyName}
            onChange={(event) => setNewKeyName(event.target.value)}
            maxLength={80}
            placeholder="My local agent"
            className="border-white/10 bg-black/20 text-white placeholder:text-poof-mist"
          />
          <div className="grid gap-2 sm:grid-cols-3">
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-poof-mist">
              Read
              <Switch checked={newCanRead} onCheckedChange={setNewCanRead} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-poof-mist">
              Write
              <Switch checked={newCanWrite} onCheckedChange={setNewCanWrite} />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-poof-mist">
              Agent-owned only
              <Switch
                checked={newAgentResourcesOnly}
                onCheckedChange={setNewAgentResourcesOnly}
              />
            </label>
          </div>
        </div>
        <Button onClick={() => void handleCreateKey()} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create key'}
        </Button>
      </div>

      {revealedApiKey ? (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 space-y-3">
          <div>
            <p className="text-sm font-medium text-white">New API key</p>
            <p className="text-xs text-poof-mist">Store it now. Poof will not show this exact value again.</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-3 font-mono text-xs text-emerald-200 break-all">
            {revealedApiKey}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => void handleCopyKey()}>
              Copy key
            </Button>
            <Button variant="ghost" className="text-poof-mist hover:text-white" onClick={() => setRevealedApiKey(null)}>
              Hide
            </Button>
          </div>
        </div>
      ) : null}

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-sm text-poof-mist">Loading API keys...</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-poof-mist">No API keys yet. Create one to connect an agent.</p>
        ) : (
          keys.map((key) => {
            const isRevoked = Boolean(key.revokedAt)

            return (
              <div
                key={key.id}
                className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{key.name}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.14em] ${
                        isRevoked
                          ? 'bg-red-400/15 text-red-200'
                          : 'bg-emerald-400/15 text-emerald-200'
                      }`}
                    >
                      {isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-poof-mist">{key.prefix}...</p>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.12em]">
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        key.canRead ? 'bg-cyan-400/15 text-cyan-200' : 'bg-white/10 text-poof-mist'
                      }`}
                    >
                      Read
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        key.canWrite ? 'bg-amber-400/15 text-amber-200' : 'bg-white/10 text-poof-mist'
                      }`}
                    >
                      Write
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 ${
                        key.agentResourcesOnly
                          ? 'bg-violet-400/15 text-violet-200'
                          : 'bg-white/10 text-poof-mist'
                      }`}
                    >
                      Agent-owned only
                    </span>
                  </div>
                  <p className="text-xs text-poof-mist">Created: {formatTimestamp(key.createdAt)}</p>
                  <p className="text-xs text-poof-mist">Last used: {formatTimestamp(key.lastUsedAt)}</p>
                </div>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <label className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-poof-mist">
                      R
                      <Switch
                        checked={key.canRead}
                        disabled={isRevoked || savingKeyId === key.id}
                        onCheckedChange={(checked) => {
                          if (!checked && !key.canWrite) {
                            toast.error('Enable at least read or write access')
                            return
                          }
                          void handleUpdateKey(key, { canRead: checked })
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-poof-mist">
                      W
                      <Switch
                        checked={key.canWrite}
                        disabled={isRevoked || savingKeyId === key.id}
                        onCheckedChange={(checked) => {
                          if (!checked && !key.canRead) {
                            toast.error('Enable at least read or write access')
                            return
                          }
                          void handleUpdateKey(key, { canWrite: checked })
                        }}
                      />
                    </label>
                    <label className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-[11px] text-poof-mist">
                      AO
                      <Switch
                        checked={key.agentResourcesOnly}
                        disabled={isRevoked || savingKeyId === key.id}
                        onCheckedChange={(checked) =>
                          void handleUpdateKey(key, { agentResourcesOnly: checked })
                        }
                      />
                    </label>
                  </div>
                  <Button
                    variant="outline"
                    className="border-white/10 text-white hover:bg-white/5"
                    disabled={isRevoked || revokingId === key.id || savingKeyId === key.id}
                    onClick={() => void handleRevokeKey(key.id)}
                  >
                    {revokingId === key.id ? 'Revoking...' : isRevoked ? 'Revoked' : 'Revoke'}
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </GlassCard>
  )
}
