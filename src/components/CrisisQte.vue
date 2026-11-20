<script setup>
import { computed } from 'vue'

const props = defineProps({
  alignment: { type: Number, default: 30 },
  angle: { type: Number, default: 0 },
  safe: { type: Boolean, default: true },
  auto: { type: Boolean, default: false },
  chargeRate: { type: Number, default: 20 },
  drainRate: { type: Number, default: 5 },
  rescue: { type: Boolean, default: false },
  rescueForced: { type: Boolean, default: false },
  rescuePrompt: { type: String, default: '' },
  rescueTarget: { type: String, default: '' },
})

const emit = defineEmits(['nudge-start', 'nudge-end', 'nudge'])

const CX = 200
const CY = 200
const R = 170
const SAFE_HALF = 18

function polar(deg, radius = R) {
  const rad = (deg * Math.PI) / 180
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY - Math.sin(rad) * radius,
  }
}

function pointLabel(point) {
  return `${point.x.toFixed(2)} ${point.y.toFixed(2)}`
}

const rimPath = `M${CX - R} ${CY} A${R} ${R} 0 0 1 ${CX + R} ${CY}`
const safeLeft = polar(90 + SAFE_HALF)
const safeRight = polar(90 - SAFE_HALF)
const safePath = `M${CX} ${CY} L${pointLabel(safeLeft)} A${R} ${R} 0 0 1 ${pointLabel(safeRight)} Z`

const spokes = []
for (let deg = 0; deg <= 180; deg += 15) {
  const point = polar(deg, R - 9)
  spokes.push({
    deg,
    x: point.x.toFixed(2),
    y: point.y.toFixed(2),
    major: deg % 30 === 0,
  })
}

const arcs = [42, 84, 126, 168].map((radius) => {
  const left = polar(180, radius)
  const right = polar(0, radius)
  return `M${pointLabel(left)} A${radius} ${radius} 0 0 1 ${pointLabel(right)}`
})

const needleTip = computed(() => {
  const angle = Math.max(-90, Math.min(90, props.angle))
  return polar(90 - angle, R - 20)
})

const alignmentLabel = computed(() =>
  Math.max(0, Math.min(100, Math.round(props.alignment))),
)

const angleLabel = computed(() => {
  const value = Math.round(Math.max(-90, Math.min(90, props.angle)))
  return `${value > 0 ? '+' : ''}${value}°`
})

const rescueActive = computed(() => props.rescue)
const rescueTargetLeft = computed(
  () => rescueActive.value && !props.rescueForced && props.rescueTarget === 'left',
)
const rescueTargetRight = computed(
  () => rescueActive.value && !props.rescueForced && props.rescueTarget === 'right',
)
const leftDisabled = computed(
  () =>
    props.auto ||
    (rescueActive.value && (props.rescueForced || !rescueTargetLeft.value)),
)
const rightDisabled = computed(
  () =>
    props.auto ||
    (rescueActive.value && (props.rescueForced || !rescueTargetRight.value)),
)

const statusTitle = computed(() => {
  if (props.rescueForced) return '强制修正 · 指针回收中'
  if (rescueActive.value) return '时序时停 · 等待修正'
  return props.safe ? '对齐充能中 100%' : '负载失衡 · 对齐流失'
})

const statusRate = computed(() => {
  if (props.rescueForced) return '自动平衡协议接管'
  if (rescueActive.value) return '时停中 · 对齐度锁定'
  return props.safe
    ? `+${props.chargeRate}% / 秒`
    : `-${props.drainRate}% / 秒`
})

function press(direction) {
  emit('nudge-start', direction)
}

function release(direction) {
  emit('nudge-end', direction)
}

function nudge(direction) {
  emit('nudge', direction)
}
</script>

<template>
  <div
    class="qte-shell"
    :class="{ 'qte-shell--rescue': rescueActive }"
    role="dialog"
    aria-modal="true"
    aria-label="负载平衡"
  >
    <div class="qte-shell__backdrop" aria-hidden="true"></div>

    <section
      class="qte-panel"
      :class="{
        'qte-panel--danger': !safe,
        'qte-panel--auto': auto,
        'qte-panel--rescue': rescueActive,
        'qte-panel--rescue-forced': rescueForced,
      }"
    >
      <span class="qte-panel__corner qte-panel__corner--tl" aria-hidden="true"></span>
      <span class="qte-panel__corner qte-panel__corner--tr" aria-hidden="true"></span>
      <span class="qte-panel__corner qte-panel__corner--bl" aria-hidden="true"></span>
      <span class="qte-panel__corner qte-panel__corner--br" aria-hidden="true"></span>

      <header class="qte-header">
        <p class="qte-header__eyebrow">负载平衡协议 // LOAD BALANCE</p>
        <h2 class="qte-header__title">对齐危机 · 负载失衡</h2>
        <p class="qte-header__sub">指针稳定在绿色安全区 充满对齐度解除危机</p>
      </header>

      <div
        v-if="rescueActive"
        class="qte-rescue"
        :class="{ 'qte-rescue--forced': rescueForced }"
        role="alert"
        aria-live="assertive"
      >
        <span class="qte-rescue__tag">{{ rescueForced ? 'FORCED HOLD' : 'TIME HOLD' }}</span>
        <p class="qte-rescue__prompt">{{ rescuePrompt }}</p>
      </div>

      <div class="qte-gauge">
        <span class="qte-gauge__axis qte-gauge__axis--left" aria-hidden="true">L</span>
        <span class="qte-gauge__axis qte-gauge__axis--right" aria-hidden="true">R</span>
        <div class="qte-gauge__sweep" aria-hidden="true"></div>

        <svg class="qte-gauge__svg" viewBox="0 0 400 212" aria-hidden="true">
          <defs>
            <linearGradient id="qte-rim" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stop-color="#0891b2" stop-opacity="0.25" />
              <stop offset="0.5" stop-color="#67e8f9" stop-opacity="0.95" />
              <stop offset="1" stop-color="#0891b2" stop-opacity="0.25" />
            </linearGradient>
            <linearGradient id="qte-safe" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stop-color="#22c55e" stop-opacity="0.04" />
              <stop offset="1" stop-color="#4ade80" stop-opacity="0.36" />
            </linearGradient>
            <radialGradient id="qte-hub" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stop-color="#ecfeff" />
              <stop offset="0.45" stop-color="#22d3ee" />
              <stop offset="1" stop-color="#0e7490" stop-opacity="0" />
            </radialGradient>
            <filter id="qte-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path class="qte-gauge__rim-glow" :d="rimPath" />
          <path class="qte-gauge__rim" :d="rimPath" stroke="url(#qte-rim)" />

          <g class="qte-gauge__grid">
            <path
              v-for="(arc, index) in arcs"
              :key="`arc-${index}`"
              :d="arc"
              class="qte-gauge__grid-arc"
            />
            <line
              v-for="spoke in spokes"
              :key="`spoke-${spoke.deg}`"
              x1="200"
              y1="200"
              :x2="spoke.x"
              :y2="spoke.y"
              class="qte-gauge__grid-line"
              :class="{ 'qte-gauge__grid-line--major': spoke.major }"
            />
          </g>

          <path class="qte-gauge__safe" :d="safePath" fill="url(#qte-safe)" />
          <path class="qte-gauge__safe-edge" :d="safePath" />
          <line
            x1="200"
            y1="200"
            :x2="safeLeft.x.toFixed(2)"
            :y2="safeLeft.y.toFixed(2)"
            class="qte-gauge__safe-boundary"
          />
          <line
            x1="200"
            y1="200"
            :x2="safeRight.x.toFixed(2)"
            :y2="safeRight.y.toFixed(2)"
            class="qte-gauge__safe-boundary"
          />

          <line
            x1="200"
            y1="200"
            :x2="needleTip.x.toFixed(2)"
            :y2="needleTip.y.toFixed(2)"
            class="qte-gauge__needle"
            filter="url(#qte-glow)"
          />
          <line
            x1="200"
            y1="200"
            :x2="needleTip.x.toFixed(2)"
            :y2="needleTip.y.toFixed(2)"
            class="qte-gauge__needle-core"
          />
          <circle cx="200" cy="200" r="18" fill="url(#qte-hub)" opacity="0.7" />
          <circle cx="200" cy="200" r="6" class="qte-gauge__hub" />
          <circle cx="200" cy="200" r="2.4" fill="#ecfeff" />
        </svg>

        <div class="qte-gauge__readout">
          <span class="qte-gauge__angle">{{ angleLabel }}</span>
          <span class="qte-gauge__state" :class="{ 'qte-gauge__state--danger': !safe }">
            {{ safe ? 'SAFE' : 'OFFSET' }}
          </span>
        </div>
      </div>

      <div class="qte-status" :class="{ 'qte-status--danger': !safe }" aria-live="polite">
        <p class="qte-status__title">{{ statusTitle }}</p>
        <p class="qte-status__rate">{{ statusRate }}</p>
      </div>

      <div class="qte-charge">
        <div
          class="qte-charge__track"
          role="progressbar"
          aria-label="对齐度"
          :aria-valuenow="alignmentLabel"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span
            class="qte-charge__fill"
            :class="{ 'qte-charge__fill--danger': !safe }"
            :style="{ width: `${alignmentLabel}%` }"
          ></span>
        </div>
        <div class="qte-charge__labels">
          <span>对齐度 {{ alignmentLabel }}%</span>
          <span>目标 100%</span>
        </div>
      </div>

      <div class="qte-controls">
        <button
          type="button"
          class="qte-nudge"
          data-guide="qte-nudge-left"
          :class="{ 'qte-nudge--target': rescueTargetLeft }"
          :disabled="leftDisabled"
          aria-label="向左微调"
          @pointerdown.prevent="press(-1)"
          @pointerup="release(-1)"
          @pointerleave="release(-1)"
          @pointercancel="release(-1)"
          @click="nudge(-1)"
        >
          <span
            v-if="rescueTargetLeft"
            class="qte-nudge__callout"
            aria-hidden="true"
          >
            <span class="qte-nudge__callout-label">按住或点击此处</span>
            <span class="qte-nudge__callout-arrow">▼</span>
          </span>
          <span class="qte-nudge__arrow" aria-hidden="true">◀</span>
          <span class="qte-nudge__label">向左微调</span>
        </button>
        <button
          type="button"
          class="qte-nudge"
          data-guide="qte-nudge-right"
          :class="{ 'qte-nudge--target': rescueTargetRight }"
          :disabled="rightDisabled"
          aria-label="向右微调"
          @pointerdown.prevent="press(1)"
          @pointerup="release(1)"
          @pointerleave="release(1)"
          @pointercancel="release(1)"
          @click="nudge(1)"
        >
          <span
            v-if="rescueTargetRight"
            class="qte-nudge__callout"
            aria-hidden="true"
          >
            <span class="qte-nudge__callout-label">点击这里修正</span>
            <span class="qte-nudge__callout-arrow">▼</span>
          </span>
          <span class="qte-nudge__label">向右微调</span>
          <span class="qte-nudge__arrow" aria-hidden="true">▶</span>
        </button>
      </div>

      <p v-if="!rescueActive" class="qte-hint">
        键盘 <kbd>←</kbd> / <kbd>→</kbd> 微调 · 指针滑出安全区将失去对齐度
      </p>

      <div v-if="auto" class="qte-auto">
        <span class="qte-auto__dot" aria-hidden="true"></span>
        自动平衡协议介入中 · 1 秒后解除危机
      </div>
    </section>
  </div>
</template>
