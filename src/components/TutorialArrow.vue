<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { reducedMotion } from '../composables/useSettings'

const props = defineProps({
  guide: { type: Object, default: null },
})

const found = ref(false)
const side = ref('right')
const compact = ref(false)
const rigStyle = ref({ transform: 'translate3d(-9999px, -9999px, 0)' })
const focusStyle = ref({ transform: 'translate3d(-9999px, -9999px, 0)' })
const pill = ref(null)

let measureTimer = null
let rafEvalId = 0
let rafValidateId = 0
let retryTimers = []
let domObserver = null
let lastGuideKey = 'none'
let lastFoundAt = 0
let invalidSince = 0
let placedBox = null
let highlightedEl = null
let highlightedTone = ''
const GUIDE_TONES = ['gold', 'cyan', 'amber', 'red', 'violet']
const GAP = 16
const PAD = 12
const TARGET_MARGIN = 6
const TOAST_MARGIN = 10
const SHEET_MARGIN = 8
const CORE_MARGIN = 10
// 底部控制带 | 极速模式按钮 + 四向舱门 | 悬浮框与其保持 50px 安全间距
const BAND_CLEARANCE = 50
const BAND_SELECTOR =
  '.speedrun-launch, [data-guide="servers-dock"], [data-guide="protocol-dock"], [data-guide="anomaly-dock"], [data-guide="automation-dock"]'
// 位移阈值 | 低于此值视为抖动 | 不触发重定位
const MOVE_THRESHOLD = 4
// 防闪烁锁存 | 目标持续不可见超过该时长才允许退场
const FLICKER_LOCK_MS = 1000

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

function rectsOverlap(box, obstacle, margin) {
  return (
    box.left < obstacle.right + margin &&
    box.right > obstacle.left - margin &&
    box.top < obstacle.bottom + margin &&
    box.bottom > obstacle.top - margin
  )
}

function unionBounds(nodes) {
  let left = Infinity
  let top = Infinity
  let right = -Infinity
  let bottom = -Infinity
  for (const node of nodes) {
    const rect = node.getBoundingClientRect()
    if (rect.width < 2 || rect.height < 2) continue
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)
  }
  if (!Number.isFinite(left)) return null
  return { left, top, right, bottom }
}

function boundsOf(selector) {
  return unionBounds(document.querySelectorAll(selector))
}

// 移动端主线面板固定于底部 | 作为障碍物避让
function questSheetBounds() {
  const el = document.querySelector('.spatial-rail .main-quest--compact')
  if (!el) return null
  const rect = el.getBoundingClientRect()
  if (rect.width < 2 || rect.height < 2) return null
  if (window.getComputedStyle(el).position !== 'fixed') return null
  return rect
}

// 弹窗场景 | 目标位于抽屉面板内 | 面板与头部作为定位参照
function drawerScene(el, raw) {
  const panel = el.closest('.holo-shell__panel')
  if (!panel) return null
  const headEl = panel.querySelector('.holo-shell__head')
  const headRect = headEl ? headEl.getBoundingClientRect() : null
  return {
    panel: panel.getBoundingClientRect(),
    head: headRect,
    targetInHead: headRect ? rectsOverlap(raw, headRect, 0) : false,
  }
}

// 稳定键位 | 目标与文案均未变化时视为同一引导 | 忽略对象换新
function guideKeyOf(guide) {
  if (!guide) return 'none'
  return [guide.id ?? '', guide.target, guide.title ?? '', guide.text ?? '', guide.hint ?? '', guide.tone ?? ''].join('|')
}

// 防闪烁锁存 | 目标短暂不可见时保持现状 | 持续超过 1s 才退场
function markInvalid() {
  if (!found.value) return
  const now = window.performance.now()
  if (!invalidSince) invalidSince = now
  if (now - invalidSince >= FLICKER_LOCK_MS) hideNow()
}

// 已显示状态下的定位失败 | 1s 内不退场
function softHide() {
  if (
    found.value &&
    lastFoundAt > 0 &&
    window.performance.now() - lastFoundAt < FLICKER_LOCK_MS
  ) {
    return
  }
  hideNow()
}

function hideNow() {
  clearTargetHighlight()
  resetFocusRing()
  found.value = false
  lastFoundAt = 0
  invalidSince = 0
  placedBox = null
}

function clampToViewport(x, y, pillW, pillH, viewportW, viewportH) {
  return {
    x: Math.min(Math.max(x, PAD), Math.max(PAD, viewportW - pillW - PAD)),
    y: Math.min(Math.max(y, PAD), Math.max(PAD, viewportH - pillH - PAD)),
  }
}

function evaluate() {
  if (!props.guide) {
    hideNow()
    return
  }

  const el = readTarget()
  if (!el) {
    clearTargetHighlight()
    resetFocusRing()
    softHide()
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
    softHide()
    return
  }

  applyTargetHighlight(el)

  const viewportW = window.innerWidth
  const viewportH = window.innerHeight
  const pillW = Math.max(150, pill.value?.offsetWidth || 300)
  const pillH = Math.max(36, pill.value?.offsetHeight || 52)

  // Anchor to the element's true bounds (clamped to the viewport) so the
  // focus ring clears decorative glows instead of stopping at a clipped edge.
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

  const scene = drawerScene(el, raw)
  if (compact.value !== Boolean(scene)) compact.value = Boolean(scene)
  const centerX = (box.left + box.right) / 2
  const centerY = (box.top + box.bottom) / 2

  // 主界面底部控制带 | 极速模式按钮 + 底部横条内的舱门 | 方向舱门在侧边与顶部时不纳入
  const band = scene
    ? null
    : unionBounds(
        Array.from(document.querySelectorAll(BAND_SELECTOR)).filter((el) => {
          const rect = el.getBoundingClientRect()
          return rect.width >= 2 && rect.height >= 2 && rect.top > viewportH * 0.55
        }),
      )
  const targetInBand = Boolean(band && rectsOverlap(raw, band, 0))

  // 候选方位按场景排序 | 中部目标优先侧边 | 底部目标优先正上方 | 全部不合适时自动翻转
  let kinds
  if (scene) {
    const p = scene.panel
    const headFloor = scene.head && !scene.targetInHead ? scene.head.bottom : p.top
    kinds = []
    if (box.right + GAP + pillW <= p.right - 8) kinds.push('right')
    if (box.left - GAP - pillW >= p.left + 8) kinds.push('left')
    if (box.top - GAP - pillH >= headFloor + 8) kinds.push('top')
    if (box.bottom + GAP + pillH <= p.bottom - 8) kinds.push('bottom')
    if (viewportW - p.right >= pillW + GAP + PAD) kinds.push('panel-right')
    if (p.left >= pillW + GAP + PAD) kinds.push('panel-left')
  } else if (band && targetInBand) {
    // 控制带内目标 | 固定于底部控制带上方 50px | 正中央优先 | 偏左备选
    kinds = ['top', 'top-left']
  } else {
    const bottomZone = box.top > viewportH * 0.62 || box.bottom > viewportH - 150
    kinds = (
      bottomZone ? ['top', 'right', 'left', 'bottom'] : ['right', 'left', 'top', 'bottom']
    ).filter((kind) => {
      if (kind === 'right') return viewportW - box.right >= pillW + GAP + PAD
      if (kind === 'left') return box.left >= pillW + GAP + PAD
      if (kind === 'top') return box.top >= pillH + GAP + PAD
      return viewportH - box.bottom >= pillH + GAP + PAD
    })
  }

  // 方位迟滞 | 目标位移后仍优先沿用原方位 | 抑制左右翻转跳动
  if (side.value && kinds.includes(side.value)) {
    kinds = [side.value, ...kinds.filter((kind) => kind !== side.value)]
  }

  const place = (kind) => {
    switch (kind) {
      case 'right':
        return { side: 'right', x: box.right + GAP, y: centerY - pillH / 2 }
      case 'left':
        return { side: 'left', x: box.left - GAP - pillW, y: centerY - pillH / 2 }
      case 'top':
        return {
          side: 'top',
          x: centerX - pillW / 2,
          y:
            band && targetInBand
              ? band.top - BAND_CLEARANCE - pillH
              : box.top - GAP - pillH,
        }
      case 'top-left':
        return {
          side: 'top',
          x: PAD,
          y:
            band && targetInBand
              ? band.top - BAND_CLEARANCE - pillH
              : box.top - GAP - pillH,
        }
      case 'bottom':
        return { side: 'bottom', x: centerX - pillW / 2, y: box.bottom + GAP }
      case 'panel-right':
        return { side: 'right', x: scene.panel.right + GAP, y: centerY - pillH / 2 }
      default:
        return { side: 'left', x: scene.panel.left - GAP - pillW, y: centerY - pillH / 2 }
    }
  }

  const toast = boundsOf('.achievement-toast')
  const sheet = questSheetBounds()
  const core = scene ? null : boundsOf('.core-stage__value, .core-stage__disc')
  const obstacles = [{ rect: box, margin: TARGET_MARGIN }]
  if (toast) obstacles.push({ rect: toast, margin: TOAST_MARGIN })
  if (sheet) obstacles.push({ rect: sheet, margin: SHEET_MARGIN })
  if (band) obstacles.push({ rect: band, margin: BAND_CLEARANCE })
  // 中央核心区 | 目标本身位于核心区时不再重复避让
  if (core && !rectsOverlap(raw, core, 0)) {
    obstacles.push({ rect: core, margin: CORE_MARGIN })
  }
  if (scene?.head && !scene.targetInHead) {
    obstacles.push({ rect: scene.head, margin: TARGET_MARGIN })
  }

  let chosen = null
  let fallback = null
  for (const kind of kinds) {
    const candidate = place(kind)
    if (!fallback) fallback = candidate
    const { x, y } = clampToViewport(candidate.x, candidate.y, pillW, pillH, viewportW, viewportH)
    const rect = { left: x, top: y, right: x + pillW, bottom: y + pillH }
    if (obstacles.some((o) => rectsOverlap(rect, o.rect, o.margin))) continue
    chosen = { side: candidate.side, x, y }
    break
  }
  if (!chosen && fallback) {
    chosen = {
      side: fallback.side,
      ...clampToViewport(fallback.x, fallback.y, pillW, pillH, viewportW, viewportH),
    }
  }
  if (!chosen) {
    softHide()
    return
  }

  if (side.value !== chosen.side) side.value = chosen.side
  const transform = `translate3d(${Math.round(chosen.x)}px, ${Math.round(chosen.y)}px, 0)`
  if (rigStyle.value.transform !== transform) {
    rigStyle.value = { transform }
  }
  found.value = true
  lastFoundAt = window.performance.now()
  invalidSince = 0
  placedBox = box
}

// 轻量校验 | DOM 变更与轮询只检查目标存活性与位移 | 位置冻结不重算
function validate() {
  if (!props.guide) return
  const el = readTarget()
  if (!el) {
    markInvalid()
    return
  }
  const raw = el.getBoundingClientRect()
  const inViewport =
    raw.bottom > 0 &&
    raw.top < window.innerHeight &&
    raw.right > 0 &&
    raw.left < window.innerWidth
  if (!inViewport || !isVisible(el, clippedRect(el, raw))) {
    markInvalid()
    return
  }
  invalidSince = 0
  if (!found.value) {
    scheduleEvaluate()
    return
  }
  const box = {
    left: Math.max(raw.left, 0),
    top: Math.max(raw.top, 0),
    right: Math.min(raw.right, window.innerWidth),
    bottom: Math.min(raw.bottom, window.innerHeight),
  }
  if (
    !placedBox ||
    Math.abs(box.left - placedBox.left) > MOVE_THRESHOLD ||
    Math.abs(box.top - placedBox.top) > MOVE_THRESHOLD ||
    Math.abs(box.right - placedBox.right) > MOVE_THRESHOLD ||
    Math.abs(box.bottom - placedBox.bottom) > MOVE_THRESHOLD
  ) {
    scheduleEvaluate()
  }
}

function clearRetries() {
  for (const timer of retryTimers) window.clearTimeout(timer)
  retryTimers = []
}

function scheduleEvaluate() {
  if (rafEvalId) return
  rafEvalId = window.requestAnimationFrame(() => {
    rafEvalId = 0
    evaluate()
  })
}

function scheduleValidate() {
  if (rafValidateId) return
  rafValidateId = window.requestAnimationFrame(() => {
    rafValidateId = 0
    validate()
  })
}

function handleViewportChange() {
  scheduleEvaluate()
}

// 仅在目标真正变化时重建定位 | 同键位对象换新 | 状态扰动一律忽略
watch(
  () => props.guide,
  async (guide) => {
    const key = guideKeyOf(guide)
    if (key === lastGuideKey) return
    lastGuideKey = key
    clearRetries()
    invalidSince = 0
    if (!guide) {
      hideNow()
      return
    }
    await nextTick()
    evaluate()
    // Layout shifts (auto-expanded panels, accordions) settle after the guide
    // change; a few retries keep the pointer latched onto the final position.
    const delays = reducedMotion.value ? [120, 360, 700] : [220, 560, 1000]
    retryTimers = delays.map((delay) => window.setTimeout(evaluate, delay))
  },
  { immediate: true },
)

// 紧凑模式切换会改变悬浮框尺寸 | 重新定位一次
watch(compact, () => scheduleEvaluate())

onMounted(() => {
  window.addEventListener('resize', handleViewportChange, { passive: true })
  window.addEventListener('scroll', scheduleEvaluate, { passive: true, capture: true })
  window.addEventListener('orientationchange', handleViewportChange, { passive: true })
  // DOM 结构变化 | Tab 切换 | 弹窗内容更新 | 轻量校验
  domObserver = new MutationObserver(scheduleValidate)
  domObserver.observe(document.body, { childList: true, subtree: true })
  measureTimer = window.setInterval(() => {
    if (!document.hidden) validate()
  }, 260)
  evaluate()
})

onBeforeUnmount(() => {
  clearTargetHighlight()
  window.removeEventListener('resize', handleViewportChange)
  window.removeEventListener('scroll', scheduleEvaluate, true)
  window.removeEventListener('orientationchange', handleViewportChange)
  domObserver?.disconnect()
  domObserver = null
  window.clearInterval(measureTimer)
  clearRetries()
  if (rafEvalId) window.cancelAnimationFrame(rafEvalId)
  if (rafValidateId) window.cancelAnimationFrame(rafValidateId)
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="guide"
      class="tutorial-arrow"
      :class="[
        `tutorial-arrow--side-${side}`,
        { 'is-visible': found, 'tutorial-arrow--compact': compact },
      ]"
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
