export type ContentStatus = 'draft' | 'published'
export type Visibility = 'private' | 'shared'
export type BlockType = 'text' | 'image' | 'video' | 'audio_placeholder' | 'bgm_placeholder'
export type AnniversaryType = 'relationship' | 'birthday' | 'first_trip' | 'holiday' | 'custom'
export type ThemeType = 'romantic_dreamy' | 'travel_magazine'

export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}
