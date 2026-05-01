import type { Share } from '@/types'

export const mockShares: Share[] = [
  { id: 'share-1', token: 'tokyo-love-2023', entityType: 'city', entityId: 'city-1', isActive: true, createdAt: '2023-03-25T00:00:00Z' },
  { id: 'share-2', token: 'paris-romance', entityType: 'city', entityId: 'city-3', isActive: true, createdAt: '2023-06-20T00:00:00Z' },
  { id: 'share-3', token: 'maldives-stars', entityType: 'memory', entityId: 'memory-6', isActive: true, createdAt: '2024-02-20T00:00:00Z' },
  { id: 'share-4', token: 'japan-honeymoon', entityType: 'trip', entityId: 'trip-1', isActive: true, createdAt: '2023-04-01T00:00:00Z' },
]
