<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCityStore } from '@/stores/city'
import { useMemoryStore } from '@/stores/memory'
import { useAnniversaryStore } from '@/stores/anniversary'
import { useCesiumGlobe } from '@/composables/useCesiumGlobe'
import { daysUntil, formatRelativeDate } from '@/utils/date'
import type { City } from '@/types'

const router = useRouter()
const cityStore = useCityStore()
const memoryStore = useMemoryStore()
const anniversaryStore = useAnniversaryStore()

const cesiumContainer = ref<HTMLElement | null>(null)
const showOverlay = ref(false)
const selectedCityName = ref('')
const isSidebarCollapsed = ref(false)
const isAutoRotating = ref(true)
const cityScreenPositions = ref<Array<{ city: City; x: number; y: number }>>([])

// Sidebar nav
const activeNav = ref('planet')
const navItems = [
  { key: 'planet', label: '星球总览', icon: 'ph-planet', route: '/' },
  { key: 'cities', label: '城市探索', icon: 'ph-map-pin', route: '/cities' },
  { key: 'timeline', label: '回忆时间线', icon: 'ph-git-branch', route: '/trips' },
  { key: 'gallery', label: '影像宇宙', icon: 'ph-images', route: '/cities' },
  { key: 'diary', label: '心情日记', icon: 'ph-notebook', route: '/cities' },
  { key: 'anniversary', label: '纪念日', icon: 'ph-calendar-heart', route: '/anniversaries' },
  { key: 'stats', label: '数据星图', icon: 'ph-chart-scatter', route: '/cities' },
]

// Data
const cities = computed(() => cityStore.publishedCities)
const cityCount = computed(() => cities.value.length)
const memories = computed(() => memoryStore.publishedMemories)
const memoryCount = computed(() => memories.value.length)
const latestMemory = computed(() => memories.value.length ? memories.value[0] : null)
const recentMemories = computed(() => memories.value.slice(0, 3))
const upcomingAnniversary = computed(() => anniversaryStore.upcomingCountdowns[0] ?? null)
const topCities = computed(() =>
  [...cities.value].sort((a, b) => b.visitCount - a.visitCount).slice(0, 5)
)

// Photo/video counts (mock derived from memory blocks)
const photoCount = computed(() => {
  let count = 0
  for (const m of memories.value) {
    count += m.blocks.filter(b => b.type === 'image').length
  }
  return count
})
const videoCount = computed(() => {
  let count = 0
  for (const m of memories.value) {
    count += m.blocks.filter(b => b.type === 'video').length
  }
  return count
})

// Globe
const { viewer, isReady, Cesium, flyToCity, zoomIn, zoomOut, resetView } = useCesiumGlobe(cesiumContainer, { lowPerformance: false })

// Cesium may init before container has real dimensions (CSS layout timing).
// Force resize once layout is complete.
watch(isReady, (ready) => {
  if (!ready || !viewer.value) return
  const v = viewer.value
  // Multiple attempts at different delays to catch layout completion
  const delays = [0, 100, 300, 600, 1000]
  delays.forEach(d => {
    setTimeout(() => {
      if (v && !v.isDestroyed()) {
        v.resize()
        v.scene.requestRender()
      }
    }, d)
  })
  // Also observe container for ongoing size changes
  if (cesiumContainer.value) {
    const ro = new ResizeObserver(() => {
      if (v && !v.isDestroyed()) {
        v.resize()
      }
    })
    ro.observe(cesiumContainer.value)
    onUnmounted(() => ro.disconnect())
  }
})

function updateCityPositions() {
  if (!viewer.value || !Cesium.value) return
  const v = viewer.value
  const C = Cesium.value
  const canvas = v.scene.canvas
  const viewProj = C.Matrix4.multiply(
    v.camera.frustum.projectionMatrix,
    v.camera.viewMatrix,
    new C.Matrix4()
  )
  const m = viewProj
  const positions: Array<{ city: City; x: number; y: number }> = []
  for (const city of cities.value) {
    if (city.deletedAt || city.status !== 'published') continue
    const pos3d = C.Cartesian3.fromDegrees(city.longitude, city.latitude, 0)
    const x = pos3d.x, y = pos3d.y, z = pos3d.z
    const clipX = m[0]*x + m[4]*y + m[8]*z  + m[12]
    const clipY = m[1]*x + m[5]*y + m[9]*z  + m[13]
    const clipW = m[3]*x + m[7]*y + m[11]*z + m[15]
    if (clipW <= 0) continue
    const ndcX = clipX / clipW
    const ndcY = clipY / clipW
    if (ndcX < -1.5 || ndcX > 1.5 || ndcY < -1.5 || ndcY > 1.5) continue
    const screenX = (ndcX + 1) * 0.5 * canvas.width
    const screenY = (1 - ndcY)  * 0.5 * canvas.height
    positions.push({ city, x: screenX, y: screenY })
  }
  cityScreenPositions.value = positions
}

let removePostRender: (() => void) | null = null
let removeAutoRotate: (() => void) | null = null
watch(isReady, (ready) => {
  if (ready && viewer.value) {
    updateCityPositions()
    const handler = viewer.value.scene.postRender.addEventListener(() => {
      updateCityPositions()
    })
    removePostRender = () => handler()
  }
})

watch([isReady, isAutoRotating], ([ready, rotating]) => {
  removeAutoRotate?.()
  removeAutoRotate = null
  if (!ready || !rotating || !viewer.value || !Cesium.value) return
  const v = viewer.value
  const C = Cesium.value
  removeAutoRotate = v.clock.onTick.addEventListener(() => {
    if (v.isDestroyed()) return
    v.camera.rotate(C.Cartesian3.UNIT_Z, -0.00028)
    v.scene.requestRender()
  })
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    cityStore.fetchCities(),
    memoryStore.fetchMemories(),
    anniversaryStore.fetchAnniversaries(),
  ])
  setTimeout(() => { showOverlay.value = true }, 500)
})

onUnmounted(() => {
  removePostRender?.()
  removeAutoRotate?.()
})

function handleCityClick(city: City) {
  selectedCityName.value = city.name
  flyToCity(city.latitude, city.longitude, () => {
    router.push(`/cities/${city.id}`)
  })
}

function navigateTo(key: string) {
  activeNav.value = key
  const item = navItems.find(i => i.key === key)
  if (item?.route) router.push(item.route)
}

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  nextTick(() => {
    viewer.value?.resize()
    viewer.value?.scene.requestRender()
  })
}

function handleResetView() {
  selectedCityName.value = ''
  resetView()
}

const colorMap = ['#a855f7', '#ec4899', '#3b82f6', '#eab308', '#14b8a6']
</script>

<template>
  <div
    class="home-shell flex h-screen overflow-hidden"
    :class="{ 'is-sidebar-collapsed': isSidebarCollapsed }"
    style="background-color: #070811; color: #fff; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-image: radial-gradient(circle at 50% 50%, rgba(30, 32, 60, 0.4) 0%, transparent 60%), radial-gradient(circle at 80% 20%, rgba(157, 78, 221, 0.08) 0%, transparent 40%);"
  >
    <!-- ====== 左侧导航栏 ====== -->
    <aside class="home-sidebar w-[240px] flex-shrink-0 bg-[#0c0d16]/90 border-r border-white/5 flex flex-col pt-8 pb-4 px-4 z-20 backdrop-blur-xl">
      <!-- Logo -->
      <div class="home-logo flex items-center gap-3 px-2 mb-10">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center glow-purple">
          <i class="ph-fill ph-heart text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-[17px] font-semibold tracking-wide text-white">Love Atlas</h1>
          <p class="text-[11px] text-gray-400 mt-0.5">爱 的 星 球</p>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="home-nav flex-1 space-y-1.5">
        <a
          v-for="item in navItems"
          :key="item.key"
          href="#"
          :class="[
            'home-nav-link flex items-center gap-3 px-4 py-3 rounded-xl transition',
            activeNav === item.key
              ? 'nav-active text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          ]"
          @click.prevent="navigateTo(item.key)"
        >
          <i :class="['home-nav-icon ph', item.icon, 'text-lg', activeNav === item.key ? 'text-purple-400' : '']"></i>
          <span class="home-nav-label text-[13px]" :class="activeNav === item.key ? 'font-medium' : ''">{{ item.label }}</span>
        </a>

        <div class="home-nav-divider pt-4 mt-2 border-t border-white/5">
          <a href="#" class="home-nav-link flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
            <i class="home-nav-icon ph ph-gear text-lg"></i>
            <span class="home-nav-label text-[13px]">设置</span>
          </a>
        </div>
      </nav>

      <!-- 底部用户信息区 -->
      <div class="mt-auto pt-4">
        <div class="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-purple-500/30 shrink-0">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80" alt="avatar" class="w-full h-full object-cover">
            </div>
            <div class="overflow-hidden">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-gray-200 truncate">星海与你</span>
                <span class="bg-[#d97706]/20 text-[#fbbf24] text-[9px] px-1.5 py-0.5 rounded border border-[#d97706]/30 flex-shrink-0">Pro <span class="opacity-60">Lv.28</span></span>
              </div>
              <p class="text-[10px] text-gray-500 mt-1 truncate">愿我们的回忆，永远闪耀。</p>
            </div>
          </div>

          <div class="space-y-1.5 mb-4">
            <div class="flex justify-between text-[10px] text-gray-400">
              <span>空间使用</span>
              <span>12.4GB / 50GB</span>
            </div>
            <div class="progress-bar">
              <div class="progress-bar-fill" style="width: 25%"></div>
            </div>
          </div>

          <div class="flex justify-between items-center px-1 text-gray-400">
            <button class="hover:text-white transition" aria-label="查看通知"><i class="ph ph-bell text-[16px]"></i></button>
            <button class="hover:text-white transition" aria-label="打开留言"><i class="ph ph-chat-circle text-[16px]"></i></button>
            <button class="hover:text-white transition" aria-label="查看收藏"><i class="ph ph-heart text-[16px]"></i></button>
            <button class="hover:text-white transition" aria-label="打开设置"><i class="ph ph-gear text-[16px]"></i></button>
          </div>
        </div>

        <button
          class="sidebar-collapse-button w-full flex justify-center text-gray-600 hover:text-white transition py-2"
          :aria-label="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          :title="isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="toggleSidebar"
        >
          <i class="ph ph-caret-double-left text-sm" :class="{ 'rotate-180': isSidebarCollapsed }"></i>
        </button>
      </div>
    </aside>

    <!-- ====== 右侧主内容区 ====== -->
    <main class="home-main scroll-area flex-1 flex flex-col relative h-full overflow-y-auto px-8 py-7">
      <!-- 顶部 Header -->
      <header class="home-header flex justify-between items-end mb-6 shrink-0">
        <div>
          <h2 class="text-[22px] font-bold flex items-center gap-2 text-gray-100 glow-text mb-1.5">
            欢迎回来，星海与你 <i class="ph-fill ph-sparkle text-purple-400 text-lg"></i>
          </h2>
          <p class="text-[12px] text-gray-400">每一段回忆，都是我们在宇宙中留下的光迹。</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="relative group">
            <i class="ph ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-400 transition"></i>
            <input type="text" placeholder="搜索城市、回忆、人物..." class="bg-[#1a1c2d]/60 border border-white/10 rounded-lg py-2 pl-9 pr-12 text-[12px] w-[260px] text-gray-300 focus:outline-none focus:border-purple-500/50 focus:bg-[#1a1c2d] transition backdrop-blur-md placeholder-gray-500">
            <div class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">⌘ K</div>
          </div>
          <button class="w-9 h-9 rounded-lg bg-[#1a1c2d]/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-gray-300" aria-label="查看通知">
            <i class="ph ph-bell text-[16px]"></i>
          </button>
          <button class="w-9 h-9 rounded-lg bg-[#1a1c2d]/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-gray-300" aria-label="打开素材包">
            <i class="ph ph-bag text-[16px]"></i>
          </button>
        </div>
      </header>

      <!-- 核心三列内容 -->
      <div class="home-content flex gap-6 mb-6 flex-1 min-h-[440px]">
        <!-- 左侧列 (4个数据卡片) -->
        <div class="home-left-column w-[240px] flex flex-col gap-4 shrink-0">
          <!-- 卡片1: 最新回忆 -->
          <div class="glass-panel p-4 flex-1">
            <h3 class="text-[12px] text-gray-400 mb-3">最新回忆</h3>
            <div v-if="latestMemory" class="flex gap-3 items-center">
              <div class="w-[42px] h-[42px] rounded-lg overflow-hidden shrink-0 bg-gray-800">
                <img v-if="latestMemory.coverImage" :src="latestMemory.coverImage" :alt="latestMemory.title" class="w-full h-full object-cover">
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="text-[13px] font-medium text-gray-200 truncate">{{ latestMemory.title }}</h4>
                <p class="text-[11px] text-gray-500 mt-0.5">{{ formatRelativeDate(latestMemory.updatedAt) }}</p>
              </div>
              <i class="ph-fill ph-heart text-[#ec4899] text-[12px]"></i>
            </div>
            <div v-else class="text-[12px] text-gray-500">暂无回忆</div>
          </div>

          <!-- 卡片2: 回忆总数 -->
          <div class="glass-panel p-4 flex-1 flex flex-col justify-center">
            <h3 class="text-[12px] text-gray-400 mb-2">回忆总数</h3>
            <div class="flex justify-between items-end">
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-[28px] font-bold text-white">{{ memoryCount }}</span>
                  <span class="text-[12px] text-gray-500">段回忆</span>
                </div>
                <p class="text-[11px] text-gray-500 mt-1">珍藏每一刻心动时光</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-[#ec4899]/10 flex items-center justify-center border border-[#ec4899]/20 shadow-[0_0_15px_rgba(236,72,153,0.15)]">
                <i class="ph ph-heart text-[#ec4899] text-lg"></i>
              </div>
            </div>
          </div>

          <!-- 卡片3: 走过城市 -->
          <div class="glass-panel p-4 flex-1 flex flex-col justify-center">
            <h3 class="text-[12px] text-gray-400 mb-2">走过城市</h3>
            <div class="flex justify-between items-end">
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-[28px] font-bold text-white">{{ cityCount }}</span>
                  <span class="text-[12px] text-gray-500">个城市</span>
                </div>
                <p class="text-[11px] text-gray-500 mt-1">足迹遍布世界各处</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-[#a855f7]/10 flex items-center justify-center border border-[#a855f7]/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                <i class="ph ph-map-pin text-[#a855f7] text-lg"></i>
              </div>
            </div>
          </div>

          <!-- 卡片4: 照片/视频 -->
          <div class="glass-panel p-4 flex-1 flex flex-col justify-center">
            <h3 class="text-[12px] text-gray-400 mb-2">照片 / 视频</h3>
            <div class="flex justify-between items-end">
              <div>
                <div class="flex items-baseline gap-1">
                  <span class="text-[22px] font-bold text-white tracking-tight">{{ photoCount }} <span class="text-[16px] text-gray-500 font-normal">/</span> {{ videoCount }}</span>
                </div>
                <p class="text-[11px] text-gray-500 mt-1">张照片 / 个视频<br>记录我们的故事</p>
              </div>
              <div class="w-9 h-9 rounded-full bg-[#3b82f6]/10 flex items-center justify-center border border-[#3b82f6]/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                <i class="ph ph-camera text-[#3b82f6] text-lg"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 中央 Cesium 地球区 -->
        <div class="home-globe-column flex-1 relative flex flex-col items-center justify-center min-w-[400px]">
          <div class="globe-wrapper">
            <!-- Cesium 背景场景 -->
            <div ref="cesiumContainer" class="cesium-circle" />

            <!-- 城市标记 (HTML overlay) -->
            <template v-if="showOverlay && isReady">
              <button
                v-for="item in cityScreenPositions"
                :key="item.city.id"
                class="globe-marker absolute z-20 cursor-pointer group"
                :style="{
                  left: (item.x / (cesiumContainer?.clientWidth || 1)) * 100 + '%',
                  top: (item.y / (cesiumContainer?.clientHeight || 1)) * 100 + '%',
                  transform: 'translate(-50%, -50%)',
                }"
                @click="handleCityClick(item.city)"
              >
                <div class="globe-dot"></div>
                <div class="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-gray-200 drop-shadow-md opacity-80 group-hover:opacity-100 transition">
                  {{ item.city.name }}
                </div>
              </button>
            </template>
          </div>

          <!-- 底部控制器 -->
          <div class="globe-controls absolute bottom-2 glass-panel px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-5 text-[11px] text-gray-400 z-20 backdrop-blur-xl">
            <button
              class="globe-control-toggle flex items-center gap-2 cursor-pointer text-gray-300"
              type="button"
              :aria-pressed="isAutoRotating"
              @click="isAutoRotating = !isAutoRotating"
            >
              <i class="ph ph-globe"></i> 自动旋转
              <span class="relative w-7 h-4 rounded-full ml-1 transition" :class="isAutoRotating ? 'bg-purple-600' : 'bg-white/10'">
                <span class="absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all" :class="isAutoRotating ? 'right-0.5' : 'left-0.5'"></span>
              </span>
            </button>
            <div class="w-px h-3 bg-white/10"></div>
            <button class="globe-control-button flex items-center gap-1.5 hover:text-white transition" type="button" @click="zoomIn"><i class="ph ph-plus-circle text-sm"></i> 放大</button>
            <button class="globe-control-button flex items-center gap-1.5 hover:text-white transition" type="button" @click="zoomOut"><i class="ph ph-minus-circle text-sm"></i> 缩小</button>
            <button class="globe-control-button flex items-center gap-1.5 hover:text-white transition" type="button" @click="handleResetView"><i class="ph ph-arrows-clockwise text-sm"></i> 重置视角</button>
          </div>

          <!-- 飞行指示器 -->
          <Transition name="fade">
            <div v-if="selectedCityName" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
              <div class="glass-panel rounded-3xl px-8 py-6 text-center border-purple-500/30">
                <i class="ph-fill ph-heart text-3xl text-pink-400 mb-2 heartbeat"></i>
                <p class="text-white/50 text-sm mb-1">正在飞往</p>
                <p class="text-white text-2xl font-bold">{{ selectedCityName }}</p>
              </div>
            </div>
          </Transition>
        </div>

        <!-- 右侧列 (4个数据卡片) -->
        <div class="home-right-column w-[280px] flex flex-col gap-4 shrink-0">
          <!-- 卡片1: 纪念日倒计时 -->
          <div class="glass-panel p-4 h-[120px] relative overflow-hidden flex flex-col justify-between group">
            <div class="absolute inset-0 opacity-30 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1531366936337-77cf3e615f87?auto=format&fit=crop&w=400&q=80')"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-[#0a0b14] to-transparent"></div>
            <div class="relative z-10 flex justify-between items-center w-full">
              <h3 class="text-[12px] text-gray-300">纪念日倒计时</h3>
              <span
                class="text-[10px] text-purple-400 flex items-center cursor-pointer hover:text-purple-300"
                @click="router.push('/anniversaries')"
              >全部纪念日 <i class="ph ph-caret-right ml-0.5"></i></span>
            </div>
            <div v-if="upcomingAnniversary" class="relative z-10">
              <p class="text-[11px] text-gray-400 mb-1">{{ upcomingAnniversary.title }}</p>
              <div class="flex items-baseline gap-1">
                <span class="text-[32px] font-bold text-white drop-shadow-lg">{{ daysUntil(upcomingAnniversary.date) }}</span>
                <span class="text-[12px] text-gray-300">天</span>
              </div>
              <p class="text-[10px] text-gray-500 mt-1">{{ upcomingAnniversary.date }}</p>
            </div>
            <div v-else class="relative z-10 text-[12px] text-gray-500">暂无即将到来的纪念日</div>
            <div class="absolute bottom-4 right-4 z-10 text-5xl text-purple-400/50 drop-shadow-[0_0_15px_#a855f7] transform group-hover:scale-110 transition duration-500">
              <i class="ph-fill ph-heart"></i>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-4 border-2 border-purple-300/30 rounded-[50%] transform -rotate-12"></div>
            </div>
          </div>

          <!-- 卡片2: 最近回忆 -->
          <div class="glass-panel p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-[12px] text-gray-300">最近回忆</h3>
              <span class="text-[10px] text-gray-500 flex items-center cursor-pointer hover:text-gray-300">查看全部 <i class="ph ph-caret-right ml-0.5"></i></span>
            </div>
            <div v-if="recentMemories.length">
              <!-- 主回忆条目 -->
              <div
                class="flex gap-3 mb-2 cursor-pointer group"
                @click="router.push(`/memories/${recentMemories[0].id}`)"
              >
                <div class="relative w-[130px] h-[75px] rounded-lg overflow-hidden border border-white/5 shrink-0 bg-gray-800">
                  <img v-if="recentMemories[0].coverImage" :src="recentMemories[0].coverImage" :alt="recentMemories[0].title" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                  <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div class="w-7 h-7 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                      <i class="ph-fill ph-play text-white text-[12px] ml-0.5"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-[12px] text-gray-200 font-medium leading-snug">{{ recentMemories[0].title }}</h4>
                  <p class="text-[10px] text-gray-500 mt-1">{{ recentMemories[0].updatedAt?.slice(0, 10) }} · {{ recentMemories[0].cityName }}</p>
                  <span class="inline-block mt-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] px-1.5 py-0.5 rounded">视频</span>
                </div>
              </div>
              <!-- 缩略图行 -->
              <div class="flex gap-2">
                <div
                  v-for="mem in recentMemories.slice(1, 4)"
                  :key="mem.id"
                  class="flex-1 h-10 rounded border border-white/5 overflow-hidden cursor-pointer"
                  @click="router.push(`/memories/${mem.id}`)"
                >
                  <img v-if="mem.coverImage" :src="mem.coverImage" :alt="mem.title" class="w-full h-full object-cover opacity-80 hover:opacity-100 transition">
                </div>
                <div v-if="memoryCount > 4" class="flex-1 h-10 rounded border border-white/5 overflow-hidden relative bg-gray-800">
                  <div class="absolute inset-0 flex items-center justify-center text-[10px] text-white">+{{ memoryCount - 4 }}</div>
                </div>
              </div>
            </div>
            <div v-else class="text-[12px] text-gray-500">暂无回忆</div>
          </div>

          <!-- 卡片3: 今日提示 -->
          <div class="glass-panel p-4 relative overflow-hidden">
            <h3 class="text-[12px] text-gray-300 mb-2">今日提示</h3>
            <p class="text-[11px] text-gray-400 italic leading-relaxed">"在平凡的日子里，制造一些浪漫的回忆吧。"</p>
            <p class="text-[10px] text-gray-500 mt-1">— Love Atlas</p>
            <div class="absolute right-2 bottom-0 text-4xl text-blue-400/20 drop-shadow-[0_0_10px_#3b82f6]">
              <i class="ph-fill ph-heart"></i>
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-3 border border-blue-300/30 rounded-[50%] transform rotate-12"></div>
            </div>
          </div>

          <!-- 卡片4: 足迹地图 -->
          <div class="glass-panel p-4 flex-1 flex flex-col relative overflow-hidden">
            <div class="flex justify-between items-center mb-3 relative z-10">
              <h3 class="text-[12px] text-gray-300">足迹地图</h3>
              <span
                class="text-[10px] text-gray-500 flex items-center cursor-pointer hover:text-gray-300"
                @click="router.push('/cities')"
              >查看全部城市 <i class="ph ph-caret-right ml-0.5"></i></span>
            </div>
            <!-- 点阵地图背景 -->
            <div class="absolute left-0 right-16 top-10 bottom-0 opacity-20 pointer-events-none">
              <div class="w-full h-full" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSJub25lIj48L3JlY3Q+CjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjZmZmIj48L2NpcmNsZT4KPC9zdmc+'); opacity: 0.4;"></div>
              <div class="absolute top-[30%] left-[40%] w-1.5 h-1.5 bg-purple-500 rounded-full" style="box-shadow: 0 0 10px #a855f7;"></div>
              <div class="absolute top-[40%] left-[70%] w-1.5 h-1.5 bg-pink-500 rounded-full" style="box-shadow: 0 0 10px #ec4899;"></div>
              <div class="absolute top-[20%] left-[60%] w-1.5 h-1.5 bg-blue-500 rounded-full" style="box-shadow: 0 0 10px #3b82f6;"></div>
            </div>
            <div class="flex-1 flex flex-col justify-end relative z-10 ml-auto w-[100px] space-y-2">
              <div
                v-for="(city, idx) in topCities"
                :key="city.id"
                class="flex justify-between items-center text-[11px]"
              >
                <span class="flex items-center gap-1.5 text-gray-300">
                  <div
                    class="w-1.5 h-1.5 rounded-full"
                    :style="{ background: colorMap[idx], boxShadow: `0 0 5px ${colorMap[idx]}` }"
                  ></div>
                  {{ city.name }}
                </span>
                <span class="text-gray-500">{{ city.visitCount }} 次</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部4个功能卡片区 -->
      <div class="home-action-grid grid grid-cols-4 gap-6 shrink-0 h-[110px]">
        <!-- 快速记录 -->
        <div class="glass-panel card-gradient-1 p-4 relative overflow-hidden group border border-[#4c1d95]/30 flex flex-col justify-between hover:border-[#6d28d9] transition cursor-pointer">
          <div class="flex justify-between items-start z-10">
            <h4 class="text-[14px] font-medium text-gray-100">快速记录</h4>
            <i class="ph ph-plus text-gray-500"></i>
          </div>
          <div class="z-10 flex justify-between items-end">
            <p class="text-[10px] text-gray-400 w-[60%] leading-snug">随时记录生活中的心动瞬间</p>
            <button class="bg-[#4c1d95]/40 hover:bg-[#5b21b6]/60 border border-[#7c3aed]/30 text-white text-[10px] px-3 py-1.5 rounded-md transition">开始记录</button>
          </div>
          <i class="ph-fill ph-note-pencil absolute -right-2 -bottom-2 text-6xl text-[#8b5cf6]/20 transform group-hover:scale-110 transition duration-500"></i>
        </div>

        <!-- 城市时间轴 -->
        <div
          class="glass-panel card-gradient-2 p-4 relative overflow-hidden group border border-[#6b21a8]/30 flex flex-col justify-between hover:border-[#9333ea] transition cursor-pointer"
          @click="router.push('/cities')"
        >
          <div class="flex justify-between items-start z-10">
            <h4 class="text-[14px] font-medium text-gray-100">城市时间轴</h4>
            <i class="ph ph-plus text-gray-500"></i>
          </div>
          <div class="z-10 flex justify-between items-end">
            <p class="text-[10px] text-gray-400 w-[60%] leading-snug">探索我们一起走过的每一个城市</p>
            <button class="bg-[#6b21a8]/40 hover:bg-[#7e22ce]/60 border border-[#a855f7]/30 text-white text-[10px] px-3 py-1.5 rounded-md transition">进入探索</button>
          </div>
          <i class="ph-fill ph-buildings absolute -right-2 -bottom-2 text-6xl text-[#c084fc]/20 transform group-hover:scale-110 transition duration-500"></i>
          <div class="card-bg-city"></div>
        </div>

        <!-- 相册素材库 -->
        <div class="glass-panel card-gradient-3 p-4 relative overflow-hidden group border border-[#1e40af]/30 flex flex-col justify-between hover:border-[#2563eb] transition cursor-pointer">
          <div class="flex justify-between items-start z-10">
            <h4 class="text-[14px] font-medium text-gray-100">相册素材库</h4>
            <i class="ph ph-plus text-gray-500"></i>
          </div>
          <div class="z-10 flex justify-between items-end">
            <p class="text-[10px] text-gray-400 w-[60%] leading-snug">管理照片、视频等所有素材</p>
            <button class="bg-[#1e40af]/40 hover:bg-[#1d4ed8]/60 border border-[#3b82f6]/30 text-white text-[10px] px-3 py-1.5 rounded-md transition">浏览素材</button>
          </div>
          <i class="ph-fill ph-images-square absolute -right-2 -bottom-2 text-6xl text-[#60a5fa]/20 transform group-hover:scale-110 transition duration-500"></i>
          <div class="card-bg-album"></div>
        </div>

        <!-- 纪念日中心 -->
        <div
          class="glass-panel card-gradient-4 p-4 relative overflow-hidden group border border-[#9d174d]/30 flex flex-col justify-between hover:border-[#be185d] transition cursor-pointer"
          @click="router.push('/anniversaries')"
        >
          <div class="flex justify-between items-start z-10">
            <h4 class="text-[14px] font-medium text-gray-100">纪念日中心</h4>
            <i class="ph ph-plus text-gray-500"></i>
          </div>
          <div class="z-10 flex justify-between items-end">
            <p class="text-[10px] text-gray-400 w-[60%] leading-snug">重要日子不再错过<br>珍藏每个纪念时刻</p>
            <button class="bg-[#9d174d]/40 hover:bg-[#be185d]/60 border border-[#ec4899]/30 text-white text-[10px] px-3 py-1.5 rounded-md transition">管理纪念日</button>
          </div>
          <i class="ph-fill ph-calendar-heart absolute -right-2 -bottom-2 text-6xl text-[#f472b6]/20 transform group-hover:scale-110 transition duration-500"></i>
        </div>
      </div>

      <!-- 底部 Footer -->
      <footer class="mt-4 flex justify-between items-center text-[10px] text-gray-500 shrink-0">
        <div class="flex items-center gap-1">
          <span>Love Atlas · 让爱有迹可循，让回忆永恒闪耀</span>
          <i class="ph-fill ph-heart text-gray-400"></i>
        </div>
        <div class="flex items-center gap-6">
          <span class="flex items-center gap-1.5 text-[#10b981]">
            <i class="ph ph-check-circle text-[12px]"></i> 数据已安全备份
          </span>
          <span>最后备份: 2024.05.20 18:42</span>
        </div>
      </footer>
    </main>
  </div>
</template>

<style scoped>
/* ====== 页面级全局重置 ====== */
:host {
  display: block;
  height: 100vh;
  overflow: hidden;
}

/* 隐藏滚动条但保留滚动能力 */
.scroll-area::-webkit-scrollbar { width: 0; height: 0; }
.scroll-area { scrollbar-width: none; -ms-overflow-style: none; }

/* ====== 过渡动画 ====== */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ====== 参考 index.html 的侧栏精确样式 ====== */
.home-shell {
  position: relative;
}

.home-sidebar {
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  padding: 32px 16px 16px;
  background: rgba(12, 13, 22, 0.9);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  transition: width 220ms ease, min-width 220ms ease, max-width 220ms ease, padding 220ms ease;
  position: relative;
  z-index: 4;
}

.home-logo {
  height: 40px;
  margin-bottom: 40px;
  gap: 12px;
}

.home-nav {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 6px;
}

.home-nav-link {
  display: flex;
  min-height: 44px;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 12px;
  color: rgb(156 163 175);
  text-decoration: none;
  transition: color 150ms ease, background-color 150ms ease;
}

.home-nav-link:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.home-nav-icon {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  font-size: 18px;
  line-height: 18px;
}

.home-nav-label {
  display: block;
  font-size: 13px;
  line-height: 18px;
}

.home-nav-divider {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-collapse-button i {
  transition: transform 180ms ease;
}

.home-shell.is-sidebar-collapsed .home-sidebar {
  width: 72px;
  min-width: 72px;
  max-width: 72px;
  padding: 32px 12px 16px;
}

.home-shell.is-sidebar-collapsed .home-logo {
  justify-content: center;
  padding-inline: 0;
}

.home-shell.is-sidebar-collapsed .home-logo > div:last-child,
.home-shell.is-sidebar-collapsed .home-nav-label,
.home-shell.is-sidebar-collapsed .home-sidebar .mt-auto > .bg-white\/\[0\.03\] {
  display: none;
}

.home-shell.is-sidebar-collapsed .home-nav-link {
  justify-content: center;
  padding: 12px;
}

.home-shell.is-sidebar-collapsed .home-nav-icon {
  margin: 0;
}

.home-shell.is-sidebar-collapsed .home-nav-divider {
  padding-top: 16px;
}

.home-shell.is-sidebar-collapsed .sidebar-collapse-button {
  padding-top: 12px;
}

/* ====== 参考 index.html 的主内容尺寸 ====== */
.home-main {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 28px 32px;
  pointer-events: none;
}

.home-header {
  position: relative;
  z-index: 3;
  margin-bottom: 24px;
  pointer-events: auto;
}

.home-content {
  display: flex;
  flex: 1 1 auto;
  min-height: 440px;
  gap: 24px;
  margin-bottom: 24px;
}

.home-left-column {
  width: 240px;
  min-width: 240px;
  max-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.home-right-column {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  z-index: 2;
  pointer-events: auto;
}

.home-left-column > .glass-panel,
.home-right-column > .glass-panel,
.home-action-grid > .glass-panel {
  padding: 16px;
}

.home-action-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  height: 110px;
  position: relative;
  z-index: 3;
  pointer-events: auto;
}

.home-action-grid > .glass-panel {
  position: relative;
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  cursor: pointer;
}

.home-main > footer {
  position: relative;
  z-index: 3;
  pointer-events: auto;
}

/* ====== 心跳动画 ====== */
.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
}

/* ====== 地球区域 ====== */
.home-globe-column {
  pointer-events: none;
  z-index: 0;
}

.globe-wrapper {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 240px;
  width: auto;
  height: auto;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: hidden;
  z-index: 0;
  pointer-events: auto;
}

.home-shell.is-sidebar-collapsed .globe-wrapper {
  left: 72px;
}

/* Cesium 背景场景 */
.cesium-circle {
  position: relative;
  z-index: 0;
  width: 100%;
  height: 100%;
  border-radius: 0;
  overflow: hidden;
  background: #02030a;
  filter: saturate(0.78) contrast(0.92) brightness(0.72);
  pointer-events: auto;
}

/* 地图发光坐标点 */
.globe-dot {
  position: absolute;
  width: 7px;
  height: 7px;
  background: #ff71a3;
  border-radius: 50%;
  box-shadow: 0 0 12px 3px rgba(255, 113, 163, 0.48);
}

.globe-marker {
  pointer-events: auto;
}
.globe-dot::after {
  content: '';
  position: absolute;
  inset: -4px;
  border: 1px solid rgba(255, 113, 163, 0.8);
  border-radius: 50%;
  animation: globe-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes globe-ping {
  0% { transform: scale(1); opacity: 0.8; }
  75% { transform: scale(2); opacity: 0; }
  100% { transform: scale(2.5); opacity: 0; }
}

/* ====== 侧边栏导航激活态 ====== */
.nav-active {
  background: linear-gradient(90deg, rgba(157, 78, 221, 0.25) 0%, rgba(157, 78, 221, 0) 100%);
  position: relative;
}
.nav-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10%;
  height: 80%;
  width: 3px;
  background: #c084fc;
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px #c084fc;
}

/* ====== 毛玻璃面板 ====== */
.glass-panel {
  background: rgba(22, 24, 43, 0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* ====== 发光文字 ====== */
.glow-text { text-shadow: 0 0 10px rgba(255, 255, 255, 0.5); }
.glow-purple { box-shadow: 0 0 20px rgba(157, 78, 221, 0.3); }

/* ====== 进度条 ====== */
.progress-bar {
  height: 4px;
  background: #1f2937;
  border-radius: 9999px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 9999px;
  box-shadow: 0 0 8px #a855f7;
}

/* ====== 底部卡片渐变 ====== */
.card-gradient-1 { background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(17, 24, 39, 0.8) 100%); }
.card-gradient-2 { background: linear-gradient(135deg, rgba(49, 14, 104, 0.5) 0%, rgba(17, 24, 39, 0.8) 100%); }
.card-gradient-3 { background: linear-gradient(135deg, rgba(30, 58, 138, 0.4) 0%, rgba(17, 24, 39, 0.8) 100%); }
.card-gradient-4 { background: linear-gradient(135deg, rgba(131, 24, 67, 0.4) 0%, rgba(17, 24, 39, 0.8) 100%); }

/* ====== 底部卡片装饰背景 ====== */
.card-bg-city {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 96px;
  height: 64px;
  background-image: url('https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=100&q=80');
  background-size: cover;
  opacity: 0.2;
  mix-blend-mode: overlay;
}
.card-bg-album {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 96px;
  height: 64px;
  background-image: url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=100&q=80');
  background-size: cover;
  opacity: 0.2;
  mix-blend-mode: overlay;
}

/* ====== Cesium 容器样式 ====== */
.cesium-circle :deep(.cesium-viewer),
.cesium-circle :deep(.cesium-widget),
.cesium-circle :deep(.cesium-viewer-cesiumWidgetContainer) {
  width: 100%;
  height: 100%;
  background: transparent !important;
}
.cesium-circle :deep(.cesium-widget canvas) {
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}
/* Hide Cesium default credits */
.cesium-circle :deep(.cesium-viewer-bottom),
.cesium-circle :deep(.cesium-widget-credits),
.cesium-circle :deep(.cesium-credit-textContainer),
.cesium-circle :deep(.cesium-credit-logoContainer),
.cesium-circle :deep(.cesium-credit-expand-link),
.cesium-circle :deep(.cesium-credit-lightbox),
.cesium-circle :deep(.cesium-credit-lightbox-overlay),
.cesium-circle :deep(.cesium-credit-lightboxOverlay) {
  display: none !important;
}

.globe-controls {
  pointer-events: auto;
  bottom: 4px;
  background: rgba(22, 24, 43, 0.48);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.22), 0 0 26px rgba(59, 130, 246, 0.08);
}

.globe-control-toggle,
.globe-control-button {
  min-height: 24px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.globe-control-toggle:hover,
.globe-control-button:hover {
  color: #fff;
}

</style>
