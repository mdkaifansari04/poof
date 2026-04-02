'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { GlassCard } from '@/components/poof/glass-card'
import { EmptyState } from '@/components/poof/empty-state'
import { StatusBadge } from '@/components/poof/status-badge'
import { Countdown } from '@/components/poof/countdown'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  useDeleteSharedResource,
  useRevokeSharedResource,
  useUpdateSharedResource,
} from '@/hooks/mutations'
import { useSharedResources } from '@/hooks/queries'
import { MIN_SHARE_EXPIRY_MS } from '@/lib/limits'
import {
  Check,
  Copy,
  Eye,
  ExternalLink,
  Pencil,
  Link2,
  Loader2,
  MoreHorizontal,
  Search,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

const COPY_ICON_SUCCESS_MS = 2000
type StatusFilter = 'ALL' | 'ACTIVE' | 'EXPIRED' | 'REVOKED'

function formatDateTime(value: string) {
  const date = new Date(value)
  return date.toLocaleString()
}

function toLocalDateTimeInputValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function ShareLinksPage() {
  const sharedResourcesQuery = useSharedResources()
  const revokeSharedResource = useRevokeSharedResource()
  const deleteSharedResource = useDeleteSharedResource()
  const updateSharedResource = useUpdateSharedResource()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null)
  const [revokingLinkId, setRevokingLinkId] = useState<string | null>(null)
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editTargetId, setEditTargetId] = useState<string | null>(null)
  const [editExpiryDateTime, setEditExpiryDateTime] = useState('')
  const [editReactivate, setEditReactivate] = useState(false)

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const links = sharedResourcesQuery.data ?? []

  const stats = useMemo(() => {
    const active = links.filter((link) => link.status === 'ACTIVE')
    const expiringSoon = active.filter((link) => {
      const diff = new Date(link.expiresAt).getTime() - Date.now()
      return diff > 0 && diff < 24 * 60 * 60 * 1000
    })

    return {
      total: links.length,
      active: active.length,
      expired: links.filter((link) => link.status === 'EXPIRED').length,
      revoked: links.filter((link) => link.status === 'REVOKED').length,
      expiringSoon: expiringSoon.length,
      views: links.reduce((sum, link) => sum + link.viewCount, 0),
    }
  }, [links])

  const filteredLinks = useMemo(() => {
    const query = search.trim().toLowerCase()

    return links.filter((link) => {
      if (statusFilter !== 'ALL' && link.status !== statusFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return (
        link.shareUrl.toLowerCase().includes(query) ||
        (link.gallery?.name ?? '').toLowerCase().includes(query) ||
        link.type.toLowerCase().includes(query)
      )
    })
  }, [links, search, statusFilter])

  const deleteTarget = deleteTargetId
    ? links.find((link) => link.id === deleteTargetId) ?? null
    : null
  const editTarget = editTargetId ? links.find((link) => link.id === editTargetId) ?? null : null
  const minDateTimeValue = toLocalDateTimeInputValue(new Date(Date.now() + MIN_SHARE_EXPIRY_MS))

  const handleCopy = async (shareUrl: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopiedLinkId(linkId)

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedLinkId((current) => (current === linkId ? null : current))
      }, COPY_ICON_SUCCESS_MS)

      toast.success('Share link copied')
    } catch {
      toast.error('Failed to copy share link')
    }
  }

  const handleRevoke = async (resourceId: string) => {
    setRevokingLinkId(resourceId)
    try {
      await revokeSharedResource.mutateAsync(resourceId)
      toast.success('Share link revoked')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to revoke share link'
      toast.error(message)
    } finally {
      setRevokingLinkId((current) => (current === resourceId ? null : current))
    }
  }

  const handleDelete = async (resourceId: string) => {
    setIsDeleting(true)
    try {
      await deleteSharedResource.mutateAsync(resourceId)
      setDeleteTargetId(null)
      toast.success('Share link deleted')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete share link'
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const openEditDialog = (resourceId: string) => {
    const target = links.find((link) => link.id === resourceId)
    if (!target) {
      return
    }

    const expiresAtDate = new Date(target.expiresAt)
    const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const initialDate = expiresAtDate.getTime() > Date.now() ? expiresAtDate : fallback

    setEditTargetId(resourceId)
    setEditExpiryDateTime(toLocalDateTimeInputValue(initialDate))
    setEditReactivate(target.status !== 'ACTIVE')
  }

  const handleUpdateLink = async () => {
    if (!editTargetId) {
      return
    }

    if (!editExpiryDateTime) {
      toast.error('Please choose an expiry date and time')
      return
    }

    const expiresAt = new Date(editExpiryDateTime)
    if (Number.isNaN(expiresAt.getTime())) {
      toast.error('Please choose a valid date and time')
      return
    }

    if (expiresAt.getTime() <= Date.now()) {
      toast.error('Expiry must be in the future')
      return
    }

    try {
      await updateSharedResource.mutateAsync({
        resourceId: editTargetId,
        body: {
          expiresAt: expiresAt.toISOString(),
          reactivate: editReactivate || undefined,
        },
      })

      toast.success(editReactivate ? 'Link updated and reactivated' : 'Link updated')
      setEditTargetId(null)
      setEditReactivate(false)
      setEditExpiryDateTime('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update link'
      toast.error(message)
    }
  }

  if (sharedResourcesQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-10 w-60 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="skeleton-shimmer h-28 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="skeleton-shimmer h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (sharedResourcesQuery.isError) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-white font-medium">Could not load share links</p>
        <p className="text-poof-mist text-sm mt-2">{sharedResourcesQuery.error.message}</p>
        <Button
          onClick={() => void sharedResourcesQuery.refetch()}
          className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
        >
          Retry
        </Button>
      </GlassCard>
    )
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-poof-mist absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by URL, gallery, or type..."
              className="pl-9 bg-white/5 border-white/10 text-white"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'ACTIVE', 'EXPIRED', 'REVOKED'] as const).map((status) => (
              <Button
                key={status}
                size="sm"
                variant="outline"
                className={
                  statusFilter === status
                    ? 'border-poof-violet text-white bg-poof-violet/20'
                    : 'border-white/10 text-poof-mist hover:text-white hover:bg-white/5'
                }
                onClick={() => setStatusFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      {filteredLinks.length === 0 ? (
        <GlassCard hover={false}>
          <EmptyState type="links" className="py-12" />
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <GlassCard key={link.id} className="p-4" hover={false}>
              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge
                      variant={
                        link.status === 'ACTIVE'
                          ? 'active'
                          : link.status === 'REVOKED'
                            ? 'revoked'
                            : 'expired'
                      }
                      className="text-[10px]"
                    >
                      {link.status}
                    </StatusBadge>
                    <StatusBadge
                      variant={link.type === 'GALLERY' ? 'gallery' : 'photo'}
                      className="text-[10px]"
                    >
                      {link.type}
                    </StatusBadge>
                    <span className="text-xs text-poof-mist">{link.gallery?.name ?? 'Unknown gallery'}</span>
                  </div>

                  <a
                    href={link.shareUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-xs text-poof-violet hover:underline break-all inline-flex items-center gap-1"
                  >
                    {link.shareUrl}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-poof-mist">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      {link.viewCount} views
                    </span>
                    <span>Created: {formatDateTime(link.createdAt)}</span>
                    <span className="inline-flex items-center gap-1">
                      Expires in: <Countdown expiresAt={new Date(link.expiresAt)} />
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-lg text-poof-mist/40 hover:bg-white/6 hover:text-poof-mist"
                        disabled={(isDeleting && deleteTargetId === link.id) || revokingLinkId === link.id}
                      >
                        {(isDeleting && deleteTargetId === link.id) || revokingLinkId === link.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => openEditDialog(link.id)}
                        disabled={updateSharedResource.isPending}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => void handleCopy(link.shareUrl, link.id)}
                      >
                        {copiedLinkId === link.id ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedLinkId === link.id ? 'Copied' : 'Copy'}
                      </DropdownMenuItem>
                      {link.status === 'ACTIVE' && (
                        <DropdownMenuItem
                          onClick={() => void handleRevoke(link.id)}
                          disabled={revokingLinkId === link.id || isDeleting}
                        >
                          {revokingLinkId === link.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          {revokingLinkId === link.id ? 'Revoking...' : 'Revoke'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTargetId(link.id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteTargetId(null)
          }
        }}
      >
        <AlertDialogContent className="bg-poof-base border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete share link?</AlertDialogTitle>
            <AlertDialogDescription className="text-poof-mist">
              {deleteTarget
                ? `This removes this ${deleteTarget.type.toLowerCase()} link permanently.`
                : 'This removes this link permanently.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white"
              onClick={() => {
                if (deleteTargetId) {
                  void handleDelete(deleteTargetId)
                }
              }}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete link'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={Boolean(editTargetId)}
        onOpenChange={(open) => {
          if (!open && !updateSharedResource.isPending) {
            setEditTargetId(null)
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-poof-base border-white/10 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-2xl">Edit share link</h2>
              <p className="text-poof-mist text-sm mt-1">
                Update expiry and optionally reactivate this link.
              </p>
            </div>

            {editTarget ? (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-mono text-xs text-poof-violet break-all">{editTarget.shareUrl}</p>
                <p className="text-xs text-poof-mist mt-1">
                  Current status: {editTarget.status}
                </p>
              </div>
            ) : null}

            <div className="space-y-2">
              <label className="text-sm text-poof-mist">New expiry (date & time)</label>
              <Input
                type="datetime-local"
                value={editExpiryDateTime}
                min={minDateTimeValue}
                onChange={(event) => setEditExpiryDateTime(event.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Checkbox
                checked={editReactivate}
                onCheckedChange={(checked) => setEditReactivate(Boolean(checked))}
                className="border-white/30 data-[state=checked]:bg-poof-accent data-[state=checked]:border-poof-accent"
              />
              <span className="text-sm text-poof-mist">
                Reactivate link (useful for revoked links)
              </span>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                onClick={() => setEditTargetId(null)}
                disabled={updateSharedResource.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                onClick={() => void handleUpdateLink()}
                disabled={updateSharedResource.isPending}
              >
                {updateSharedResource.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  label,
  value,
  subtext,
}: {
  label: string
  value: number
  subtext?: string
}) {
  return (
    <GlassCard className="p-4" hover={false}>
      <p className="text-poof-mist text-sm">{label}</p>
      <p className="font-heading font-bold text-3xl text-white mt-2">{value.toLocaleString()}</p>
      {subtext ? <p className="text-xs text-poof-mist mt-1">{subtext}</p> : null}
    </GlassCard>
  )
}
