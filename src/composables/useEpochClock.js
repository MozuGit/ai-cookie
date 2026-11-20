import { ref } from 'vue'

const EPOCH_CLOCK_KEY = 'ai-cookie.epoch-clock.v1'

function readStartedAt() {
  try {
    const raw = localStorage.getItem(EPOCH_CLOCK_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const value = Number(parsed?.startedAt)
      if (Number.isFinite(value) && value > 0) return value
    }
  } catch {
    // 损坏数据视为首次启动
  }
  const now = Date.now()
  try {
    localStorage.setItem(EPOCH_CLOCK_KEY, JSON.stringify({ startedAt: now }))
  } catch {
    // 存储不可用时退化为内存时间
  }
  return now
}

export const epochClockStartedAt = ref(readStartedAt())

export function markEpochClockReset() {
  const now = Date.now()
  epochClockStartedAt.value = now
  try {
    localStorage.setItem(EPOCH_CLOCK_KEY, JSON.stringify({ startedAt: now }))
  } catch {
    // 忽略持久化失败
  }
}

export function formatEpochRuntime(
  startedAt = epochClockStartedAt.value,
  now = Date.now(),
) {
  const totalMinutes = Math.max(0, Math.floor((now - startedAt) / 60000))
  if (totalMinutes < 1) return '不到 1 分钟'
  const days = Math.floor(totalMinutes / 1440)
  const hours = Math.floor((totalMinutes % 1440) / 60)
  const minutes = totalMinutes % 60
  const parts = []
  if (days) parts.push(`${days} 天`)
  if (hours) parts.push(`${hours} 小时`)
  if (minutes || !parts.length) parts.push(`${minutes} 分钟`)
  return parts.join(' ')
}
