import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Tag } from '@/types'
import { tagService } from '@/api/mock/service'

export const useTagStore = defineStore('tag', () => {
  const tags = ref<Tag[]>([])
  const loading = ref(false)

  const popularTags = computed(() => [...tags.value].sort((a, b) => b.usageCount - a.usageCount).slice(0, 10))

  async function fetchTags() {
    loading.value = true
    try {
      tags.value = await tagService.list()
    } finally {
      loading.value = false
    }
  }

  function searchTags(query: string) {
    return tags.value.filter(t => t.name.includes(query))
  }

  async function createTag(data: Partial<Tag>) {
    const tag = await tagService.create(data)
    tags.value.push(tag)
    return tag
  }

  async function deleteTag(id: string) {
    await tagService.delete(id)
    tags.value = tags.value.filter(t => t.id !== id)
  }

  return { tags, loading, popularTags, fetchTags, searchTags, createTag, deleteTag }
})
