import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TrashItem } from '@/types'
import { trashService } from '@/api/mock/service'

export const useTrashStore = defineStore('trash', () => {
  const trashItems = ref<TrashItem[]>([])
  const loading = ref(false)

  async function fetchTrash() {
    loading.value = true
    try {
      trashItems.value = await trashService.list()
    } finally {
      loading.value = false
    }
  }

  async function restoreItem(id: string) {
    await trashService.restore(id)
    trashItems.value = trashItems.value.filter(t => t.id !== id)
  }

  async function permanentlyDelete(id: string) {
    await trashService.permanentlyDelete(id)
    trashItems.value = trashItems.value.filter(t => t.id !== id)
  }

  return { trashItems, loading, fetchTrash, restoreItem, permanentlyDelete }
})
