<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
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
const { viewer, isReady, Cesium, flyToCity } = useCesiumGlobe(cesiumContainer)

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
watch(isReady, (ready) => {
  if (ready && viewer.value) {
    updateCityPositions()
    const handler = viewer.value.scene.postRender.addEventListener(() => {
      updateCityPositions()
    })
    removePostRender = () => handler()
  }
})

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

const colorMap = ['#a855f7', '#ec4899', '#3b82f6', '#eab308', '#14b8a6']
</script>

<template>
  <div class="theme-dark flex h-screen overflow-hidden">
    <!-- ====== 左侧导航栏 ====== -->
    <aside class="w-[240px] flex-shrink-0 bg-[#0c0d16]/90 border-r border-white/5 flex flex-col pt-8 pb-4 px-4 z-20 backdrop-blur-xl">
      <!-- Logo -->
      <div class="flex items-center gap-3 px-2 mb-10">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center glow-purple">
          <i class="ph-fill ph-heart text-white text-xl"></i>
        </div>
        <div>
          <h1 class="text-[17px] font-semibold tracking-wide text-white">Love Atlas</h1>
          <p class="text-[11px] text-gray-400 mt-0.5">爱 的 星 球</p>
        </div>
      </div>

      <!-- 导航菜单 -->
      <nav class="flex-1 space-y-1.5">
        <a
          v-for="item in navItems"
          :key="item.key"
          href="#"
          :class="[
            'flex items-center gap-3 px-4 py-3 rounded-xl transition',
            activeNav === item.key
              ? 'nav-active text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          ]"
          @click.prevent="navigateTo(item.key)"
        >
          <i :class="['ph', item.icon, 'text-lg', activeNav === item.key ? 'text-purple-400' : '']"></i>
          <span class="text-[13px]" :class="activeNav === item.key ? 'font-medium' : ''">{{ item.label }}</span>
        </a>

        <div class="pt-4 mt-2 border-t border-white/5">
          <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition">
            <i class="ph ph-gear text-lg"></i>
            <span class="text-[13px]">设置</span>
          </a>
        </div>
      </nav>

      <!-- 底部用户信息区 -->
      <div class="mt-auto pt-4">
        <div class="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 mb-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full overflow-hidden border border-purple-500/30 shrink-0 bg-gradient-to-br from-pink-400 to-rose-400 flex items-center justify-center text-sm font-bold text-white">
              爱
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
            <button class="hover:text-white transition"><i class="ph ph-bell text-[16px]"></i></button>
            <button class="hover:text-white transition"><i class="ph ph-chat-circle text-[16px]"></i></button>
            <button class="hover:text-white transition"><i class="ph ph-heart text-[16px]"></i></button>
            <button class="hover:text-white transition"><i class="ph ph-gear text-[16px]"></i></button>
          </div>
        </div>
      </div>
    </aside>

    <!-- ====== 右侧主内容区 ====== -->
    <main class="flex-1 flex flex-col relative h-full overflow-y-auto px-8 py-7">
      <!-- 顶部 Header -->
      <header class="flex justify-between items-end mb-6 shrink-0">
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
          <button class="w-9 h-9 rounded-lg bg-[#1a1c2d]/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-gray-300">
            <i class="ph ph-bell text-[16px]"></i>
          </button>
          <button class="w-9 h-9 rounded-lg bg-[#1a1c2d]/60 border border-white/10 flex items-center justify-center hover:bg-white/10 transition text-gray-300">
            <i class="ph ph-bag text-[16px]"></i>
          </button>
        </div>
      </header>

      <!-- 核心三列内容 -->
      <div class="flex gap-6 mb-6 flex-1 min-h-[440px]">
        <!-- 左侧列 (4个数据卡片) -->
        <div class="w-[240px] flex flex-col gap-4 shrink-0">
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
        <div class="flex-1 relative flex flex-col items-center justify-center min-w-[400px]">
          <div class="globe-wrapper">
            <!-- Cesium 容器 (裁剪为圆形) -->
            <div ref="cesiumContainer" class="absolute inset-0 rounded-full overflow-hidden" />

            <!-- SVG 航线装饰 (叠加在地球上) -->
            <svg class="absolute inset-0 w-full h-full" style="z-index: 10; pointer-events: none;">
              <path d="M180 200 Q 250 120 330 160" class="route-line" />
              <path d="M180 200 Q 300 280 400 180" class="route-line" />
              <path d="M220 350 Q 320 400 380 340" class="route-line" />
              <path d="M180 200 Q 150 280 220 350" class="route-line" />
            </svg>

            <!-- 城市标记 (HTML overlay) -->
            <template v-if="showOverlay && isReady">
              <button
                v-for="item in cityScreenPositions"
                :key="item.city.id"
                class="absolute z-20 cursor-pointer group"
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
          <div class="absolute bottom-2 glass-panel px-5 py-2.5 rounded-full border border-white/10 flex items-center gap-5 text-[11px] text-gray-400 z-20 backdrop-blur-xl">
            <label class="flex items-center gap-2 cursor-pointer text-gray-300">
              <i class="ph ph-globe"></i> 自动旋转
              <div class="relative w-7 h-4 bg-purple-600 rounded-full ml-1">
                <div class="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </label>
            <div class="w-px h-3 bg-white/10"></div>
            <button class="flex items-center gap-1.5 hover:text-white transition"><i class="ph ph-plus-circle text-sm"></i> 放大</button>
            <button class="flex items-center gap-1.5 hover:text-white transition"><i class="ph ph-minus-circle text-sm"></i> 缩小</button>
            <button class="flex items-center gap-1.5 hover:text-white transition"><i class="ph ph-arrows-clockwise text-sm"></i> 重置视角</button>
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
        <div class="w-[280px] flex flex-col gap-4 shrink-0">
          <!-- 卡片1: 纪念日倒计时 -->
          <div class="glass-panel p-4 h-[120px] relative overflow-hidden flex flex-col justify-between group">
            <div class="absolute inset-0 opacity-10 bg-gradient-to-br from-purple-900 to-transparent"></div>
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
            </div>
          </div>

          <!-- 卡片2: 最近回忆 -->
          <div class="glass-panel p-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-[12px] text-gray-300">最近回忆</h3>
              <span class="text-[10px] text-gray-500 flex items-center cursor-pointer hover:text-gray-300">查看全部 <i class="ph ph-caret-right ml-0.5"></i></span>
            </div>
            <div v-if="recentMemories.length" class="space-y-2">
              <div
                v-for="mem in recentMemories.slice(0, 1)"
                :key="mem.id"
                class="flex gap-3 cursor-pointer group"
                @click="router.push(`/memories/${mem.id}`)"
              >
                <div class="relative w-[130px] h-[75px] rounded-lg overflow-hidden border border-white/5 shrink-0 bg-gray-800">
                  <img v-if="mem.coverImage" :src="mem.coverImage" class="w-full h-full object-cover transition duration-700 group-hover:scale-110">
                  <div class="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div class="w-7 h-7 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                      <i class="ph-fill ph-play text-white text-[12px] ml-0.5"></i>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-[12px] text-gray-200 font-medium leading-snug">{{ mem.title }}</h4>
                  <p class="text-[10px] text-gray-500 mt-1">{{ mem.cityName }}</p>
                  <span class="inline-block mt-1 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[9px] px-1.5 py-0.5 rounded">回忆</span>
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
      <div class="grid grid-cols-4 gap-6 shrink-0 h-[110px]">
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.heartbeat {
  animation: heartbeat 1.5s ease-in-out infinite;
}
@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  15% { transform: scale(1.15); }
  30% { transform: scale(1); }
  45% { transform: scale(1.1); }
}

/* Hide Cesium default credits */
.globe-wrapper :deep(.cesium-viewer-bottom),
.globe-wrapper :deep(.cesium-widget-credits) {
  display: none !important;
}
</style>
