<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCityStore } from '@/stores/city'
import { useTripStore } from '@/stores/trip'

const cityStore = useCityStore()
const tripStore = useTripStore()

onMounted(async () => {
  await cityStore.fetchCities()
  await tripStore.fetchTrips()
})

const cities = computed(() => cityStore.publishedCities)

function getTripCount(cityId: string) {
  return tripStore.getTripsByCityId(cityId).length
}
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <div class="relative overflow-hidden py-20 md:py-28">
      <div class="absolute inset-0 bg-gradient-to-b from-pink-50 via-rose-50/50 to-transparent" />
      <div class="absolute top-10 left-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
      <div class="absolute top-20 right-1/4 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl" />
      <div class="relative max-w-5xl mx-auto px-6 text-center">
        <p class="text-5xl mb-4">🌍</p>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-3">
          城市足迹
        </h1>
        <p class="text-muted-foreground text-lg">每一座城市，都藏着我们的故事</p>
        <div class="mt-6 flex items-center justify-center gap-2">
          <span class="px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-sm font-medium">
            共到访 {{ cities.length }} 座城市
          </span>
        </div>
      </div>
    </div>

    <!-- Cities Grid -->
    <div class="max-w-6xl mx-auto px-6 pb-20">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link
          v-for="(city, idx) in cities"
          :key="city.id"
          :to="`/cities/${city.id}`"
          class="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
          :style="{ animationDelay: `${idx * 0.08}s` }"
        >
          <!-- Cover Image -->
          <div class="aspect-[4/3] overflow-hidden">
            <img
              :src="city.coverImage || 'https://picsum.photos/seed/city/800/600'"
              :alt="city.name"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>

          <!-- Gradient Overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <!-- Pin badge -->
          <div v-if="city.isPinned" class="absolute top-3 right-3">
            <span class="px-2 py-1 rounded-full bg-pink-500/90 text-white text-xs font-medium backdrop-blur-sm">
              💕 置顶
            </span>
          </div>

          <!-- Content -->
          <div class="absolute bottom-0 left-0 right-0 p-5">
            <div class="flex items-end justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white mb-1 drop-shadow-lg">{{ city.name }}</h3>
                <p class="text-white/70 text-sm">{{ city.country }}{{ city.province ? ` · ${city.province}` : '' }}</p>
              </div>
              <div class="text-right">
                <p class="text-white/60 text-xs">{{ city.firstVisitDate }}</p>
              </div>
            </div>
            <p v-if="city.description" class="text-white/60 text-sm mt-2 line-clamp-2">{{ city.description }}</p>
            <div class="flex items-center gap-3 mt-3">
              <span class="text-white/50 text-xs">📸 {{ city.memoryCount }} 篇回忆</span>
              <span class="text-white/50 text-xs">✈️ {{ getTripCount(city.id) }} 次旅行</span>
              <span class="text-white/50 text-xs">👁️ {{ city.visitCount }}</span>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <span v-for="tag in city.tags?.slice(0, 3)" :key="tag" class="px-2 py-0.5 rounded-full bg-white/15 text-white/70 text-xs backdrop-blur-sm">
                {{ tag }}
              </span>
            </div>
          </div>

          <!-- Hover glow -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none border-2 border-pink-400/40 rounded-2xl" />
        </router-link>
      </div>
    </div>
  </div>
</template>
