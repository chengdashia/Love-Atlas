<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCityStore } from '@/stores/city'
import { useMemoryStore } from '@/stores/memory'
import MemoryCard from '@/components/memory/MemoryCard.vue'

const route = useRoute()
const cityStore = useCityStore()
const memoryStore = useMemoryStore()
const cityId = computed(() => route.params.cityId as string)

onMounted(async () => {
  await cityStore.fetchCityById(cityId.value)
  await memoryStore.fetchMemories({ cityId: cityId.value })
})

const city = computed(() => cityStore.selectedCity)
const memories = computed(() => memoryStore.getMemoriesByCityId(cityId.value))
</script>

<template>
  <div v-if="city" class="min-h-screen">
    <!-- Hero -->
    <div class="relative h-[50vh] overflow-hidden">
      <img
        :src="city.coverImage || 'https://picsum.photos/seed/city/1920/800'"
        :alt="city.name"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

      <!-- City Info -->
      <div class="absolute bottom-0 left-0 right-0 p-8">
        <div class="max-w-4xl mx-auto">
          <div class="flex items-center gap-4 mb-3">
            <div class="relative">
              <span class="text-5xl">📍</span>
              <div class="absolute -inset-2 bg-pink-500/20 rounded-full blur-lg" />
            </div>
            <div>
              <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl">{{ city.name }}</h1>
              <p class="text-white/60 text-lg mt-1">{{ city.country }}{{ city.province ? ` · ${city.province}` : '' }}</p>
            </div>
          </div>
          <p v-if="city.description" class="text-white/70 text-lg mt-3 max-w-2xl leading-relaxed">{{ city.description }}</p>
          <div class="flex items-center gap-5 mt-5 text-sm text-white/50">
            <span v-if="city.firstVisitDate" class="flex items-center gap-1.5">🗓️ 首次到访: {{ city.firstVisitDate }}</span>
            <span class="flex items-center gap-1.5">📸 {{ memories.length }} 篇回忆</span>
            <span class="flex items-center gap-1.5">👁️ {{ city.visitCount }} 次浏览</span>
          </div>
          <div class="flex flex-wrap gap-2 mt-4">
            <span v-for="tag in city.tags" :key="tag" class="px-3 py-1 bg-white/15 text-white/80 text-xs rounded-full backdrop-blur-sm border border-white/10">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Memories -->
    <div class="max-w-4xl mx-auto px-6 py-16">
      <div class="flex items-center gap-3 mb-8">
        <span class="text-2xl">📸</span>
        <h2 class="text-2xl font-bold">这座城市的故事</h2>
        <div class="flex-1 h-px bg-gradient-to-r from-pink-200 to-transparent ml-3" />
      </div>
      <div v-if="memories.length" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MemoryCard v-for="memory in memories" :key="memory.id" :memory="memory" />
      </div>
      <div v-else class="text-center py-20 text-muted-foreground">
        <p class="text-5xl mb-4">📭</p>
        <p class="text-lg">这座城市还没有回忆</p>
        <p class="text-sm mt-1 text-muted-foreground/60">去管理内容中添加新的回忆吧</p>
      </div>
    </div>
  </div>

  <!-- Loading -->
  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="text-5xl heartbeat mb-4">💕</div>
      <p class="text-muted-foreground">加载中...</p>
    </div>
  </div>
</template>
