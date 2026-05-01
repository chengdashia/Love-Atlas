import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { VisitStats } from '@/types'
import { statsService } from '@/api/mock/service'

export const useStatsStore = defineStore('stats', () => {
  const visitStats = ref<VisitStats | null>(null)
  const loading = ref(false)

  async function fetchStats() {
    loading.value = true
    try {
      visitStats.value = await statsService.getStats()
    } finally {
      loading.value = false
    }
  }

  async function recordView(entityType: string, entityId: string) {
    await statsService.recordView(entityType, entityId)
  }

  return { visitStats, loading, fetchStats, recordView }
})
