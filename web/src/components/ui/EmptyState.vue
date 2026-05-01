<script setup lang="ts">
defineProps<{
  icon?: string
  title: string
  description?: string
  actionLabel?: string
}>()
const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div class="text-5xl mb-4">{{ icon || '📭' }}</div>
    <h3 class="text-lg font-medium mb-1">{{ title }}</h3>
    <p v-if="description" class="text-sm text-muted-foreground mb-4">{{ description }}</p>
    <button
      v-if="actionLabel"
      class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90 transition-opacity"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
