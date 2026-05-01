import { ref, onMounted, onUnmounted, type Ref } from 'vue'

export function useScrollAnimation(
  elementRef: Ref<HTMLElement | null>,
  options?: { threshold?: number; animation?: string }
) {
  const isVisible = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!elementRef.value) return
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          isVisible.value = true
          observer?.disconnect()
        }
      },
      { threshold: options?.threshold ?? 0.1 }
    )
    observer.observe(elementRef.value)
  })

  onUnmounted(() => observer?.disconnect())

  return { isVisible }
}
