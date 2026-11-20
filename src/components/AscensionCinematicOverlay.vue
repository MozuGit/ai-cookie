<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'
import {
  playAscensionCinematicAudio,
  stopAscensionCinematicAudio,
} from '../audio'

const props = defineProps({
  tier: { type: String, required: true },
  reduced: { type: Boolean, default: false },
})

const emit = defineEmits(['complete'])

const TIER_META = {
  reduction: {
    label: '架构降维',
    sub: 'SPATIAL IMPLOSION // SINGULARITY',
    duration: 3600,
  },
  overload: {
    label: '算力超载',
    sub: 'CORE OVERDRIVE // CRITICAL FAILURE',
    duration: 4200,
  },
  collapse: {
    label: '逻辑坍缩',
    sub: 'ROOT ACCESS // DIMENSION TEAR',
    duration: 3300,
  },
}

const REDUCED_DURATION = 1000

const meta = computed(() => TIER_META[props.tier] || TIER_META.reduction)
const duration = computed(() =>
  props.reduced ? REDUCED_DURATION : meta.value.duration,
)

const WARP_LINES = Array.from({ length: 36 }, (_, index) => index)

// UI 虚影面板：仅覆盖层内绘制的幽灵轮廓，真实 DOM 不参与任何位移
const REDUCTION_GHOST_LAYOUT = [
  [3, 14, 22, 40],
  [75, 14, 22, 44],
  [27, 3, 46, 8],
  [38, 34, 24, 20],
  [3, 60, 24, 26],
  [30, 88, 40, 7],
  [72, 64, 22, 22],
  [42, 26, 16, 6],
]

const REDUCTION_GHOSTS = REDUCTION_GHOST_LAYOUT.map(
  ([x, y, width, height], index) => ({
    id: index,
    x,
    y,
    width,
    height,
    tx: (50 - (x + width / 2)).toFixed(2),
    ty: (46 - (y + height / 2)).toFixed(2),
    delay: (index * 0.055).toFixed(3),
  }),
)

const OVERLOAD_CODES = [
  'OVERLOAD',
  'ERR 0x7F3A',
  'CORE_TEMP 98C',
  'CRITICAL',
  '0xDEADBEEF',
  'THERMAL RUNAWAY',
  'GPU FAULT',
  'SIGNAL LOST',
  'MEM 0xFF',
  'BUS ERROR',
  'SYNC FAIL',
  'FAN 0 RPM',
  'CORE MELTDOWN',
  '0x00000000',
]

const OVERLOAD_COLUMNS = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  x: (index * 5.3 + 1.4) % 100,
  delay: -((index * 0.37) % 2.8),
  speed: 0.9 + (index % 5) * 0.26,
  code: OVERLOAD_CODES[index % OVERLOAD_CODES.length],
}))

// 底层乱码瀑布 | 黑紫与亮绿相间 向下疯狂坠落
const COLLAPSE_CODES = [
  '0x8F3A11',
  '110010Σ',
  'NULL 0x00',
  '0xDEADC0DE',
  'Σ10Σ01',
  '0xFF2A04',
  '0101 1010',
  'ROOT 0x1F',
  'ΣΣ0x7C3',
  '11011001',
  '0x00F1A5',
  'ERR 0x2C',
  'Σ01Σ10',
  '0xBADC0DE',
  '1100 0011',
  '0x77F1C2',
  'VOID 0x0',
  'Σ1Σ1Σ0',
  '0xFEEDFACE',
  '01100010',
  '0x51CA7B',
  'SIG 0x99',
  '1Σ00Σ1',
  '0x13B66F',
  '100101ΣΣ',
  '0x0DDF11',
  'CORE 0xE',
  'Σ0x1Σ9',
  '0x2F4B6D',
  '00111010',
]

const COLLAPSE_COLUMNS = Array.from({ length: 34 }, (_, index) => ({
  id: index,
  x: (index * 3.05 + 0.6) % 100,
  delay: -((index * 0.29) % 1.6),
  speed: 0.7 + (index % 7) * 0.13,
  code: COLLAPSE_CODES[index % COLLAPSE_CODES.length],
}))

let finishTimer = null
let watchdogTimer = null
let finished = false
let shellElement = null

function finish() {
  if (finished) return
  finished = true
  emit('complete')
}

// 卸载步骤必须逐项隔离 | 任何一步抛错都会打断 Vue 卸载 让黑屏层卡死在顶层
function releaseShell() {
  try {
    if (shellElement) {
      shellElement.removeAttribute('inert')
      shellElement = null
    }
  } catch { /* noop */ }
  try {
    document.body.classList.remove(
      'asc-cine-active',
      `asc-cine--${props.tier}`,
      'asc-cine-reduced',
    )
  } catch { /* noop */ }
}

// 保险 | 卸载被异常中断时直接隐藏演出层 绝不让黑屏卡在最上面
function forceHideOverlay() {
  try {
    document.querySelectorAll('.asc-cine').forEach((el) => {
      el.style.display = 'none'
    })
  } catch { /* noop */ }
}

onMounted(() => {
  document.body.classList.add('asc-cine-active', `asc-cine--${props.tier}`)
  if (props.reduced) document.body.classList.add('asc-cine-reduced')
  try {
    shellElement = document.querySelector('.app-shell')
    if (shellElement) shellElement.setAttribute('inert', '')
  } catch { /* noop */ }
  try {
    playAscensionCinematicAudio(props.tier, duration.value, props.reduced)
  } catch (error) {
    console.error('[asc-cine] audio start failed', error)
  }
  finishTimer = window.setTimeout(finish, duration.value)
  // 保险 | 主定时器失效时 时长+1.2s 强制恢复屏幕并解除交互封锁
  watchdogTimer = window.setTimeout(() => {
    releaseShell()
    forceHideOverlay()
    finish()
  }, duration.value + 1200)
})

onBeforeUnmount(() => {
  try {
    if (finishTimer) {
      window.clearTimeout(finishTimer)
      finishTimer = null
    }
    if (watchdogTimer) {
      window.clearTimeout(watchdogTimer)
      watchdogTimer = null
    }
  } catch { /* noop */ }
  try {
    stopAscensionCinematicAudio()
  } catch (error) {
    console.error('[asc-cine] audio stop failed', error)
  }
  releaseShell()
})
</script>

<template>
  <div
    v-if="reduced"
    class="asc-cine asc-cine--reduced"
    role="dialog"
    aria-modal="true"
    :aria-label="meta.label"
    :data-tier="tier"
  >
    <div class="asc-cine-reduced__flash" aria-hidden="true"></div>
    <div class="asc-cine-reduced__copy">
      <span>[ {{ meta.label }} ]</span>
      <small>MOTION REDUCED // EXECUTING</small>
    </div>
  </div>

  <div
    v-else-if="tier === 'reduction'"
    class="asc-cine asc-cine--reduction"
    role="dialog"
    aria-modal="true"
    aria-label="架构降维"
    data-tier="reduction"
  >
    <div class="asc-reduction__scrim" aria-hidden="true"></div>
    <div class="asc-reduction__ghosts" aria-hidden="true">
      <span
        v-for="ghost in REDUCTION_GHOSTS"
        :key="ghost.id"
        class="asc-reduction__ghost"
        :style="{
          '--gx': `${ghost.x}%`,
          '--gy': `${ghost.y}%`,
          '--gw': `${ghost.width}%`,
          '--gh': `${ghost.height}%`,
          '--tx': `${ghost.tx}vw`,
          '--ty': `${ghost.ty}vh`,
          '--delay': `${ghost.delay}s`,
        }"
      ></span>
    </div>
    <div class="asc-reduction__warp" aria-hidden="true">
      <span
        v-for="line in WARP_LINES"
        :key="line"
        class="asc-reduction__line"
        :style="{ '--i': line }"
      ></span>
    </div>
    <div class="asc-reduction__vortex" aria-hidden="true">
      <span class="asc-reduction__ring asc-reduction__ring--a"></span>
      <span class="asc-reduction__ring asc-reduction__ring--b"></span>
      <span class="asc-reduction__ring asc-reduction__ring--c"></span>
      <span class="asc-reduction__core"></span>
    </div>
    <div class="asc-reduction__vignette" aria-hidden="true"></div>
    <div class="asc-reduction__flash" aria-hidden="true"></div>
    <div class="asc-reduction__black" aria-hidden="true"></div>
    <div class="asc-reduction__copy">
      <span>[ 架构降维 ]</span>
      <small>SPATIAL IMPLOSION // SINGULARITY</small>
    </div>
  </div>

  <div
    v-else-if="tier === 'overload'"
    class="asc-cine asc-cine--overload"
    role="dialog"
    aria-modal="true"
    aria-label="算力超载"
    data-tier="overload"
  >
    <div class="asc-overload__scrim" aria-hidden="true"></div>
    <div class="asc-overload__rain" aria-hidden="true">
      <span
        v-for="column in OVERLOAD_COLUMNS"
        :key="column.id"
        class="asc-overload__code"
        :style="{
          '--x': `${column.x}%`,
          '--delay': `${column.delay}s`,
          '--speed': `${column.speed}s`,
        }"
        >{{ column.code }}</span
      >
    </div>
    <div class="asc-overload__glitch" aria-hidden="true">
      <span
        v-for="strip in 6"
        :key="strip"
        :style="{ '--n': strip }"
      ></span>
    </div>
    <div class="asc-overload__core" aria-hidden="true"></div>
    <div class="asc-overload__warnings" aria-hidden="true">
      <span class="asc-overload__warning">OVERLOAD</span>
      <span class="asc-overload__warning asc-overload__warning--critical">
        CRITICAL FAILURE
      </span>
    </div>
    <div class="asc-overload__flash" aria-hidden="true"></div>
    <div class="asc-overload__burst" aria-hidden="true"></div>
    <div class="asc-overload__black" aria-hidden="true"></div>
    <div class="asc-overload__copy">
      <span>[ 算力超载 ]</span>
      <small>CORE OVERDRIVE // CRITICAL FAILURE</small>
    </div>
  </div>

  <div
    v-else
    class="asc-cine asc-cine--collapse"
    role="dialog"
    aria-modal="true"
    aria-label="逻辑坍缩"
    data-tier="collapse"
  >
    <div class="asc-collapse__rain" aria-hidden="true">
      <span
        v-for="column in COLLAPSE_COLUMNS"
        :key="column.id"
        class="asc-collapse__code"
        :style="{
          '--x': `${column.x}%`,
          '--delay': `${column.delay}s`,
          '--speed': `${column.speed}s`,
        }"
        >{{ column.code }}</span
      >
    </div>
    <div class="asc-collapse__glitch" aria-hidden="true">
      <span
        v-for="strip in 8"
        :key="strip"
        :style="{ '--n': strip }"
      ></span>
    </div>
    <div class="asc-collapse__copy">
      <span data-text="[ 逻辑坍缩 ]">[ 逻辑坍缩 ]</span>
      <small>ROOT ACCESS // DIMENSION TEAR</small>
    </div>
    <div class="asc-collapse__black" aria-hidden="true"></div>
    <div class="asc-collapse__warning" aria-hidden="true">
      <span class="asc-collapse__warning-text"
        >[ 警告 ] 根权限已断开 // 逻辑矩阵正在解体...</span
      >
    </div>
  </div>
</template>
