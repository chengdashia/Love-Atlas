<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAnniversaryStore } from '@/stores/anniversary'
import type { Anniversary, AnniversaryType } from '@/types'
import { formatDate, getAnniversaryTypeLabel } from '@/utils/date'

const store = useAnniversaryStore()
const showEditor = ref(false)
const editing = ref<Partial<Anniversary> | null>(null)

onMounted(() => store.fetchAnniversaries())

const typeOptions: AnniversaryType[] = ['relationship', 'birthday', 'first_trip', 'holiday', 'custom']

function openCreate() {
  editing.value = { title: '', date: '', type: 'custom', status: 'draft', visibility: 'private', isRecurring: false, tags: [] }
  showEditor.value = true
}

function openEdit(a: Anniversary) {
  editing.value = { ...a }
  showEditor.value = true
}

async function handleSave() {
  if (!editing.value) return
  if (editing.value.id) {
    await store.updateAnniversary(editing.value.id, editing.value)
  } else {
    await store.createAnniversary(editing.value)
  }
  showEditor.value = false
}

async function handleDelete(id: string) {
  if (confirm('确定删除？')) await store.deleteAnniversary(id)
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🎉 纪念日管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm">+ 新增纪念日</button>
    </div>

    <div class="space-y-3">
      <div v-for="a in store.anniversaries" :key="a.id" class="glass-card rounded-xl p-4 flex items-center gap-4">
        <img :src="a.coverImage || 'https://picsum.photos/seed/a/80/80'" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">{{ a.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ formatDate(a.date) }} · {{ getAnniversaryTypeLabel(a.type) }}</p>
        </div>
        <span :class="['px-2 py-0.5 rounded-full text-xs font-medium', a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
          {{ a.status === 'published' ? '已发布' : '草稿' }}
        </span>
        <div class="flex gap-2">
          <button @click="openEdit(a)" class="text-xs text-primary hover:underline">编辑</button>
          <button @click="handleDelete(a.id)" class="text-xs text-destructive hover:underline">删除</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditor && editing" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="showEditor = false">
          <div class="w-full max-w-lg glass-card rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">{{ editing.id ? '编辑纪念日' : '新增纪念日' }}</h2>
            <form @submit.prevent="handleSave" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">标题</label>
                <input v-model="editing.title" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">日期</label>
                  <input v-model="editing.date" type="date" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">类型</label>
                  <select v-model="editing.type" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option v-for="t in typeOptions" :key="t" :value="t">{{ getAnniversaryTypeLabel(t) }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">描述</label>
                <textarea v-model="editing.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">封面图 URL</label>
                <input v-model="editing.coverImage" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">状态</label>
                  <select v-model="editing.status" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">可见性</label>
                  <select v-model="editing.visibility" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
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
