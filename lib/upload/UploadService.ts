export interface PresignedUrlResult {
  presignedUrl: string
  r2Key: string
  publicUrl: string
}

export interface DeleteResult {
  success: boolean
}

export abstract class UploadService {
  abstract getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn?: number,
  ): Promise<PresignedUrlResult>

  abstract getPresignedDownloadUrl(key: string, expiresIn?: number): Promise<string>

  abstract deleteObject(key: string): Promise<DeleteResult>

  abstract deleteObjects(keys: string[]): Promise<DeleteResult>
}
