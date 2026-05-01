import type { VisitStats } from '@/types'

export const mockVisitStats: VisitStats = {
  totalViews: 1567,
  cityViews: {
    'city-1': 128,
    'city-2': 95,
    'city-3': 156,
    'city-4': 87,
    'city-5': 112,
    'city-6': 143,
    'city-7': 78,
    'city-8': 0,
    'city-9': 65,
    'city-10': 72,
  },
  memoryViews: {
    'memory-1': 89,
    'memory-2': 76,
    'memory-3': 112,
    'memory-4': 95,
    'memory-5': 68,
    'memory-6': 134,
  },
  tripViews: {
    'trip-1': 223,
    'trip-2': 184,
    'trip-3': 198,
    'trip-4': 87,
  },
  anniversaryViews: {
    'anniversary-1': 210,
    'anniversary-2': 45,
    'anniversary-3': 42,
    'anniversary-4': 89,
    'anniversary-5': 56,
  },
  shareLinkClicks: 89,
}

export const mockStats = mockVisitStats
