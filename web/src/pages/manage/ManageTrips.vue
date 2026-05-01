<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useTripStore } from '@/stores/trip'
import { useCityStore } from '@/stores/city'
import type { Trip } from '@/types'

const tripStore = useTripStore()
const cityStore = useCityStore()
const showEditor = ref(false)
const editingTrip = ref<Partial<Trip> | null>(null)

onMounted(async () => {
  await tripStore.fetchTrips()
  await cityStore.fetchCities()
})

function openCreate() {
  editingTrip.value = { title: '', description: '', startDate: '', endDate: '', status: 'draft', visibility: 'private', cities: [], tags: [] }
  showEditor.value = true
}

function openEdit(trip: Trip) {
  editingTrip.value = { ...trip, cities: [...trip.cities] }
  showEditor.value = true
}

async function handleSave() {
  if (!editingTrip.value) return
  if (editingTrip.value.id) {
    await tripStore.updateTrip(editingTrip.value.id, editingTrip.value)
  } else {
    await tripStore.createTrip(editingTrip.value)
  }
  showEditor.value = false
}

async function handleDelete(id: string) {
  if (confirm('确定删除？')) await tripStore.deleteTrip(id)
}

async function toggleStatus(trip: Trip) {
  await tripStore.updateTrip(trip.id, { status: trip.status === 'published' ? 'draft' : 'published' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">✈️ 旅行管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">+ 新增旅行</button>
    </div>

    <div class="space-y-3">
      <div v-for="trip in tripStore.trips" :key="trip.id" class="glass-card rounded-xl p-4 flex items-center gap-4">
        <img :src="trip.coverImage || 'https://picsum.photos/seed/t/80/80'" class="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
        <div class="flex-1 min-w-0">
          <h3 class="font-bold truncate">{{ trip.title }}</h3>
          <p class="text-sm text-muted-foreground">{{ trip.startDate }} - {{ trip.endDate }} · {{ trip.cities.length }} 城市</p>
        </div>
        <button @click="toggleStatus(trip)" :class="['px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer', trip.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
          {{ trip.status === 'published' ? '已发布' : '草稿' }}
        </button>
        <div class="flex gap-2">
          <button @click="openEdit(trip)" class="text-xs text-primary hover:underline">编辑</button>
          <button @click="handleDelete(trip.id)" class="text-xs text-destructive hover:underline">删除</button>
        </div>
      </div>
    </div>

    <!-- Editor Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditor && editingTrip" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="showEditor = false">
          <div class="w-full max-w-lg glass-card rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">{{ editingTrip.id ? '编辑旅行' : '新增旅行' }}</h2>
            <form @submit.prevent="handleSave" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">旅行标题</label>
                <input v-model="editingTrip.title" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">描述</label>
                <textarea v-model="editingTrip.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">开始日期</label>
                  <input v-model="editingTrip.startDate" type="date" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">结束日期</label>
                  <input v-model="editingTrip.endDate" type="date" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">封面图 URL</label>
                <input v-model="editingTrip.coverImage" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">状态</label>
                  <select v-model="editingTrip.status" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">可见性</label>
                  <select v-model="editingTrip.visibility" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
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
