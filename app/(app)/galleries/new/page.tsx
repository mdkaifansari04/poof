"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  X,
  Upload,
  Check,
  AlertCircle,
  Star,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  useConfirmUpload,
  useCreateGallery,
  useFailUpload,
  useRequestPresignedUrl,
} from "@/hooks/mutations";
import {
  MAX_FILE_SIZE_BYTES,
  MAX_IMAGES_PER_GALLERY,
  SUPPORTED_IMAGE_MIME_TYPES,
} from "@/lib/limits";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = 1 | 2 | 3;

type UploadedPhoto = {
  id: string;
  imageId: string | null;
  file: File;
  preview: string;
  progress: number;
  status: "uploading" | "complete" | "error";
  errorMessage: string | null;
};

const acceptedFormats = ["JPG", "PNG", "WEBP", "HEIC"];
const supportedMimeSet = new Set<string>(SUPPORTED_IMAGE_MIME_TYPES);

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const order = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** order;
  return `${value.toFixed(order === 0 ? 0 : 1)} ${units[order]}`;
}

function uploadWithPresignedUrl(
  file: File,
  presignedUrl: string,
  onProgress: (progress: number) => void,
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
      onProgress(Math.round((event.loaded / event.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export default function NewGalleryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [creating, setCreating] = useState(false);
  const [galleryId, setGalleryId] = useState<string | null>(null);

  const createGallery = useCreateGallery();
  const requestPresign = useRequestPresignedUrl();
  const confirmUpload = useConfirmUpload();
  const failUpload = useFailUpload();

  const ensureGallery = useCallback(async (): Promise<string> => {
    if (galleryId) {
      return galleryId;
    }

    const created = await createGallery.mutateAsync({
      name: name.trim(),
    });

    setGalleryId(created.id);
    return created.id;
  }, [createGallery, galleryId, name]);

  const setPhotoState = useCallback(
    (photoId: string, patch: Partial<UploadedPhoto>) => {
      setPhotos((previous) =>
        previous.map((photo) =>
          photo.id === photoId ? { ...photo, ...patch } : photo,
        ),
      );
    },
    [],
  );

  const uploadPhoto = useCallback(
    async (photoId: string, file: File) => {
      if (!supportedMimeSet.has(file.type)) {
        setPhotoState(photoId, {
          status: "error",
          progress: 0,
          errorMessage: "Unsupported file type",
        });
        toast.error(`${file.name}: unsupported file type`);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        setPhotoState(photoId, {
          status: "error",
          progress: 0,
          errorMessage: "Exceeds 10MB",
        });
        toast.error(`${file.name}: exceeds 10MB`);
        return;
      }

      let uploadedImageId: string | null = null;
      let ensuredGalleryId: string | null = null;
      try {
        ensuredGalleryId = await ensureGallery();
        if (!ensuredGalleryId) {
          throw new Error("Failed to create gallery");
        }

        const presigned = await requestPresign.mutateAsync({
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          galleryId: ensuredGalleryId,
        });

        uploadedImageId = presigned.imageId;
        if (!uploadedImageId) {
          throw new Error("Upload failed to initialize");
        }

        setPhotoState(photoId, { imageId: uploadedImageId });

        await uploadWithPresignedUrl(
          file,
          presigned.presignedUrl,
          (progress) => {
            setPhotoState(photoId, { progress });
          },
        );

        await confirmUpload.mutateAsync({
          imageId: uploadedImageId,
          galleryId: ensuredGalleryId,
        });

        setPhotoState(photoId, {
          status: "complete",
          progress: 100,
          errorMessage: null,
        });
      } catch (error) {
        if (uploadedImageId && ensuredGalleryId) {
          await failUpload
            .mutateAsync({
              imageId: uploadedImageId,
              galleryId: ensuredGalleryId,
            })
            .catch(() => undefined);
        }

        const message =
          error instanceof Error ? error.message : "Upload failed";
        setPhotoState(photoId, {
          status: "error",
          errorMessage: message,
        });
        toast.error(`${file.name}: ${message}`);
      }
    },
    [confirmUpload, ensureGallery, failUpload, requestPresign, setPhotoState],
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) {
        return;
      }

      const incoming = Array.from(files).map<UploadedPhoto>((file) => ({
        id: crypto.randomUUID(),
        imageId: null,
        file,
        preview: URL.createObjectURL(file),
        progress: 0,
        status: "uploading",
        errorMessage: null,
      }));

      setPhotos((previous) => [...previous, ...incoming]);

      if (!coverPhotoId && incoming.length > 0) {
        setCoverPhotoId(incoming[0]?.id ?? null);
      }

      for (const photo of incoming) {
        void uploadPhoto(photo.id, photo.file);
      }
    },
    [coverPhotoId, uploadPhoto],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const removePhoto = async (photoId: string) => {
    const target = photos.find((photo) => photo.id === photoId);
    if (!target) return;

    setPhotos((previous) => previous.filter((photo) => photo.id !== photoId));

    if (coverPhotoId === photoId) {
      const next = photos.find((photo) => photo.id !== photoId);
      setCoverPhotoId(next?.id ?? null);
    }

    URL.revokeObjectURL(target.preview);

    if (target.imageId) {
      await api.delete(`/images/${target.imageId}`).catch(() => undefined);
    }
  };

  const totalSize = useMemo(
    () => photos.reduce((sum, photo) => sum + photo.file.size, 0),
    [photos],
  );
  const allUploaded =
    photos.length > 0 && photos.every((photo) => photo.status === "complete");

  const handleCreate = async () => {
    setCreating(true);

    try {
      const ensuredGalleryId = await ensureGallery();
      const coverImageId =
        photos.find((photo) => photo.id === coverPhotoId)?.imageId ?? null;

      if (coverImageId) {
        await api.patch(`/galleries/${ensuredGalleryId}`, { coverImageId });
      }

      toast.success("Gallery created");
      router.push(`/galleries/${ensuredGalleryId}`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create gallery";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl py-2 font-sans animate-fade-up">
      <div className="mb-4 flex items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-poof-mist/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className={cn(
                "h-1 w-8 rounded-full transition-colors",
                index <= step ? "bg-poof-accent" : "bg-white/10",
              )}
            />
          ))}
        </div>

        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs text-poof-mist/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>

      <div className="rounded-xl border border-white/6 bg-[#111] p-4 sm:p-6">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-poof-mist/45">
                Step 1 of 3
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-white">
                Name your gallery
              </h1>
              <p className="mt-1 text-sm text-poof-mist/75">
                Keep it short and memorable.
              </p>
            </div>

            <div className="space-y-2">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 60))}
                placeholder="Gallery name"
                className="h-11 rounded-md border-white/8 bg-white/3 text-sm text-white placeholder:text-poof-mist/35"
                autoFocus
              />
              <p className="text-xs text-poof-mist/55">{name.length}/60</p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="h-8 bg-poof-accent px-4 text-xs text-white hover:bg-poof-accent/90"
              >
                Continue
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-poof-mist/45">
                Step 2 of 3
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Add photos
              </h2>
              <p className="mt-1 text-sm text-poof-mist/75">
                Drag, drop, or click to select files.
              </p>
            </div>

            <div
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              className={cn(
                "relative rounded-lg border border-dashed p-8 text-center transition-colors",
                dragOver
                  ? "border-poof-accent/60 bg-poof-accent/10"
                  : "border-white/10 bg-white/[0.02] hover:border-white/20",
              )}
            >
              <input
                type="file"
                accept={SUPPORTED_IMAGE_MIME_TYPES.join(",")}
                multiple
                onChange={(event) => handleFiles(event.target.files)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <Upload
                className={cn(
                  "mx-auto mb-3 h-10 w-10",
                  dragOver ? "text-poof-accent" : "text-poof-mist/70",
                )}
              />
              <p className="text-sm font-medium text-white">
                Drop photos here or click to browse
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
                {acceptedFormats.map((format) => (
                  <span
                    key={format}
                    className="rounded-md border border-white/8 bg-white/4 px-2 py-0.5 text-[11px] text-poof-mist/70"
                  >
                    {format}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-xs text-poof-mist/60">
                Max {formatBytes(MAX_FILE_SIZE_BYTES)} per file · Max{" "}
                {MAX_IMAGES_PER_GALLERY} images
              </p>
            </div>

            {photos.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-poof-mist/75">
                    {photos.length} photo{photos.length === 1 ? "" : "s"} ·{" "}
                    {formatBytes(totalSize)}
                  </p>
                  <button
                    onClick={() =>
                      document
                        .querySelector<HTMLInputElement>('input[type="file"]')
                        ?.click()
                    }
                    className="rounded-md px-2 py-1 text-xs text-poof-violet transition-colors hover:bg-poof-violet/10"
                  >
                    Add more
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative aspect-square overflow-hidden rounded-md border border-white/8 bg-black/40"
                    >
                      <img
                        src={photo.preview}
                        alt={photo.file.name}
                        className="h-full w-full object-cover"
                      />

                      {photo.status === "uploading" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/65">
                          <svg className="h-9 w-9" viewBox="0 0 36 36">
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="rgba(255,255,255,0.2)"
                              strokeWidth="2"
                            />
                            <circle
                              cx="18"
                              cy="18"
                              r="16"
                              fill="none"
                              stroke="#7c5cfc"
                              strokeWidth="2"
                              strokeDasharray={100}
                              strokeDashoffset={100 - photo.progress}
                              strokeLinecap="round"
                              transform="rotate(-90 18 18)"
                              className="transition-all duration-200"
                            />
                          </svg>
                        </div>
                      )}

                      {photo.status === "complete" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          <Check className="h-5 w-5 text-poof-mint" />
                        </div>
                      )}

                      {photo.status === "error" && (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        </div>
                      )}

                      <button
                        onClick={() => void removePhoto(photo.id)}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="h-8 text-xs text-poof-mist hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                onClick={() => setStep(3)}
                disabled={!allUploaded}
                className="h-8 bg-poof-accent px-4 text-xs text-white hover:bg-poof-accent/90"
              >
                Continue
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-poof-mist/45">
                Step 3 of 3
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-white">
                Pick a cover photo
              </h2>
              <p className="mt-1 text-sm text-poof-mist/75">
                This image appears as your gallery card preview.
              </p>
            </div>

            <div className="flex snap-x gap-2 overflow-x-auto pb-2">
              {photos.map((photo) => (
                <button
                  key={photo.id}
                  onClick={() => setCoverPhotoId(photo.id)}
                  className={cn(
                    "relative h-24 w-24 shrink-0 snap-start overflow-hidden rounded-md border transition-all",
                    coverPhotoId === photo.id
                      ? "border-poof-violet ring-1 ring-poof-violet"
                      : "border-white/10 opacity-70 hover:opacity-100",
                  )}
                >
                  <img
                    src={photo.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {coverPhotoId === photo.id && (
                    <div className="absolute right-1 top-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-poof-violet">
                      <Star className="h-2.5 w-2.5 fill-white text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-white/8 bg-black/40">
              <div className="aspect-video">
                {coverPhotoId ? (
                  <img
                    src={
                      photos.find((photo) => photo.id === coverPhotoId)
                        ?.preview
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-linear-to-br from-white/5 to-white/2" />
                )}
              </div>
              <div className="border-t border-white/8 px-3 py-2.5">
                <h3 className="truncate text-sm font-medium text-white">{name}</h3>
                <p className="text-xs text-poof-mist/70">
                  {photos.length} photos
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                variant="ghost"
                onClick={() => setStep(2)}
                className="h-8 text-xs text-poof-mist hover:bg-white/5 hover:text-white"
              >
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                onClick={() => void handleCreate()}
                disabled={creating}
                className="h-8 bg-poof-accent px-4 text-xs text-white hover:bg-poof-accent/90"
              >
                {creating ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create gallery
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
