import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Memory, ContentStatus } from '@/types'
import { memoryService } from '@/api/mock/service'

export const useMemoryStore = defineStore('memory', () => {
  const memories = ref<Memory[]>([])
  const selectedMemory = ref<Memory | null>(null)
  const loading = ref(false)

  const publishedMemories = computed(() => memories.value.filter(m => m.status === 'published' && !m.deletedAt))
  const sharedMemories = computed(() => memories.value.filter(m => m.visibility === 'shared' && m.status === 'published' && !m.deletedAt))

  async function fetchMemories(params?: { status?: ContentStatus; cityId?: string; tripId?: string }) {
    loading.value = true
    try {
      const res = await memoryService.list(params)
      memories.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchMemoryById(id: string) {
    loading.value = true
    try {
      selectedMemory.value = await memoryService.getById(id)
      return selectedMemory.value
    } finally {
      loading.value = false
    }
  }

  function getMemoriesByCityId(cityId: string) {
    return memories.value.filter(m => m.cityId === cityId && !m.deletedAt)
  }

  function getMemoriesByTripId(tripId: string) {
    return memories.value.filter(m => m.tripId === tripId && !m.deletedAt)
  }

  async function createMemory(data: Partial<Memory>) {
    const memory = await memoryService.create(data)
    memories.value.push(memory)
    return memory
  }

  async function updateMemory(id: string, data: Partial<Memory>) {
    const memory = await memoryService.update(id, data)
    const idx = memories.value.findIndex(m => m.id === id)
    if (idx !== -1) memories.value[idx] = memory
    return memory
  }

  async function deleteMemory(id: string) {
    await memoryService.delete(id)
    const memory = memories.value.find(m => m.id === id)
    if (memory) memory.deletedAt = new Date().toISOString()
  }

  async function restoreMemory(id: string) {
    const memory = await memoryService.restore(id)
    const idx = memories.value.findIndex(m => m.id === id)
    if (idx !== -1) memories.value[idx] = memory
    return memory
  }

  return { memories, selectedMemory, loading, publishedMemories, sharedMemories, fetchMemories, fetchMemoryById, getMemoriesByCityId, getMemoriesByTripId, createMemory, updateMemory, deleteMemory, restoreMemory }
})
