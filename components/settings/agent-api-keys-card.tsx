"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { api } from "@/lib/api-client";
import type {
  CreateAgentApiKeyResponse,
  AgentApiKeyListItem,
} from "@/lib/types/agent-api-key";
import { Copy, Plus, Trash2 } from "lucide-react";

export function AgentApiKeysCard() {
  const [keys, setKeys] = useState<AgentApiKeyListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Create form state
  const [newKeyName, setNewKeyName] = useState("My agent");
  const [newCanRead, setNewCanRead] = useState(true);
  const [newCanWrite, setNewCanWrite] = useState(true);
  const [newAgentResourcesOnly, setNewAgentResourcesOnly] = useState(false);
  const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

  async function loadKeys() {
    setIsLoading(true);
    try {
      const nextKeys = await api.get<AgentApiKeyListItem[]>("/agent-api-keys");
      setKeys(nextKeys);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load API keys";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  const activeKeyCount = useMemo(
    () => keys.filter((key) => key.revokedAt === null).length,
    [keys],
  );

  async function handleCreateKey() {
    const trimmedName = newKeyName.trim();
    if (!trimmedName) {
      toast.error("Name is required");
      return;
    }
    if (!newCanRead && !newCanWrite) {
      toast.error("Enable at least read or write access");
      return;
    }

    setIsCreating(true);
    try {
      const created = await api.post<CreateAgentApiKeyResponse>(
        "/agent-api-keys",
        {
          name: trimmedName,
          canRead: newCanRead,
          canWrite: newCanWrite,
          agentResourcesOnly: newAgentResourcesOnly,
        },
      );

      setKeys((current) => [created.key, ...current]);
      setRevealedApiKey(created.apiKey);
      setNewKeyName("My agent");
      setNewCanRead(true);
      setNewCanWrite(true);
      setNewAgentResourcesOnly(false);
      setSheetOpen(false);
      toast.success("API key created");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create API key";
      toast.error(message);
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopyKey() {
    if (!revealedApiKey) return;
    try {
      await navigator.clipboard.writeText(revealedApiKey);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Failed to copy");
    }
  }

  async function handleRevokeKey(keyId: string) {
    setRevokingId(keyId);
    try {
      const revoked = await api.delete<{ id: string; revokedAt: string }>(
        `/agent-api-keys/${keyId}`,
      );
      setKeys((current) =>
        current.map((key) =>
          key.id === revoked.id
            ? { ...key, revokedAt: revoked.revokedAt }
            : key,
        ),
      );
      toast.success("API key revoked");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to revoke API key";
      toast.error(message);
    } finally {
      setRevokingId(null);
    }
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xs font-medium tracking-wide text-poof-mist/60 uppercase">
            API Keys
          </h2>
          <p className="mt-1 text-sm text-poof-mist">
            {activeKeyCount} active key{activeKeyCount !== 1 ? "s" : ""}
          </p>
        </div>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create key
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create API key</SheetTitle>
              <SheetDescription>
                Configure permissions for a new agent key. The raw secret is
                shown only once after creation.
              </SheetDescription>
            </SheetHeader>
            <div className="grid flex-1 auto-rows-min gap-5 px-4">
              <div className="grid gap-2">
                <Label htmlFor="key-name">Name</Label>
                <Input
                  id="key-name"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  maxLength={80}
                  placeholder="My local agent"
                />
              </div>
              <div className="grid gap-3">
                <Label>Permissions</Label>
                <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Read</p>
                    <p className="text-xs text-muted-foreground">
                      Access galleries, images, and links
                    </p>
                  </div>
                  <Switch
                    checked={newCanRead}
                    onCheckedChange={setNewCanRead}
                  />
                </label>
                <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Write</p>
                    <p className="text-xs text-muted-foreground">
                      Create, update, and delete resources
                    </p>
                  </div>
                  <Switch
                    checked={newCanWrite}
                    onCheckedChange={setNewCanWrite}
                  />
                </label>
                <label className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Agent-owned only
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Restrict to resources created by this key
                    </p>
                  </div>
                  <Switch
                    checked={newAgentResourcesOnly}
                    onCheckedChange={setNewAgentResourcesOnly}
                  />
                </label>
              </div>
            </div>
            <SheetFooter>
              <Button
                onClick={() => void handleCreateKey()}
                disabled={isCreating}
              >
                {isCreating ? "Creating..." : "Create key"}
              </Button>
              <SheetClose asChild>
                <Button variant="outline">Cancel</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Revealed key banner */}
      {revealedApiKey && (
        <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-emerald-300">
                New API key created
              </p>
              <p className="mt-0.5 text-xs text-poof-mist">
                Copy it now — this is the only time it will be shown.
              </p>
              <code className="mt-2 block break-all rounded-md bg-black/30 px-3 py-2 font-mono text-xs text-emerald-200">
                {revealedApiKey}
              </code>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
              onClick={() => void handleCopyKey()}
            >
              <Copy className="h-3.5 w-3.5" />
              Copy
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-poof-mist hover:text-white"
              onClick={() => setRevealedApiKey(null)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Keys table */}
      <div className="rounded-lg border border-white/6 bg-white/2">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-poof-mist">
            Loading keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm text-poof-mist">No API keys yet.</p>
            <p className="mt-1 text-xs text-poof-mist/60">
              Create one to connect an agent.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/6 text-xs text-poof-mist/60">
                  <th className="px-4 py-2.5 font-medium">Name</th>
                  <th className="px-4 py-2.5 font-medium">Key</th>
                  <th className="px-4 py-2.5 font-medium">Permissions</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                  <th className="px-4 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4">
                {keys.map((key) => {
                  const isRevoked = Boolean(key.revokedAt);

                  return (
                    <tr key={key.id} className="group">
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-white">
                          {key.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <code className="font-mono text-xs text-poof-mist">
                          {key.prefix}...
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {key.canRead && (
                            <Badge
                              variant="secondary"
                              className="border-0 bg-cyan-400/10 text-cyan-300 text-[11px]"
                            >
                              Read
                            </Badge>
                          )}
                          {key.canWrite && (
                            <Badge
                              variant="secondary"
                              className="border-0 bg-amber-400/10 text-amber-300 text-[11px]"
                            >
                              Write
                            </Badge>
                          )}
                          {key.agentResourcesOnly && (
                            <Badge
                              variant="secondary"
                              className="border-0 bg-violet-400/10 text-violet-300 text-[11px]"
                            >
                              AO
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isRevoked ? (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-red-400/10 text-red-300 text-[11px]"
                          >
                            Revoked
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="border-0 bg-emerald-400/10 text-emerald-300 text-[11px]"
                          >
                            Active
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!isRevoked && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 gap-1.5 text-xs text-poof-mist opacity-60 transition hover:text-red-300 group-hover:opacity-100"
                            disabled={revokingId === key.id}
                            onClick={() => void handleRevokeKey(key.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                            {revokingId === key.id ? "Revoking..." : "Revoke"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
