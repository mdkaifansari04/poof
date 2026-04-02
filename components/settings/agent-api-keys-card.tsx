"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api-client";
import type {
  CreateAgentApiKeyResponse,
  AgentApiKeyListItem,
} from "@/lib/types/agent-api-key";
import {
  Copy,
  Key,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Deterministic color from key name for avatar circle
const avatarColors = [
  "bg-violet-500/20 text-violet-300",
  "bg-cyan-500/20 text-cyan-300",
  "bg-amber-500/20 text-amber-300",
  "bg-emerald-500/20 text-emerald-300",
  "bg-rose-500/20 text-rose-300",
  "bg-blue-500/20 text-blue-300",
  "bg-orange-500/20 text-orange-300",
  "bg-teal-500/20 text-teal-300",
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function formatPermissions(key: AgentApiKeyListItem) {
  const parts: string[] = [];
  if (key.canRead) parts.push("Read");
  if (key.canWrite) parts.push("Write");
  if (key.agentResourcesOnly) parts.push("AO");
  return parts.join(" · ") || "None";
}

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

  async function handleCopyPrefix(prefix: string) {
    try {
      await navigator.clipboard.writeText(prefix);
      toast.success("Key prefix copied");
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
            <Button variant={"ghost"} size="sm" className="gap-1.5 hover:!text-white">
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
        <div className="mb-4 rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-emerald-300">
                New API key created
              </p>
              <p className="mt-0.5 text-xs text-poof-mist">
                Copy it now — this is the only time it will be shown.
              </p>
              <code className="mt-2 block break-all rounded-lg bg-black/30 px-3 py-2 font-mono text-xs text-emerald-200">
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

      {/* Keys list — card-style rows */}
      <div className="overflow-hidden rounded-lg border border-white/6 bg-black">
        {isLoading ? (
          <div className="flex flex-col gap-1 p-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-white/3"
              />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/4">
              <Key className="h-4 w-4 text-poof-mist/40" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-poof-mist">No API keys yet</p>
            <p className="mt-0.5 text-xs text-poof-mist/50">
              Create one to connect an agent.
            </p>
          </div>
        ) : (
          <div className="flex flex-col p-0.5">
            {/* Header */}
            <div className="grid grid-cols-[1fr_120px_120px_36px] items-center gap-2 px-5 py-2.5 text-xs font-medium text-poof-mist/70 sm:grid-cols-[1fr_140px_140px_36px] bg-black">
              <span>Key</span>
              <span>Permissions</span>
              <span>Status</span>
              <span />
            </div>

            {/* Rows */}
            <div className="flex flex-col px-1 pb-2">
              {keys.map((key, index) => {
                const isRevoked = Boolean(key.revokedAt);

                return (
                  <div
                    key={key.id}
                    className={cn(
                      "group bg-[#141414] grid grid-cols-[1fr_120px_120px_36px] items-center gap-1 px-3 py-3 transition-colors duration-150 hover:bg-white/4 sm:grid-cols-[1fr_140px_140px_36px]",
                      {
                        "rounded-t-lg": index === 0,
                        "rounded-b-lg": index === keys.length - 1,
                      },
                    )}
                  >
                    {/* Key info with avatar */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${getAvatarColor(key.name)}`}
                      >
                        {key.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white/90">
                          {key.name}
                        </p>
                        <p className="truncate font-mono text-[11px] text-poof-mist/50">
                          {key.prefix}...
                        </p>
                      </div>
                    </div>

                    {/* Permissions */}
                    <span className="text-xs text-poof-mist/60">
                      {formatPermissions(key)}
                    </span>

                    {/* Status */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${isRevoked ? "bg-red-400/70" : "bg-emerald-400/70"}`}
                      />
                      <span
                        className={`text-xs ${isRevoked ? "text-red-300/60" : "text-emerald-300/60"}`}
                      >
                        {isRevoked ? "Revoked" : "Active"}
                      </span>
                    </div>

                    {/* Actions dropdown */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex h-7 w-7 items-center justify-center rounded-lg text-poof-mist/30 opacity-0 transition-all duration-150 hover:bg-white/6 hover:text-poof-mist group-hover:opacity-100 focus-visible:opacity-100">
                            <MoreHorizontal
                              className="h-4 w-4"
                              strokeWidth={1.5}
                            />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-44 rounded-sm border-white/8 bg-[#1a1a1a] p-1.5"
                        >
                          <DropdownMenuItem
                            className="gap-2 rounded-sm px-2 py-1 text-xs hover:!bg-gray-200/20 hover:!text-white"
                            onClick={() => void handleCopyPrefix(key.prefix)}
                          >
                            <Copy
                              className="h-3 w-3 text-poof-mist/50"
                              strokeWidth={1.5}
                            />
                            Copy prefix
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 rounded-sm px-2 py-1 text-xs hover:!bg-gray-200/20 hover:!text-white">
                            <ShieldCheck
                              className="h-3 w-3 text-poof-mist/50"
                              strokeWidth={1.5}
                            />
                            {formatPermissions(key)}
                          </DropdownMenuItem>

                          {!isRevoked && (
                            <>
                              <DropdownMenuSeparator className="my-1 bg-white/6" />
                              <DropdownMenuItem
                                variant="destructive"
                                className="gap-2 rounded-sm px-2 py-1 text-xs hover:bg-white/5"
                                disabled={revokingId === key.id}
                                onClick={() => void handleRevokeKey(key.id)}
                              >
                                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                                {revokingId === key.id
                                  ? "Revoking..."
                                  : "Revoke key"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
