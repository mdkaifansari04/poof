// Mock data for Poof app
// In production, this would come from a database

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  plan: 'free' | 'creator' | 'pro'
  createdAt: Date
}

export interface Gallery {
  id: string
  name: string
  description?: string
  coverPhoto?: string
  photos: Photo[]
  createdAt: Date
  updatedAt: Date
  userId: string
}

export interface Photo {
  id: string
  url: string
  filename: string
  size: number
  width: number
  height: number
  uploadedAt: Date
  galleryId: string
}

export interface ShareLink {
  id: string
  token: string
  type: 'gallery' | 'photo'
  galleryId?: string
  photoId?: string
  expiresAt: Date | null
  viewLimit?: number
  viewCount: number
  password?: string
  allowDownload: boolean
  createdAt: Date
  status: 'active' | 'expired' | 'revoked'
}

export interface Activity {
  id: string
  type: 'upload' | 'share' | 'expire' | 'milestone'
  message: string
  createdAt: Date
  galleryId?: string
  linkId?: string
}

export interface Notification {
  id: string
  type: 'expired' | 'expiring' | 'milestone' | 'storage'
  message: string
  read: boolean
  createdAt: Date
}

// Mock user
export const mockUser: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex@example.com',
  avatar: undefined,
  plan: 'creator',
  createdAt: new Date('2024-01-15'),
}

// Mock photos
const samplePhotos: Omit<Photo, 'galleryId'>[] = [
  { id: 'photo-1', url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', filename: 'mountain-view.jpg', size: 2400000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-01') },
  { id: 'photo-2', url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800', filename: 'forest-morning.jpg', size: 1800000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-01') },
  { id: 'photo-3', url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800', filename: 'lake-reflection.jpg', size: 2100000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-02') },
  { id: 'photo-4', url: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800', filename: 'sunset-field.jpg', size: 1900000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-02') },
  { id: 'photo-5', url: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800', filename: 'ocean-waves.jpg', size: 2200000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-03') },
  { id: 'photo-6', url: 'https://images.unsplash.com/photo-1518173946687-a4c036bc3814?w=800', filename: 'desert-dunes.jpg', size: 1700000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-03') },
  { id: 'photo-7', url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800', filename: 'canyon-view.jpg', size: 2300000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-04') },
  { id: 'photo-8', url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800', filename: 'autumn-path.jpg', size: 2000000, width: 1920, height: 1280, uploadedAt: new Date('2025-03-04') },
]

// Mock galleries
export const mockGalleries: Gallery[] = [
  {
    id: 'gallery-1',
    name: 'Portfolio 2025',
    description: 'My best landscape shots from this year',
    coverPhoto: samplePhotos[0].url,
    photos: samplePhotos.slice(0, 4).map(p => ({ ...p, galleryId: 'gallery-1' })),
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-15'),
    userId: 'user-1',
  },
  {
    id: 'gallery-2',
    name: 'Client Preview',
    description: 'Wedding photoshoot selections',
    coverPhoto: samplePhotos[4].url,
    photos: samplePhotos.slice(4, 7).map(p => ({ ...p, galleryId: 'gallery-2' })),
    createdAt: new Date('2025-03-10'),
    updatedAt: new Date('2025-03-18'),
    userId: 'user-1',
  },
  {
    id: 'gallery-3',
    name: 'Nature Collection',
    description: undefined,
    coverPhoto: samplePhotos[7].url,
    photos: [{ ...samplePhotos[7], galleryId: 'gallery-3' }],
    createdAt: new Date('2025-03-15'),
    updatedAt: new Date('2025-03-20'),
    userId: 'user-1',
  },
]

// Mock share links
export const mockShareLinks: ShareLink[] = [
  {
    id: 'link-1',
    token: 'abc123',
    type: 'gallery',
    galleryId: 'gallery-1',
    expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    viewCount: 47,
    allowDownload: true,
    createdAt: new Date('2025-03-15'),
    status: 'active',
  },
  {
    id: 'link-2',
    token: 'def456',
    type: 'gallery',
    galleryId: 'gallery-2',
    expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours (expiring soon)
    viewCount: 23,
    password: 'secret123',
    allowDownload: false,
    createdAt: new Date('2025-03-18'),
    status: 'active',
  },
  {
    id: 'link-3',
    token: 'ghi789',
    type: 'photo',
    photoId: 'photo-1',
    galleryId: 'gallery-1',
    expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired yesterday
    viewCount: 156,
    allowDownload: true,
    createdAt: new Date('2025-03-10'),
    status: 'expired',
  },
  {
    id: 'link-4',
    token: 'jkl012',
    type: 'gallery',
    galleryId: 'gallery-3',
    expiresAt: null, // No expiry
    viewLimit: 100,
    viewCount: 12,
    allowDownload: true,
    createdAt: new Date('2025-03-20'),
    status: 'active',
  },
]

// Mock activity
export const mockActivities: Activity[] = [
  { id: 'act-1', type: 'upload', message: 'Uploaded 4 photos to Portfolio 2025', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), galleryId: 'gallery-1' },
  { id: 'act-2', type: 'share', message: 'Created share link for Client Preview', createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), galleryId: 'gallery-2', linkId: 'link-2' },
  { id: 'act-3', type: 'expire', message: "Link for 'Portfolio 2025' expired", createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), linkId: 'link-3' },
  { id: 'act-4', type: 'milestone', message: 'Your link got 50 views', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), linkId: 'link-1' },
]

// Mock notifications
export const mockNotifications: Notification[] = [
  { id: 'notif-1', type: 'expiring', message: "'Client Preview' link expires in 6 hours", read: false, createdAt: new Date(Date.now() - 30 * 60 * 1000) },
  { id: 'notif-2', type: 'milestone', message: "'Portfolio 2025' reached 50 views", read: false, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
  { id: 'notif-3', type: 'expired', message: "Share link for 'Portfolio 2025' has expired", read: true, createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
]

// Stats helpers
export function getStats() {
  const activeLinks = mockShareLinks.filter(l => l.status === 'active').length
  const expiredLinks = mockShareLinks.filter(l => l.status === 'expired').length
  const totalPhotos = mockGalleries.reduce((sum, g) => sum + g.photos.length, 0)
  const totalViews = mockShareLinks.reduce((sum, l) => sum + l.viewCount, 0)
  const totalStorage = mockGalleries.reduce((sum, g) => sum + g.photos.reduce((pSum, p) => pSum + p.size, 0), 0)
  const expiringToday = mockShareLinks.filter(l => {
    if (!l.expiresAt || l.status !== 'active') return false
    const diff = l.expiresAt.getTime() - Date.now()
    return diff > 0 && diff < 24 * 60 * 60 * 1000
  }).length

  return {
    totalGalleries: mockGalleries.length,
    activeGalleries: mockGalleries.length,
    totalPhotos,
    totalStorage,
    activeLinks,
    expiredLinks,
    totalViews,
    expiringToday,
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return days === 1 ? 'yesterday' : `${days} days ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}
