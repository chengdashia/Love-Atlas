<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import SearchDialog from './SearchDialog.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const showSearch = ref(false)
const showUserMenu = ref(false)

const navLinks = [
  { name: '首页', path: '/', icon: '🏠' },
  { name: '城市足迹', path: '/cities', icon: '🌍' },
  { name: '旅行', path: '/trips', icon: '✈️' },
  { name: '纪念日', path: '/anniversaries', icon: '💕' },
  { name: '社区', path: '/community', icon: '🌸' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

function handleLogout() {
  authStore.logout()
  showUserMenu.value = false
  router.push('/')
}
</script>

<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass border-b border-pink-100/50">
    <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <router-link to="/" class="flex items-center gap-2.5 group">
        <span class="text-2xl group-hover:scale-110 transition-transform duration-300">💕</span>
        <span class="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
          我们的旅行记忆
        </span>
      </router-link>

      <!-- Nav Links -->
      <div class="hidden md:flex items-center gap-1">
        <router-link
          v-for="link in navLinks"
          :key="link.path"
          :to="link.path"
          class="relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
          :class="isActive(link.path)
            ? 'text-pink-600 bg-pink-50'
            : 'text-foreground/60 hover:text-pink-500 hover:bg-pink-50/50'"
        >
          <span class="mr-1.5">{{ link.icon }}</span>
          {{ link.name }}
          <div v-if="isActive(link.path)" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-pink-400 rounded-full" />
        </router-link>
      </div>

      <!-- Right Actions -->
      <div class="flex items-center gap-3">
        <!-- Search -->
        <button
          v-if="authStore.isAuthenticated"
          class="p-2.5 rounded-full hover:bg-pink-50 transition-colors text-foreground/50 hover:text-pink-500"
          @click="showSearch = true"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- User Menu -->
        <div v-if="authStore.isAuthenticated" class="relative">
          <button
            class="flex items-center gap-2 p-1 rounded-full hover:bg-pink-50 transition-colors"
            @click="showUserMenu = !showUserMenu"
          >
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-sm font-bold text-white shadow-md">
              {{ authStore.user?.nickname?.[0] || '?' }}
            </div>
          </button>

          <!-- Dropdown -->
          <Transition name="fade">
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-12 w-52 glass-card rounded-xl shadow-xl py-2 z-50 overflow-hidden"
            >
              <div class="px-4 py-3 border-b border-pink-100/50">
                <p class="text-sm font-medium">{{ authStore.user?.nickname }}</p>
                <p class="text-xs text-muted-foreground">{{ authStore.user?.email }}</p>
              </div>
              <router-link
                to="/manage"
                class="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-pink-50 transition-colors"
                @click="showUserMenu = false"
              >
                <span>📝</span> 管理内容
              </router-link>
              <button
                class="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-pink-50 transition-colors text-destructive"
                @click="handleLogout"
              >
                <span>🚪</span> 退出登录
              </button>
            </div>
          </Transition>
        </div>

        <!-- Login Button -->
        <router-link
          v-else
          to="/login"
          class="btn-romantic text-sm !py-2 !px-5"
        >
          登录
        </router-link>
      </div>
    </div>
  </nav>

  <!-- Click outside to close menu -->
  <div v-if="showUserMenu" class="fixed inset-0 z-40" @click="showUserMenu = false" />

  <!-- Search Dialog -->
  <SearchDialog v-model:open="showSearch" />
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
