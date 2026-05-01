import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Trip, ContentStatus } from '@/types'
import { tripService } from '@/api/mock/service'

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([])
  const selectedTrip = ref<Trip | null>(null)
  const loading = ref(false)

  const publishedTrips = computed(() => trips.value.filter(t => t.status === 'published' && !t.deletedAt))

  async function fetchTrips(params?: { status?: ContentStatus }) {
    loading.value = true
    try {
      const res = await tripService.list(params)
      trips.value = res.data
    } finally {
      loading.value = false
    }
  }

  async function fetchTripById(id: string) {
    loading.value = true
    try {
      selectedTrip.value = await tripService.getById(id)
      return selectedTrip.value
    } finally {
      loading.value = false
    }
  }

  function getTripsByCityId(cityId: string) {
    return trips.value.filter(t => t.cities.some(c => c.cityId === cityId) && !t.deletedAt)
  }

  async function createTrip(data: Partial<Trip>) {
    const trip = await tripService.create(data)
    trips.value.push(trip)
    return trip
  }

  async function updateTrip(id: string, data: Partial<Trip>) {
    const trip = await tripService.update(id, data)
    const idx = trips.value.findIndex(t => t.id === id)
    if (idx !== -1) trips.value[idx] = trip
    return trip
  }

  async function deleteTrip(id: string) {
    await tripService.delete(id)
    const trip = trips.value.find(t => t.id === id)
    if (trip) trip.deletedAt = new Date().toISOString()
  }

  async function restoreTrip(id: string) {
    const trip = await tripService.restore(id)
    const idx = trips.value.findIndex(t => t.id === id)
    if (idx !== -1) trips.value[idx] = trip
    return trip
  }

  return { trips, selectedTrip, loading, publishedTrips, fetchTrips, fetchTripById, getTripsByCityId, createTrip, updateTrip, deleteTrip, restoreTrip }
})
