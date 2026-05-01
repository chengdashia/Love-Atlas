<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTripStore } from '@/stores/trip'
import { formatDateRange } from '@/utils/date'

const tripStore = useTripStore()

onMounted(async () => {
  await tripStore.fetchTrips()
})

const trips = computed(() => tripStore.publishedTrips)

function getDuration(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const days = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24))
  return days
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <div class="relative overflow-hidden py-20 md:py-28">
      <div class="absolute inset-0 bg-gradient-to-b from-pink-50 via-rose-50/50 to-transparent" />
      <div class="absolute top-10 right-1/3 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
      <div class="absolute top-20 left-1/3 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl" />
      <div class="relative max-w-5xl mx-auto px-6 text-center">
        <p class="text-5xl mb-4">✈️</p>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-3">
          旅行记忆
        </h1>
        <p class="text-muted-foreground text-lg">每一次出发，都是爱的冒险</p>
        <div class="mt-6 flex items-center justify-center gap-2">
          <span class="px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-sm font-medium">
            共 {{ trips.length }} 次旅行
          </span>
        </div>
      </div>
    </div>

    <!-- Trips List -->
    <div class="max-w-5xl mx-auto px-6 pb-20 space-y-8">
      <router-link
        v-for="(trip, idx) in trips"
        :key="trip.id"
        :to="`/trips/${trip.id}`"
        class="group block"
      >
        <div class="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <!-- Cover -->
          <div class="aspect-[21/9] overflow-hidden">
            <img
              :src="trip.coverImage || 'https://picsum.photos/seed/trip/1200/600'"
              :alt="trip.title"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          <!-- Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          <!-- Pin -->
          <div v-if="trip.isPinned" class="absolute top-4 right-4">
            <span class="px-3 py-1 rounded-full bg-pink-500/90 text-white text-xs font-medium backdrop-blur-sm">
              💕 置顶
            </span>
          </div>

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <h2 class="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg group-hover:text-pink-200 transition-colors">
                  ✈️ {{ trip.title }}
                </h2>
                <p v-if="trip.description" class="text-white/70 text-sm md:text-base line-clamp-2 max-w-xl">
                  {{ trip.description }}
                </p>
              </div>
              <div class="flex items-center gap-4 text-white/60 text-sm flex-shrink-0">
                <span class="flex items-center gap-1">🗓️ {{ formatDateRange(trip.startDate, trip.endDate) }}</span>
                <span class="px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-sm">
                  {{ getDuration(trip.startDate, trip.endDate) }} 天
                </span>
              </div>
            </div>

            <!-- Cities row -->
            <div class="flex items-center gap-2 mt-4 overflow-x-auto">
              <span
                v-for="(city, cidx) in trip.cities"
                :key="city.cityId"
                class="flex items-center gap-1 flex-shrink-0"
              >
                <span v-if="cidx > 0" class="text-white/30 mx-1">→</span>
                <span class="px-3 py-1 rounded-full bg-white/15 text-white/80 text-sm backdrop-blur-sm">
                  {{ city.cityName }}
                </span>
              </span>
            </div>

            <div class="flex items-center gap-4 mt-3 text-xs text-white/50">
              <span>🏙️ {{ trip.cities.length }} 座城市</span>
              <span>📸 {{ trip.memoryCount }} 篇回忆</span>
              <span>👁️ {{ trip.visitCount }} 次浏览</span>
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>
