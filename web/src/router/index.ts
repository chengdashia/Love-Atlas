import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      children: [
        { path: '', name: 'Home', component: () => import('@/pages/HomeGlobe.vue'), meta: { fullScreen: true } },
        { path: 'cities', name: 'Cities', component: () => import('@/pages/Cities.vue') },
        { path: 'cities/:cityId', name: 'CityDetail', component: () => import('@/pages/CityDetail.vue') },
        { path: 'trips', name: 'Trips', component: () => import('@/pages/Trips.vue') },
        { path: 'trips/:tripId', name: 'TripDetail', component: () => import('@/pages/TripDetail.vue') },
        { path: 'memories/:memoryId', name: 'MemoryDetail', component: () => import('@/pages/MemoryDetail.vue') },
        { path: 'anniversaries', name: 'Anniversaries', component: () => import('@/pages/Anniversaries.vue') },
        { path: 'community', name: 'Community', component: () => import('@/pages/CommunityPreview.vue') },
        {
          path: 'manage',
          name: 'Manage',
          component: () => import('@/pages/Manage.vue'),
          meta: { requiresAuth: true },
          children: [
            { path: '', name: 'ManageCities', component: () => import('@/pages/manage/ManageCities.vue') },
            { path: 'trips', name: 'ManageTrips', component: () => import('@/pages/manage/ManageTrips.vue') },
            { path: 'memories', name: 'ManageMemories', component: () => import('@/pages/manage/ManageMemories.vue') },
            { path: 'anniversaries', name: 'ManageAnniversaries', component: () => import('@/pages/manage/ManageAnniversaries.vue') },
            { path: 'tags', name: 'ManageTags', component: () => import('@/pages/manage/ManageTags.vue') },
            { path: 'trash', name: 'ManageTrash', component: () => import('@/pages/manage/ManageTrash.vue') },
          ],
        },
      ],
    },
    { path: '/login', name: 'Login', component: () => import('@/pages/Login.vue') },
    { path: '/register', name: 'Register', component: () => import('@/pages/Register.vue') },
    { path: '/share/:shareToken', name: 'ShareAccess', component: () => import('@/pages/ShareAccess.vue') },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/pages/NotFound.vue') },
  ],
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  authStore.checkAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
