<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useTripStore } from '@/stores/trip'
import { useMemoryStore } from '@/stores/memory'
import { formatDate, formatDateRange } from '@/utils/date'
import MemoryCard from '@/components/memory/MemoryCard.vue'

const route = useRoute()
const tripStore = useTripStore()
const memoryStore = useMemoryStore()
const tripId = computed(() => route.params.tripId as string)

onMounted(async () => {
  await tripStore.fetchTripById(tripId.value)
  await memoryStore.fetchMemories({ tripId: tripId.value })
})

const trip = computed(() => tripStore.selectedTrip)
const memories = computed(() => memoryStore.getMemoriesByTripId(tripId.value))
</script>

<template>
  <div v-if="trip" class="min-h-screen">
    <!-- Hero -->
    <div class="relative h-[45vh] overflow-hidden">
      <img
        :src="trip.coverImage || 'https://picsum.photos/seed/trip/1920/800'"
        :alt="trip.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-3">✈️ {{ trip.title }}</h1>
          <p v-if="trip.description" class="text-white/70 text-lg mb-4 max-w-2xl leading-relaxed">{{ trip.description }}</p>
          <div class="flex items-center gap-5 text-sm text-white/50">
            <span class="flex items-center gap-1.5">🗓️ {{ formatDateRange(trip.startDate, trip.endDate) }}</span>
            <span class="flex items-center gap-1.5">🏙️ {{ trip.cities.length }} 座城市</span>
            <span class="flex items-center gap-1.5">📸 {{ memories.length }} 篇回忆</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <span v-for="tag in trip.tags" :key="tag" class="px-3 py-1 bg-white/15 text-white/80 text-xs rounded-full backdrop-blur-sm border border-white/10">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Route Timeline -->
    <div class="max-w-4xl mx-auto px-6 py-16">
      <div class="flex items-center gap-3 mb-10">
        <span class="text-2xl">🗺️</span>
        <h2 class="text-2xl font-bold">旅行路线</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent ml-3" />
      </div>

      <div class="relative pl-10">
        <!-- Timeline Line -->
        <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-pink-300 via-pink-200 to-pink-100" />

        <div v-for="(city, idx) in trip.cities" :key="city.cityId" class="relative mb-10 last:mb-0">
          <!-- Dot -->
          <div class="absolute -left-6 top-1.5">
            <div class="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-pink-200">
              {{ idx + 1 }}
            </div>
          </div>

          <!-- City Card -->
          <div class="glass-card romantic-card p-6 rounded-xl">
            <router-link :to="`/cities/${city.cityId}`" class="text-lg font-bold text-pink-600 hover:text-pink-500 transition-colors">
              {{ city.cityName }}
            </router-link>
            <p class="text-sm text-muted-foreground mt-1">
              {{ city.arrivalDate ? formatDate(city.arrivalDate) : '' }}
              {{ city.departureDate ? ` — ${formatDate(city.departureDate)}` : '' }}
            </p>

            <!-- Memories in this city -->
            <div v-if="memories.filter(m => m.cityId === city.cityId).length" class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <router-link
                v-for="m in memories.filter(m => m.cityId === city.cityId)"
                :key="m.id"
                :to="`/memories/${m.id}`"
                class="flex items-center gap-3 p-3 rounded-xl bg-pink-50/50 hover:bg-pink-50 transition-colors group"
              >
                <img :src="m.coverImage || 'https://picsum.photos/seed/m/100/100'" class="w-12 h-12 rounded-lg object-cover shadow-sm" />
                <div>
                  <p class="text-sm font-medium line-clamp-1 group-hover:text-pink-600 transition-colors">{{ m.title }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(m.createdAt) }}</p>
                </div>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Memories -->
    <div v-if="memories.length" class="max-w-4xl mx-auto px-6 pb-16">
      <div class="flex items-center gap-3 mb-8">
        <span class="text-2xl">📸</span>
        <h2 class="text-2xl font-bold">旅途中的回忆</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent ml-3" />
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemoryCard v-for="m in memories" :key="m.id" :memory="m" />
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="text-5xl heartbeat mb-4">✈️</div>
      <p class="text-muted-foreground">加载中...</p>
    </div>
  </div>
</template>
