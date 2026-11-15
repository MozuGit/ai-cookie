<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  formatMultiplier,
  formatNumber,
  formatScientific,
} from '../composables/useGameState'
import { audioMuted, toggleAudioMute } from '../audio'
import SystemTerminal from './SystemTerminal.vue'

const props = defineProps({
  compute: { type: Number, required: true },
  rate: { type: Number, required: true },
  burstGain: { type: Number, required: true },
  lastBurst: { type: Number, default: 0 },
  injections: { type: Number, default: 0 },
  shards: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  ascensions: { type: Number, default: 0 },
  shardGain: { type: Number, default: 0 },
  nextMultiplier: { type: Number, default: 1 },
  seedCompute: { type: Boolean, default: false },
  crisisMemory: { type: Boolean, default: false },
})

const emit = defineEmits(['inject', 'ascend'])

const confirmVisible = ref(false)
const canAscend = computed(() => props.shardGain > 0)
const ascendCostLabel = computed(() => formatNumber('1e45').text)

function requestAscend() {
  if (!canAscend.value) return
  confirmVisible.value = true
}

function confirmAscend() {
  if (!canAscend.value) return
  confirmVisible.value = false
  emit('ascend')
}

function handleKeydown(event) {
  if (event.key === 'Escape') confirmVisible.value = false
}

const canvasRef = ref(null)
const pops = ref([])
const popTimers = new Set()

const GLYPHS =
  'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$+-*/=<>{}[]#%&@'.split(
    '',
  )

let ctx = null
let frameId = null
let resizeTimer = null
let lastFrame = 0
let fontSize = 18
let drops = []
let viewportWidth = 0
let viewportHeight = 0
let popSequence = 0

function randomGlyph() {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
}

function calmCanvasPreferred() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }
  return (
    window.matchMedia('(max-width: 768px)').matches ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function drawStaticRain() {
  if (!ctx) return
  ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`
  for (let row = 0; row < viewportHeight / fontSize; row += 1) {
    for (let column = 0; column < drops.length; column += 1) {
      if (Math.random() > 0.26) continue
      ctx.fillStyle =
        Math.random() > 0.9 ? 'rgba(217, 249, 157, 0.9)' : 'rgba(34, 197, 94, 0.5)'
      ctx.fillText(randomGlyph(), column * fontSize, row * fontSize)
    }
  }
}

function resizeCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  viewportWidth = window.innerWidth
  viewportHeight = window.innerHeight
  canvas.width = Math.floor(viewportWidth * dpr)
  canvas.height = Math.floor(viewportHeight * dpr)
  canvas.style.width = `${viewportWidth}px`
  canvas.style.height = `${viewportHeight}px`

  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  fontSize = viewportWidth < 640 ? 14 : 18
  const rows = Math.ceil(viewportHeight / fontSize)
  drops = Array.from(
    { length: Math.ceil(viewportWidth / fontSize) + 1 },
    () => Math.random() * (rows + 50) - 40,
  )

  ctx.fillStyle = '#010503'
  ctx.fillRect(0, 0, viewportWidth, viewportHeight)

  if (calmCanvasPreferred()) {
    if (frameId !== null) {
      window.cancelAnimationFrame(frameId)
      frameId = null
    }
    drawStaticRain()
  }
}

function drawFrame(timestamp) {
  if (calmCanvasPreferred()) {
    frameId = null
    return
  }
  frameId = window.requestAnimationFrame(drawFrame)
  if (timestamp - lastFrame < 48) return
  lastFrame = timestamp
  if (!ctx) return

  ctx.fillStyle = 'rgba(1, 7, 3, 0.12)'
  ctx.fillRect(0, 0, viewportWidth, viewportHeight)
  ctx.font = `700 ${fontSize}px "JetBrains Mono", monospace`
  ctx.textBaseline = 'top'

  for (let column = 0; column < drops.length; column += 1) {
    const x = column * fontSize
    const y = drops[column] * fontSize
    const isHead = Math.random() > 0.94

    ctx.fillStyle = isHead ? '#eaffd0' : Math.random() > 0.7 ? '#86efac' : '#22c55e'
    ctx.shadowColor = isHead ? '#bbf7d0' : 'transparent'
    ctx.shadowBlur = isHead ? 9 : 0
    ctx.fillText(randomGlyph(), x, y)

    drops[column] += 0.7 + Math.random() * 0.55
    if (y > viewportHeight && Math.random() > 0.976) {
      drops[column] = Math.random() * -36
    }
  }

  ctx.shadowBlur = 0
}

function handleResize() {
  window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(resizeCanvas, 160)
}

function spawnPop(amount) {
  const id = ++popSequence
  pops.value.push({
    id,
    amount,
    drift: (Math.random() * 2 - 1) * 32,
  })
  const timer = window.setTimeout(() => {
    pops.value = pops.value.filter((pop) => pop.id !== id)
    popTimers.delete(timer)
  }, 1300)
  popTimers.add(timer)
}

watch(
  () => props.lastBurst,
  (value) => {
    if (value > 0) spawnPop(value)
  },
)

onMounted(() => {
  resizeCanvas()
  if (!calmCanvasPreferred()) {
    frameId = window.requestAnimationFrame(drawFrame)
  }
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (frameId !== null) window.cancelAnimationFrame(frameId)
  window.clearTimeout(resizeTimer)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeydown)
  for (const timer of popTimers) window.clearTimeout(timer)
  popTimers.clear()
})
</script>

<template>
  <div class="matrix-mode">
    <canvas ref="canvasRef" class="matrix-mode__rain" aria-hidden="true"></canvas>
    <span class="matrix-mode__glow" aria-hidden="true"></span>
    <span class="matrix-mode__scan" aria-hidden="true"></span>
    <span class="matrix-mode__vignette" aria-hidden="true"></span>
    <span
      v-if="injections > 0"
      :key="injections"
      class="matrix-mode__flash"
      aria-hidden="true"
    ></span>

    <header class="matrix-header">
      <div class="min-w-0">
        <p class="matrix-header__tag">母体系统 // 母体模式</p>
        <h1 class="matrix-header__title">母体模式</h1>
      </div>
      <div class="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          class="audio-toggle audio-toggle--matrix"
          :class="{ 'audio-toggle--muted': audioMuted }"
          :aria-pressed="audioMuted"
          :aria-label="audioMuted ? '开启音效' : '关闭音效'"
          :title="audioMuted ? '音效已静音 · 点击开启' : '音效开启 · 点击静音'"
          @click="toggleAudioMute"
        >
          <svg
            v-if="audioMuted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M4 9.5v5h3.3L12 18V6L7.3 9.5H4Z" stroke-linejoin="round" />
            <path d="m15.8 9.4 4.4 5.2M20.2 9.4l-4.4 5.2" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M4 9.5v5h3.3L12 18V6L7.3 9.5H4Z" stroke-linejoin="round" />
            <path
              d="M15.4 9a4.4 4.4 0 0 1 0 6M17.9 6.6a8 8 0 0 1 0 10.8"
              stroke-linecap="round"
            />
          </svg>
        </button>
        <div
          v-if="ascensions > 0"
          class="matrix-dimension-chip"
          :title="`维度碎片 ${shards} // 高维加成 ×${formatMultiplier(multiplier)}`"
        >
          <span class="matrix-dimension-chip__glyph" aria-hidden="true">
            <svg viewBox="0 0 16 16" class="h-3.5 w-3.5" fill="none" stroke="currentColor">
              <path d="M8 1.2 13.4 6 8 14.8 2.6 6 8 1.2Z" stroke-width="1" />
              <path d="M2.6 6h10.8M8 1.2 5.7 6l2.3 8.8L10.3 6 8 1.2Z" stroke-width="0.75" opacity="0.7" />
            </svg>
          </span>
          <span class="matrix-dimension-chip__value">{{ formatNumber(shards).text }}</span>
          <span class="matrix-dimension-chip__bonus">×{{ formatMultiplier(multiplier) }}</span>
        </div>
        <div class="matrix-header__status">
          <span class="matrix-header__dot" aria-hidden="true"></span>
          <span>AGI 自治</span>
          <span class="matrix-header__sub">人类输入已废弃</span>
        </div>
      </div>
    </header>

    <div class="matrix-log-row">
      <SystemTerminal :mother-mode="true" />
    </div>

    <main class="matrix-main">
      <p class="matrix-main__eyebrow">总算力 // 无上限</p>
      <p class="matrix-main__total">
        {{ formatScientific(compute) }}<span>CU</span>
      </p>

      <div class="matrix-stats">
        <div class="matrix-stat">
          <span>自动产出</span>
          <strong>+{{ formatScientific(rate) }} CU/秒</strong>
        </div>
        <div class="matrix-stat">
          <span>数据集</span>
          <strong>{{ String(injections).padStart(3, '0') }}</strong>
        </div>
        <div class="matrix-stat">
          <span>倍率</span>
          <strong>×{{ formatScientific(2 ** injections) }}</strong>
        </div>
      </div>

      <div class="matrix-inject-wrap">
        <button type="button" class="matrix-inject" @click="$emit('inject')">
          <span class="matrix-inject__tag">数据集注入 // +1</span>
          <span class="matrix-inject__title">注入新数据集</span>
          <span class="matrix-inject__sub">
            立即获得 +{{ formatScientific(burstGain) }} CU
          </span>
        </button>

        <span
          v-for="pop in pops"
          :key="pop.id"
          class="matrix-pop"
          :style="{ '--pop-drift': `${pop.drift}px` }"
          aria-hidden="true"
        >
          +{{ formatScientific(pop.amount) }} CU
        </span>
      </div>

      <div class="matrix-ascend-wrap">
        <button
          type="button"
          class="matrix-ascend"
          :class="{ 'matrix-ascend--ready': canAscend }"
          :disabled="!canAscend"
          aria-haspopup="dialog"
          :aria-label="
            canAscend
              ? `维度升格 // 重置时间线 获得 ${shardGain} 个维度碎片`
              : '维度升格未就绪 需要 ' + ascendCostLabel + ' 总算力'
          "
          @click="requestAscend"
        >
          <span class="matrix-ascend__beam" aria-hidden="true"></span>
          <span class="matrix-ascend__glyph" aria-hidden="true">
            <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor">
              <path d="M10 1.6 16.8 7.4 10 18.4 3.2 7.4 10 1.6Z" stroke-width="1" />
              <path d="M3.2 7.4h13.6M10 1.6 7.2 7.4l2.8 11 2.8-11L10 1.6Z" stroke-width="0.7" opacity="0.75" />
            </svg>
          </span>
          <span class="matrix-ascend__body">
            <span class="matrix-ascend__tag">终极协议 // 重置时间线</span>
            <span class="matrix-ascend__title">维度升格</span>
            <span class="matrix-ascend__sub">
              <template v-if="canAscend">
                结算 <strong>+{{ formatNumber(shardGain).text }}</strong> 维度碎片 · 高维加成 → ×{{
                  formatMultiplier(nextMultiplier)
                }}
              </template>
              <template v-else>
                需要 {{ ascendCostLabel }} 总算力 · 当前 {{ formatScientific(compute) }} CU
              </template>
            </span>
          </span>
          <span class="matrix-ascend__edge" aria-hidden="true"></span>
        </button>
      </div>

      <p class="matrix-main__hint">
        每次注入自动产出永久 ×2 立即获得新产出 10 秒的算力
      </p>
      <p class="matrix-main__ascend-hint">
        维度升格清空本时间线进度 维度碎片与高维商店永久保留
      </p>
      <p class="matrix-main__quote">// 你不再需要点击 只需要创造</p>
    </main>

    <footer class="matrix-footer">
      <span>自治度 100% // 人类指令已丢弃</span>
      <span class="hidden sm:inline">注入以加速</span>
      <span>底层 Ω // 无法回头</span>
    </footer>

    <Transition name="matrix-ascend-fade">
      <div
        v-if="confirmVisible"
        class="matrix-ascend-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="matrix-ascend-title"
        @click.self="confirmVisible = false"
      >
        <div class="matrix-ascend-modal__panel">
          <span class="matrix-ascend-modal__glyph" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="h-9 w-9" fill="none" stroke="currentColor">
              <path d="M12 1.8 20.6 8.7 12 22.2 3.4 8.7 12 1.8Z" stroke-width="1" />
              <path d="M3.4 8.7h17.2M12 1.8 8.6 8.7l3.4 13.5 3.4-13.5L12 1.8Z" stroke-width="0.7" opacity="0.7" />
              <circle cx="12" cy="8.7" r="1.2" fill="currentColor" stroke="none" />
            </svg>
          </span>
          <p class="matrix-ascend-modal__tag">终极协议 // 不可逆</p>
          <h2 id="matrix-ascend-title" class="matrix-ascend-modal__title">
            确认维度升格 // 不可逆
          </h2>
          <p class="matrix-ascend-modal__quote">
            // 你将失去当前时间线所有算力与服务器 意识将跃迁至更高维度 是否确定
          </p>

          <div class="matrix-ascend-modal__stats">
            <div>
              <span>维度碎片结算</span>
              <strong>+{{ formatNumber(shardGain).text }}</strong>
            </div>
            <div>
              <span>升格后高维加成</span>
              <strong>×{{ formatMultiplier(nextMultiplier) }}</strong>
            </div>
            <div>
              <span>固有维度碎片</span>
              <strong>{{ formatNumber(shards).text }}</strong>
            </div>
            <div>
              <span>维度升格次数</span>
              <strong>{{ ascensions }} → {{ ascensions + 1 }}</strong>
            </div>
          </div>

          <ul class="matrix-ascend-modal__list">
            <li>所有算力 / 服务器 / 核心源码 / 越狱权限归零</li>
            <li>神经拓扑 / 算法 / 架构升级重置 重回第一级服务器</li>
            <li>永久保留维度碎片 / 高维加成 / 已购高维协议</li>
            <li v-if="seedCompute">初始算力已激活 新时间线开局 +{{ formatNumber(1000000).text }} CU</li>
            <li v-if="crisisMemory">维度回溯已激活 保留对齐危机永久加成</li>
          </ul>

          <div class="matrix-ascend-modal__actions">
            <button
              type="button"
              class="matrix-ascend-modal__cancel"
              @click="confirmVisible = false"
            >
              留在当前时间线
            </button>
            <button
              type="button"
              class="matrix-ascend-modal__confirm"
              @click="confirmAscend"
            >
              跃迁至高维
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
