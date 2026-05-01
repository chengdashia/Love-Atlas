export interface Share {
  id: string
  token: string
  entityType: 'city' | 'trip' | 'memory' | 'anniversary'
  entityId: string
  isActive: boolean
  createdAt: string
}
