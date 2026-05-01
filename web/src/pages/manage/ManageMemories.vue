<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useMemoryStore } from '@/stores/memory'
import { useCityStore } from '@/stores/city'
import type { Memory, MemoryBlock, ThemeType } from '@/types'

const memoryStore = useMemoryStore()
const cityStore = useCityStore()
const showEditor = ref(false)
const editingMemory = ref<Partial<Memory> | null>(null)

onMounted(async () => {
  await memoryStore.fetchMemories()
  await cityStore.fetchCities()
})

function openCreate() {
  editingMemory.value = { title: '', summary: '', cityId: '', theme: 'romantic_dreamy', status: 'draft', visibility: 'private', blocks: [], tags: [] }
  showEditor.value = true
}

function openEdit(memory: Memory) {
  editingMemory.value = { ...memory, blocks: memory.blocks.map(b => ({ ...b })) }
  showEditor.value = true
}

function addBlock(type: MemoryBlock['type']) {
  if (!editingMemory.value) return
  if (!editingMemory.value.blocks) editingMemory.value.blocks = []
  editingMemory.value.blocks.push({
    id: `block-${Date.now()}`, type, content: '', sortOrder: editingMemory.value.blocks.length + 1,
  })
}

function removeBlock(idx: number) {
  editingMemory.value?.blocks?.splice(idx, 1)
}

async function handleSave() {
  if (!editingMemory.value) return
  const city = cityStore.cities.find(c => c.id === editingMemory.value!.cityId)
  if (city) editingMemory.value.cityName = city.name
  if (editingMemory.value.id) {
    await memoryStore.updateMemory(editingMemory.value.id, editingMemory.value)
  } else {
    await memoryStore.createMemory(editingMemory.value)
  }
  showEditor.value = false
}

async function handleDelete(id: string) {
  if (confirm('确定删除？')) await memoryStore.deleteMemory(id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">📸 回忆管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">+ 新增回忆</button>
    </div>

    <div class="space-y-3">
      <div v-for="m in memoryStore.memories" :key="m.id" class="glass-card rounded-xl p-4 flex items-center gap-4">
        <img :src="m.coverImage || 'https://picsum.photos/seed/m/80/80'" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">{{ m.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ m.cityName }} · {{ m.blocks.length }} 个内容块 · {{ m.theme === 'romantic_dreamy' ? '浪漫梦幻' : '旅行杂志' }}</p>
        </div>
        <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', m.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
          {{ m.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <div class="flex gap-2">
          <button @click="openEdit(m)" class="text-xs text-primary hover:underline">编辑</button>
          <button @click="handleDelete(m.id)" class="text-xs text-destructive hover:underline">删除</button>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditor && editingMemory" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="showEditor = false">
          <div class="w-full max-w-2xl glass-card rounded-2xl p-6 max-h-[85vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">{{ editingMemory.id ? '编辑回忆' : '新增回忆' }}</h2>
            <form @submit.prevent="handleSave" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">标题</label>
                <input v-model="editingMemory.title" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">摘要</label>
                <input v-model="editingMemory.summary" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">城市</label>
                  <select v-model="editingMemory.cityId" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="">选择城市</option>
                    <option v-for="c in cityStore.cities" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">主题</label>
                  <select v-model="editingMemory.theme" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="romantic_dreamy">浪漫梦幻</option>
                    <option value="travel_magazine">旅行杂志</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">封面图 URL</label>
                <input v-model="editingMemory.coverImage" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>

              <!-- Blocks -->
              <div>
                <label class="block text-sm font-medium mb-2">内容块</label>
                <div class="space-y-3">
                  <div v-for="(block, idx) in editingMemory.blocks" :key="block.id" class="p-3 rounded-lg border border-border bg-background/30">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-xs font-medium text-muted-foreground uppercase">{{ block.type }}</span>
                      <button type="button" @click="removeBlock(idx)" class="text-xs text-destructive hover:underline">删除</button>
                    </div>
                    <textarea v-if="block.type === 'text'" v-model="block.content" rows="3" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" placeholder="文字内容..." />
                    <input v-else-if="block.type === 'image'" v-model="block.mediaUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" placeholder="图片 URL" />
                    <input v-else-if="block.type === 'video'" v-model="block.mediaUrl" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" placeholder="视频 URL" />
                  </div>
                </div>
                <div class="flex gap-2 mt-3">
                  <button type="button" @click="addBlock('text')" class="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">+ 文字</button>
                  <button type="button" @click="addBlock('image')" class="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">+ 图片</button>
                  <button type="button" @click="addBlock('video')" class="px-3 py-1.5 text-xs rounded-lg border border-border hover:bg-muted">+ 视频</button>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">状态</label>
                  <select v-model="editingMemory.status" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">可见性</label>
                  <select v-model="editingMemory.visibility" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="private">私密</option>
                    <option value="shared">已分享</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="showEditor = false" class="px-4 py-2 rounded-lg border border-border text-sm">取消</button>
                <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">保存</button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
