<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  anchor: { type: Object, default: null },
})

const emit = defineEmits(['close'])

const panelEl = ref(null)
const bodyEl = ref(null)
const closeButton = ref(null)
const panelStyle = ref({})
const scrollState = ref({ scrollable: false, atBottom: true })
let restoreFocusOnClose = false

const features = [
  {
    icon: 'ascension',
    name: '赛博四阶飞升',
    desc: '架构降维 > 算力超载 > 逻辑坍缩 > 重启纪元',
  },
  {
    icon: 'balance',
    name: '负载平衡 QTE',
    desc: '指针失控临界点 强行拉回对齐度',
  },
  {
    icon: 'matrix',
    name: '数据协议矩阵',
    desc: '合成元素 重写 AI 底层代码',
  },
  {
    icon: 'chip',
    name: '智械矩阵',
    desc: '点亮神经矩阵 让 AI 反向打工',
  },
]

function close() {
  emit('close')
}

function updateScrollState() {
  const el = bodyEl.value
  if (!el) return
  scrollState.value = {
    scrollable: el.scrollHeight > el.clientHeight + 2,
    atBottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 4,
  }
}

function updatePosition() {
  const anchorEl = props.anchor
  if (!anchorEl) return
  const rect = anchorEl.getBoundingClientRect()
  const pad = 12
  const gap = 10
  const right = pad
  let width = Math.min(432, window.innerWidth - pad * 2)
  let left = window.innerWidth - right - width
  const top = Math.min(rect.bottom + gap, window.innerHeight - 220)
  let available = window.innerHeight - top - pad
  const core = document.querySelector('.core-trigger')
  if (core) {
    const coreRect = core.getBoundingClientRect()
    const canSitBesideCore =
      coreRect.right + pad + 320 <= window.innerWidth - right
    if (left < coreRect.right && left + width > coreRect.left) {
      if (canSitBesideCore) {
        width = window.innerWidth - right - coreRect.right - pad
        left = window.innerWidth - right - width
      } else if (coreRect.top > top) {
        available = Math.min(available, coreRect.top - top - pad)
      }
    }
  }
  panelStyle.value = {
    top: `${Math.round(top)}px`,
    right: `${Math.round(right)}px`,
    width: `${Math.round(width)}px`,
    maxHeight: `${Math.round(Math.max(220, available))}px`,
  }
  nextTick(updateScrollState)
}

function onPointerDown(event) {
  if (panelEl.value?.contains(event.target)) return
  if (props.anchor?.contains(event.target)) return
  close()
}

function onKeydown(event) {
  if (event.key !== 'Escape') return
  event.preventDefault()
  restoreFocusOnClose = true
  close()
}

function bindGlobal() {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', updatePosition)
  window.addEventListener('scroll', updatePosition, true)
}

function unbindGlobal() {
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', updatePosition)
  window.removeEventListener('scroll', updatePosition, true)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      await nextTick()
      updatePosition()
      bindGlobal()
      closeButton.value?.focus({ preventScroll: true })
      await nextTick()
      updateScrollState()
    } else {
      unbindGlobal()
      if (restoreFocusOnClose) {
        restoreFocusOnClose = false
        props.anchor?.focus?.({ preventScroll: true })
      }
    }
  },
)

onBeforeUnmount(unbindGlobal)
</script>

<template>
  <Teleport to="body">
    <Transition name="system-info">
      <section
        v-if="open"
        ref="panelEl"
        class="system-info"
        :style="panelStyle"
        role="dialog"
        aria-labelledby="system-info-title"
        aria-describedby="system-info-work"
      >
        <span class="system-info__scan" aria-hidden="true"></span>

        <header class="system-info__head">
          <div class="min-w-0">
            <p class="system-info__tag">系统信息 // SYSTEM ARCHIVE</p>
            <div class="system-info__title-row">
              <h2 id="system-info-title" class="system-info__title">参赛作品档案</h2>
              <span class="system-info__badge">ENTRY BUILD</span>
            </div>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="system-info__close"
            aria-label="关闭系统信息"
            @click="close"
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
              <path d="m3.4 3.4 9.2 9.2M12.6 3.4l-9.2 9.2" stroke-linecap="round" />
            </svg>
          </button>
        </header>

        <div
          ref="bodyEl"
          class="system-info__body"
          :class="{ 'system-info__body--more': scrollState.scrollable && !scrollState.atBottom }"
          @scroll.passive="updateScrollState"
        >
          <div class="system-info__hero">
            <p class="system-info__label">作品名称</p>
            <p id="system-info-work" class="system-info__work" aria-label="魔族陌 | 算力奇点 // 失控协议">
              <span class="system-info__studio">魔族陌</span>
              <span class="system-info__sep" aria-hidden="true">|</span>
              <span class="system-info__core">算力奇点</span>
              <span class="system-info__protocol">// 失控协议</span>
            </p>
            <p class="system-info__tagline">
              亲手培育赛博神明 在失控边缘疯狂试探 硬核放置
            </p>
          </div>

          <div class="system-info__meta">
            <p class="system-info__meta-row">
              <span class="system-info__meta-label">作者</span>
              <span class="system-info__meta-value">魔族陌 [ MozuGit ]</span>
            </p>
            <p class="system-info__meta-row">
              <span class="system-info__meta-label">赛事</span>
              <span class="system-info__meta-value">Qoder 大赛 · Vibe Coding 参赛作品</span>
            </p>
          </div>

          <div class="system-info__section">
            <p class="system-info__section-title">
              核心特色 <small>CORE FEATURES</small>
            </p>
            <ul class="system-info__features">
              <li v-for="feature in features" :key="feature.name" class="system-info__feature">
                <span class="system-info__feature-icon" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <g v-if="feature.icon === 'ascension'">
                      <path d="M12 2.6 16.4 7 12 11.4 7.6 7 12 2.6Z" />
                      <path d="M12 7.4 19.6 15 12 22.6 4.4 15 12 7.4Z" />
                      <path d="M12 5.1v12.1" opacity="0.5" />
                      <path d="M9.6 13.7 12 11.3l2.4 2.4" opacity="0.85" />
                    </g>
                    <g v-else-if="feature.icon === 'balance'">
                      <path d="M12 3.2v17.2" />
                      <path d="M4.6 6.4h14.8" />
                      <path d="M4.6 6.4 2.2 12.3h4.8L4.6 6.4Z" />
                      <path d="M19.4 6.4 17 12.3h4.8l-2.4-5.9Z" />
                      <path d="M8.6 20.4h6.8" />
                    </g>
                    <g v-else-if="feature.icon === 'matrix'">
                      <path d="M12 2.8 19.2 7v9.2L12 20.4 4.8 16.2V7L12 2.8Z" />
                      <circle cx="12" cy="7.9" r="1.25" />
                      <circle cx="8.2" cy="15.3" r="1.25" />
                      <circle cx="15.8" cy="15.3" r="1.25" />
                      <path d="M12 9.15v2.6M11 10.4l-2 3.7M13 10.4l2 3.7" />
                    </g>
                    <g v-else-if="feature.icon === 'chip'">
                      <rect x="7" y="7" width="10" height="10" rx="1.8" />
                      <rect x="10" y="10" width="4" height="4" rx="0.8" opacity="0.7" />
                      <path d="M9.5 3v4M14.5 3v4M9.5 17v4M14.5 17v4" />
                      <path d="M3 9.5h4M3 14.5h4M17 9.5h4M17 14.5h4" />
                    </g>
                  </svg>
                </span>
                <p class="system-info__feature-text">
                  <strong>{{ feature.name }} //</strong>{{ feature.desc }}
                </p>
              </li>
            </ul>
          </div>

          <div class="system-info__credit">
            <span class="system-info__credit-glyph" aria-hidden="true">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="3.2" y="4.2" width="17.6" height="15.6" rx="2" />
                <path d="m7.2 9.2 3 2.8-3 2.8M12.6 15h4.2" />
              </svg>
            </span>
            <p>
              <span class="system-info__credit-label">致谢</span> // Qoder Vibe Coding
              驱动
            </p>
          </div>
        </div>

        <footer class="system-info__foot">
          <span class="system-info__status">
            <span class="status-dot"></span>
            Qoder 大赛 · 参赛作品
          </span>
          <span class="system-info__foot-hints">
            <span
              v-if="scrollState.scrollable && !scrollState.atBottom"
              class="system-info__scroll"
            >
              ↕ 滚动查看更多
            </span>
            <span class="system-info__hint">ESC // 关闭</span>
          </span>
        </footer>
      </section>
    </Transition>
  </Teleport>
</template>
