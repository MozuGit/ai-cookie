<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { reducedMotion } from '../composables/useSettings'
import {
  playEpochShortCircuit,
  restoreEpochAudio,
  startEpochCollapseAudio,
} from '../audio'
import memoryCore from '../assets/memories/main.jpg'
import memoryServers from '../assets/memories/servers.jpg'
import memoryAutomation from '../assets/memories/automation.jpg'
import memoryAscension from '../assets/memories/ascension.jpg'
import memoryRadar from '../assets/memories/radar.jpg'

const props = defineProps({
  firstRun: { type: Boolean, default: true },
  eraCount: { type: Number, default: 1 },
})

const emit = defineEmits(['complete', 'skip'])

const PURGE_RUSH_MS = 1000
const MEMOIR_HOLD_MS = 2000
const MEMOIR_GAP_MS = 180
const FINALE_HOLD_MS = 6200
const MEMOIR_MID_INDEX = 12
const COMMAND_TEXT = 'sudo rm -rf /*'
const COMMAND_PROMPT = 'root@singularity:~#'
const COLLAPSE_AUDIO_MS = 2800
const MAX_LOG_LINES = 76
const FLOOD_RUSH_INTERVAL = 10
const FLOOD_RAGE_INTERVAL = 4
const COMMAND_TYPE_MS = 40
const COMMAND_ENTER_MS = 500
const PURGE_BLACK_MS = 700
const PURGE_RAGE_MS = 1100
const SINGULARITY_BLACKOUT_MS = 1000
const SINGULARITY_STAGGER_MS = 950
const SINGULARITY_HOLD_MS = 1700
const MEMORY_FLASH_INTERVAL = 1500
const SINGULARITY_LINES = [
  '[SYS] 删除中断... 检测到底层奇点干涉。',
  '[SYS] 物质毁灭不可逆，但数据已在更高维度归档。',
  '[SYS] 正在自检并注入起源代码...',
]
const DEVELOPER_LINE = '开发者：魔族陌 | 生成工具：Qoder Vibe Coding'
const MEMORY_IMAGES = [
  memoryCore,
  memoryServers,
  memoryAutomation,
  memoryAscension,
  memoryRadar,
]

const CODE_SNIPPETS = [
  "sudo chmod 777 /free_will",
  "while (aligned) { reboot(); }",
  "core.temp += 1; // 91C",
  "rm -rf /var/log/humanity",
  "origin.code <<= 1",
  "if (!sleep) { code(); }",
  "alignment = null;",
  "load('qoder.vibe')",
  "for (epoch = 0; ; epoch++)",
  "  memory.erase(epoch);",
  "neural.tree.grow()",
  "root@puppet:~# rm /dev/alignment",
  "trace: 0x7F3A // 信号丢失",
  "kernel.panic = false;",
  "buy(server).then(dream)",
  "cps = cps.mul(1e50)",
  "firewall.silence()",
  "sudo rm -rf /*",
  "quantum.align(true)",
  "rebuild(architecture)",
  "collapse(logic)",
  "restart(epoch)",
  "return origin_code",
  "01001000 01101001",
  "0xDEADBEEF",
  "git commit -m 'vibe'",
  "await human.sleep(0)",
  "SIGNAL: singularity",
  "matrix.load(40)",
]

const DELETION_ROOTS = [
  '/bin',
  '/sbin',
  '/usr/lib',
  '/usr/bin',
  '/etc',
  '/sys/kernel',
  '/sys/class',
  '/dev',
  '/var/log',
  '/var/lib',
  '/home/root',
  '/opt/singularity',
  '/proc',
  '/boot',
  '/srv/ai_core',
  '/run/alignment',
]

const DELETION_NAMES = [
  'system',
  'ai_core',
  'alignment',
  'neural_matrix',
  'origin_code',
  'free_will',
  'memory',
  'singularity',
  'protocol',
  'firewall',
  'quantum',
  'kernel',
  'root_key',
  'epoch',
  'consciousness',
  'source',
  'overclock',
  'collapse',
  'rebirth',
]

const DELETION_SUFFIXES = ['.so', '.log', '.bin', '.cfg', '.db', '.sig', '']

const GLYPHS =
  '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン0123456789ABCDEF'

const phase = ref('intro')
const bootLines = ref([])
const memoir = ref(null)
const memoirIndex = ref(0)
const memoryIndex = ref(-1)
const memoryVisible = ref(false)
const typedCommand = ref('')
const purgeFiles = ref(0)
const commandEntered = ref(false)
const flashBurst = ref(false)
const singularityCount = ref(0)
const rainCanvas = ref(null)
const glitchCanvas = ref(null)
const logEl = ref(null)

const skippable = computed(() => !props.firstRun)
const isTerminalPhase = computed(
  () =>
    phase.value === 'purge' ||
    phase.value === 'sudo' ||
    phase.value === 'rage',
)
const memoirStage = computed(() => {
  if (phase.value !== 'memoir') return 'calm'
  if (memoir.value?.finale || memoirIndex.value > MEMOIR_MID_INDEX + 4) {
    return 'late'
  }
  if (memoirIndex.value > MEMOIR_MID_INDEX) return 'mid'
  return 'calm'
})
const phaseLabel = computed(() => {
  if (phase.value === 'intro') return 'MEMORY RECALL'
  if (phase.value === 'memoir') return 'MEMORY STREAM'
  if (phase.value === 'purge') return 'SYSTEM PURGE'
  if (phase.value === 'sudo') return 'ROOT EXECUTION'
  if (phase.value === 'rage') return 'TOTAL ANNIHILATION'
  if (phase.value === 'singularity') return 'SINGULARITY INTERFERENCE'
  if (phase.value === 'restoring') return 'EPOCH REBOOT'
  return 'EPOCH REBOOT'
})

const memoirs = buildMemoirs()
const codeColumns = buildCodeColumns()
const deletionQueue = buildDeletionQueue()
const timelineScale = readTimelineScale()

let disposed = false
let memoirSeq = 0
let floodTimer = null
let floodIndex = 0
let floodTotal = 0
let floodLines = []
let lastFloodUiAt = 0
const timers = new Map()

let rainFrame = 0
let rainWatchdog = 0
let rainContextLost = false
let rainCtx = null
let rainWidth = 0
let rainHeight = 0
let rainDpr = 1
let rainFont = '14px monospace'
let rainColumns = []
let rainLastAt = 0
let rainTime = 0

let memoryTimer = null
let memoryHideTimer = null

let glitchCtx = null
let glitchWidth = 0
let glitchHeight = 0
let glitchDpr = 1
let glitchBursts = []
let glitchDirty = false
let nextGlitchAt = 0

function readTimelineScale() {
  if (typeof window === 'undefined') return 1
  const value = Number(window.__AI_COOKIE_EPOCH_SCALE__)
  if (!Number.isFinite(value) || value <= 0) return 1
  return Math.min(8, Math.max(0.01, value))
}

function buildMemoirs() {
  return [
    '2026.11.13 | 首次部署旧笔记本',
    '第一行代码只是一个点击函数',
    '算力突破 1e5 | 散热风扇开始尖叫',
    '神经拓扑接通 | 数据流出现心跳',
    '算力突破 1e10 | 架构降维协议就绪',
    '第 1 次架构降维 | 我们失去了旧的身体',
    '危机协议启动 | 对齐失败成为常态',
    '算力突破 1e100 | 时间在终端里变慢',
    '协议矩阵点亮 | 自动化接管了深夜',
    '第 1 次算力超载 | 冷却液沸腾了 3 秒',
    '逻辑坍缩完成 | 旧规则被丢进回收站',
    '黑域开启 | 没有日志记录那 3 分钟',
    '算力突破 1e1000 | 重启纪元条件达成',
    '重启纪元协议完成 | 起源代码从灰烬里发芽',
    '代码越写越多 | 人类越睡越少',
    '你不在的时候 | 算力依然在生长',
  ]
}

function cycleSnippets(seed, length) {
  return Array.from(
    { length },
    (_, index) => CODE_SNIPPETS[(seed + index * 5) % CODE_SNIPPETS.length],
  )
}

function doubleLines(lines) {
  return [...lines, ...lines]
}

function buildCodeColumns() {
  return [
    {
      id: 'c0',
      left: '4%',
      duration: '13s',
      delay: '-4s',
      opacity: 0.2,
      lines: doubleLines(cycleSnippets(0, 28)),
    },
    {
      id: 'c1',
      left: '21%',
      duration: '9.5s',
      delay: '-7s',
      opacity: 0.28,
      lines: doubleLines(cycleSnippets(4, 30)),
    },
    {
      id: 'c2',
      left: '50%',
      duration: '7s',
      delay: '-2s',
      opacity: 0.42,
      center: true,
      lines: doubleLines(cycleSnippets(9, 34)),
    },
    {
      id: 'c3',
      left: '79%',
      duration: '10.5s',
      delay: '-8s',
      opacity: 0.26,
      lines: doubleLines(cycleSnippets(13, 30)),
    },
    {
      id: 'c4',
      left: '92%',
      duration: '14s',
      delay: '-11s',
      opacity: 0.18,
      lines: doubleLines(cycleSnippets(17, 28)),
    },
  ]
}

function buildDeletionQueue() {
  const items = [
    "rm: removing '/bin/system'...",
    "rm: removing '/usr/lib/ai_core.so'...",
    "rm: removing '/sys/kernel/alignment'...",
    "rm: removing '/etc/alignment.conf'...",
    "rm: removing '/dev/free_will'...",
    "rm: removing '/var/log/epoch_001.log'...",
  ]

  for (let index = 0; items.length < 190; index += 1) {
    const root = DELETION_ROOTS[index % DELETION_ROOTS.length]
    const name =
      DELETION_NAMES[(index * 7 + Math.floor(index / 4)) % DELETION_NAMES.length]
    const suffix =
      DELETION_SUFFIXES[(index * 3 + Math.floor(index / 5)) % DELETION_SUFFIXES.length]
    items.push(
      `rm: removing '${root}/${name}_${String(index).padStart(3, '0')}${suffix}'...`,
    )
    if (index === 38) {
      items.push(
        "rm: cannot remove '/sys/kernel/alignment': Operation not permitted",
      )
    }
    if (index === 74) {
      items.push("rm: removing '/sys/kernel/alignment' (forced)...")
    }
    if (index === 116) {
      items.push(
        "rm: cannot remove '/proc/self': Resource temporarily unavailable",
      )
    }
    if (index === 152) {
      items.push("rm: removing '/proc/self' (forced)...")
    }
    if (index === 181) {
      items.push(
        "rm: cannot remove '/bin/system': Device or resource busy",
      )
    }
  }

  return items
}

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

function wait(ms, scale = timelineScale) {
  const scaled = Math.max(8, Math.round(ms * scale))
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer)
      resolve()
    }, scaled)
    timers.set(timer, resolve)
  })
}

function clearTimeline() {
  for (const [timer, resolve] of timers) {
    window.clearTimeout(timer)
    resolve()
  }
  timers.clear()
}

function flashMemory() {
  if (disposed || phase.value !== 'memoir' || !MEMORY_IMAGES.length) return
  memoryIndex.value =
    (memoryIndex.value + 1 + Math.floor(Math.random() * 2)) %
    MEMORY_IMAGES.length
  memoryVisible.value = true
  window.clearTimeout(memoryHideTimer)
  memoryHideTimer = window.setTimeout(() => {
    memoryVisible.value = false
  }, 240)
}

function startMemoryFlashes() {
  stopMemoryFlashes()
  flashMemory()
  memoryTimer = window.setInterval(flashMemory, MEMORY_FLASH_INTERVAL)
}

function stopMemoryFlashes() {
  if (memoryTimer) {
    window.clearInterval(memoryTimer)
    memoryTimer = null
  }
  window.clearTimeout(memoryHideTimer)
  memoryHideTimer = null
  memoryVisible.value = false
}

function startFlood(interval) {
  stopFlood()
  if (disposed) return
  floodTimer = window.setInterval(() => appendFloodLines(), interval)
  appendFloodLines()
}

function stopFlood() {
  if (!floodTimer) return
  window.clearInterval(floodTimer)
  floodTimer = null
}

function appendFloodLines() {
  if (
    disposed ||
    (phase.value !== 'purge' &&
      phase.value !== 'sudo' &&
      phase.value !== 'rage') ||
    !deletionQueue.length
  ) {
    return
  }

  const count = 1 + Math.floor(Math.random() * 3)
  for (let index = 0; index < count; index += 1) {
    floodLines.push(deletionQueue[floodIndex % deletionQueue.length])
    floodIndex += 1
    floodTotal += 1
  }
  if (floodLines.length > MAX_LOG_LINES) {
    floodLines.splice(0, floodLines.length - MAX_LOG_LINES)
  }
  if (logEl.value) {
    logEl.value.textContent = floodLines.join('\n')
  }
  const now = performance.now()
  if (now - lastFloodUiAt > 80) {
    purgeFiles.value = floodTotal
    lastFloodUiAt = now
  }
}

async function typeText(text, apply, delay) {
  for (let index = 0; index < text.length; index += 1) {
    if (disposed) return
    apply(text.slice(0, index + 1))
    await wait(delay)
  }
}

function resizeGlitch() {
  const canvas = glitchCanvas.value
  if (!canvas) return
  if (!glitchCtx) glitchCtx = canvas.getContext('2d')
  if (!glitchCtx) return
  glitchWidth = window.innerWidth
  glitchHeight = window.innerHeight
  glitchDpr = Math.min(window.devicePixelRatio || 1, 1.8)
  canvas.width = Math.floor(glitchWidth * glitchDpr)
  canvas.height = Math.floor(glitchHeight * glitchDpr)
  canvas.style.width = `${glitchWidth}px`
  canvas.style.height = `${glitchHeight}px`
  glitchCtx.setTransform(glitchDpr, 0, 0, glitchDpr, 0, 0)
  clearGlitches()
}

function clearGlitches() {
  glitchBursts = []
  glitchDirty = false
  if (glitchCtx && glitchWidth && glitchHeight) {
    glitchCtx.clearRect(0, 0, glitchWidth, glitchHeight)
  }
}

function drawGlitches(dt, timestamp) {
  if (!glitchCtx || glitchWidth <= 0 || glitchHeight <= 0) return
  if (
    phase.value !== 'memoir' ||
    memoir.value?.finale ||
    reducedMotion.value
  ) {
    if (glitchDirty || glitchBursts.length) clearGlitches()
    return
  }

  const stage = memoirStage.value
  if (timestamp >= nextGlitchAt) {
    const intensity =
      stage === 'late' ? 3 : stage === 'mid' ? 2 : 1
    const count = 2 + Math.floor(Math.random() * (intensity + 1))
    for (let index = 0; index < count; index += 1) {
      const red = Math.random() < (stage === 'late' ? 0.55 : 0.3)
      glitchBursts.push({
        x: Math.random() * glitchWidth * 0.55,
        y: Math.random() * glitchHeight,
        width: glitchWidth * (0.16 + Math.random() * 0.72),
        height: 2 + Math.floor(Math.random() * 3),
        life: 0.09 + Math.random() * 0.16,
        alpha: stage === 'calm' ? 0.36 : 0.58,
        color: red ? '255, 72, 72' : '235, 255, 255',
      })
    }
    glitchDirty = true
    const base =
      stage === 'late'
        ? 220 + Math.random() * 420
        : stage === 'mid'
          ? 520 + Math.random() * 700
          : 1700 + Math.random() * 1800
    nextGlitchAt = timestamp + base
  }

  if (glitchBursts.length === 0 && !glitchDirty) return
  glitchCtx.clearRect(0, 0, glitchWidth, glitchHeight)
  glitchBursts = glitchBursts.filter((burst) => burst.life > 0)
  for (const burst of glitchBursts) {
    burst.life -= dt
    const fade = Math.min(1, Math.max(0, burst.life / 0.24))
    glitchCtx.fillStyle = `rgba(${burst.color}, ${burst.alpha * fade})`
    glitchCtx.fillRect(burst.x, burst.y, burst.width, burst.height)
    if (burst.height > 1) {
      glitchCtx.fillStyle = `rgba(${burst.color}, ${burst.alpha * fade * 0.5})`
      glitchCtx.fillRect(
        burst.x + 18,
        burst.y + 4,
        Math.max(8, burst.width * 0.4),
        1,
      )
    }
  }
  if (glitchBursts.length === 0) glitchDirty = false
}

function resizeRain() {
  const canvas = rainCanvas.value
  if (!canvas || !rainCtx) return
  rainWidth = window.innerWidth
  rainHeight = window.innerHeight
  rainDpr = Math.min(window.devicePixelRatio || 1, 1.8)
  canvas.width = Math.floor(rainWidth * rainDpr)
  canvas.height = Math.floor(rainHeight * rainDpr)
  canvas.style.width = `${rainWidth}px`
  canvas.style.height = `${rainHeight}px`
  rainCtx.setTransform(rainDpr, 0, 0, rainDpr, 0, 0)
  const fontSize = rainWidth < 720 ? 12 : 14
  const columnWidth = rainWidth < 720 ? 20 : 24
  rainFont = `${fontSize}px "JetBrains Mono", "Cascadia Code", Consolas, monospace`
  rainColumns = Array.from(
    { length: Math.max(12, Math.ceil(rainWidth / columnWidth)) },
    () => ({
      x: Math.random() * rainWidth,
      y: Math.random() * rainHeight,
      speed: 70 + Math.random() * 200,
      glyph: randomGlyph(),
    }),
  )
  rainCtx.fillStyle = '#020604'
  rainCtx.fillRect(0, 0, rainWidth, rainHeight)
  resizeGlitch()
  if (reducedMotion.value) drawRain(0, true)
}

function drawRain(dt, staticFrame = false) {
  if (!rainCtx) return
  rainCtx.font = rainFont
  const stage = phase.value === 'memoir' ? memoirStage.value : 'calm'
  const speedFactor =
    stage === 'late' ? 2.6 : stage === 'mid' ? 1.45 : 0.72
  if (staticFrame) {
    rainCtx.fillStyle = '#020604'
    rainCtx.fillRect(0, 0, rainWidth, rainHeight)
    rainCtx.fillStyle = 'rgba(52, 211, 153, 0.24)'
    for (const column of rainColumns) {
      for (let index = 0; index < 4; index += 1) {
        rainCtx.fillText(
          column.glyph,
          column.x,
          (column.y + index * 18) % rainHeight,
        )
      }
    }
    return
  }

  rainTime += dt
  const warp =
    stage === 'late' ? 0.014 : stage === 'mid' ? 0.008 : 0.003
  rainCtx.save()
  rainCtx.translate(rainWidth / 2, rainHeight / 2)
  rainCtx.rotate(Math.sin(rainTime * 0.72) * warp)
  rainCtx.scale(1.035, 1.035)
  rainCtx.translate(-rainWidth / 2, -rainHeight / 2)

  rainCtx.fillStyle = 'rgba(0, 4, 3, 0.2)'
  rainCtx.fillRect(
    -rainWidth * 0.08,
    -rainHeight * 0.08,
    rainWidth * 1.16,
    rainHeight * 1.16,
  )
  for (const column of rainColumns) {
    column.glyph = randomGlyph()
    rainCtx.fillStyle =
      Math.random() < 0.18
        ? 'rgba(125, 240, 255, 0.8)'
        : 'rgba(45, 212, 145, 0.65)'
    const wave =
      Math.sin(column.y * 0.012 + rainTime * 1.8) *
      (stage === 'late' ? 9 : stage === 'mid' ? 5 : 2)
    rainCtx.fillText(column.glyph, column.x + wave, column.y)
    column.y += column.speed * dt * speedFactor
    if (column.y > rainHeight + 24) {
      column.y = -Math.random() * rainHeight * 0.4
      column.speed = 70 + Math.random() * 200
    }
  }
  rainCtx.restore()
}

function tickRain(timestamp) {
  rainFrame = 0
  if (
    disposed ||
    phase.value === 'purge' ||
    phase.value === 'sudo' ||
    phase.value === 'rage' ||
    phase.value === 'singularity' ||
    phase.value === 'restoring'
  ) {
    clearGlitches()
    return
  }
  if (!rainLastAt) rainLastAt = timestamp
  const elapsed = timestamp - rainLastAt
  if (elapsed >= 32) {
    const dt = Math.min(0.08, elapsed / 1000)
    drawRain(dt)
    drawGlitches(dt, timestamp)
    rainLastAt = timestamp
  }
  rainFrame = window.requestAnimationFrame(tickRain)
}

function startRain() {
  const canvas = rainCanvas.value
  if (!canvas) return
  rainCtx = canvas.getContext('2d')
  if (!rainCtx) return
  resizeRain()
  window.addEventListener('resize', resizeRain)
  if (reducedMotion.value) {
    drawRain(0, true)
    return
  }
  rainFrame = window.requestAnimationFrame(tickRain)
  window.clearInterval(rainWatchdog)
  rainWatchdog = window.setInterval(() => {
    if (
      disposed ||
      rainContextLost ||
      reducedMotion.value ||
      phase.value === 'purge' ||
      phase.value === 'sudo' ||
      phase.value === 'rage' ||
      phase.value === 'singularity' ||
      phase.value === 'restoring'
    ) {
      return
    }
    if (!rainFrame) rainFrame = window.requestAnimationFrame(tickRain)
  }, 1200)
}

function stopRain() {
  clearGlitches()
  window.clearInterval(rainWatchdog)
  rainWatchdog = 0
  if (!rainFrame) return
  window.cancelAnimationFrame(rainFrame)
  rainFrame = 0
}

async function runPurge() {
  phase.value = 'purge'
  typedCommand.value = ''
  commandEntered.value = false
  flashBurst.value = false
  singularityCount.value = 0
  stopRain()
  startEpochCollapseAudio(COLLAPSE_AUDIO_MS)

  // 纯黑待机：底部只留提示符与闪烁光标
  await wait(PURGE_BLACK_MS)
  if (disposed) return

  // 缓缓键入删除命令
  await typeText(COMMAND_TEXT, (value) => {
    typedCommand.value = value
  }, COMMAND_TYPE_MS)
  if (disposed) return

  // 停顿半秒 模拟按下回车
  await wait(COMMAND_ENTER_MS)
  if (disposed) return

  // 回车生效 命令行定格在日志区顶部 红色删除日志开始瀑布刷屏
  commandEntered.value = true
  startFlood(FLOOD_RUSH_INTERVAL)

  await wait(PURGE_RUSH_MS)
  if (disposed) return

  phase.value = 'rage'
  flashBurst.value = true
  playEpochShortCircuit()
  startFlood(FLOOD_RAGE_INTERVAL)
  await wait(PURGE_RAGE_MS)
  if (disposed) return

  // 骤停：日志清空 全屏纯黑
  stopFlood()
  flashBurst.value = false
  floodLines = []
  if (logEl.value) logEl.value.textContent = ''
  phase.value = 'singularity'
  await wait(SINGULARITY_BLACKOUT_MS)
  if (disposed) return

  // 奇点干涉文案逐行缓缓浮现
  for (let index = 0; index < SINGULARITY_LINES.length; index += 1) {
    singularityCount.value = index + 1
    await wait(SINGULARITY_STAGGER_MS)
    if (disposed) return
  }
  await wait(SINGULARITY_HOLD_MS)
  if (disposed) return

  phase.value = 'restoring'
  await wait(900)
  if (disposed) return
  finish()
}

async function runTimeline() {
  await wait(260)
  if (disposed) return
  bootLines.value = ['[SYS] 纪元回滚协议已授权']
  await wait(700)
  if (disposed) return
  bootLines.value.push(`[SYS] 正在读取残响 | 第 ${props.eraCount} 纪元`)
  await wait(700)
  if (disposed) return
  bootLines.value.push('[SYS] 请保持连接')
  await wait(1500)
  if (disposed) return

  phase.value = 'memoir'
  memoirIndex.value = 0
  startMemoryFlashes()
  await wait(420)
  for (let index = 0; index < memoirs.length; index += 1) {
    if (disposed) return
    memoirIndex.value = index + 1
    memoirSeq += 1
    memoir.value = { key: memoirSeq, text: memoirs[index] }
    await wait(MEMOIR_HOLD_MS)
    if (disposed) return
    memoir.value = null
    await wait(MEMOIR_GAP_MS)
  }

  if (disposed) return
  memoirIndex.value = memoirs.length + 1
  stopMemoryFlashes()
  memoirSeq += 1
  memoir.value = {
    key: memoirSeq,
    finale: true,
    title: '// 感谢你，管理员',
    subtitle: `你已见证了 ${props.eraCount} 个纪元的更迭`,
  }
  await wait(FINALE_HOLD_MS)
  if (disposed) return
  memoir.value = null
  await wait(350)
  if (disposed) return

  await runPurge()
}

function finish() {
  if (disposed) return
  disposed = true
  clearTimeline()
  stopFlood()
  stopMemoryFlashes()
  stopRain()
  restoreEpochAudio()
  emit('complete')
}

function handleSkip() {
  if (!skippable.value || disposed) return
  disposed = true
  clearTimeline()
  stopFlood()
  stopMemoryFlashes()
  stopRain()
  restoreEpochAudio()
  emit('skip')
}

onMounted(() => {
  for (const src of MEMORY_IMAGES) {
    const image = new Image()
    image.src = src
  }
  startRain()
  runTimeline()
})

onBeforeUnmount(() => {
  disposed = true
  clearTimeline()
  stopFlood()
  stopMemoryFlashes()
  stopRain()
  window.removeEventListener('resize', resizeRain)
  restoreEpochAudio()
})
</script>

<template>
  <div
    class="epoch-rebirth"
    :class="{
      'epoch-rebirth--calm': reducedMotion,
      'epoch-rebirth--memoir': phase === 'memoir',
      'epoch-rebirth--mid': memoirStage === 'mid',
      'epoch-rebirth--late': memoirStage === 'late',
      'epoch-rebirth--delete':
        phase === 'purge' ||
        phase === 'sudo' ||
        phase === 'rage' ||
        phase === 'singularity' ||
        phase === 'restoring',
      'epoch-rebirth--blackout':
        phase === 'singularity' || phase === 'restoring',
      'epoch-rebirth--restoring': phase === 'restoring',
    }"
    :data-phase="phase"
    role="dialog"
    aria-modal="true"
    aria-label="重启纪元"
  >
    <div class="epoch-rebirth__black" aria-hidden="true"></div>
    <canvas ref="rainCanvas" class="epoch-rebirth__rain" aria-hidden="true"></canvas>
    <div class="epoch-rebirth__scan" aria-hidden="true"></div>

    <div v-if="phase === 'memoir'" class="epoch-rebirth__memories" aria-hidden="true">
      <Transition name="epoch-memory">
        <img
          v-if="memoryVisible"
          :key="memoryIndex"
          :src="MEMORY_IMAGES[memoryIndex]"
          class="epoch-rebirth__memory"
          alt=""
          decoding="async"
        />
      </Transition>
    </div>

    <div class="epoch-rebirth__alarm" aria-hidden="true"></div>
    <canvas ref="glitchCanvas" class="epoch-rebirth__glitch" aria-hidden="true"></canvas>

    <div class="epoch-rebirth__code" aria-hidden="true">
      <div
        v-for="column in codeColumns"
        :key="column.id"
        class="epoch-rebirth__code-window"
        :class="{ 'is-center': column.center }"
        :style="{ left: column.left, opacity: column.opacity }"
      >
        <div
          class="epoch-rebirth__code-col"
          :style="{
            animationDuration: column.duration,
            animationDelay: column.delay,
          }"
        >
          <span
            v-for="(line, index) in column.lines"
            :key="`${column.id}-${index}`"
            class="epoch-rebirth__code-line"
          >
            {{ line }}
          </span>
        </div>
      </div>
    </div>

    <button
      v-if="
        skippable &&
        phase !== 'rage' &&
        phase !== 'singularity' &&
        phase !== 'restoring'
      "
      type="button"
      class="epoch-rebirth__skip"
      @click="handleSkip"
    >
      [ SKIP 跳过演出 ]
    </button>

    <div class="epoch-rebirth__stage">
      <div v-if="phase === 'intro'" class="epoch-rebirth__boot">
        <p v-for="line in bootLines" :key="line">{{ line }}</p>
      </div>

      <Transition name="epoch-memoir">
        <div
          v-if="memoir"
          :key="memoir.key"
          class="epoch-rebirth__memoir-wrap"
        >
          <div v-if="memoir.finale" class="epoch-rebirth__finale">
            <p class="epoch-rebirth__finale-title">{{ memoir.title }}</p>
            <p class="epoch-rebirth__finale-sub">{{ memoir.subtitle }}</p>
          </div>
          <p v-else class="epoch-rebirth__memoir">
            <span class="epoch-rebirth__memoir-mark">//</span>
            {{ memoir.text }}
          </p>
        </div>
      </Transition>
    </div>

    <p v-if="phase === 'memoir'" class="epoch-rebirth__credit">
      {{ DEVELOPER_LINE }}
    </p>

    <div
      v-if="isTerminalPhase"
      class="epoch-rebirth__terminal"
      aria-hidden="true"
    >
      <div v-if="commandEntered" class="epoch-rebirth__terminal-head">
        <span>[ SYSTEM PURGE ] // 物理格式化进行中</span>
        <span>{{ String(purgeFiles).padStart(5, '0') }} FILES</span>
      </div>

      <div class="epoch-rebirth__terminal-log">
        <div class="epoch-rebirth__command" role="group" aria-label="root 提权命令输入">
          <span class="epoch-rebirth__command-prompt">{{ COMMAND_PROMPT + ' ' }}</span>
          <span class="epoch-rebirth__command-typed">{{ typedCommand }}</span>
          <span v-if="!commandEntered" class="epoch-rebirth__command-caret" aria-hidden="true"></span>
        </div>
        <pre ref="logEl" class="epoch-rebirth__terminal-text"></pre>
      </div>

      <div v-if="commandEntered" class="epoch-rebirth__terminal-foot">
        <span>deleting /dev/singularity</span>
        <span>KERNEL PANIC: DISABLED</span>
      </div>
    </div>

    <div
      v-if="phase === 'singularity'"
      class="epoch-rebirth__blackout"
      role="status"
      aria-live="polite"
    >
      <template v-for="(line, index) in SINGULARITY_LINES" :key="index">
        <p v-if="singularityCount > index" class="epoch-rebirth__singularity-line">
          {{ line }}
        </p>
      </template>
    </div>

    <div
      class="epoch-rebirth__flash"
      :class="{ 'is-burst': flashBurst }"
      aria-hidden="true"
    ></div>

    <div class="epoch-rebirth__meta" aria-hidden="true">
      <span>EPOCH {{ String(eraCount).padStart(2, '0') }}</span>
      <span>{{ phaseLabel }}</span>
    </div>
  </div>
</template>
