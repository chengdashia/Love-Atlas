<script setup lang="ts">
import { useRoute } from 'vue-router'
import AppNavbar from './AppNavbar.vue'
import AppFooter from './AppFooter.vue'

const route = useRoute()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppNavbar v-if="!route.meta.fullScreen" />
    <main :class="route.meta.fullScreen ? 'flex-1' : 'flex-1 pt-16'">
      <RouterView />
    </main>
    <AppFooter v-if="!route.meta.fullScreen" />
  </div>
</template>
