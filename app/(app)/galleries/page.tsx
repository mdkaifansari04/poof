"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  FolderOpen,
  Share2,
  MoreHorizontal,
  X,
  Trash2,
  ImageIcon,
  Link2,
  Clock,
} from "lucide-react";
import { useDeleteGallery } from "@/hooks/mutations";
import { useGalleries, useSharedResources } from "@/hooks/queries";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type SortOption = "newest" | "oldest" | "az";
type FilterOption = "all" | "active" | "expiring" | "expired" | "no-expiry";

type GalleryView = {
  id: string;
  name: string;
  description: string | null;
  coverPhoto: string | null;
  photoCount: number;
  createdAt: Date;
};

/* Deterministic accent color per gallery */
const accents = [
  "from-violet-500 to-indigo-600",
  "from-cyan-400 to-blue-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-rose-400 to-pink-500",
  "from-fuchsia-400 to-purple-500",
  "from-sky-400 to-blue-500",
  "from-lime-400 to-emerald-500",
];
function pickAccent(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return accents[Math.abs(h) % accents.length];
}

function relativeDate(date: Date) {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function GalleriesPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGalleries, setSelectedGalleries] = useState<Set<string>>(
    new Set(),
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    ids: string[];
  }>({
    open: false,
    ids: [],
  });

  const galleriesQuery = useGalleries();
  const sharedResourcesQuery = useSharedResources();
  const deleteGallery = useDeleteGallery();

  const galleries = useMemo<GalleryView[]>(() => {
    const rows = galleriesQuery.data ?? [];
    return rows.map((gallery) => ({
      id: gallery.id,
      name: gallery.name,
      description: gallery.description,
      coverPhoto: gallery.bannerImageUrl,
      photoCount: gallery.imageCount,
      createdAt: new Date(gallery.createdAt),
    }));
  }, [galleriesQuery.data]);

  const filteredGalleries = useMemo(() => {
    const shareLinks = (sharedResourcesQuery.data ?? []).map((resource) => {
      const status: "active" | "expired" | "revoked" =
        resource.status === "ACTIVE"
          ? "active"
          : resource.status === "REVOKED"
            ? "revoked"
            : "expired";
      return {
        galleryId: resource.galleryId,
        status,
        expiresAt:
          resource.status === "ACTIVE" ? new Date(resource.expiresAt) : null,
      };
    });

    let next = [...galleries];
    if (searchQuery) {
      const needle = searchQuery.toLowerCase();
      next = next.filter(
        (g) =>
          g.name.toLowerCase().includes(needle) ||
          g.description?.toLowerCase().includes(needle),
      );
    }
    if (filterBy !== "all") {
      next = next.filter((gallery) => {
        const gLinks = shareLinks.filter((l) => l.galleryId === gallery.id);
        switch (filterBy) {
          case "active":
            return gLinks.some((l) => l.status === "active");
          case "expiring":
            return gLinks.some((l) => {
              if (!l.expiresAt || l.status !== "active") return false;
              const diff = l.expiresAt.getTime() - Date.now();
              return diff > 0 && diff < 24 * 60 * 60 * 1000;
            });
          case "expired":
            return (
              gLinks.length > 0 && gLinks.every((l) => l.status === "expired")
            );
          case "no-expiry":
            return gLinks.some((l) => !l.expiresAt && l.status === "active");
          default:
            return true;
        }
      });
    }
    switch (sortBy) {
      case "oldest":
        next.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case "az":
        next.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        next.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    return next;
  }, [filterBy, galleries, searchQuery, sharedResourcesQuery.data, sortBy]);

  const shareLinksByGalleryId = useMemo(() => {
    const shareLinks = (sharedResourcesQuery.data ?? []).map((resource) => {
      const status: "active" | "expired" | "revoked" =
        resource.status === "ACTIVE"
          ? "active"
          : resource.status === "REVOKED"
            ? "revoked"
            : "expired";
      return {
        galleryId: resource.galleryId,
        status,
        expiresAt:
          resource.status === "ACTIVE" ? new Date(resource.expiresAt) : null,
      };
    });
    const grouped = new Map<string, typeof shareLinks>();
    for (const link of shareLinks) {
      if (!link.galleryId) continue;
      const existing = grouped.get(link.galleryId) ?? [];
      grouped.set(link.galleryId, [...existing, link]);
    }
    return grouped;
  }, [sharedResourcesQuery.data]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedGalleries);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedGalleries(next);
  };
  const clearSelection = () => setSelectedGalleries(new Set());

  const deleteOneGallery = async (id: string) => {
    try {
      await deleteGallery.mutateAsync(id);
      setSelectedGalleries((prev) => {
        const n = new Set(prev);
        n.delete(id);
        return n;
      });
      toast.success("Gallery deleted");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete gallery",
      );
    }
  };
  const openDeleteDialog = (ids: string[]) => {
    if (ids.length) setDeleteDialog({ open: true, ids });
  };
  const confirmDeleteDialog = async () => {
    const ids = [...deleteDialog.ids];
    setDeleteDialog({ open: false, ids: [] });
    for (const id of ids) await deleteOneGallery(id);
    if (ids.length > 1) clearSelection();
  };

  const isSelecting = selectedGalleries.size > 0;

  /* ── Loading ── */
  if (galleriesQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl py-2 font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-52 animate-pulse rounded-xl bg-muted border border-border"
            />
          ))}
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (galleriesQuery.isError) {
    return (
      <div className="mx-auto max-w-6xl py-2 font-sans">
        <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">
            Could not load galleries
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            {galleriesQuery.error.message}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-4 text-poof-violet"
            onClick={() => galleriesQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-2 font-sans animate-fade-up">
      {/* ── Toolbar ── */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2  text-muted-foreground /40" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search galleries..."
            className="h-8 rounded-md border-border bg-muted pl-8 text-xs text-foreground placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5">
          {(
            [
              ["newest", "Recent"],
              ["oldest", "Oldest"],
              ["az", "A-Z"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              className={cn(
                "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                sortBy === val
                  ? "bg-card shadow-sm text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-0.5 rounded-md border border-border bg-muted p-0.5">
          {(
            [
              ["all", "All"],
              ["active", "Active"],
              ["expiring", "Expiring"],
              ["expired", "Expired"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilterBy(val as FilterOption)}
              className={cn(
                "rounded-[5px] px-2.5 py-1 text-[11px] font-medium transition-colors",
                filterBy === val
                  ? "bg-card shadow-sm text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Selection bar ── */}
      {isSelecting && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-poof-violet/20 bg-poof-violet/5 px-4 py-2.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-medium text-foreground">
              {selectedGalleries.size} selected
            </span>
            <button
              onClick={clearSelection}
              className="text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 text-xs text-red-400 hover:text-red-300"
            disabled={deleteGallery.isPending}
            onClick={() => openDeleteDialog([...selectedGalleries])}
          >
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        </div>
      )}

      {/* ── Cards grid ── */}
      {filteredGalleries.length > 0 || !searchQuery ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Add gallery card */}
          <Link href="/galleries/new" className="block">
            <div className="group relative flex h-full min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted transition-all duration-200 hover:border-poof-violet/40 hover:bg-muted">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-muted  text-muted-foreground /50 transition-colors group-hover:border-poof-violet/30 group-hover:bg-poof-violet/10 group-hover:text-poof-violet">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                New gallery
              </p>
            </div>
          </Link>

          {filteredGalleries.map((gallery, index) => (
            <GalleryCard
              key={gallery.id}
              gallery={gallery}
              index={index}
              isSelected={selectedGalleries.has(gallery.id)}
              onToggleSelect={() => toggleSelection(gallery.id)}
              isSelecting={isSelecting}
              onOpen={() => router.push(`/galleries/${gallery.id}`)}
              onDelete={() => openDeleteDialog([gallery.id])}
              links={shareLinksByGalleryId.get(gallery.id) ?? []}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card px-6 py-16 text-center">
          <p className="text-sm  text-muted-foreground ">
            No galleries match your search.
          </p>
        </div>
      )}

      {/* ── Delete dialog ── */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent className="border-border bg-card text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-medium">
              Delete{" "}
              {deleteDialog.ids.length > 1
                ? `${deleteDialog.ids.length} galleries`
                : "gallery"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm  text-muted-foreground ">
              This action removes{" "}
              {deleteDialog.ids.length > 1 ? "these galleries" : "this gallery"}{" "}
              permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground hover:bg-muted hover:text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-foreground hover:bg-red-500/90"
              onClick={() => void confirmDeleteDialog()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Gallery Card — inspired by the reference card design
   ─────────────────────────────────────────────────────── */
interface GalleryCardProps {
  gallery: GalleryView;
  index: number;
  isSelected: boolean;
  onToggleSelect: () => void;
  isSelecting: boolean;
  onOpen: () => void;
  onDelete: () => void;
  links: {
    galleryId: string | null;
    status: "active" | "expired" | "revoked";
    expiresAt: Date | null;
  }[];
}

function GalleryCard({
  gallery,
  index,
  isSelected,
  onToggleSelect,
  isSelecting,
  onOpen,
  onDelete,
  links,
}: GalleryCardProps) {
  const activeLinks = links.filter((l) => l.status === "active");
  const hasExpiring = activeLinks.some((l) => {
    if (!l.expiresAt) return false;
    const diff = l.expiresAt.getTime() - Date.now();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  });
  const accent = pickAccent(gallery.name);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-poof-border-hover hover:bg-muted",
        isSelected && "ring-1 ring-poof-violet border-poof-violet/30",
      )}
      style={{ animationDelay: `${index * 0.04}s` }}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {/* Accent bar — thin gradient stripe at top */}
      <div className={cn("h-0.75 w-full bg-linear-to-r", accent)} />

      {/* Cover / avatar area */}
      <div className="relative mx-4 mt-4 mb-3 aspect-video overflow-hidden rounded-lg bg-muted">
        {gallery.coverPhoto ? (
          <img
            src={gallery.coverPhoto}
            alt={`${gallery.name}`}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-white/4 to-white/2">
            <span className="select-none text-2xl font-semibold tracking-tight text-foreground/15">
              {gallery.name.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Selection checkbox overlay */}
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity",
            isSelecting || isSelected
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100",
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggleSelect}
            className="h-4 w-4 border-border bg-foreground/50 data-[state=checked]:border-poof-violet data-[state=checked]:bg-poof-violet"
          />
        </div>

        {/* Hover overlay actions */}
        <div
          className="absolute inset-0 flex items-center justify-center gap-2 bg-foreground/60 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            size="sm"
            variant="secondary"
            asChild
            className="h-7 gap-1 rounded-md text-xs"
          >
            <Link href={`/galleries/${gallery.id}`}>
              <FolderOpen className="h-3 w-3" />
              Open
            </Link>
          </Button>
          <Button
            size="sm"
            variant="secondary"
            asChild
            className="h-7 gap-1 rounded-md text-xs"
          >
            <Link href={`/galleries/${gallery.id}?openShare=1`}>
              <Share2 className="h-3 w-3" />
              Share
            </Link>
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-4 pb-4">
        {/* Name + menu */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-sm font-semibold text-white">
            {gallery.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md  text-muted-foreground /30 opacity-0 transition-all hover:bg-foreground/5 hover: text-muted-foreground  group-hover:opacity-100 focus-visible:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-lg border-border bg-popover p-1"
            >
              <DropdownMenuItem
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                asChild
              >
                <Link href={`/galleries/${gallery.id}`}>
                  <FolderOpen
                    className="h-3 w-3  text-muted-foreground /50"
                    strokeWidth={1.5}
                  />
                  Open
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                asChild
              >
                <Link href={`/galleries/${gallery.id}?openShare=1`}>
                  <Share2
                    className="h-3 w-3  text-muted-foreground /50"
                    strokeWidth={1.5}
                  />
                  Share
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-muted" />
              <DropdownMenuItem
                variant="destructive"
                className="gap-2 rounded-md px-2.5 py-1.5 text-xs"
                onClick={onDelete}
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.5} />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Status badge area — dashed border like inspiration */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Photo count */}
          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-0.5 text-[10px]  text-muted-foreground /60">
            <ImageIcon className="h-2.5 w-2.5" strokeWidth={1.5} />
            {gallery.photoCount} photos
          </span>

          {/* Link status */}
          {hasExpiring ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-poof-peach/30 px-2 py-0.5 text-[10px] text-poof-peach">
              <Clock className="h-2.5 w-2.5" strokeWidth={1.5} />
              Expiring soon
            </span>
          ) : activeLinks.length > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-emerald-400/20 px-2 py-0.5 text-[10px] text-emerald-400/70">
              <Link2 className="h-2.5 w-2.5" strokeWidth={1.5} />
              {activeLinks.length} active
            </span>
          ) : null}
        </div>

        {/* Footer — relative date */}
        <p className="mt-auto pt-3 text-[11px]  text-muted-foreground /35">
          Updated {relativeDate(gallery.createdAt)}
        </p>
      </div>
    </div>
  );
}
