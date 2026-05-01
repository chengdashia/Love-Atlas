import type { AnniversaryType, ContentStatus, Visibility } from './common'

export interface Anniversary {
  id: string
  title: string
  date: string
  type: AnniversaryType
  description?: string
  coverImage?: string
  linkedCityId?: string
  linkedTripId?: string
  linkedMemoryId?: string
  status: ContentStatus
  visibility: Visibility
  sortOrder: number
  isRecurring: boolean
  tags: string[]
  deletedAt?: string
  createdAt: string
  updatedAt: string
}
