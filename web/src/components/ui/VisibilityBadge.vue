<script setup lang="ts">
defineProps<{ visibility: 'private' | 'shared' }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      visibility === 'shared' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
    ]"
  >
    {{ visibility === 'shared' ? '🔗 已分享' : '🔒 私密' }}
  </span>
</template>
