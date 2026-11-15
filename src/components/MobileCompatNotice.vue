<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { isMobileDevice } from '../composables/useSettings'

const NOTICE_STORAGE_KEY = 'has_seen_mobile_warning'
const SHOW_DELAY_MS = 700

const visible = ref(false)
const confirmButton = ref(null)
let showTimer = 0

function readFlag() {
  try {
    return localStorage.getItem(NOTICE_STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

function confirm() {
  visible.value = false
  try {
    localStorage.setItem(NOTICE_STORAGE_KEY, '1')
  } catch {
    /* noop */
  }
}

onMounted(() => {
  if (!isMobileDevice() || readFlag()) return
  showTimer = window.setTimeout(async () => {
    showTimer = 0
    visible.value = true
    await nextTick()
    confirmButton.value?.focus()
  }, SHOW_DELAY_MS)
})

onBeforeUnmount(() => {
  if (showTimer) window.clearTimeout(showTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="mobile-notice">
      <div v-if="visible" class="mobile-notice" role="dialog" aria-modal="true" aria-labelledby="mobile-notice-title">
        <div class="mobile-notice__scrim" aria-hidden="true"></div>
        <section class="mobile-notice__panel">
          <span class="mobile-notice__scan" aria-hidden="true"></span>
          <header class="mobile-notice__head">
            <span class="mobile-notice__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <path d="M12 3.2 21.4 19.6a1.2 1.2 0 0 1-1 1.8H3.6a1.2 1.2 0 0 1-1-1.8L12 3.2Z" stroke-linejoin="round" />
                <path d="M12 9.4v4.4" stroke-linecap="round" />
                <circle cx="12" cy="16.9" r="1.05" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <div class="mobile-notice__head-copy">
              <p class="mobile-notice__tag">SYSTEM // COMPATIBILITY</p>
              <h2 id="mobile-notice-title" class="mobile-notice__title">系统提示：设备兼容性</h2>
            </div>
          </header>
          <p class="mobile-notice__body">
            检测到您正在使用移动设备。本终端含有复杂的阵列面板与高精度量子校准（QTE），建议使用
            PC 端（宽屏）以获得最佳的管理员操作体验。移动端已为您开启性能保护模式。
          </p>
          <div class="mobile-notice__actions">
            <button ref="confirmButton" type="button" class="mobile-notice__btn" @click="confirm">
              [ 确认并继续 ]
            </button>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
