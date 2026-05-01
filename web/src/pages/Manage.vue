<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const menuItems = [
  { name: '城市管理', path: '/manage', icon: '🏙️' },
  { name: '旅行管理', path: '/manage/trips', icon: '✈️' },
  { name: '回忆管理', path: '/manage/memories', icon: '📸' },
  { name: '纪念日管理', path: '/manage/anniversaries', icon: '🎉' },
  { name: '标签管理', path: '/manage/tags', icon: '🏷️' },
  { name: '回收站', path: '/manage/trash', icon: '🗑️' },
]
</script>

<template>
  <div class="max-w-7xl mx-auto px-6 py-8">
    <div class="flex gap-8">
      <!-- Sidebar -->
      <aside class="w-48 flex-shrink-0">
        <h2 class="text-lg font-bold mb-4">📝 内容管理</h2>
        <nav class="space-y-1">
          <router-link
            v-for="item in menuItems"
            :key="item.path"
            :to="item.path"
            class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            :class="route.path === item.path ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground/70'"
          >
            <span>{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content -->
      <main class="flex-1 min-w-0">
        <RouterView />
      </main>
    </div>
  </div>
</template>
