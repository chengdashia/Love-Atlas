import type { BlockType, ContentStatus, ThemeType, Visibility } from './common'

export interface Memory {
  id: string
  title: string
  summary?: string
  coverImage?: string
  cityId: string
  cityName?: string
  tripId?: string
  tripTitle?: string
  theme: ThemeType
  blocks: MemoryBlock[]
  status: ContentStatus
  visibility: Visibility
  isPinned: boolean
  sortOrder: number
  visitCount: number
  tags: string[]
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface MemoryBlock {
  id: string
  type: BlockType
  content: string
  mediaUrl?: string
  mediaThumbnail?: string
  occurredAt?: string
  weather?: string
  moodEmoji?: string
  location?: string
  sortOrder: number
  metadata?: Record<string, unknown>
}
