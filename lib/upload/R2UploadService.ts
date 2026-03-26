import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { DeleteResult, PresignedUrlResult, UploadService } from './UploadService'

export class R2UploadService extends UploadService {
  private client: S3Client
  private bucket: string
  private publicBaseUrl: string

  constructor() {
    super()

    this.bucket = process.env.R2_BUCKET_NAME || ''
    this.publicBaseUrl = process.env.R2_PUBLIC_URL || ''

    this.client = new S3Client({
      region: 'auto',
      endpoint: process.env.R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
  }

  private assertConfig() {
    const missing = [
      'R2_ENDPOINT',
      'R2_BUCKET_NAME',
      'R2_ACCESS_KEY_ID',
      'R2_SECRET_ACCESS_KEY',
      'R2_PUBLIC_URL',
    ].filter((key) => !process.env[key])

    if (missing.length > 0) {
      throw new Error(`Missing R2 configuration: ${missing.join(', ')}`)
    }
  }

  async getPresignedUploadUrl(
    key: string,
    mimeType: string,
    expiresIn = 300,
  ): Promise<PresignedUrlResult> {
    this.assertConfig()

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
    })

    const presignedUrl = await getSignedUrl(this.client, command, { expiresIn })

    return {
      presignedUrl,
      r2Key: key,
      publicUrl: `${this.publicBaseUrl}/${key}`,
    }
  }

  async deleteObject(key: string): Promise<DeleteResult> {
    this.assertConfig()

    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    )

    return { success: true }
  }

  async deleteObjects(keys: string[]): Promise<DeleteResult> {
    this.assertConfig()

    if (keys.length === 0) {
      return { success: true }
    }

    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
        },
      }),
    )

    return { success: true }
  }
}
