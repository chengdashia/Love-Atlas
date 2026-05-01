<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const nickname = ref('')
const inviteCode = ref('')
const loading = ref(false)
const error = ref('')

async function handleRegister() {
  if (!email.value || !password.value || !nickname.value) {
    error.value = '请填写所有必填项'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.register(email.value, password.value, nickname.value)
    router.push('/')
  } catch {
    error.value = '注册失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50/50 to-white" />
    <div class="absolute top-20 right-1/4 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
    <div class="absolute bottom-20 left-1/4 w-72 h-72 bg-rose-200/15 rounded-full blur-3xl" />

    <div class="w-full max-w-md relative">
      <div class="text-center mb-8 animate-fade-in-up">
        <div class="text-6xl mb-4 heartbeat">💕</div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent">创建账号</h1>
        <p class="text-muted-foreground text-sm mt-2">开始记录你们的旅行故事</p>
      </div>

      <div class="glass-card rounded-2xl p-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <form @submit.prevent="handleRegister" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1.5">昵称</label>
            <input v-model="nickname" type="text" placeholder="你的昵称" class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">邮箱</label>
            <input v-model="email" type="email" placeholder="your@email.com" class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">密码</label>
            <input v-model="password" type="password" placeholder="设置密码" class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">确认密码</label>
            <input v-model="confirmPassword" type="password" placeholder="再次输入密码" class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1.5">邀请码 <span class="text-muted-foreground">(可选)</span></label>
            <input v-model="inviteCode" type="text" placeholder="输入情侣邀请码" class="w-full px-4 py-3 rounded-xl border border-pink-100 bg-white/50 outline-none focus:ring-2 focus:ring-pink-300/50 focus:border-pink-300 transition-all" />
          </div>

          <p v-if="error" class="text-sm text-destructive text-center">{{ error }}</p>

          <button type="submit" :disabled="loading" class="w-full py-3 btn-romantic text-base disabled:opacity-50">
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </form>

        <div class="mt-6 text-center text-sm">
          <span class="text-muted-foreground">已有账号？</span>
          <router-link to="/login" class="text-pink-500 hover:text-pink-600 font-medium ml-1">登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
