import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Anniversary, ContentStatus } from '@/types'
import { anniversaryService } from '@/api/mock/service'
import { daysUntil } from '@/utils/date'

export const useAnniversaryStore = defineStore('anniversary', () => {
  const anniversaries = ref<Anniversary[]>([])
  const loading = ref(false)

  const publishedAnniversaries = computed(() => anniversaries.value.filter(a => a.status === 'published' && !a.deletedAt))
  const upcomingCountdowns = computed(() =>
    publishedAnniversaries.value
      .filter(a => daysUntil(a.date) > 0)
      .sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  )
  const pastAnniversaries = computed(() =>
    publishedAnniversaries.value
      .filter(a => daysUntil(a.date) === 0)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  )

  async function fetchAnniversaries(params?: { status?: ContentStatus }) {
    loading.value = true
    try {
      const res = await anniversaryService.list(params)
      anniversaries.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function createAnniversary(data: Partial<Anniversary>) {
    const a = await anniversaryService.create(data)
    anniversaries.value.push(a)
    return a
  }

  async function updateAnniversary(id: string, data: Partial<Anniversary>) {
    const a = await anniversaryService.update(id, data)
    const idx = anniversaries.value.findIndex(x => x.id === id)
    if (idx !== -1) anniversaries.value[idx] = a
    return a
  }

  async function deleteAnniversary(id: string) {
    await anniversaryService.delete(id)
    const a = anniversaries.value.find(x => x.id === id)
    if (a) a.deletedAt = new Date().toISOString()
  }

  async function restoreAnniversary(id: string) {
    const a = await anniversaryService.restore(id)
    const idx = anniversaries.value.findIndex(x => x.id === id)
    if (idx !== -1) anniversaries.value[idx] = a
    return a
  }

  return { anniversaries, loading, publishedAnniversaries, upcomingCountdowns, pastAnniversaries, fetchAnniversaries, createAnniversary, updateAnniversary, deleteAnniversary, restoreAnniversary }
})
