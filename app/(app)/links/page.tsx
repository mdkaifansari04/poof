"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Countdown } from "@/components/poof/countdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useDeleteSharedResource,
  useRevokeSharedResource,
  useUpdateSharedResource,
} from "@/hooks/mutations";
import { useSharedResources } from "@/hooks/queries";
import { MIN_SHARE_EXPIRY_MS } from "@/lib/limits";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  Eye,
  ExternalLink,
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const COPY_ICON_SUCCESS_MS = 2000;
type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED" | "REVOKED";

function toLocalDateTimeInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function relativeDate(value: string) {
  const now = Date.now();
  const date = new Date(value).getTime();
  const diff = now - date;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const typeColors: Record<string, string> = {
  GALLERY: "bg-poof-violet/12 text-poof-violet",
  IMAGE: "bg-poof-peach/12 text-poof-peach",
  MULTI_IMAGE: "bg-poof-mint/12 text-poof-mint",
};

export default function ShareLinksPage() {
  const sharedResourcesQuery = useSharedResources();
  const revokeSharedResource = useRevokeSharedResource();
  const deleteSharedResource = useDeleteSharedResource();
  const updateSharedResource = useUpdateSharedResource();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [revokingLinkId, setRevokingLinkId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [editExpiryDateTime, setEditExpiryDateTime] = useState("");
  const [editReactivate, setEditReactivate] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const links = sharedResourcesQuery.data ?? [];

  const stats = useMemo(() => {
    const active = links.filter((l) => l.status === "ACTIVE");
    return {
      total: links.length,
      active: active.length,
      expired: links.filter((l) => l.status === "EXPIRED").length,
      revoked: links.filter((l) => l.status === "REVOKED").length,
      views: links.reduce((s, l) => s + l.viewCount, 0),
    };
  }, [links]);

  const filteredLinks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return links.filter((link) => {
      if (statusFilter !== "ALL" && link.status !== statusFilter) return false;
      if (!q) return true;
      return (
        link.shareUrl.toLowerCase().includes(q) ||
        (link.gallery?.name ?? "").toLowerCase().includes(q) ||
        link.type.toLowerCase().includes(q)
      );
    });
  }, [links, search, statusFilter]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredLinks.length / perPage));
  const paginatedLinks = filteredLinks.slice(
    (page - 1) * perPage,
    page * perPage,
  );
  const rangeStart = filteredLinks.length === 0 ? 0 : (page - 1) * perPage + 1;
  const rangeEnd = Math.min(page * perPage, filteredLinks.length);

  const deleteTarget = deleteTargetId
    ? (links.find((l) => l.id === deleteTargetId) ?? null)
    : null;
  const editTarget = editTargetId
    ? (links.find((l) => l.id === editTargetId) ?? null)
    : null;
  const minDateTimeValue = toLocalDateTimeInputValue(
    new Date(Date.now() + MIN_SHARE_EXPIRY_MS),
  );

  const handleCopy = async (shareUrl: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLinkId(linkId);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopiedLinkId((c) => (c === linkId ? null : c));
      }, COPY_ICON_SUCCESS_MS);
      toast.success("Share link copied");
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  const handleRevoke = async (resourceId: string) => {
    setRevokingLinkId(resourceId);
    try {
      await revokeSharedResource.mutateAsync(resourceId);
      toast.success("Share link revoked");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to revoke share link",
      );
    } finally {
      setRevokingLinkId((c) => (c === resourceId ? null : c));
    }
  };

  const handleDelete = async (resourceId: string) => {
    setIsDeleting(true);
    try {
      await deleteSharedResource.mutateAsync(resourceId);
      setDeleteTargetId(null);
      toast.success("Share link deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete share link",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (resourceId: string) => {
    const target = links.find((l) => l.id === resourceId);
    if (!target) return;
    const expiresAtDate = new Date(target.expiresAt);
    const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const initialDate =
      expiresAtDate.getTime() > Date.now() ? expiresAtDate : fallback;
    setEditTargetId(resourceId);
    setEditExpiryDateTime(toLocalDateTimeInputValue(initialDate));
    setEditReactivate(target.status !== "ACTIVE");
  };

  const handleUpdateLink = async () => {
    if (!editTargetId) return;
    if (!editExpiryDateTime) {
      toast.error("Please choose an expiry date and time");
      return;
    }
    const expiresAt = new Date(editExpiryDateTime);
    if (Number.isNaN(expiresAt.getTime())) {
      toast.error("Please choose a valid date and time");
      return;
    }
    if (expiresAt.getTime() <= Date.now()) {
      toast.error("Expiry must be in the future");
      return;
    }
    try {
      await updateSharedResource.mutateAsync({
        resourceId: editTargetId,
        body: {
          expiresAt: expiresAt.toISOString(),
          reactivate: editReactivate || undefined,
        },
      });
      toast.success(
        editReactivate ? "Link updated and reactivated" : "Link updated",
      );
      setEditTargetId(null);
      setEditReactivate(false);
      setEditExpiryDateTime("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update link",
      );
    }
  };

  /* ── Loading ── */
  if (sharedResourcesQuery.isPending) {
    return (
      <div className="mx-auto max-w-5xl py-2 font-sans">
        <div className="flex flex-col gap-1 rounded-lg border border-white/6 bg-black p-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-white/3" />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (sharedResourcesQuery.isError) {
    return (
      <div className="mx-auto max-w-5xl py-2 font-sans">
        <div className="rounded-lg border border-white/6 bg-black px-6 py-12 text-center">
          <p className="text-sm font-medium text-white">
            Could not load share links
          </p>
          <p className="mt-1 text-xs text-poof-mist/60">
            {sharedResourcesQuery.error.message}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-4 text-poof-violet"
            onClick={() => void sharedResourcesQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-2 font-sans animate-fade-up">
      {/* ── Search + filters ── */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-poof-mist/40" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search links..."
            className="h-8 rounded-md border-white/6 bg-white/3 pl-8 text-xs text-white placeholder:text-poof-mist/30"
          />
        </div>
        <div className="flex items-center gap-0.5 rounded-md border border-white/6 bg-white/2 p-0.5">
          {(["ALL", "ACTIVE", "EXPIRED", "REVOKED"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                statusFilter === s
                  ? "bg-white/8 text-white"
                  : "text-poof-mist/50 hover:text-poof-mist",
              )}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-lg border border-white/6 bg-black">
        {filteredLinks.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/4">
              <Link2 className="h-4 w-4 text-poof-mist/40" strokeWidth={1.5} />
            </div>
            <p className="text-sm text-poof-mist">No share links found</p>
            <p className="mt-0.5 text-xs text-poof-mist/40">
              {search || statusFilter !== "ALL"
                ? "Try adjusting your filters."
                : "Create one from a gallery."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_100px_80px_100px_80px_36px] items-center gap-2 px-5 py-2.5 text-[11px] font-medium tracking-wide text-poof-mist/50 uppercase">
              <span>Link</span>
              <span>Type</span>
              <span>Views</span>
              <span>Expires</span>
              <span>Status</span>
              <span />
            </div>

            {/* Rows */}
            <div className="flex flex-col px-1 pb-1.5">
              {paginatedLinks.map((link, index) => {
                const isActive = link.status === "ACTIVE";
                const isRevoked = link.status === "REVOKED";

                return (
                  <div
                    key={link.id}
                    className={cn(
                      "group grid grid-cols-[1fr_100px_80px_100px_80px_36px] items-center gap-2 bg-[#141414] px-4 py-3 transition-colors duration-150 hover:bg-white/4",
                      {
                        "rounded-t-lg": index === 0,
                        "rounded-b-lg": index === paginatedLinks.length - 1,
                      },
                    )}
                  >
                    {/* Link info */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-white/90">
                          {link.gallery?.name ?? "Untitled"}
                        </p>
                        <span className="text-[10px] text-poof-mist/30">
                          {relativeDate(link.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <p className="truncate font-mono text-[11px] text-poof-mist/40">
                          {link.shareUrl.replace(/^https?:\/\//, "")}
                        </p>
                        <button
                          onClick={() =>
                            void handleCopy(link.shareUrl, link.id)
                          }
                          className="shrink-0 text-poof-mist/30 transition-colors hover:text-white"
                        >
                          {copiedLinkId === link.id ? (
                            <Check className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Type chip */}
                    <div>
                      <span
                        className={cn(
                          "inline-block rounded-md px-2 py-0.5 text-[10px] font-medium",
                          typeColors[link.type] ?? "bg-white/5 text-poof-mist",
                        )}
                      >
                        {link.type === "MULTI_IMAGE"
                          ? "Multi"
                          : link.type.charAt(0) +
                            link.type.slice(1).toLowerCase()}
                      </span>
                    </div>

                    {/* Views */}
                    <div className="flex items-center gap-1.5">
                      <Eye
                        className="h-3 w-3 text-poof-mist/30"
                        strokeWidth={1.5}
                      />
                      <span className="text-xs tabular-nums text-poof-mist/60">
                        {link.viewCount}
                      </span>
                    </div>

                    {/* Expires */}
                    <div className="text-xs">
                      <Countdown
                        expiresAt={new Date(link.expiresAt)}
                        className="text-[11px]"
                      />
                    </div>

                    {/* Status dot */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("inline-block h-1.5 w-1.5 rounded-full", {
                          "bg-emerald-400/70": isActive,
                          "bg-red-400/70": isRevoked,
                          "bg-poof-mist/30": !isActive && !isRevoked,
                        })}
                      />
                      <span
                        className={cn("text-[11px]", {
                          "text-emerald-300/60": isActive,
                          "text-red-300/60": isRevoked,
                          "text-poof-mist/40": !isActive && !isRevoked,
                        })}
                      >
                        {link.status.charAt(0) +
                          link.status.slice(1).toLowerCase()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-poof-mist/30 opacity-0 transition-all duration-150 hover:bg-white/6 hover:text-poof-mist group-hover:opacity-100 focus-visible:opacity-100"
                            disabled={
                              (isDeleting && deleteTargetId === link.id) ||
                              revokingLinkId === link.id
                            }
                          >
                            {(isDeleting && deleteTargetId === link.id) ||
                            revokingLinkId === link.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <MoreHorizontal
                                className="h-4 w-4"
                                strokeWidth={1.5}
                              />
                            )}
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 rounded-lg border-white/8 bg-[#1a1a1a] p-1"
                        >
                          <DropdownMenuItem
                            className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                            onClick={() => openEditDialog(link.id)}
                          >
                            <Pencil
                              className="h-3 w-3 text-poof-mist/50"
                              strokeWidth={1.5}
                            />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                            onClick={() =>
                              void handleCopy(link.shareUrl, link.id)
                            }
                          >
                            <Copy
                              className="h-3 w-3 text-poof-mist/50"
                              strokeWidth={1.5}
                            />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                            onClick={() => window.open(link.shareUrl, "_blank")}
                          >
                            <ExternalLink
                              className="h-3 w-3 text-poof-mist/50"
                              strokeWidth={1.5}
                            />
                            Open link
                          </DropdownMenuItem>
                          {isActive && (
                            <>
                              <DropdownMenuSeparator className="my-1 bg-white/6" />
                              <DropdownMenuItem
                                className="gap-2 rounded-md px-2.5 py-1.5 text-xs text-amber-300"
                                onClick={() => void handleRevoke(link.id)}
                                disabled={revokingLinkId === link.id}
                              >
                                <Link2 className="h-3 w-3" strokeWidth={1.5} />
                                {revokingLinkId === link.id
                                  ? "Revoking..."
                                  : "Revoke"}
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator className="my-1 bg-white/6" />
                          <DropdownMenuItem
                            variant="destructive"
                            className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                            onClick={() => setDeleteTargetId(link.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pagination */}
        {filteredLinks.length > 0 && (
          <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[11px] tabular-nums text-poof-mist/50">
                {rangeStart}–{rangeEnd} of {filteredLinks.length}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-poof-mist/40">per page</span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-6 rounded-md border border-white/8 bg-white/5 px-1.5 text-[11px] text-poof-mist outline-none transition-colors hover:border-white/12"
                >
                  {[10, 20, 50].map((n) => (
                    <option key={n} value={n} className="bg-[#1a1a1a]">
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-md text-poof-mist/40 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              >
                <ChevronsLeft className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex h-6 w-6 items-center justify-center rounded-md text-poof-mist/40 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <span className="min-w-12 text-center text-[11px] tabular-nums text-poof-mist/60">
                {page}/{totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded-md text-poof-mist/40 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              >
                <ChevronRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page >= totalPages}
                className="flex h-6 w-6 items-center justify-center rounded-md text-poof-mist/40 transition-colors hover:bg-white/6 hover:text-white disabled:opacity-25 disabled:pointer-events-none"
              >
                <ChevronsRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete dialog ── */}
      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setDeleteTargetId(null);
        }}
      >
        <AlertDialogContent className="border-white/10 bg-poof-base text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">
              Delete share link?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-poof-mist">
              {deleteTarget
                ? `This removes this ${deleteTarget.type.toLowerCase()} link permanently.`
                : "This removes this link permanently."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 text-poof-mist hover:bg-white/5 hover:text-white"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white hover:bg-red-500/90"
              onClick={() => {
                if (deleteTargetId) void handleDelete(deleteTargetId);
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Edit dialog ── */}
      <Dialog
        open={Boolean(editTargetId)}
        onOpenChange={(open) => {
          if (!open && !updateSharedResource.isPending) setEditTargetId(null);
        }}
      >
        <DialogContent className="border-white/10 bg-poof-base text-white sm:max-w-md">
          <div className="space-y-5">
            <div>
              <h2 className="text-base font-medium text-white">Edit link</h2>
              <p className="mt-1 text-xs text-poof-mist/60">
                Update expiry or reactivate this link.
              </p>
            </div>

            {editTarget ? (
              <div className="rounded-lg border border-white/6 bg-white/3 px-3 py-2.5">
                <p className="break-all font-mono text-[11px] text-poof-violet/80">
                  {editTarget.shareUrl}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={cn("inline-block h-1.5 w-1.5 rounded-full", {
                      "bg-emerald-400/70": editTarget.status === "ACTIVE",
                      "bg-red-400/70": editTarget.status === "REVOKED",
                      "bg-poof-mist/30": editTarget.status === "EXPIRED",
                    })}
                  />
                  <span className="text-[11px] text-poof-mist/50">
                    {editTarget.status}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <label className="text-xs text-poof-mist/60">
                Expiry date &amp; time
              </label>
              <Input
                type="datetime-local"
                value={editExpiryDateTime}
                min={minDateTimeValue}
                onChange={(e) => setEditExpiryDateTime(e.target.value)}
                className="h-9 border-white/6 bg-white/3 text-xs text-white"
              />
            </div>

            {editTarget && editTarget.status !== "ACTIVE" && (
              <label className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-white/3 px-3 py-2.5">
                <Checkbox
                  checked={editReactivate}
                  onCheckedChange={(c) => setEditReactivate(Boolean(c))}
                  className="border-white/20 data-[state=checked]:border-poof-accent data-[state=checked]:bg-poof-accent"
                />
                <span className="text-xs text-poof-mist">
                  Reactivate this link
                </span>
              </label>
            )}

            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-poof-mist hover:text-white"
                onClick={() => setEditTargetId(null)}
                disabled={updateSharedResource.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-poof-accent text-white hover:bg-poof-accent/90"
                onClick={() => void handleUpdateLink()}
                disabled={updateSharedResource.isPending}
              >
                {updateSharedResource.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
