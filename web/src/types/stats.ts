export interface VisitStats {
  totalViews: number
  cityViews: Record<string, number>
  memoryViews: Record<string, number>
  tripViews: Record<string, number>
  anniversaryViews: Record<string, number>
  shareLinkClicks: number
}
