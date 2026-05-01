<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShareByToken, getCityById, getMemoryById, getTripById } from '@/api/mock'
import type { City, Memory, Trip } from '@/types'

const route = useRoute()
const router = useRouter()
const token = computed(() => route.params.shareToken as string)
const entity = ref<City | Memory | Trip | null>(null)
const entityType = ref<string>('')
const notFound = ref(false)

onMounted(() => {
  const share = getShareByToken(token.value)
  if (!share) { notFound.value = true; return }

  entityType.value = share.entityType
  if (share.entityType === 'city') entity.value = getCityById(share.entityId)
  else if (share.entityType === 'memory') entity.value = getMemoryById(share.entityId)
  else if (share.entityType === 'trip') entity.value = getTripById(share.entityId)

  if (!entity.value) notFound.value = true
})
</script>

<template>
  <div class="min-h-screen">
    <!-- Not Found -->
    <div v-if="notFound" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="text-5xl mb-4">🔗</div>
        <h2 class="text-xl font-bold mb-2">内容不存在或未公开</h2>
        <p class="text-muted-foreground mb-6">该分享链接可能已过期或内容已被移除</p>
        <router-link to="/" class="px-6 py-2 bg-primary text-primary-foreground rounded-full">返回首页</router-link>
      </div>
    </div>

    <!-- City Share -->
    <div v-else-if="entityType === 'city' && entity">
      <div class="relative h-[40vh] overflow-hidden">
        <img :src="(entity as City).coverImage || 'https://picsum.photos/seed/share/1920/800'" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div class="absolute bottom-6 left-6">
          <h1 class="text-3xl font-bold text-white drop-shadow-lg">{{ (entity as City).name }}</h1>
          <p class="text-white/70">{{ (entity as City).country }}</p>
        </div>
      </div>
      <div class="max-w-2xl mx-auto px-6 py-8">
        <p class="text-muted-foreground mb-4">{{ (entity as City).description }}</p>
        <p class="text-xs text-muted-foreground">🔗 由我们的旅行记忆分享</p>
      </div>
    </div>

    <!-- Memory Share -->
    <div v-else-if="entityType === 'memory' && entity">
      <div class="relative h-[40vh] overflow-hidden">
        <img :src="(entity as Memory).coverImage || 'https://picsum.photos/seed/share/1920/800'" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div class="absolute bottom-6 left-6">
          <h1 class="text-3xl font-bold text-white drop-shadow-lg">{{ (entity as Memory).title }}</h1>
          <p class="text-white/70">{{ (entity as Memory).summary }}</p>
        </div>
      </div>
      <div class="max-w-2xl mx-auto px-6 py-8">
        <div v-for="block in (entity as Memory).blocks" :key="block.id" class="mb-6">
          <p v-if="block.type === 'text'" class="text-foreground/80 leading-relaxed">{{ block.content }}</p>
          <img v-else-if="block.type === 'image'" :src="block.mediaUrl" class="w-full rounded-xl" />
        </div>
        <p class="text-xs text-muted-foreground mt-8">🔗 由我们的旅行记忆分享</p>
      </div>
    </div>

    <!-- Trip Share -->
    <div v-else-if="entityType === 'trip' && entity">
      <div class="relative h-[40vh] overflow-hidden">
        <img :src="(entity as Trip).coverImage || 'https://picsum.photos/seed/share/1920/800'" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div class="absolute bottom-6 left-6">
          <h1 class="text-3xl font-bold text-white drop-shadow-lg">✈️ {{ (entity as Trip).title }}</h1>
          <p class="text-white/70">{{ (entity as Trip).description }}</p>
        </div>
      </div>
      <div class="max-w-2xl mx-auto px-6 py-8">
        <p class="text-muted-foreground mb-4">经过 {{ (entity as Trip).cities.length }} 座城市</p>
        <p class="text-xs text-muted-foreground">🔗 由我们的旅行记忆分享</p>
      </div>
    </div>
  </div>
</template>
