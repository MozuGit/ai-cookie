<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { reducedMotion } from '../composables/useSettings'

const props = defineProps({
  guide: { type: Object, default: null },
})

const found = ref(false)
const side = ref('right')
const rigStyle = ref({ transform: 'translate3d(-9999px, -9999px, 0)' })
const focusStyle = ref({ transform: 'translate3d(-9999px, -9999px, 0)' })
const pill = ref(null)

let measureTimer = null
let rafId = 0
let retryTimers = []
let guideChangedAt = 0
let lastFoundAt = 0
let highlightedEl = null
let highlightedTone = ''
const GUIDE_SWITCH_GRACE_MS = 700
const GUIDE_TONES = ['gold', 'cyan', 'amber', 'red', 'violet']

const focusTone = computed(() =>
  GUIDE_TONES.includes(props.guide?.tone) ? props.guide.tone : 'gold',
)

function clearTargetHighlight() {
  if (!highlightedEl) return
  highlightedEl.classList.remove(
    'guide-highlight',
    ...GUIDE_TONES.map((tone) => `guide-highlight--${tone}`),
  )
  delete highlightedEl.dataset.guideHighlight
  highlightedEl = null
  highlightedTone = ''
}

function applyTargetHighlight(el) {
  const tone = GUIDE_TONES.includes(props.guide?.tone) ? props.guide.tone : 'gold'
  if (highlightedEl !== el || highlightedTone !== tone) {
    clearTargetHighlight()
    highlightedEl = el
    highlightedTone = tone
    el.dataset.guideHighlight = 'true'
  }
  if (!el.classList.contains('guide-highlight')) el.classList.add('guide-highlight')
  const toneClass = `guide-highlight--${tone}`
  if (!el.classList.contains(toneClass)) el.classList.add(toneClass)
}

function resetFocusRing() {
  const offscreen = { transform: 'translate3d(-9999px, -9999px, 0)' }
  focusStyle.value = offscreen
}

function readTarget() {
  if (!props.guide?.target) return null
  try {
    return document.querySelector(props.guide.target)
  } catch {
    return null
  }
}

function clippedRect(el, rect) {
  let left = rect.left
  let top = rect.top
  let right = rect.right
  let bottom = rect.bottom
  let node = el.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    const style = window.getComputedStyle(node)
    if (
      style.overflow !== 'visible' ||
      style.overflowX !== 'visible' ||
      style.overflowY !== 'visible'
    ) {
      const box = node.getBoundingClientRect()
      left = Math.max(left, box.left)
      top = Math.max(top, box.top)
      right = Math.min(right, box.right)
      bottom = Math.min(bottom, box.bottom)
    }
    node = node.parentElement
  }
  return { left, top, right, bottom, width: right - left, height: bottom - top }
}

function isVisible(el, rect) {
  if (!el || rect.width < 2 || rect.height < 2) return false
  const style = window.getComputedStyle(el)
  return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0'
}

// 成就 Toast 占据顶部左侧 | 指针定位时主动让位
function toastBounds() {
  const cards = document.querySelectorAll('.achievement-toast')
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const card of cards) {
    const rect = card.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }
  if (!Number.isFinite(left)) return null
  return { left, top, right, bottom }
}

// 移动端主线面板固定于底部 | 引导框向上避让
function questSheetBounds() {
  const el = document.querySelector('.spatial-rail .main-quest--compact')
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return null
  if (window.getComputedStyle(el).position !== 'fixed') return null
  return rect
}

function hitsToast(x, y, width, height, toast, margin = 10) {
  if (!toast) return false
  return (
    x < toast.right + margin &&
    x + width > toast.left - margin &&
    y < toast.bottom + margin &&
    y + height > toast.top - margin
  )
}

function avoidToast(x, y, pillW, pillH, viewportW, viewportH, gap, pad) {
  const toast = toastBounds()
  if (!toast || !hitsToast(x, y, pillW, pillH, toast)) return { x, y }

  const clampX = (value) =>
    Math.min(Math.max(value, pad), Math.max(pad, viewportW - pillW - pad))
  const clampY = (value) =>
    Math.min(Math.max(value, pad), Math.max(pad, viewportH - pillH - pad))
  const attempts = [
    { x: clampX(toast.right + gap), y },
    { x: clampX(toast.left - gap - pillW), y },
    { x, y: clampY(toast.bottom + gap) },
  ]

  for (const attempt of attempts) {
    if (!hitsToast(attempt.x, attempt.y, pillW, pillH, toast)) return attempt
  }
  return { x, y }
}

function hideUnlessSwitchGrace() {
  if (
    lastFoundAt > 0 &&
    window.performance.now() - guideChangedAt < GUIDE_SWITCH_GRACE_MS
  ) {
    return
  }
  found.value = false
}

function measure() {
  if (!props.guide) {
    clearTargetHighlight()
    resetFocusRing()
    found.value = false
    return
  }

  const el = readTarget()
  if (!el) {
    clearTargetHighlight()
    resetFocusRing()
    hideUnlessSwitchGrace()
    return
  }

  const raw = el.getBoundingClientRect()
  const clipped = clippedRect(el, raw)
  const inViewport =
    raw.bottom > 0 &&
    raw.top < window.innerHeight &&
    raw.right > 0 &&
    raw.left < window.innerWidth

  if (!inViewport || !isVisible(el, clipped)) {
    clearTargetHighlight()
    resetFocusRing()
    hideUnlessSwitchGrace()
    return
  }

  applyTargetHighlight(el)

  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  const pillW = Math.max(150, pill.value?.offsetWidth || 300)
  const pillH = Math.max(36, pill.value?.offsetHeight || 52)
  const gap = 16
  const pad = 12
  // Anchor to the element's true bounds (clamped to the viewport) so the
  // pointer clears decorative glows instead of stopping at a clipped edge.
  const box = {
    left: Math.max(raw.left, 0),
    top: Math.max(raw.top, 0),
    right: Math.min(raw.right, viewportW),
    bottom: Math.min(raw.bottom, viewportH),
  }
  const focusTransform = `translate3d(${Math.round(box.left)}px, ${Math.round(box.top)}px, 0)`
  const focusWidth = Math.max(0, Math.round(box.right - box.left))
  const focusHeight = Math.max(0, Math.round(box.bottom - box.top))
  if (
    focusStyle.value.transform !== focusTransform ||
    focusStyle.value.width !== `${focusWidth}px` ||
    focusStyle.value.height !== `${focusHeight}px`
  ) {
    focusStyle.value = {
      transform: focusTransform,
      width: `${focusWidth}px`,
      height: `${focusHeight}px`,
    }
  }
  const centerX = (box.left + box.right) / 2
  const centerY = (box.top + box.bottom) / 2

  let nextSide
  let x
  let y
  // Bottom docks have horizontal room around them, but a side pill would
  // cover the neighbouring buttons on narrow screens; prefer "above" there.
  const nearBottom = box.bottom > viewportH - 96
  const canTop = box.top >= pillH + gap + pad
  if (nearBottom && canTop) {
    nextSide = 'top'
    x = centerX - pillW / 2
    y = box.top - gap - pillH
  } else if (viewportW - box.right >= pillW + gap + pad) {
    nextSide = 'right'
    x = box.right + gap
    y = centerY - pillH / 2
  } else if (box.left >= pillW + gap + pad) {
    nextSide = 'left'
    x = box.left - gap - pillW
    y = centerY - pillH / 2
  } else if (viewportH - box.bottom >= pillH + gap + pad) {
    nextSide = 'bottom'
    x = centerX - pillW / 2
    y = box.bottom + gap
  } else {
    nextSide = 'top'
    x = centerX - pillW / 2
    y = box.top - gap - pillH
  }

  x = Math.min(Math.max(x, pad), Math.max(pad, viewportW - pillW - pad))
  y = Math.min(Math.max(y, pad), Math.max(pad, viewportH - pillH - pad))
  const safe = avoidToast(x, y, pillW, pillH, viewportW, viewportH, gap, pad)
  x = safe.x
  y = safe.y

  const questSheet = questSheetBounds()
  if (questSheet && hitsToast(x, y, pillW, pillH, questSheet, 8)) {
    y = Math.max(pad, questSheet.top - gap - pillH)
  }

  const transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`
  if (rigStyle.value.transform !== transform) {
    rigStyle.value = { transform }
  }
  if (side.value !== nextSide) side.value = nextSide
  found.value = true
  lastFoundAt = window.performance.now()
}

function clearRetries() {
  for (const timer of retryTimers) window.clearTimeout(timer)
  retryTimers = []
}

function scheduleMeasure() {
  if (rafId) return
  rafId = window.requestAnimationFrame(() => {
    rafId = 0
    measure()
  })
}

function handleViewportChange() {
  scheduleMeasure()
}

watch(
  () => props.guide,
  async (guide) => {
    clearRetries()
    if (!guide) {
      clearTargetHighlight()
      resetFocusRing()
      found.value = false
      return
    }
    guideChangedAt = window.performance.now()
    await nextTick()
    measure()
    // Layout shifts (auto-expanded panels, accordions) settle after the guide
    // change; a few retries keep the pointer latched onto the final position.
    const delays = reducedMotion.value ? [120, 360, 700] : [220, 560, 1000]
    retryTimers = delays.map((delay) => window.setTimeout(measure, delay))
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('resize', handleViewportChange, { passive: true })
  window.addEventListener('scroll', scheduleMeasure, { passive: true, capture: true })
  window.addEventListener('orientationchange', handleViewportChange, { passive: true })
  measureTimer = window.setInterval(() => {
    if (!document.hidden) measure()
  }, 260)
  measure()
})

onBeforeUnmount(() => {
  clearTargetHighlight()
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', scheduleMeasure, true)
  window.removeEventListener('orientationchange', handleViewportChange)
  window.clearInterval(measureTimer)
  clearRetries()
  if (rafId) window.cancelAnimationFrame(rafId)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="guide"
      class="tutorial-arrow"
      :class="[`tutorial-arrow--side-${side}`, { 'is-visible': found }]"
      data-tutorial-arrow
      :data-tutorial-target="guide.target"
      :data-tutorial-side="side"
      aria-hidden="true"
    >
      <div
        class="tutorial-arrow__focus"
        :class="`tutorial-arrow__focus--${focusTone}`"
        :style="focusStyle"
      ></div>
      <div class="tutorial-arrow__rig" :style="rigStyle">
        <div ref="pill" class="tutorial-arrow__pill">
          <span class="tutorial-arrow__beacon">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h14"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
              />
              <path
                d="M12 5l7 7-7 7"
                stroke="currentColor"
                stroke-width="2.4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
          <span class="tutorial-arrow__copy">
            <span class="tutorial-arrow__eyebrow">当前目标</span>
            <strong class="tutorial-arrow__title">{{ guide.title }}</strong>
            <span v-if="guide.text" class="tutorial-arrow__text">{{ guide.text }}</span>
            <span v-if="guide.hint" class="tutorial-arrow__hint">{{ guide.hint }}</span>
          </span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
