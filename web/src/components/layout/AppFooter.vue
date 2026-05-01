<script setup lang="ts">
</script>

<template>
  <footer class="border-t border-pink-100/50 bg-gradient-to-b from-transparent to-pink-50/50 py-12">
    <div class="max-w-7xl mx-auto px-6 text-center">
      <div class="text-3xl mb-3 heartbeat">💕</div>
      <h3 class="text-lg font-bold bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text text-transparent mb-1">
        我们的旅行记忆
      </h3>
      <p class="text-sm text-muted-foreground mb-6">记录我们在一起的每一段旅程</p>
      <div class="flex justify-center gap-6 text-sm text-muted-foreground">
        <router-link to="/" class="hover:text-pink-500 transition-colors">首页</router-link>
        <router-link to="/cities" class="hover:text-pink-500 transition-colors">城市</router-link>
        <router-link to="/trips" class="hover:text-pink-500 transition-colors">旅行</router-link>
        <router-link to="/anniversaries" class="hover:text-pink-500 transition-colors">纪念日</router-link>
        <router-link to="/community" class="hover:text-pink-500 transition-colors">社区</router-link>
      </div>
      <div class="mt-6 pt-6 border-t border-pink-100/30">
        <p class="text-xs text-muted-foreground/60">
          用爱记录 · 用心珍藏 · 2024
        </p>
      </div>
    </div>
  </footer>
</template>
