"use client";

import { useCallback, useEffect, useMemo, useRef, useState, use } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { GlassCard } from "@/components/poof/glass-card";
import { Countdown } from "@/components/poof/countdown";
import { StatusBadge } from "@/components/poof/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Share2,
  Plus,
  MoreHorizontal,
  Download,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CloudUpload,
  Copy,
  Check,
  Pencil,
  Link2,
  Clock3,
} from "lucide-react";
import {
  useCreateSharedResource,
  useConfirmUpload,
  useDeleteSharedResource,
  useDeleteGallery,
  useDeleteImage,
  useFailUpload,
  useRevokeSharedResource,
  useRequestPresignedUrl,
  useRequestBannerPresignedUrl,
  useUpdateSharedResource,
  useUpdateGallery,
} from "@/hooks/mutations";
import { useGallery, useSharedResources } from "@/hooks/queries";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_GALLERY,
  MAX_SHARE_EXPIRY_MS,
  MIN_SHARE_EXPIRY_MS,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "@/lib/limits";
import { cn } from "@/lib/utils";
import { api } from "@/lib/axios";
import { toast } from "sonner";

const supportedMimeSet = new Set<string>(SUPPORTED_IMAGE_MIME_TYPES);
const DEFAULT_SHARE_EXPIRY_HOURS = 1;
const DEFAULT_SHARE_DATETIME_HOURS = 24;
const COPY_ICON_SUCCESS_MS = 2000;

type GalleryRouteParams = Promise<{ id: string }>;
type ShareExpiryMode = "hours" | "datetime";
type BannerPickerMode = "upload" | "unsplash" | "default";

type UnsplashImageOption = {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  authorName: string;
  authorLink: string;
};

type UnsplashSearchResponse = {
  source: "unsplash" | "fallback";
  results: UnsplashImageOption[];
};

type UploadAlertState =
  | {
      status: "idle";
      progress: number;
      uploaded: number;
      total: number;
      failed: number;
      message: string;
    }
  | {
      status: "pending" | "success" | "error";
      progress: number;
      uploaded: number;
      total: number;
      failed: number;
      message: string;
    };

function toLocalDateTimeInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDefaultShareDateTimeValue(): string {
  return toLocalDateTimeInputValue(
    new Date(Date.now() + DEFAULT_SHARE_DATETIME_HOURS * 60 * 60 * 1000),
  );
}

function uploadWithPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader(
      "Content-Type",
      file.type || "application/octet-stream",
    );
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function GalleryDetailPage({
  params,
}: {
  params: GalleryRouteParams;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { id } = use(params);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);

  const galleryQuery = useGallery(id);
  const updateGallery = useUpdateGallery(id);
  const deleteGallery = useDeleteGallery();
  const deleteImage = useDeleteImage(id);
  const requestPresign = useRequestPresignedUrl();
  const requestBannerPresign = useRequestBannerPresignedUrl(id);
  const confirmUpload = useConfirmUpload();
  const failUpload = useFailUpload();
  const sharedResourcesQuery = useSharedResources();
  const createSharedResource = useCreateSharedResource();
  const revokeSharedResource = useRevokeSharedResource();
  const deleteSharedResource = useDeleteSharedResource();
  const updateSharedResource = useUpdateSharedResource();

  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [bannerPickerMode, setBannerPickerMode] =
    useState<BannerPickerMode>("upload");
  const [bannerUploadFile, setBannerUploadFile] = useState<File | null>(null);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);
  const [bannerSearchQuery, setBannerSearchQuery] = useState(
    "minimal abstract background",
  );
  const [bannerOptions, setBannerOptions] = useState<UnsplashImageOption[]>([]);
  const [selectedBannerOptionUrl, setSelectedBannerOptionUrl] = useState<
    string | null
  >(null);
  const [isBannerOptionsLoading, setIsBannerOptionsLoading] = useState(false);
  const [isBannerUpdating, setIsBannerUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isUploadDragOver, setIsUploadDragOver] = useState(false);
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [isDeleteGalleryModalOpen, setIsDeleteGalleryModalOpen] =
    useState(false);
  const [deleteImageTargetId, setDeleteImageTargetId] = useState<string | null>(
    null,
  );
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(
    new Set(),
  );
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareImageIds, setShareImageIds] = useState<string[]>([]);
  const [shareExpiryMode, setShareExpiryMode] =
    useState<ShareExpiryMode>("hours");
  const [shareExpiryHours, setShareExpiryHours] = useState(
    String(DEFAULT_SHARE_EXPIRY_HOURS),
  );
  const [shareExpiryDateTime, setShareExpiryDateTime] = useState(
    getDefaultShareDateTimeValue,
  );
  const [lastCreatedShareUrl, setLastCreatedShareUrl] = useState<string | null>(
    null,
  );
  const [lastCreatedShareSignature, setLastCreatedShareSignature] = useState<
    string | null
  >(null);
  const [copiedShareKey, setCopiedShareKey] = useState<string | null>(null);
  const [revokingShareId, setRevokingShareId] = useState<string | null>(null);
  const [isDeletingShare, setIsDeletingShare] = useState(false);
  const [deleteShareTargetId, setDeleteShareTargetId] = useState<string | null>(
    null,
  );
  const [editShareTargetId, setEditShareTargetId] = useState<string | null>(
    null,
  );
  const [editShareExpiryDateTime, setEditShareExpiryDateTime] = useState("");
  const [editShareReactivate, setEditShareReactivate] = useState(false);
  const [uploadAlert, setUploadAlert] = useState<UploadAlertState>({
    status: "idle",
    progress: 0,
    uploaded: 0,
    total: 0,
    failed: 0,
    message: "",
  });
  const copiedShareTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const uploadAlertTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const gallery = galleryQuery.data;
  const allImages = gallery?.images ?? [];
  const confirmedImages = useMemo(
    () => allImages.filter((image) => image.uploadStatus === "CONFIRMED"),
    [allImages],
  );
  const galleryShares = useMemo(() => {
    const resources = sharedResourcesQuery.data ?? [];
    return resources.filter((resource) => resource.galleryId === id);
  }, [id, sharedResourcesQuery.data]);

  useEffect(() => {
    if (gallery?.name) {
      setEditName(gallery.name);
    }
  }, [gallery?.name]);

  useEffect(() => {
    const shouldOpenShare = searchParams.get("openShare");
    if (shouldOpenShare !== "1" && shouldOpenShare !== "true") {
      return;
    }

    setShareImageIds([]);
    setShareExpiryMode("hours");
    setShareExpiryHours(String(DEFAULT_SHARE_EXPIRY_HOURS));
    setShareExpiryDateTime(getDefaultShareDateTimeValue());
    setLastCreatedShareUrl(null);
    setLastCreatedShareSignature(null);
    setCopiedShareKey(null);
    setIsShareModalOpen(true);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("openShare");
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  }, [pathname, router, searchParams]);

  useEffect(() => {
    return () => {
      if (copiedShareTimeoutRef.current) {
        clearTimeout(copiedShareTimeoutRef.current);
      }
      if (uploadAlertTimeoutRef.current) {
        clearTimeout(uploadAlertTimeoutRef.current);
      }
    };
  }, []);

  const fetchBannerOptions = useCallback(async (query: string) => {
    setIsBannerOptionsLoading(true);
    try {
      const encoded = encodeURIComponent(
        query.trim() || "minimal abstract background",
      );
      const payload = (await api.get(
        `/unsplash?query=${encoded}&perPage=12`,
      )) as UnsplashSearchResponse;
      setBannerOptions(payload.results);
      setSelectedBannerOptionUrl((current) => {
        if (current) {
          return current;
        }

        return payload.results[0]?.fullUrl ?? null;
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to load banner options";
      toast.error(message);
    } finally {
      setIsBannerOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isBannerModalOpen || bannerPickerMode !== "unsplash") {
      return;
    }

    if (bannerOptions.length > 0) {
      return;
    }

    void fetchBannerOptions(bannerSearchQuery);
  }, [
    bannerOptions.length,
    bannerPickerMode,
    bannerSearchQuery,
    fetchBannerOptions,
    isBannerModalOpen,
  ]);

  const resetBannerUploadState = () => {
    setBannerUploadFile(null);
    setBannerUploadProgress(0);
    if (bannerFileInputRef.current) {
      bannerFileInputRef.current.value = "";
    }
  };

  const handleUploadBannerImage = async () => {
    if (!bannerUploadFile || isBannerUpdating) {
      return;
    }

    setIsBannerUpdating(true);
    setBannerUploadProgress(0);

    try {
      const presigned = await requestBannerPresign.mutateAsync({
        fileName: bannerUploadFile.name,
        mimeType: bannerUploadFile.type,
        fileSize: bannerUploadFile.size,
      });

      await uploadWithPresignedUrl(
        bannerUploadFile,
        presigned.presignedUrl,
        (progress) => {
          setBannerUploadProgress(progress);
        },
      );

      await updateGallery.mutateAsync({
        bannerImageUrl: presigned.publicUrl,
        bannerImageKey: presigned.key,
      });

      toast.success("Gallery banner updated");
      setIsBannerModalOpen(false);
      resetBannerUploadState();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update gallery banner";
      toast.error(message);
    } finally {
      setIsBannerUpdating(false);
    }
  };

  const handleUseUnsplashBanner = async () => {
    if (!selectedBannerOptionUrl || isBannerUpdating) {
      return;
    }

    setIsBannerUpdating(true);
    try {
      await updateGallery.mutateAsync({
        bannerImageUrl: selectedBannerOptionUrl,
        bannerImageKey: null,
      });
      toast.success("Gallery banner updated");
      setIsBannerModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update gallery banner";
      toast.error(message);
    } finally {
      setIsBannerUpdating(false);
    }
  };

  const handleUseDefaultBanner = async () => {
    if (isBannerUpdating) {
      return;
    }

    setIsBannerUpdating(true);
    try {
      await updateGallery.mutateAsync({
        bannerImageUrl: null,
        bannerImageKey: null,
      });
      toast.success("Default banner restored");
      setIsBannerModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to restore default banner";
      toast.error(message);
    } finally {
      setIsBannerUpdating(false);
    }
  };

  const handleRenameCommit = async () => {
    const nextName = editName.trim();
    if (!nextName) {
      setEditName(gallery?.name ?? "");
      setIsEditing(false);
      return;
    }

    try {
      await updateGallery.mutateAsync({ name: nextName });
      setIsEditing(false);
      toast.success("Gallery updated");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to rename gallery";
      toast.error(message);
    }
  };

  const handleDeleteGallery = async () => {
    try {
      await deleteGallery.mutateAsync(id);
      toast.success("Gallery deleted");
      router.push("/galleries");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete gallery";
      toast.error(message);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      await deleteImage.mutateAsync(imageId);
      setLightboxPhoto((current) => (current === imageId ? null : current));
      setSelectedImageIds((previous) => {
        const next = new Set(previous);
        next.delete(imageId);
        return next;
      });
      setDeleteImageTargetId(null);
      toast.success("Image deleted");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete image";
      toast.error(message);
    }
  };

  const toggleImageSelection = (imageId: string) => {
    setSelectedImageIds((previous) => {
      const next = new Set(previous);

      if (next.has(imageId)) {
        next.delete(imageId);
      } else {
        next.add(imageId);
      }

      return next;
    });
  };

  const clearImageSelection = () => {
    setSelectedImageIds(new Set());
  };

  const openShareModal = (imageIds: string[] = []) => {
    setShareImageIds(imageIds);
    setShareExpiryMode("hours");
    setShareExpiryHours(String(DEFAULT_SHARE_EXPIRY_HOURS));
    setShareExpiryDateTime(getDefaultShareDateTimeValue());
    setLastCreatedShareUrl(null);
    setLastCreatedShareSignature(null);
    setCopiedShareKey(null);
    setIsShareModalOpen(true);
  };

  const handleCreateShareLink = async () => {
    const nowMs = Date.now();
    let expiresAtDate: Date;

    if (shareExpiryMode === "hours") {
      const hours = DEFAULT_SHARE_EXPIRY_HOURS;

      if (!Number.isFinite(hours) || hours <= 0) {
        toast.error("Please enter a valid expiry in hours");
        return;
      }

      expiresAtDate = new Date(nowMs + hours * 60 * 60 * 1000);
    } else {
      if (!shareExpiryDateTime) {
        toast.error("Please choose an expiry date and time");
        return;
      }

      const parsedDateTime = new Date(shareExpiryDateTime);

      if (Number.isNaN(parsedDateTime.getTime())) {
        toast.error("Please choose a valid expiry date and time");
        return;
      }

      expiresAtDate = parsedDateTime;
    }

    const expiryDistance = expiresAtDate.getTime() - nowMs;

    if (expiryDistance <= 0) {
      toast.error("Expiry must be in the future");
      return;
    }

    if (expiryDistance < MIN_SHARE_EXPIRY_MS) {
      toast.error("Expiry must be at least 1 hour from now");
      return;
    }

    if (expiryDistance > MAX_SHARE_EXPIRY_MS) {
      toast.error("Expiry cannot be more than 1 year from now");
      return;
    }

    const expiresAt = expiresAtDate.toISOString();
    const selectedShareType =
      shareImageIds.length === 0
        ? "GALLERY"
        : shareImageIds.length === 1
          ? "IMAGE"
          : "MULTI_IMAGE";

    try {
      const created = await createSharedResource.mutateAsync({
        type: selectedShareType,
        galleryId: selectedShareType === "GALLERY" ? id : undefined,
        imageIds: selectedShareType === "GALLERY" ? undefined : shareImageIds,
        expiresAt,
      });

      setLastCreatedShareUrl(created.shareUrl);
      setLastCreatedShareSignature(currentShareDraftSignature);
      await navigator.clipboard.writeText(created.shareUrl);
      setCopiedShareKey("latest");
      if (copiedShareTimeoutRef.current) {
        clearTimeout(copiedShareTimeoutRef.current);
      }
      copiedShareTimeoutRef.current = setTimeout(() => {
        setCopiedShareKey((previous) =>
          previous === "latest" ? null : previous,
        );
      }, COPY_ICON_SUCCESS_MS);
      toast.success("Share link created and copied");
      void sharedResourcesQuery.refetch();
      if (shareImageIds.length > 1) {
        clearImageSelection();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create share link";
      toast.error(message);
    }
  };

  const handleCopyShareLink = async (shareUrl: string, key: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareKey(key);
      if (copiedShareTimeoutRef.current) {
        clearTimeout(copiedShareTimeoutRef.current);
      }
      copiedShareTimeoutRef.current = setTimeout(() => {
        setCopiedShareKey((previous) => (previous === key ? null : previous));
      }, COPY_ICON_SUCCESS_MS);
      toast.success("Share link copied");
    } catch {
      toast.error("Failed to copy share link");
    }
  };

  const handleRevokeShare = async (resourceId: string) => {
    setRevokingShareId(resourceId);
    try {
      await revokeSharedResource.mutateAsync(resourceId);
      toast.success("Share link revoked");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to revoke share link";
      toast.error(message);
    } finally {
      setRevokingShareId((current) =>
        current === resourceId ? null : current,
      );
    }
  };

  const handleDeleteShare = async (resourceId: string) => {
    setIsDeletingShare(true);
    try {
      await deleteSharedResource.mutateAsync(resourceId);
      setDeleteShareTargetId(null);
      toast.success("Share link deleted");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete share link";
      toast.error(message);
    } finally {
      setIsDeletingShare(false);
    }
  };

  const openEditShareModal = (resourceId: string) => {
    const target = galleryShares.find((share) => share.id === resourceId);
    if (!target) {
      return;
    }

    const expiresAtDate = new Date(target.expiresAt);
    const fallback = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const initialDate =
      expiresAtDate.getTime() > Date.now() ? expiresAtDate : fallback;

    setEditShareTargetId(target.id);
    setEditShareExpiryDateTime(toLocalDateTimeInputValue(initialDate));
    setEditShareReactivate(target.status !== "ACTIVE");
  };

  const handleUpdateShare = async () => {
    if (!editShareTargetId) {
      return;
    }

    if (!editShareExpiryDateTime) {
      toast.error("Please choose an expiry date and time");
      return;
    }

    const expiresAt = new Date(editShareExpiryDateTime);
    if (Number.isNaN(expiresAt.getTime())) {
      toast.error("Please choose a valid expiry date and time");
      return;
    }

    try {
      await updateSharedResource.mutateAsync({
        resourceId: editShareTargetId,
        body: {
          expiresAt: expiresAt.toISOString(),
          reactivate: editShareReactivate || undefined,
        },
      });

      setEditShareTargetId(null);
      setEditShareExpiryDateTime("");
      setEditShareReactivate(false);
      toast.success(
        editShareReactivate ? "Link updated and reactivated" : "Link updated",
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update share link";
      toast.error(message);
    }
  };

  const enqueueFiles = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const candidates = Array.from(files);
    setQueuedFiles((previous) => [...previous, ...candidates]);
  };

  const clearUploadAlert = () => {
    if (uploadAlert.status === "pending") {
      return;
    }

    if (uploadAlertTimeoutRef.current) {
      clearTimeout(uploadAlertTimeoutRef.current);
      uploadAlertTimeoutRef.current = null;
    }

    setUploadAlert({
      status: "idle",
      progress: 0,
      uploaded: 0,
      total: 0,
      failed: 0,
      message: "",
    });
  };

  useEffect(() => {
    if (uploadAlert.status !== "success" && uploadAlert.status !== "error") {
      return;
    }

    if (uploadAlertTimeoutRef.current) {
      clearTimeout(uploadAlertTimeoutRef.current);
    }

    uploadAlertTimeoutRef.current = setTimeout(() => {
      setUploadAlert((current) => {
        if (current.status === "pending" || current.status === "idle") {
          return current;
        }

        return {
          status: "idle",
          progress: 0,
          uploaded: 0,
          total: 0,
          failed: 0,
          message: "",
        };
      });
      uploadAlertTimeoutRef.current = null;
    }, 3500);
  }, [uploadAlert.status]);

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const candidates = [...files];
    setIsUploading(true);
    setUploadAlert({
      status: "pending",
      progress: 0,
      uploaded: 0,
      total: candidates.length,
      failed: 0,
      message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
    });

    let uploadedCount = 0;
    let failedCount = 0;
    try {
      for (const [index, file] of candidates.entries()) {
        if (!supportedMimeSet.has(file.type)) {
          toast.error(`Unsupported type for ${file.name}`);
          failedCount += 1;
          const progress = Math.round(((index + 1) / candidates.length) * 100);
          setUploadAlert({
            status: "pending",
            progress,
            uploaded: uploadedCount,
            total: candidates.length,
            failed: failedCount,
            message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
          });
          continue;
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
          toast.error(`${file.name} exceeds 10MB limit`);
          failedCount += 1;
          const progress = Math.round(((index + 1) / candidates.length) * 100);
          setUploadAlert({
            status: "pending",
            progress,
            uploaded: uploadedCount,
            total: candidates.length,
            failed: failedCount,
            message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
          });
          continue;
        }

        let imageId: string | null = null;
        try {
          const presigned = await requestPresign.mutateAsync({
            fileName: file.name,
            mimeType: file.type,
            fileSize: file.size,
            galleryId: id,
          });

          imageId = presigned.imageId;
          await uploadWithPresignedUrl(
            file,
            presigned.presignedUrl,
            (fileProgress) => {
              const progress = Math.round(
                ((index + fileProgress / 100) / candidates.length) * 100,
              );

              setUploadAlert({
                status: "pending",
                progress: Math.min(100, progress),
                uploaded: uploadedCount,
                total: candidates.length,
                failed: failedCount,
                message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
              });
            },
          );
          await confirmUpload.mutateAsync({ imageId, galleryId: id });
          uploadedCount += 1;
          setUploadAlert({
            status: "pending",
            progress: Math.round(((index + 1) / candidates.length) * 100),
            uploaded: uploadedCount,
            total: candidates.length,
            failed: failedCount,
            message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
          });
        } catch (error) {
          if (imageId) {
            await failUpload
              .mutateAsync({ imageId, galleryId: id })
              .catch(() => undefined);
          }

          failedCount += 1;
          const message =
            error instanceof Error ? error.message : "Upload failed";
          toast.error(`${file.name}: ${message}`);
          setUploadAlert({
            status: "pending",
            progress: Math.round(((index + 1) / candidates.length) * 100),
            uploaded: uploadedCount,
            total: candidates.length,
            failed: failedCount,
            message: `Uploading ${candidates.length} photo${candidates.length === 1 ? "" : "s"}...`,
          });
        }
      }

      await galleryQuery.refetch();
      if (failedCount === 0) {
        setUploadAlert({
          status: "success",
          progress: 100,
          uploaded: uploadedCount,
          total: candidates.length,
          failed: failedCount,
          message: `Uploaded ${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} successfully.`,
        });
        toast.success("Upload flow completed");
      } else {
        setUploadAlert({
          status: "error",
          progress: 100,
          uploaded: uploadedCount,
          total: candidates.length,
          failed: failedCount,
          message: `${uploadedCount} uploaded, ${failedCount} failed.`,
        });
        toast.error("Some uploads failed");
      }
    } finally {
      setIsUploading(false);
      setQueuedFiles([]);
      if (modalFileInputRef.current) {
        modalFileInputRef.current.value = "";
      }
    }
  };

  const startUploadFromModal = async () => {
    if (queuedFiles.length === 0 || isUploading) {
      return;
    }

    setIsUploadModalOpen(false);
    await handleUploadFiles(queuedFiles);
  };

  const currentPhotoIndex = lightboxPhoto
    ? confirmedImages.findIndex((image) => image.id === lightboxPhoto)
    : -1;
  const selectedImageList = confirmedImages.filter((image) =>
    selectedImageIds.has(image.id),
  );
  const deleteImageTarget = deleteImageTargetId
    ? (allImages.find((image) => image.id === deleteImageTargetId) ?? null)
    : null;
  const deleteShareTarget = deleteShareTargetId
    ? (galleryShares.find((share) => share.id === deleteShareTargetId) ?? null)
    : null;
  const editShareTarget = editShareTargetId
    ? (galleryShares.find((share) => share.id === editShareTargetId) ?? null)
    : null;
  const shareIntentLabel =
    shareImageIds.length === 0
      ? "Sharing the entire gallery."
      : shareImageIds.length === 1
        ? "Sharing 1 selected image."
        : `Sharing ${shareImageIds.length} selected images.`;
  const shareType =
    shareImageIds.length === 0
      ? "GALLERY"
      : shareImageIds.length === 1
        ? "IMAGE"
        : "MULTI_IMAGE";
  const currentShareDraftSignature = `${shareType}|${[...shareImageIds].sort().join(",")}|${shareExpiryMode}|${
    shareExpiryMode === "hours"
      ? shareExpiryHours.trim()
      : shareExpiryDateTime.trim()
  }`;
  const isCreateLinkDisabled =
    createSharedResource.isPending ||
    (lastCreatedShareSignature !== null &&
      lastCreatedShareSignature === currentShareDraftSignature);
  const minShareDateTimeValue = useMemo(
    () => toLocalDateTimeInputValue(new Date(Date.now() + MIN_SHARE_EXPIRY_MS)),
    [isShareModalOpen],
  );
  const maxShareDateTimeValue = useMemo(
    () => toLocalDateTimeInputValue(new Date(Date.now() + MAX_SHARE_EXPIRY_MS)),
    [isShareModalOpen],
  );
  const minEditShareDateTimeValue = toLocalDateTimeInputValue(
    new Date(Date.now() + MIN_SHARE_EXPIRY_MS),
  );

  const goToPrevPhoto = () => {
    if (currentPhotoIndex <= 0) return;
    setLightboxPhoto(confirmedImages[currentPhotoIndex - 1]?.id ?? null);
  };

  const goToNextPhoto = () => {
    if (
      currentPhotoIndex < 0 ||
      currentPhotoIndex >= confirmedImages.length - 1
    )
      return;
    setLightboxPhoto(confirmedImages[currentPhotoIndex + 1]?.id ?? null);
  };

  if (galleryQuery.isPending) {
    return (
      <div className="space-y-6">
        <div className="skeleton-shimmer h-10 w-72 rounded-lg" />
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div
              key={index}
              className="skeleton-shimmer h-48 rounded-lg break-inside-avoid"
            />
          ))}
        </div>
      </div>
    );
  }

  if (galleryQuery.isError || !gallery) {
    return (
      <GlassCard className="p-8 text-center" hover={false}>
        <p className="text-white font-medium">Gallery not found</p>
        <p className="text-poof-mist text-sm mt-2">
          {galleryQuery.isError
            ? galleryQuery.error.message
            : "This gallery may have been deleted."}
        </p>
        <Button
          asChild
          className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
        >
          <Link href="/galleries">Back to galleries</Link>
        </Button>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/galleries"
            className="mt-1 p-2 rounded-lg text-poof-mist hover:text-white hover:bg-white/5 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                onBlur={() => void handleRenameCommit()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    void handleRenameCommit();
                  }
                  if (event.key === "Escape") {
                    setEditName(gallery.name);
                    setIsEditing(false);
                  }
                }}
                className="font-heading font-extrabold text-3xl lg:text-4xl bg-transparent border-0 border-b border-poof-accent p-0 h-auto text-white focus-visible:ring-0"
                autoFocus
              />
            ) : (
              <h1
                onClick={() => setIsEditing(true)}
                className="font-heading font-extrabold text-3xl lg:text-4xl text-white cursor-pointer hover:text-poof-violet transition-colors"
              >
                {gallery.name}
              </h1>
            )}
            {gallery.description && (
              <p className="text-poof-mist mt-1">{gallery.description}</p>
            )}
            <p className="text-poof-mist/60 text-sm mt-2">
              {allImages.length} photos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-3">
          <Button
            variant="outline"
            className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
            onClick={() => setIsUploadModalOpen(true)}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Add photos
              </>
            )}
          </Button>
          <Button
            className="bg-poof-accent hover:bg-poof-accent/90 text-white btn-press"
            onClick={() => openShareModal()}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share gallery
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-poof-mist hover:text-white"
              >
                <MoreHorizontal className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-poof-base border-white/10"
            >
              <DropdownMenuItem
                className="text-poof-mist hover:text-white cursor-pointer"
                onClick={() => setIsEditing(true)}
              >
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 cursor-pointer"
                onClick={() => setIsDeleteGalleryModalOpen(true)}
              >
                Delete gallery
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <GlassCard className="overflow-hidden p-0" hover={false}>
        <div className="relative h-44 sm:h-56">
          {gallery.bannerImageUrl ? (
            <img
              src={gallery.bannerImageUrl}
              alt={`${gallery.name} banner`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-[radial-gradient(circle_at_20%_20%,rgba(131,100,246,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(59,250,213,0.2),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
          )}
          <div className="absolute inset-0 bg-black/35" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 p-4 sm:p-5">
            <div className="min-w-0"></div>
            <Button
              size="sm"
              variant="secondary"
              className="border-white/20 bg-black/70 text-white hover:bg-black/90"
              onClick={() => setIsBannerModalOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Update banner
            </Button>
          </div>
        </div>
      </GlassCard>

      {selectedImageIds.size > 0 && (
        <GlassCard className="p-4" hover={false}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-white">
              {selectedImageIds.size} selected
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                onClick={clearImageSelection}
              >
                Clear
              </Button>
              <Button
                className="bg-poof-accent hover:bg-poof-accent/90 text-white px-5"
                onClick={() =>
                  openShareModal(selectedImageList.map((image) => image.id))
                }
              >
                Share selected
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-4" hover={false}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="text-white font-medium">Share links</h3>
          <Button
            size="sm"
            className="bg-poof-accent hover:bg-poof-accent/90 text-white"
            onClick={() => openShareModal()}
          >
            <Plus className="w-4 h-4 mr-1" />
            New link
          </Button>
        </div>

        {galleryShares.length > 0 ? (
          <div className="space-y-2">
            {galleryShares.map((share) => (
              <div
                key={share.id}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-xs text-poof-mist font-mono truncate">
                    {share.shareUrl}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge
                      variant={
                        share.status === "ACTIVE"
                          ? "active"
                          : share.status === "REVOKED"
                            ? "revoked"
                            : "expired"
                      }
                      className="text-[10px]"
                    >
                      {share.status}
                    </StatusBadge>
                    <span className="text-[11px] text-poof-mist inline-flex items-center gap-1">
                      <Clock3 className="w-3 h-3" />
                      {share.status === "ACTIVE" ? (
                        <Countdown expiresAt={new Date(share.expiresAt)} />
                      ) : share.status === "REVOKED" ? (
                        "Revoked"
                      ) : (
                        "Poofed"
                      )}
                    </span>
                    <span className="text-[11px] text-poof-mist">
                      {share.viewCount} views
                    </span>
                    <span className="text-[11px] text-poof-mist">
                      {share.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center self-start md:self-auto">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-poof-mist hover:text-white"
                        disabled={
                          isDeletingShare && deleteShareTargetId === share.id
                            ? true
                            : revokingShareId === share.id
                        }
                      >
                        {isDeletingShare && deleteShareTargetId === share.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : revokingShareId === share.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <MoreHorizontal className="w-4 h-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-poof-base border-white/10"
                    >
                      <DropdownMenuItem
                        className="cursor-pointer text-poof-mist hover:text-white"
                        onClick={() => openEditShareModal(share.id)}
                        disabled={
                          updateSharedResource.isPending || isDeletingShare
                        }
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-poof-mist hover:text-white"
                        onClick={() =>
                          void handleCopyShareLink(
                            share.shareUrl,
                            `share-${share.id}`,
                          )
                        }
                      >
                        {copiedShareKey === `share-${share.id}` ? (
                          <Check className="w-4 h-4 mr-2" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        {copiedShareKey === `share-${share.id}`
                          ? "Copied"
                          : "Copy"}
                      </DropdownMenuItem>
                      {share.status === "ACTIVE" && (
                        <DropdownMenuItem
                          className="cursor-pointer text-poof-peach hover:text-poof-peach"
                          onClick={() => void handleRevokeShare(share.id)}
                          disabled={
                            revokingShareId === share.id || isDeletingShare
                          }
                        >
                          {revokingShareId === share.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Link2 className="w-4 h-4 mr-2" />
                          )}
                          {revokingShareId === share.id
                            ? "Revoking..."
                            : "Revoke"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-400 hover:text-red-300"
                        onClick={() => setDeleteShareTargetId(share.id)}
                        disabled={isDeletingShare}
                      >
                        {isDeletingShare && deleteShareTargetId === share.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 mr-2" />
                        )}
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-poof-mist">No share links yet.</p>
        )}
      </GlassCard>

      {allImages.length > 0 ? (
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {allImages.map((image, index) => {
            const canPreview = image.uploadStatus === "CONFIRMED";

            return (
              <div
                key={image.id}
                className={cn(
                  "break-inside-avoid group relative rounded-lg overflow-hidden animate-fade-up",
                  selectedImageIds.has(image.id) && "ring-2 ring-poof-violet",
                  canPreview ? "cursor-pointer" : "cursor-not-allowed",
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => {
                  if (canPreview) {
                    setLightboxPhoto(image.id);
                  }
                }}
              >
                {canPreview ? (
                  <div className="relative">
                    <img
                      src={image.r2Url}
                      alt={image.fileName}
                      className="w-full scale-105 blur-xl transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 pointer-events-none" />
                    <div className="absolute bottom-2 left-1/2 max-w-[80%] -translate-x-1/2 truncate rounded-full bg-black/60 px-3 py-1 text-[11px] text-white/90">
                      {image.fileName}
                    </div>
                  </div>
                ) : (
                  <div className="w-full min-h-48 bg-white/5 flex items-center justify-center p-4">
                    <span className="text-sm text-poof-mist text-center">
                      {image.uploadStatus === "PENDING"
                        ? "Upload pending"
                        : "Upload failed"}
                    </span>
                  </div>
                )}

                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/50 text-[10px] text-white">
                  {image.uploadStatus}
                </div>
                {canPreview && (
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                      checked={selectedImageIds.has(image.id)}
                      onCheckedChange={() => toggleImageSelection(image.id)}
                      onClick={(event) => event.stopPropagation()}
                      className="w-4 h-4 border-white/50 bg-black/50 data-[state=checked]:bg-poof-violet data-[state=checked]:border-poof-violet"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    disabled={!canPreview}
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    onClick={(event) => {
                      event.stopPropagation();
                      openShareModal([image.id]);
                    }}
                    disabled={!canPreview}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    disabled={!canPreview}
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      setDeleteImageTargetId(image.id);
                    }}
                    className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <GlassCard className="p-8 text-center" hover={false}>
          <p className="text-white font-medium">No photos yet</p>
          <p className="text-poof-mist text-sm mt-2">
            Upload images to start building your gallery.
          </p>
          <Button
            className="mt-4 bg-poof-accent hover:bg-poof-accent/90 text-white"
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add photos
          </Button>
        </GlassCard>
      )}

      <Dialog
        open={isUploadModalOpen}
        onOpenChange={(open) => {
          if (isUploading) return;
          setIsUploadModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-xl bg-poof-base border-white/10 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-2xl">Upload Photos</h2>
              <p className="text-poof-mist text-sm mt-1">
                Drag and drop files or choose from your device.
              </p>
            </div>

            <div
              onDrop={(event) => {
                event.preventDefault();
                setIsUploadDragOver(false);
                enqueueFiles(event.dataTransfer.files);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setIsUploadDragOver(true);
              }}
              onDragLeave={() => setIsUploadDragOver(false)}
              className={cn(
                "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
                isUploadDragOver
                  ? "border-poof-accent bg-poof-accent/10"
                  : "border-white/20 hover:border-white/30",
              )}
            >
              <input
                ref={modalFileInputRef}
                type="file"
                accept={SUPPORTED_IMAGE_MIME_TYPES.join(",")}
                multiple
                className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                onChange={(event) => enqueueFiles(event.target.files)}
              />
              <CloudUpload className="w-10 h-10 mx-auto mb-3 text-poof-mist" />
              <p className="text-white font-medium">
                Drop files here or click to browse
              </p>
              <p className="text-xs text-poof-mist mt-2">
                Allowed: image/jpeg, image/png, image/webp, image/heic
              </p>
              <p className="text-xs text-poof-mist mt-1">
                Max size: 10MB per file
              </p>
              <p className="text-xs text-poof-mist mt-1">
                Max images per gallery: {MAX_IMAGES_PER_GALLERY}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-sm text-poof-mist">
                {queuedFiles.length > 0
                  ? `${queuedFiles.length} file${queuedFiles.length === 1 ? "" : "s"} selected`
                  : "No files selected yet"}
              </p>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                className="text-poof-mist hover:text-white"
                onClick={() => {
                  setQueuedFiles([]);
                  if (modalFileInputRef.current) {
                    modalFileInputRef.current.value = "";
                  }
                }}
                disabled={isUploading || queuedFiles.length === 0}
              >
                Clear
              </Button>
              <Button
                className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                onClick={() => void startUploadFromModal()}
                disabled={isUploading || queuedFiles.length === 0}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Upload{" "}
                    {queuedFiles.length > 0 ? `(${queuedFiles.length})` : ""}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isBannerModalOpen}
        onOpenChange={(open) => {
          if (!open && !isBannerUpdating) {
            setIsBannerModalOpen(false);
            setBannerPickerMode("upload");
            resetBannerUploadState();
          } else if (open) {
            setIsBannerModalOpen(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl bg-poof-base border-white/10 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-2xl">
                Update gallery banner
              </h2>
              <p className="text-poof-mist text-sm mt-1">
                Upload your own banner or pick a default look from Unsplash.
              </p>
            </div>

            <Tabs
              value={bannerPickerMode}
              onValueChange={(value) =>
                setBannerPickerMode(value as BannerPickerMode)
              }
            >
              <TabsList className="grid h-10 w-full grid-cols-3 border border-white/10 bg-white/5">
                <TabsTrigger
                  value="upload"
                  className="text-poof-mist data-[state=active]:bg-poof-violet/30 data-[state=active]:text-white"
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value="unsplash"
                  className="text-poof-mist data-[state=active]:bg-poof-violet/30 data-[state=active]:text-white"
                >
                  Unsplash
                </TabsTrigger>
                <TabsTrigger
                  value="default"
                  className="text-poof-mist data-[state=active]:bg-poof-violet/30 data-[state=active]:text-white"
                >
                  Default
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-3">
                <label className="block space-y-3">
                  <input
                    ref={bannerFileInputRef}
                    type="file"
                    accept={SUPPORTED_IMAGE_MIME_TYPES.join(",")}
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setBannerUploadFile(file);
                      setBannerUploadProgress(0);
                    }}
                    disabled={isBannerUpdating}
                  />
                  <button
                    type="button"
                    className="w-full rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-8 text-center hover:border-white/35 transition-colors"
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isBannerUpdating}
                  >
                    <CloudUpload className="mx-auto mb-2 h-8 w-8 text-poof-mist" />
                    <p className="text-sm text-white">
                      {bannerUploadFile
                        ? bannerUploadFile.name
                        : "Choose a banner image"}
                    </p>
                    <p className="mt-1 text-xs text-poof-mist">
                      image/jpeg, image/png, image/webp, image/heic · Max 10MB
                    </p>
                  </button>
                </label>
                {bannerUploadProgress > 0 && (
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-white/15">
                      <div
                        className="h-1.5 rounded-full bg-poof-accent transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(100, bannerUploadProgress))}%`,
                        }}
                      />
                    </div>
                    <p className="text-xs text-poof-mist">
                      {bannerUploadProgress}% uploaded
                    </p>
                  </div>
                )}
                <div className="flex justify-end">
                  <Button
                    className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                    onClick={() => void handleUploadBannerImage()}
                    disabled={!bannerUploadFile || isBannerUpdating}
                  >
                    {isBannerUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save banner"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="unsplash" className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    value={bannerSearchQuery}
                    onChange={(event) =>
                      setBannerSearchQuery(event.target.value)
                    }
                    placeholder="Search style (e.g. minimal gradient)"
                    className="bg-white/5 border-white/10 text-white"
                    disabled={isBannerUpdating || isBannerOptionsLoading}
                  />
                  <Button
                    variant="outline"
                    className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                    onClick={() => void fetchBannerOptions(bannerSearchQuery)}
                    disabled={isBannerUpdating || isBannerOptionsLoading}
                  >
                    {isBannerOptionsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Search"
                    )}
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                  {bannerOptions.map((option) => {
                    const isSelected =
                      selectedBannerOptionUrl === option.fullUrl;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        className={cn(
                          "group relative aspect-video overflow-hidden rounded-lg border transition-colors",
                          isSelected
                            ? "border-poof-violet"
                            : "border-white/10 hover:border-white/30",
                        )}
                        onClick={() =>
                          setSelectedBannerOptionUrl(option.fullUrl)
                        }
                        disabled={isBannerUpdating}
                      >
                        <img
                          src={option.thumbUrl}
                          alt={`Banner option by ${option.authorName}`}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
                {selectedBannerOptionUrl && (
                  <p className="text-xs text-poof-mist">
                    Selected from Unsplash. Attribution available in Unsplash
                    source.
                  </p>
                )}
                <div className="flex justify-end">
                  <Button
                    className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                    onClick={() => void handleUseUnsplashBanner()}
                    disabled={!selectedBannerOptionUrl || isBannerUpdating}
                  >
                    {isBannerUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Use selected"
                    )}
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="default" className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-poof-mist">
                  Remove your custom banner and switch back to the default Poof
                  banner style.
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                    onClick={() => void handleUseDefaultBanner()}
                    disabled={isBannerUpdating}
                  >
                    {isBannerUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Use default banner"
                    )}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className="sm:max-w-lg bg-poof-base border-white/10 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-2xl">
                Create share link
              </h2>
              <p className="text-poof-mist text-sm mt-1">
                Generate an expiring link for this gallery or selected images.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-poof-mist">{shareIntentLabel}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm text-poof-mist">Expiry</label>
              <Tabs
                value={shareExpiryMode}
                onValueChange={(value) => {
                  const nextMode = value as ShareExpiryMode;
                  setShareExpiryMode(nextMode);
                  if (nextMode === "hours") {
                    setShareExpiryHours(String(DEFAULT_SHARE_EXPIRY_HOURS));
                  } else {
                    setShareExpiryDateTime(getDefaultShareDateTimeValue());
                  }
                }}
              >
                <TabsList className="grid h-10 w-full grid-cols-2 border border-white/10 bg-white/5">
                  <TabsTrigger
                    value="hours"
                    className="text-poof-mist data-[state=active]:bg-poof-violet/30 data-[state=active]:text-white"
                  >
                    An hour
                  </TabsTrigger>
                  <TabsTrigger
                    value="datetime"
                    className="text-poof-mist data-[state=active]:bg-poof-violet/30 data-[state=active]:text-white"
                  >
                    Date & time
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="hours" className="space-y-2">
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-poof-mist">
                    Link will expire exactly 1 hour from now.
                  </div>
                </TabsContent>

                <TabsContent value="datetime" className="space-y-2">
                  <Input
                    type="datetime-local"
                    value={shareExpiryDateTime}
                    min={minShareDateTimeValue}
                    max={maxShareDateTimeValue}
                    onChange={(event) =>
                      setShareExpiryDateTime(event.target.value)
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-poof-mist">
                    Uses your local timezone.
                  </p>
                </TabsContent>
              </Tabs>
            </div>

            {lastCreatedShareUrl && (
              <div className="rounded-lg border border-poof-mint/30 bg-poof-mint/10 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs text-poof-mint">Latest link</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-poof-mint/40 text-poof-mint hover:bg-poof-mint/10"
                    onClick={() =>
                      void handleCopyShareLink(lastCreatedShareUrl, "latest")
                    }
                  >
                    {copiedShareKey === "latest" ? (
                      <Check className="w-3.5 h-3.5 mr-1" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1" />
                    )}
                    Copy
                  </Button>
                </div>
                <p className="font-mono text-xs text-white break-all">
                  {lastCreatedShareUrl}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                onClick={() => setIsShareModalOpen(false)}
                disabled={createSharedResource.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                onClick={() => void handleCreateShareLink()}
                disabled={isCreateLinkDisabled}
              >
                {createSharedResource.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 mr-2" />
                    Create link
                  </>
                )}
              </Button>
            </div>
            {lastCreatedShareSignature !== null &&
              lastCreatedShareSignature === currentShareDraftSignature &&
              !createSharedResource.isPending && (
                <p className="text-right text-xs text-poof-mist">
                  Change expiry input to generate another link.
                </p>
              )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(editShareTargetId)}
        onOpenChange={(open) => {
          if (!open && !updateSharedResource.isPending) {
            setEditShareTargetId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg bg-poof-base border-white/10 text-white">
          <div className="space-y-5">
            <div>
              <h2 className="font-heading font-bold text-2xl">
                Edit share link
              </h2>
              <p className="text-poof-mist text-sm mt-1">
                Extend expiry or reactivate this link.
              </p>
            </div>

            {editShareTarget && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <p className="font-mono text-xs text-poof-violet break-all">
                  {editShareTarget.shareUrl}
                </p>
                <p className="text-xs text-poof-mist mt-1">
                  Current status: {editShareTarget.status}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-poof-mist">
                New expiry (date & time)
              </label>
              <Input
                type="datetime-local"
                value={editShareExpiryDateTime}
                min={minEditShareDateTimeValue}
                onChange={(event) =>
                  setEditShareExpiryDateTime(event.target.value)
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <Checkbox
                checked={editShareReactivate}
                onCheckedChange={(checked) =>
                  setEditShareReactivate(Boolean(checked))
                }
                className="border-white/30 data-[state=checked]:bg-poof-accent data-[state=checked]:border-poof-accent"
              />
              <span className="text-sm text-poof-mist">Reactivate link</span>
            </label>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
                onClick={() => setEditShareTargetId(null)}
                disabled={updateSharedResource.isPending}
              >
                Cancel
              </Button>
              <Button
                className="bg-poof-accent hover:bg-poof-accent/90 text-white"
                onClick={() => void handleUpdateShare()}
                disabled={updateSharedResource.isPending}
              >
                {updateSharedResource.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(lightboxPhoto)}
        onOpenChange={() => setLightboxPhoto(null)}
      >
        <DialogContent
          className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-white/10"
          showCloseButton={false}
        >
          <div className="relative w-full h-[90vh] flex items-center justify-center">
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {currentPhotoIndex > 0 && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  goToPrevPhoto();
                }}
                className="absolute left-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {currentPhotoIndex < confirmedImages.length - 1 && (
              <button
                onClick={(event) => {
                  event.stopPropagation();
                  goToNextPhoto();
                }}
                className="absolute right-4 z-10 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {lightboxPhoto && (
              <img
                src={
                  confirmedImages.find((image) => image.id === lightboxPhoto)
                    ?.r2Url
                }
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
              <span className="text-white text-sm">
                {
                  confirmedImages.find((image) => image.id === lightboxPhoto)
                    ?.fileName
                }
              </span>
              <span className="text-poof-mist text-sm">
                {currentPhotoIndex + 1} / {confirmedImages.length}
              </span>
            </div>

            {lightboxPhoto && (
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setDeleteImageTargetId(lightboxPhoto);
                  }}
                  className="p-2 rounded-full bg-white/10 text-red-400 hover:bg-white/20 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isDeleteGalleryModalOpen}
        onOpenChange={setIsDeleteGalleryModalOpen}
      >
        <AlertDialogContent className="bg-poof-base border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete gallery?</AlertDialogTitle>
            <AlertDialogDescription className="text-poof-mist">
              This will remove this gallery and its images from your dashboard
              immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white"
              onClick={() => void handleDeleteGallery()}
            >
              Delete gallery
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteImageTargetId)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteImageTargetId(null);
          }
        }}
      >
        <AlertDialogContent className="bg-poof-base border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete image?</AlertDialogTitle>
            <AlertDialogDescription className="text-poof-mist">
              {deleteImageTarget?.fileName
                ? `This will remove "${deleteImageTarget.fileName}" from this gallery.`
                : "This will remove this image from this gallery."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white"
              onClick={() => {
                if (deleteImageTargetId) {
                  void handleDeleteImage(deleteImageTargetId);
                }
              }}
            >
              Delete image
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deleteShareTargetId)}
        onOpenChange={(open) => {
          if (!open && !isDeletingShare) {
            setDeleteShareTargetId(null);
          }
        }}
      >
        <AlertDialogContent className="bg-poof-base border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete share link?</AlertDialogTitle>
            <AlertDialogDescription className="text-poof-mist">
              {deleteShareTarget
                ? `This will permanently remove this ${deleteShareTarget.type.toLowerCase()} link from your history.`
                : "This will permanently remove this share link from your history."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-white/10 text-poof-mist hover:text-white hover:bg-white/5"
              disabled={isDeletingShare}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-500/90 text-white"
              onClick={() => {
                if (deleteShareTargetId) {
                  void handleDeleteShare(deleteShareTargetId);
                }
              }}
              disabled={isDeletingShare}
            >
              {isDeletingShare ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete link"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {uploadAlert.status !== "idle" && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] w-[360px] max-w-[calc(100vw-2rem)] sm:top-auto sm:left-auto sm:translate-x-0 sm:bottom-10 sm:right-10">
          <Alert
            className={cn(
              "border-white/20 bg-poof-base/95 text-white shadow-xl backdrop-blur",
              uploadAlert.status === "success" &&
                "border-emerald-500/40 bg-emerald-950/30 text-emerald-100",
              uploadAlert.status === "error" &&
                "border-red-500/40 bg-red-950/30 text-red-100",
            )}
          >
            {uploadAlert.status === "pending" && (
              <Loader2 className="h-4 w-4 animate-spin text-poof-accent" />
            )}
            {uploadAlert.status === "success" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            )}
            {uploadAlert.status === "error" && (
              <AlertTriangle className="h-4 w-4 text-red-400" />
            )}

            <AlertTitle>
              {uploadAlert.status === "pending" && "Uploading photos"}
              {uploadAlert.status === "success" && "Upload complete"}
              {uploadAlert.status === "error" && "Upload finished with errors"}
            </AlertTitle>
            <AlertDescription className="w-full">
              <p className="text-xs text-current/90">{uploadAlert.message}</p>
              <p className="text-xs text-current/80">
                {uploadAlert.uploaded}/{uploadAlert.total} uploaded
                {uploadAlert.failed > 0
                  ? ` · ${uploadAlert.failed} failed`
                  : ""}
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-white/20">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    uploadAlert.status === "success" && "bg-emerald-400",
                    uploadAlert.status === "error" && "bg-red-400",
                    uploadAlert.status === "pending" && "bg-poof-accent",
                  )}
                  style={{
                    width: `${Math.min(100, Math.max(0, uploadAlert.progress))}%`,
                  }}
                />
              </div>
              {uploadAlert.status !== "pending" && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 border-white/20 text-current hover:bg-white/10"
                    onClick={clearUploadAlert}
                  >
                    Close
                  </Button>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
