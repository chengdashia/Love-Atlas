export interface TrashItem {
  id: string
  entityType: 'city' | 'trip' | 'memory' | 'anniversary'
  entityId: string
  entityTitle: string
  deletedAt: string
}
