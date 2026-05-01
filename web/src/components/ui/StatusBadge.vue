<script setup lang="ts">
defineProps<{ status: 'draft' | 'published' }>()
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
      status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
    ]"
  >
    {{ status === 'published' ? '已发布' : '草稿' }}
  </span>
</template>
