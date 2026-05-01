<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useAnniversaryStore } from '@/stores/anniversary'
import { formatDate, daysSince, daysUntil, getAnniversaryTypeLabel } from '@/utils/date'

const anniversaryStore = useAnniversaryStore()

onMounted(async () => {
  await anniversaryStore.fetchAnniversaries()
})

const upcoming = computed(() => anniversaryStore.upcomingCountdowns)
const all = computed(() => anniversaryStore.publishedAnniversaries)
</script>

<template>
  <div class="min-h-screen">
    <!-- Hero -->
    <div class="relative overflow-hidden py-20 md:py-28">
      <div class="absolute inset-0 bg-gradient-to-b from-pink-50 via-rose-50/50 to-transparent" />
      <div class="absolute top-10 left-1/4 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl" />
      <div class="absolute top-20 right-1/4 w-56 h-56 bg-rose-200/20 rounded-full blur-3xl" />
      <div class="relative max-w-4xl mx-auto px-6 text-center">
        <p class="text-5xl mb-4">💕</p>
        <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent mb-3">
          重要纪念日
        </h1>
        <p class="text-muted-foreground text-lg">记录我们在一起的每一天</p>
      </div>
    </div>

    <!-- Countdown Section -->
    <div v-if="upcoming.length" class="max-w-4xl mx-auto px-6 -mt-6 mb-16">
      <div class="flex items-center gap-3 mb-6">
        <span class="text-xl">⏰</span>
        <h2 class="text-xl font-bold">即将到来</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent ml-3" />
      </div>
      <div class="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory">
        <div
          v-for="a in upcoming"
          :key="a.id"
          class="snap-start flex-shrink-0 w-72 glass-card romantic-card rounded-2xl overflow-hidden"
        >
          <div class="relative h-36 overflow-hidden">
            <img
              :src="a.coverImage || 'https://picsum.photos/seed/ann/400/200'"
              :alt="a.title"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div class="absolute bottom-3 left-3 right-3">
              <h3 class="text-white font-bold text-lg drop-shadow-lg line-clamp-1">{{ a.title }}</h3>
            </div>
          </div>
          <div class="p-4 text-center">
            <p class="text-4xl font-bold text-pink-500 mb-1">{{ daysUntil(a.date) }}</p>
            <p class="text-sm text-muted-foreground">天后</p>
            <p class="text-xs text-muted-foreground mt-2">{{ formatDate(a.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- All Anniversaries -->
    <div class="max-w-4xl mx-auto px-6 pb-20">
      <div class="flex items-center gap-3 mb-8">
        <span class="text-xl">📅</span>
        <h2 class="text-xl font-bold">所有纪念日</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent ml-3" />
      </div>
      <div class="space-y-4">
        <div
          v-for="a in all"
          :key="a.id"
          class="glass-card romantic-card rounded-xl p-5 flex items-center gap-5"
        >
          <img
            :src="a.coverImage || 'https://picsum.photos/seed/ann/200/200'"
            :alt="a.title"
            class="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-md"
          />
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-bold text-lg truncate">{{ a.title }}</h3>
              <span class="px-2.5 py-0.5 text-xs rounded-full bg-pink-50 text-pink-600 font-medium">
                {{ getAnniversaryTypeLabel(a.type) }}
              </span>
            </div>
            <p class="text-sm text-muted-foreground mb-1">{{ formatDate(a.date) }}</p>
            <p v-if="a.description" class="text-sm text-muted-foreground/70 line-clamp-1">{{ a.description }}</p>
          </div>
          <div class="text-right flex-shrink-0">
            <p v-if="daysUntil(a.date) > 0" class="text-3xl font-bold text-pink-500">{{ daysUntil(a.date) }}</p>
            <p v-else class="text-3xl font-bold text-muted-foreground/50">{{ daysSince(a.date) }}</p>
            <p class="text-xs text-muted-foreground mt-0.5">{{ daysUntil(a.date) > 0 ? '天后' : '天前' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
