"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useGalleries, useSharedResources } from "@/hooks/queries";
import {
  ImageIcon,
  Link2,
  Eye,
  ArrowRight,
  FolderOpen,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";

function relativeTime(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const galleryAccents = [
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
  return galleryAccents[Math.abs(h) % galleryAccents.length];
}

export default function DashboardPage() {
  const galleriesQuery = useGalleries();
  const sharedResourcesQuery = useSharedResources();

  const stats = useMemo(() => {
    const galleries = galleriesQuery.data ?? [];
    const links = sharedResourcesQuery.data ?? [];
    const activeLinks = links.filter((l) => l.status === "ACTIVE");
    const expiringToday = activeLinks.filter((l) => {
      const diff = new Date(l.expiresAt).getTime() - Date.now();
      return diff > 0 && diff < 24 * 60 * 60 * 1000;
    }).length;

    return {
      totalGalleries: galleries.length,
      totalPhotos: galleries.reduce((sum, g) => sum + g.imageCount, 0),
      activeLinks: activeLinks.length,
      expiringToday,
      totalViews: links.reduce((sum, l) => sum + l.viewCount, 0),
      totalLinks: links.length,
    };
  }, [galleriesQuery.data, sharedResourcesQuery.data]);

  /* ── Loading ── */
  if (galleriesQuery.isPending || sharedResourcesQuery.isPending) {
    return (
      <div className="mx-auto max-w-6xl py-2 font-sans">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl bg-white/3 border border-white/6"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3 h-72 animate-pulse rounded-xl bg-white/3 border border-white/6" />
          <div className="lg:col-span-2 h-72 animate-pulse rounded-xl bg-white/3 border border-white/6" />
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (galleriesQuery.isError || sharedResourcesQuery.isError) {
    return (
      <div className="mx-auto max-w-6xl py-2 font-sans">
        <div className="rounded-xl border border-white/6 bg-black px-6 py-12 text-center">
          <p className="text-sm font-medium text-white">
            Could not load dashboard
          </p>
          <p className="mt-1 text-xs text-poof-mist/60">
            {galleriesQuery.error?.message ||
              sharedResourcesQuery.error?.message}
          </p>
          <Button
            size="sm"
            variant="ghost"
            className="mt-4 text-poof-violet"
            onClick={() => {
              void galleriesQuery.refetch();
              void sharedResourcesQuery.refetch();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const galleries = galleriesQuery.data ?? [];
  const links = sharedResourcesQuery.data ?? [];

  return (
    <div className="mx-auto max-w-6xl py-2 font-sans animate-fade-up">
      {/* ── Metric cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          dot="bg-poof-violet"
          label="Galleries"
          value={stats.totalGalleries}
          sub={`${stats.totalPhotos} photos`}
          delay={0}
        />
        <MetricCard
          dot="bg-poof-peach"
          label="Active Links"
          value={stats.activeLinks}
          sub={
            stats.expiringToday > 0
              ? `${stats.expiringToday} expiring today`
              : "All good"
          }
          subHighlight={stats.expiringToday > 0}
          pulse={stats.expiringToday > 0}
          delay={1}
        />
        <MetricCard
          dot="bg-poof-accent"
          label="Total Views"
          value={stats.totalViews}
          sub={`${stats.totalLinks} total links`}
          delay={2}
        />
        <MetricCard
          dot="bg-poof-mint"
          label="Recent"
          value={Math.min(links.length, 10)}
          sub="Last 10 records"
          delay={3}
        />
      </div>

      {/* ── Content columns ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* ── Recent galleries ── */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Galleries</h2>
            <Link
              href="/galleries"
              className="group inline-flex items-center gap-1 text-xs text-poof-mist/50 transition-colors hover:text-poof-violet"
            >
              View all
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {galleries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {galleries.slice(0, 3).map((gallery, i) => {
                const accent = pickAccent(gallery.name);
                return (
                  <Link
                    key={gallery.id}
                    href={`/galleries/${gallery.id}`}
                    className="group block"
                  >
                    <div
                      className="overflow-hidden rounded-xl border border-white/6 bg-[#111] transition-all duration-200 hover:border-white/12 hover:bg-[#151515]"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      {/* Accent bar */}
                      <div
                        className={cn("h-0.75 w-full bg-linear-to-r", accent)}
                      />

                      {/* Cover */}
                      <div className="relative mx-3 mt-3 aspect-video overflow-hidden rounded-lg bg-black/40">
                        {gallery.bannerImageUrl ? (
                          <img
                            src={gallery.bannerImageUrl}
                            alt={gallery.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-white/4 to-white/2">
                            <span className="select-none text-xl font-semibold text-white/12">
                              {gallery.name.slice(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="px-3 pt-2.5 pb-3">
                        <h3 className="truncate text-sm font-semibold text-white">
                          {gallery.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-md border border-dashed border-white/10 px-1.5 py-0.5 text-[10px] text-poof-mist/50">
                            <ImageIcon
                              className="h-2.5 w-2.5"
                              strokeWidth={1.5}
                            />
                            {gallery.imageCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/2 px-6 py-14 text-center">
              <FolderOpen className="mx-auto mb-2 h-5 w-5 text-poof-mist/30" />
              <p className="text-sm text-poof-mist/50">No galleries yet</p>
              <Button
                asChild
                size="sm"
                variant="ghost"
                className="mt-3 text-xs text-poof-violet"
              >
                <Link href="/galleries/new">Create your first gallery</Link>
              </Button>
            </div>
          )}
        </div>

        {/* ── Recent activity feed ── */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-white">Recent Activity</h2>
            <Link
              href="/links"
              className="group inline-flex items-center gap-1 text-xs text-poof-mist/50 transition-colors hover:text-poof-violet"
            >
              All links
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-xl border border-white/6 bg-[#111]">
            {links.length > 0 ? (
              links.slice(0, 6).map((link, i) => (
                <div
                  key={link.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/3",
                    i !== 0 && "border-t border-white/4",
                  )}
                >
                  {/* Status indicator */}
                  <div
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      link.status === "ACTIVE"
                        ? "bg-emerald-400"
                        : link.status === "REVOKED"
                          ? "bg-red-400"
                          : "bg-poof-mist/30",
                    )}
                  />

                  {/* Link info */}
                  <div className="min-w-0 flex-1">
                    <a
                      href={link.shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block truncate font-mono text-[11px] text-poof-violet/80 transition-colors hover:text-poof-violet"
                    >
                      {link.shareUrl.replace(/^https?:\/\//, "")}
                    </a>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-poof-mist/40">
                      <span className="inline-flex items-center gap-0.5">
                        <Share2 className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {link.type}
                      </span>
                      <span className="inline-flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" strokeWidth={1.5} />
                        {link.viewCount}
                      </span>
                      <span>{relativeTime(link.createdAt)}</span>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={cn(
                      "shrink-0 rounded-md border border-dashed px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
                      link.status === "ACTIVE"
                        ? "border-emerald-400/20 text-emerald-400/70"
                        : link.status === "REVOKED"
                          ? "border-red-400/20 text-red-400/70"
                          : "border-white/10 text-poof-mist/40",
                    )}
                  >
                    {link.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center">
                <Link2 className="mx-auto mb-2 h-4 w-4 text-poof-mist/30" />
                <p className="text-xs text-poof-mist/40">No share links yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Metric Card ── */
function MetricCard({
  dot,
  label,
  value,
  sub,
  subHighlight,
  pulse,
  delay,
}: {
  dot: string;
  label: string;
  value: number;
  sub: string;
  subHighlight?: boolean;
  pulse?: boolean;
  delay: number;
}) {
  return (
    <div
      className="rounded-xl border border-white/6 bg-[#111] p-4 transition-colors hover:bg-[#141414]"
      style={{ animationDelay: `${delay * 0.05}s` }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full animate-ping rounded-full opacity-50",
                dot,
              )}
            />
          )}
          <span
            className={cn("relative inline-flex h-2 w-2 rounded-full", dot)}
          />
        </span>
        <span className="text-[10px] uppercase tracking-widest text-poof-mist/40">
          {label}
        </span>
      </div>
      <div className="text-2xl font-semibold tabular-nums text-white">
        {value.toLocaleString()}
      </div>
      <p
        className={cn(
          "mt-1 text-[11px]",
          subHighlight ? "text-poof-peach" : "text-poof-mist/35",
        )}
      >
        {sub}
      </p>
    </div>
  );
}
