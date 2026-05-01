<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useTagStore } from '@/stores/tag'

const tagStore = useTagStore()
const newTagName = ref('')
const newTagColor = ref('#e8507c')

onMounted(() => tagStore.fetchTags())

async function addTag() {
  if (!newTagName.value.trim()) return
  await tagStore.createTag({ name: newTagName.value.trim(), color: newTagColor.value })
  newTagName.value = ''
}

async function removeTag(id: string) {
  if (confirm('确定删除？')) await tagStore.deleteTag(id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🏷️ 标签管理</h1>
    </div>

    <!-- Add Tag -->
    <div class="glass-card rounded-xl p-4 mb-6">
      <h3 class="text-sm font-medium mb-3">新增标签</h3>
      <div class="flex gap-3">
        <input v-model="newTagName" type="text" placeholder="标签名称" class="flex-1 px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
        <input v-model="newTagColor" type="color" class="w-10 h-10 rounded-lg cursor-pointer" />
        <button @click="addTag" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">添加</button>
      </div>
    </div>

    <!-- Tag Grid -->
    <div class="flex flex-wrap gap-3">
      <div v-for="tag in tagStore.tags" :key="tag.id" class="glass-card rounded-xl px-4 py-3 flex items-center gap-3">
        <div class="w-4 h-4 rounded-full" :style="{ backgroundColor: tag.color || '#e8507c' }" />
        <span class="font-medium">{{ tag.name }}</span>
        <span class="text-xs text-muted-foreground">({{ tag.usageCount }})</span>
        <button @click="removeTag(tag.id)" class="text-xs text-destructive hover:underline ml-1">删除</button>
      </div>
    </div>
  </div>
</template>
