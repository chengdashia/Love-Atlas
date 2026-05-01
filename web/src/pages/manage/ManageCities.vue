<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useCityStore } from '@/stores/city'
import type { City } from '@/types'

const cityStore = useCityStore()
const searchQuery = ref('')
const showEditor = ref(false)
const editingCity = ref<Partial<City> | null>(null)

onMounted(() => cityStore.fetchCities())

const filteredCities = computed(() => {
  let data = cityStore.cities
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    data = data.filter(c => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q))
  }
  return data
})

function openCreate() {
  editingCity.value = { name: '', country: '', latitude: 0, longitude: 0, status: 'draft', visibility: 'private', tags: [] }
  showEditor.value = true
}

function openEdit(city: City) {
  editingCity.value = { ...city }
  showEditor.value = true
}

async function handleSave() {
  if (!editingCity.value) return
  if (editingCity.value.id) {
    await cityStore.updateCity(editingCity.value.id, editingCity.value)
  } else {
    await cityStore.createCity(editingCity.value)
  }
  showEditor.value = false
}

async function handleDelete(id: string) {
  if (confirm('确定要删除这个城市吗？')) {
    await cityStore.deleteCity(id)
  }
}

async function toggleStatus(city: City) {
  await cityStore.updateCity(city.id, { status: city.status === 'published' ? 'draft' : 'published' })
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">🏙️ 城市管理</h1>
      <button @click="openCreate" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">
        + 新增城市
      </button>
    </div>

    <!-- Search -->
    <div class="mb-4">
      <input v-model="searchQuery" type="text" placeholder="搜索城市..." class="w-full max-w-sm px-4 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
    </div>

    <!-- Table -->
    <div class="glass-card rounded-xl overflow-hidden">
      <table class="w-full">
        <thead class="bg-muted/50">
          <tr class="text-left text-sm text-muted-foreground">
            <th class="px-4 py-3">城市</th>
            <th class="px-4 py-3">国家</th>
            <th class="px-4 py-3">状态</th>
            <th class="px-4 py-3">可见性</th>
            <th class="px-4 py-3">回忆</th>
            <th class="px-4 py-3">浏览</th>
            <th class="px-4 py-3">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="city in filteredCities" :key="city.id" class="border-t border-border hover:bg-muted/30 transition-colors">
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="city.coverImage || 'https://picsum.photos/seed/c/40/40'" class="w-10 h-10 rounded-lg object-cover" />
                <span class="font-medium">{{ city.name }}</span>
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-muted-foreground">{{ city.country }}</td>
            <td class="px-4 py-3">
              <button @click="toggleStatus(city)" :class="['px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer', city.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700']">
                {{ city.status === 'published' ? '已发布' : '草稿' }}
              </button>
            </td>
            <td class="px-4 py-3 text-sm">{{ city.visibility === 'shared' ? '🔗 已分享' : '🔒 私密' }}</td>
            <td class="px-4 py-3 text-sm">{{ city.memoryCount }}</td>
            <td class="px-4 py-3 text-sm">{{ city.visitCount }}</td>
            <td class="px-4 py-3">
              <div class="flex gap-2">
                <button @click="openEdit(city)" class="text-xs text-primary hover:underline">编辑</button>
                <button @click="handleDelete(city.id)" class="text-xs text-destructive hover:underline">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Editor Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showEditor && editingCity" class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" @click.self="showEditor = false">
          <div class="w-full max-w-lg glass-card rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
            <h2 class="text-xl font-bold mb-4">{{ editingCity.id ? '编辑城市' : '新增城市' }}</h2>
            <form @submit.prevent="handleSave" class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-1">城市名称</label>
                <input v-model="editingCity.name" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">国家</label>
                <input v-model="editingCity.country" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">纬度</label>
                  <input v-model.number="editingCity.latitude" type="number" step="any" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">经度</label>
                  <input v-model.number="editingCity.longitude" type="number" step="any" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">描述</label>
                <textarea v-model="editingCity.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">封面图 URL</label>
                <input v-model="editingCity.coverImage" type="text" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none focus:ring-2 focus:ring-primary/30 text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1">状态</label>
                  <select v-model="editingCity.status" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="draft">草稿</option>
                    <option value="published">已发布</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1">可见性</label>
                  <select v-model="editingCity.visibility" class="w-full px-3 py-2 rounded-lg border border-border bg-background/50 outline-none text-sm">
                    <option value="private">私密</option>
                    <option value="shared">已分享</option>
                  </select>
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-2">
                <button type="button" @click="showEditor = false" class="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">取消</button>
                <button type="submit" class="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:opacity-90">保存</button>
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
