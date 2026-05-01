import { ref, onMounted, onUnmounted, watch, type Ref } from 'vue'

export function useCountdown(targetDate: Ref<string> | string) {
  const days = ref(0)
  const hours = ref(0)
  const minutes = ref(0)
  const seconds = ref(0)
  const isPast = ref(false)

  let timer: ReturnType<typeof setInterval> | null = null

  function update() {
    const dateStr = typeof targetDate === 'string' ? targetDate : targetDate.value
    const now = new Date()
    const target = new Date(dateStr)
    const diff = target.getTime() - now.getTime()

    if (diff <= 0) {
      days.value = 0; hours.value = 0; minutes.value = 0; seconds.value = 0; isPast.value = true
      return
    }

    isPast.value = false
    days.value = Math.floor(diff / 86400000)
    hours.value = Math.floor((diff % 86400000) / 3600000)
    minutes.value = Math.floor((diff % 3600000) / 60000)
    seconds.value = Math.floor((diff % 60000) / 1000)
  }

  onMounted(() => {
    update()
    timer = setInterval(update, 1000)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
  })

  if (typeof targetDate !== 'string') {
    watch(targetDate, update)
  }

  return { days, hours, minutes, seconds, isPast }
}
