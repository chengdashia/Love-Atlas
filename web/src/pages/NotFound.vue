<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-br from-pink-50 via-rose-50/50 to-white" />
    <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />

    <div class="text-center relative animate-fade-in-up">
      <div class="text-8xl mb-6">🌌</div>
      <h1 class="text-6xl font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent mb-3">404</h1>
      <p class="text-muted-foreground text-lg mb-8">迷路了吗？这个页面不存在</p>
      <router-link to="/" class="btn-romantic inline-flex items-center gap-2 text-base">
        🏠 返回首页
      </router-link>
    </div>
  </div>
</template>
