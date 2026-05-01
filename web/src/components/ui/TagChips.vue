<script setup lang="ts">
defineProps<{ tags: string[] }>()
</script>

<template>
  <div class="flex flex-wrap gap-1.5">
    <span
      v-for="tag in tags"
      :key="tag"
      class="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
    >
      {{ tag }}
    </span>
  </div>
</template>
