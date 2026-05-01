<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = '请输入邮箱和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login(email.value, password.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    error.value = '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
    <!-- Background decorations -->
    <div class="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50/50 to-white" />
    <div class="absolute top-20 left-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
    <div class="absolute bottom-20 right-1/4 w-72 h-72 bg-rose-200/15 rounded-full blur-3xl" />

    <div class="w-full max-w-md relative">
      <!-- Logo -->
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl mb-4 heartbeat">💕</div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">
          我们的旅行记忆
        </h1>
        <p class="text-muted-foreground text-sm mt-2">登录后管理你的旅行回忆</p>
      </div>

      <!-- Login Card -->
      <div class="glass-card rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-sm font-medium mb-1.5">邮箱</label>
            <input
              v-model="email"
              type="email"
              placeholder="your@email.com"
              class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">密码</label>
            <input
              v-model="password"
              type="password"
              placeholder="输入密码"
              class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all"
            />
          </div>

          <p v-if="error" class="text-sm text-destructive text-center">{{ error }}</p>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 btn-romantic text-base disabled:opacity-50"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-muted-foreground">还没有账号？</span>
          <router-link to="/register" class="text-pink-500 hover:text-pink-600 font-medium ml-1">注册</router-link>
        </div>

        <!-- Third Party Login Placeholder -->
        <div class="mt-6 pt-6 border-t border-pink-100/50">
          <div class="divider-romantic text-xs text-muted-foreground mb-4">第三方登录</div>
          <div class="flex justify-center gap-4">
            <button class="w-11 h-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-lg hover:bg-green-100 transition-colors" disabled>
              💬
            </button>
            <button class="w-11 h-11 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg hover:bg-blue-100 transition-colors" disabled>
              G
            </button>
          </div>
          <p class="text-center text-xs text-muted-foreground/50 mt-2">即将推出</p>
        </div>
      </div>
    </div>
  </div>
</template>
