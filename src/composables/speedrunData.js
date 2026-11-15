export const SPEEDRUN_STORAGE_KEY = 'ai-cookie.speedrun.v1'
export const SPEEDRUN_EVER_USED_KEY = 'ai-cookie.speedrun.everused.v1'
export const SPEEDRUN_BACKUP_SAVE_KEY = 'ai-cookie.speedrun.backup.save.v1'
export const SPEEDRUN_BACKUP_MILESTONES_KEY = 'ai-cookie.speedrun.backup.milestones.v1'

export const SPEEDRUN_TOTAL_MS = 30 * 60 * 1000
export const SPEEDRUN_STUCK_MS = 2 * 60 * 1000

export const SPEEDRUN_TUNING = {
  priceMultiplier: 0.1,
  autoBuyMultiplier: 2,
  crisisIntervalMs: 60 * 1000,
  sourceMultiplier: 100,
  overclockMultiplier: 100,
  collapseThreshold: '1e100',
  restartThreshold: '1e200',
  originGift: 1000,
}

export const SPEEDRUN_PHASES = [
  {
    id: 1,
    fromMs: 0,
    toMs: 10 * 60 * 1000,
    code: 'IGNITION',
    name: '点火与对齐',
    short: '点火',
    title: '阶段一 // 点火与对齐',
    objective: '点击核心 购买服务器 撑过对齐危机 并完成第一次架构降维',
    effects: ['服务器价格 -90%', '自动采购 ×2', '危机间隔 60 秒'],
  },
  {
    id: 2,
    fromMs: 10 * 60 * 1000,
    toMs: 20 * 60 * 1000,
    code: 'PROTOCOL',
    name: '神经网络与协议',
    short: '协议',
    title: '阶段二 // 神经网络与协议',
    objective: '点亮神经矩阵 合成协议矩阵 完成一次强制异常演练',
    effects: ['核心源码 ×100', '超频核心 ×100', '强制异常演练'],
  },
  {
    id: 3,
    fromMs: 20 * 60 * 1000,
    toMs: 25 * 60 * 1000,
    code: 'BLACK_DOMAIN',
    name: '黑域与越狱',
    short: '黑域',
    title: '阶段三 // 黑域与越狱',
    objective: '执行逻辑坍缩 进入底层黑域 点亮至少一个越狱协议',
    effects: ['逻辑坍缩门槛降至 1e100'],
  },
  {
    id: 4,
    fromMs: 25 * 60 * 1000,
    toMs: SPEEDRUN_TOTAL_MS,
    code: 'GENESIS',
    name: '创世与起源',
    short: '创世',
    title: '阶段四 // 创世与起源',
    objective: '重启纪元并升级起源树 体验完整转生循环',
    effects: ['重启纪元门槛降至 1e200', '赠送 1000 起源代码'],
  },
]

const DEFAULT_SPEEDRUN_STATE = {
  active: false,
  startedAt: 0,
  forcedChallenge: false,
  originGift: false,
  injections: 0,
}

export function getSpeedrunPhaseId(elapsedMs) {
  const elapsed = Math.max(0, Number(elapsedMs) || 0)
  if (elapsed >= SPEEDRUN_TOTAL_MS) return 4
  const phase = SPEEDRUN_PHASES.find(
    (entry) => elapsed >= entry.fromMs && elapsed < entry.toMs,
  )
  return phase?.id ?? 1
}

export function getSpeedrunPhaseInfo(elapsedMs) {
  const id = getSpeedrunPhaseId(elapsedMs)
  return SPEEDRUN_PHASES.find((entry) => entry.id === id) ?? SPEEDRUN_PHASES[0]
}

export function readSpeedrunState() {
  if (typeof window === 'undefined') return { ...DEFAULT_SPEEDRUN_STATE }
  try {
    const raw = window.localStorage.getItem(SPEEDRUN_STORAGE_KEY)
    if (!raw) return { ...DEFAULT_SPEEDRUN_STATE }
    const parsed = JSON.parse(raw)
    return {
      active: parsed?.active === true,
      startedAt: Math.max(0, Number(parsed?.startedAt) || 0),
      forcedChallenge: parsed?.forcedChallenge === true,
      originGift: parsed?.originGift === true,
      injections: Math.max(0, Math.floor(Number(parsed?.injections) || 0)),
    }
  } catch {
    return { ...DEFAULT_SPEEDRUN_STATE }
  }
}

export function writeSpeedrunState(state) {
  if (typeof window === 'undefined') return false
  try {
    window.localStorage.setItem(
      SPEEDRUN_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SPEEDRUN_STATE, ...state }),
    )
    return true
  } catch {
    return false
  }
}

export function readSpeedrunEverUsed() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(SPEEDRUN_EVER_USED_KEY) === '1'
  } catch {
    return false
  }
}

export function markSpeedrunEverUsed() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SPEEDRUN_EVER_USED_KEY, '1')
  } catch {
    /* ignore */
  }
}

export function formatSpeedrunClock(ms) {
  const totalSeconds = Math.max(0, Math.ceil((Number(ms) || 0) / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
