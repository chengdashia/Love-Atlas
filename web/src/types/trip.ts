import type { ContentStatus, Visibility } from './common'

export interface Trip {
  id: string
  title: string
  description?: string
  coverImage?: string
  cities: TripCity[]
  startDate: string
  endDate: string
  status: ContentStatus
  visibility: Visibility
  isPinned: boolean
  sortOrder: number
  visitCount: number
  memoryCount: number
  tags: string[]
  deletedAt?: string
  createdAt: string
  updatedAt: string
}

export interface TripCity {
  cityId: string
  cityName: string
  latitude: number
  longitude: number
  arrivalDate?: string
  departureDate?: string
  sortOrder: number
}
