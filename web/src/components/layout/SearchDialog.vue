<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ 'update:open': [value: boolean] }>()
const router = useRouter()
const appStore = useAppStore()
const query = ref('')

watch(() => props.open, (v) => {
  if (v) { query.value = ''; appStore.clearSearch() }
})

watch(query, (v) => appStore.search(v))

function navigateTo(path: string) {
  router.push(path)
  emit('update:open', false)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="fixed inset-0 z-[100] bg-black/50 flex items-start justify-center pt-[20vh]" @click.self="emit('update:open', false)">
        <div class="w-full max-w-lg glass-card rounded-xl shadow-2xl overflow-hidden">
          <!-- Search Input -->
          <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
            <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              v-model="query"
              type="text"
              placeholder="搜索城市、旅行、回忆、纪念日..."
              class="flex-1 bg-transparent outline-none text-sm"
              autofocus
            />
            <kbd class="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="max-h-80 overflow-y-auto p-2" v-if="appStore.searchResults">
            <div v-if="appStore.searchResults.cities.length" class="mb-2">
              <p class="px-2 py-1 text-xs text-muted-foreground font-medium">城市</p>
              <button
                v-for="city in appStore.searchResults.cities"
                :key="city.id"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                @click="navigateTo(`/cities/${city.id}`)"
              >
                🏙️ {{ city.name }} · {{ city.country }}
              </button>
            </div>
            <div v-if="appStore.searchResults.trips.length" class="mb-2">
              <p class="px-2 py-1 text-xs text-muted-foreground font-medium">旅行</p>
              <button
                v-for="trip in appStore.searchResults.trips"
                :key="trip.id"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                @click="navigateTo(`/trips/${trip.id}`)"
              >
                ✈️ {{ trip.title }}
              </button>
            </div>
            <div v-if="appStore.searchResults.memories.length" class="mb-2">
              <p class="px-2 py-1 text-xs text-muted-foreground font-medium">回忆</p>
              <button
                v-for="memory in appStore.searchResults.memories"
                :key="memory.id"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                @click="navigateTo(`/memories/${memory.id}`)"
              >
                📸 {{ memory.title }}
              </button>
            </div>
            <div v-if="appStore.searchResults.anniversaries.length" class="mb-2">
              <p class="px-2 py-1 text-xs text-muted-foreground font-medium">纪念日</p>
              <button
                v-for="a in appStore.searchResults.anniversaries"
                :key="a.id"
                class="w-full text-left px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors text-sm"
                @click="navigateTo('/anniversaries')"
              >
                🎉 {{ a.title }}
              </button>
            </div>
            <div
              v-if="!appStore.searchResults.cities.length && !appStore.searchResults.trips.length && !appStore.searchResults.memories.length && !appStore.searchResults.anniversaries.length"
              class="py-8 text-center text-sm text-muted-foreground"
            >
              没有找到相关内容
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
