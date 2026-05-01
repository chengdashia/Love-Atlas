import { defineStore } from 'pinia'
import { ref } from 'vue'
import { searchAll } from '@/api/mock'

export const useAppStore = defineStore('app', () => {
  const lowPerformanceMode = ref(false)
  const sidebarOpen = ref(false)
  const searchQuery = ref('')
  const searchResults = ref<ReturnType<typeof searchAll> | null>(null)

  function toggleLowPerformanceMode() {
    lowPerformanceMode.value = !lowPerformanceMode.value
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value
  }

  function search(query: string) {
    searchQuery.value = query
    if (query.trim()) {
      searchResults.value = searchAll(query)
    } else {
      searchResults.value = null
    }
  }

  function clearSearch() {
    searchQuery.value = ''
    searchResults.value = null
  }

  return { lowPerformanceMode, sidebarOpen, searchQuery, searchResults, toggleLowPerformanceMode, toggleSidebar, search, clearSearch }
})
