export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  if (s.getFullYear() === e.getFullYear() && s.getMonth() === e.getMonth()) {
    return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 - ${e.getDate()}日`
  }
  return `${formatDate(start)} - ${formatDate(end)}`
}

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diff = now - then
  const days = Math.floor(diff / 86400000)
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  if (days < 30) return `${Math.floor(days / 7)}周前`
  if (days < 365) return `${Math.floor(days / 30)}个月前`
  return `${Math.floor(days / 365)}年前`
}

export function daysSince(dateStr: string): number {
  const now = new Date()
  const then = new Date(dateStr)
  return Math.floor((now.getTime() - then.getTime()) / 86400000)
}

export function daysUntil(dateStr: string): number {
  const now = new Date()
  const then = new Date(dateStr)
  return Math.max(0, Math.floor((then.getTime() - now.getTime()) / 86400000))
}

export function formatCountdown(targetDate: string) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const minutes = Math.floor((diff % 3600000) / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  return { days, hours, minutes, seconds, isPast: false }
}

export function getAnniversaryTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    relationship: '恋爱纪念',
    birthday: '生日',
    first_trip: '第一次旅行',
    holiday: '节日',
    custom: '自定义',
  }
  return labels[type] || type
}
