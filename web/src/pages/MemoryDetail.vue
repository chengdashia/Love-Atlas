<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMemoryStore } from '@/stores/memory'
import { formatDate } from '@/utils/date'

const route = useRoute()
const memoryStore = useMemoryStore()
const memoryId = computed(() => route.params.memoryId as string)

onMounted(async () => {
  await memoryStore.fetchMemoryById(memoryId.value)
})

const memory = computed(() => memoryStore.selectedMemory)
const isRomantic = computed(() => memory.value?.theme === 'romantic_dreamy')
</script>

<template>
  <div v-if="memory" class="min-h-screen">
    <!-- Hero -->
    <div class="relative h-[50vh] overflow-hidden">
      <img
        :src="memory.coverImage || 'https://picsum.photos/seed/mem/1920/800'"
        :alt="memory.title"
        class="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center gap-2 mb-3">
            <span class="px-3 py-1 rounded-full text-xs font-medium bg-pink-500/80 text-white backdrop-blur-sm">
              {{ memory.theme === 'romantic_dreamy' ? '💕 浪漫梦幻' : '📖 旅行杂志' }}
            </span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-3">{{ memory.title }}</h1>
          <p v-if="memory.summary" class="text-white/70 text-lg mb-4 leading-relaxed">{{ memory.summary }}</p>
          <div class="flex flex-wrap items-center gap-4 text-sm text-white/50">
            <router-link v-if="memory.cityId" :to="`/cities/${memory.cityId}`" class="hover:text-white transition-colors flex items-center gap-1">
              📍 {{ memory.cityName }}
            </router-link>
            <router-link v-if="memory.tripId" :to="`/trips/${memory.tripId}`" class="hover:text-white transition-colors flex items-center gap-1">
              ✈️ {{ memory.tripTitle }}
            </router-link>
            <span class="flex items-center gap-1">🗓️ {{ formatDate(memory.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Content Blocks -->
    <div class="max-w-3xl mx-auto px-6 py-16">
      <div class="space-y-10">
        <div
          v-for="(block, idx) in memory.blocks"
          :key="block.id"
          class="animate-fade-in-up"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <!-- Text Block -->
          <div v-if="block.type === 'text'" class="relative">
            <p
              :class="[
                'text-lg leading-loose',
                isRomantic ? 'font-serif text-foreground/90' : 'text-foreground/80'
              ]"
            >
              {{ block.content }}
            </p>
            <div v-if="block.weather || block.moodEmoji || block.occurredAt" class="flex items-center gap-3 mt-4 text-sm text-muted-foreground">
              <span v-if="block.moodEmoji" class="text-lg">{{ block.moodEmoji }}</span>
              <span v-if="block.weather" class="flex items-center gap-1">🌤️ {{ block.weather }}</span>
              <span v-if="block.occurredAt">{{ formatDate(block.occurredAt) }}</span>
            </div>
          </div>

          <!-- Image Block -->
          <div v-else-if="block.type === 'image'" class="rounded-2xl overflow-hidden shadow-lg">
            <img
              :src="block.mediaUrl"
              :alt="block.content"
              class="w-full h-auto"
              loading="lazy"
            />
            <p v-if="block.content" class="text-sm text-center text-muted-foreground py-4 bg-pink-50/50">{{ block.content }}</p>
          </div>

          <!-- Video Block -->
          <div v-else-if="block.type === 'video'" class="rounded-2xl overflow-hidden shadow-lg">
            <video
              :src="block.mediaUrl"
              controls
              class="w-full"
              :poster="block.mediaThumbnail"
            />
            <p v-if="block.content" class="text-sm text-center text-muted-foreground py-4 bg-pink-50/50">{{ block.content }}</p>
          </div>

          <!-- Audio Placeholder -->
          <div v-else-if="block.type === 'audio_placeholder'" class="glass-card rounded-2xl p-8 text-center">
            <div class="text-4xl mb-3">🎤</div>
            <p class="text-muted-foreground">语音留言</p>
            <p class="text-xs text-muted-foreground/50 mt-1">即将推出</p>
          </div>

          <!-- BGM Placeholder -->
          <div v-else-if="block.type === 'bgm_placeholder'" class="glass-card rounded-2xl p-8 text-center">
            <div class="text-4xl mb-3">🎵</div>
            <p class="text-muted-foreground">背景音乐</p>
            <p class="text-xs text-muted-foreground/50 mt-1">即将推出</p>
          </div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="memory.tags.length" class="mt-16 pt-8 border-t border-pink-100">
        <div class="flex flex-wrap gap-2">
          <span v-for="tag in memory.tags" :key="tag" class="px-3 py-1.5 bg-pink-50 text-pink-600 text-sm rounded-full">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <div class="text-5xl heartbeat mb-4">📸</div>
      <p class="text-muted-foreground">加载中...</p>
    </div>
  </div>
</template>
