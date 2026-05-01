<script setup lang="ts">
import { onMounted } from 'vue'
import { useTrashStore } from '@/stores/trash'
import { formatRelativeDate } from '@/utils/date'

const trashStore = useTrashStore()

onMounted(() => trashStore.fetchTrash())

const typeLabels: Record<string, string> = { city: '🏙️ 城市', trip: '✈️ 旅行', memory: '📸 回忆', anniversary: '🎉 纪念日' }

async function handleRestore(id: string) {
  await trashStore.restoreItem(id)
}

async function handleDelete(id: string) {
  if (confirm('确定永久删除？此操作不可撤销。')) {
    await trashStore.permanentlyDelete(id)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🗑️ 回收站</h1>
    </div>

    <div v-if="trashStore.trashItems.length" class="space-y-3">
      <div v-for="item in trashStore.trashItems" :key="item.id" class="glass-card rounded-xl p-4 flex items-center gap-4">
        <span class="text-lg">{{ typeLabels[item.entityType]?.split(' ')[0] || '📄' }}</span>
        <div class="flex-1 min-w-0">
          <h3 class="font-medium truncate">{{ item.entityTitle }}</h3>
          <p class="text-xs text-muted-foreground">{{ typeLabels[item.entityType]?.split(' ')[1] }} · 删除于 {{ formatRelativeDate(item.deletedAt) }}</p>
        </div>
        <div class="flex gap-2">
          <button @click="handleRestore(item.id)" class="text-xs text-primary hover:underline">恢复</button>
          <button @click="handleDelete(item.id)" class="text-xs text-destructive hover:underline">永久删除</button>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 text-muted-foreground">
      <p class="text-4xl mb-4">✨</p>
      <p>回收站是空的</p>
    </div>
  </div>
</template>
