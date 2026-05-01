import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, Couple } from '@/types'
import { authService } from '@/api/mock/service'
import { mockCouple } from '@/api/mock/users'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const couple = ref<Couple | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  function checkAuth() {
    const saved = localStorage.getItem('auth_token')
    const savedUser = localStorage.getItem('auth_user')
    if (saved && savedUser) {
      token.value = saved
      user.value = JSON.parse(savedUser)
      couple.value = mockCouple
    }
  }

  async function login(email: string, password: string) {
    const result = await authService.login(email, password)
    user.value = result.user
    couple.value = result.couple
    token.value = result.token
    localStorage.setItem('auth_token', result.token)
    localStorage.setItem('auth_user', JSON.stringify(result.user))
    return result
  }

  async function register(email: string, password: string, nickname: string) {
    const result = await authService.register(email, password, nickname)
    user.value = result.user
    couple.value = result.couple
    token.value = result.token
    localStorage.setItem('auth_token', result.token)
    localStorage.setItem('auth_user', JSON.stringify(result.user))
    return result
  }

  function logout() {
    user.value = null
    couple.value = null
    token.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return { user, couple, token, isAuthenticated, checkAuth, login, register, logout }
})
