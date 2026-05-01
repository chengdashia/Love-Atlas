<script setup lang="ts">
import { computed } from 'vue'
import type { Anniversary } from '@/types'
import { useCountdown } from '@/composables/useCountdown'
import { getAnniversaryTypeLabel } from '@/utils/date'

const props = defineProps<{ anniversary: Anniversary }>()

const { days, hours, minutes, isPast } = useCountdown(props.anniversary.date)
</script>

<template>
  <div class="glass-card rounded-2xl p-6 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-2xl">💕</span>
      <span class="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
        {{ getAnniversaryTypeLabel(anniversary.type) }}
      </span>
    </div>
    <h3 class="font-bold text-lg mb-2">{{ anniversary.title }}</h3>
    <p class="text-sm text-muted-foreground mb-4 line-clamp-2">{{ anniversary.description }}</p>
    <div v-if="!isPast" class="flex items-end gap-2">
      <div class="text-center">
        <p class="text-3xl font-bold text-primary">{{ days }}</p>
        <p class="text-xs text-muted-foreground">天</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-bold text-primary/70">{{ hours }}</p>
        <p class="text-xs text-muted-foreground">时</p>
      </div>
      <div class="text-center">
        <p class="text-xl font-bold text-primary/70">{{ minutes }}</p>
        <p class="text-xs text-muted-foreground">分</p>
      </div>
    </div>
    <div v-else class="text-sm text-muted-foreground">
      已经过去啦 💫
    </div>
  </div>
</template>
