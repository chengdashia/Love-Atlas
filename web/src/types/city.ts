import type { ContentStatus, Visibility } from './common'

export interface City {
  id: string
  name: string
  country: string
  province?: string
  latitude: number
  longitude: number
  coverImage?: string
  description?: string
  status: ContentStatus
  visibility: Visibility
  isPinned: boolean
  sortOrder: number
  visitCount: number
  memoryCount: number
  firstVisitDate?: string
  tags: string[]
  deletedAt?: string
  createdAt: string
  updatedAt: string
}
