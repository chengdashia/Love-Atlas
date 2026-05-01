import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { City, ContentStatus } from '@/types'
import { cityService } from '@/api/mock/service'

export const useCityStore = defineStore('city', () => {
  const cities = ref<City[]>([])
  const selectedCity = ref<City | null>(null)
  const loading = ref(false)

  const publishedCities = computed(() => cities.value.filter(c => c.status === 'published' && !c.deletedAt))
  const sharedCities = computed(() => cities.value.filter(c => c.visibility === 'shared' && c.status === 'published' && !c.deletedAt))

  async function fetchCities(params?: { status?: ContentStatus; search?: string }) {
    loading.value = true
    try {
      const res = await cityService.list(params)
      cities.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchCityById(id: string) {
    loading.value = true
    try {
      selectedCity.value = await cityService.getById(id)
      return selectedCity.value
    } finally {
      loading.value = false
    }
  }

  async function createCity(data: Partial<City>) {
    const city = await cityService.create(data)
    cities.value.push(city)
    return city
  }

  async function updateCity(id: string, data: Partial<City>) {
    const city = await cityService.update(id, data)
    const idx = cities.value.findIndex(c => c.id === id)
    if (idx !== -1) cities.value[idx] = city
    return city
  }

  async function deleteCity(id: string) {
    await cityService.delete(id)
    const city = cities.value.find(c => c.id === id)
    if (city) city.deletedAt = new Date().toISOString()
  }

  async function restoreCity(id: string) {
    const city = await cityService.restore(id)
    const idx = cities.value.findIndex(c => c.id === id)
    if (idx !== -1) cities.value[idx] = city
    return city
  }

  return { cities, selectedCity, loading, publishedCities, sharedCities, fetchCities, fetchCityById, createCity, updateCity, deleteCity, restoreCity }
})
