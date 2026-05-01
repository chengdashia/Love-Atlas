<script setup lang="ts">
import { computed } from 'vue'
import type { Memory } from '@/types'
import { formatDate } from '@/utils/date'

const props = defineProps<{ memory: Memory; showStatus?: boolean }>()

const firstTextBlock = computed(() => props.memory.blocks.find(b => b.type === 'text'))
const preview = computed(() => firstTextBlock.value?.content.slice(0, 80) || '')
</script>

<template>
  <router-link
    :to="`/memories/${memory.id}`"
    class="group block glass-card romantic-card overflow-hidden"
  >
    <!-- Cover -->
    <div class="aspect-[4/3] overflow-hidden relative">
      <img
        :src="memory.coverImage || 'https://picsum.photos/seed/default/800/600'"
        :alt="memory.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
      <div class="absolute bottom-3 left-3 right-3">
        <h3 class="text-white font-bold text-lg drop-shadow-lg line-clamp-1">{{ memory.title }}</h3>
      </div>
      <div v-if="showStatus" class="absolute top-3 right-3">
        <span
          :class="[
            'px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm',
            memory.status === 'published' ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-white'
          ]"
        >
          {{ memory.status === 'published' ? '已发布' : '草稿' }}
        </span>
      </div>
      <div class="absolute top-3 left-3">
        <span class="px-2.5 py-1 rounded-full text-xs font-medium bg-pink-500/80 text-white backdrop-blur-sm">
          {{ memory.theme === 'romantic_dreamy' ? '💕 浪漫梦幻' : '📖 旅行杂志' }}
        </span>
      </div>
    </div>

    <!-- Info -->
    <div class="p-4">
      <p v-if="preview" class="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{{ preview }}...</p>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ formatDate(memory.createdAt) }}</span>
        <span v-if="memory.cityName" class="flex items-center gap-1 text-pink-500/70">📍 {{ memory.cityName }}</span>
      </div>
    </div>
  </router-link>
</template>
