<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center max-w-lg px-6">
      <div class="text-6xl mb-6">🏘️</div>
      <h1 class="text-3xl font-bold mb-4">社区大厅即将开放</h1>
      <p class="text-muted-foreground text-lg mb-8">
        我们正在打造一个浪漫的情侣旅行社区，让你可以分享自己的旅行故事，发现其他情侣的美好回忆。
      </p>
      <div class="grid grid-cols-3 gap-4 mb-8">
        <div class="glass-card rounded-xl p-4 text-center">
          <div class="text-2xl mb-2">📖</div>
          <p class="text-sm font-medium">旅行故事</p>
          <p class="text-xs text-muted-foreground">精选预览</p>
        </div>
        <div class="glass-card rounded-xl p-4 text-center">
          <div class="text-2xl mb-2">🗺️</div>
          <p class="text-sm font-medium">城市发现</p>
          <p class="text-xs text-muted-foreground">即将推出</p>
        </div>
        <div class="glass-card rounded-xl p-4 text-center">
          <div class="text-2xl mb-2">💬</div>
          <p class="text-sm font-medium">互动交流</p>
          <p class="text-xs text-muted-foreground">即将推出</p>
        </div>
      </div>
      <router-link to="/" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity">
        🏠 返回首页
      </router-link>
    </div>
  </div>
</template>
