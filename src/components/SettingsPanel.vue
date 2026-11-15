<script setup>
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { audioMuted, toggleAudioMute } from '../audio'
import {
  numberFormatMode,
  particlesEnabled,
  reducedMotion,
  setNumberFormat,
  setParticlesEnabled,
  setReducedMotion,
  setShowConfirm,
  setSpectrumEnabled,
  settings,
  spectrumEnabled,
} from '../composables/useSettings'

const props = defineProps({
  open: { type: Boolean, default: false },
  speedrunActive: { type: Boolean, default: false },
})

const emit = defineEmits([
  'close',
  'open-about',
  'start-speedrun',
  'exit-speedrun',
])

const closeButton = ref(null)

function close() {
  emit('close')
}

function openAbout() {
  emit('open-about')
}

function onKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

function bindKeys() {
  document.removeEventListener('keydown', onKeydown)
  document.addEventListener('keydown', onKeydown)
}

function unbindKeys() {
  document.removeEventListener('keydown', onKeydown)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      bindKeys()
      await nextTick()
      closeButton.value?.focus()
    } else {
      unbindKeys()
    }
  },
)

onBeforeUnmount(unbindKeys)
</script>

<template>
  <Teleport to="body">
    <Transition name="settings-modal">
      <div
        v-if="open"
        class="settings-overlay"
        @click.self="close"
      >
        <section
          class="settings-panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-panel-title"
        >
          <span class="settings-panel__scan" aria-hidden="true"></span>

          <header class="settings-panel__head">
            <div class="min-w-0">
              <p class="settings-panel__tag">系统设置 // SYSTEM SETTINGS</p>
              <h2 id="settings-panel-title" class="settings-panel__title">交互与性能</h2>
            </div>
            <button
              ref="closeButton"
              type="button"
              class="settings-panel__close"
              aria-label="关闭系统设置"
              @click="close"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
                <path d="m3.4 3.4 9.2 9.2M12.6 3.4l-9.2 9.2" stroke-linecap="round" />
              </svg>
            </button>
          </header>

          <div class="settings-panel__body">
            <section
              class="settings-speedrun"
              :class="{ 'settings-speedrun--active': speedrunActive }"
            >
              <div class="settings-speedrun__head">
                <span class="settings-speedrun__tag">急速体验 // SPEEDRUN</span>
                <span class="settings-speedrun__time">30 MIN</span>
              </div>
              <p class="settings-speedrun__title">
                {{ speedrunActive ? '急速模式进行中' : '30 分钟体验全部核心内容' }}
              </p>
              <p class="settings-speedrun__desc">
                {{
                  speedrunActive
                    ? '当前为独立体验存档。退出后会恢复开启前的正式存档与正常数值。'
                    : '分四阶段推进 服务器降价 源码与超频核心加速 跃迁门槛下调 并赠送起源代码。'
                }}
              </p>
              <button
                v-if="!speedrunActive"
                type="button"
                class="settings-speedrun__btn"
                @click="$emit('start-speedrun')"
              >
                <span aria-hidden="true">🚀</span>
                开启急速体验模式
              </button>
              <button
                v-else
                type="button"
                class="settings-speedrun__btn settings-speedrun__btn--exit"
                @click="$emit('exit-speedrun')"
              >
                退出急速模式 恢复正式存档
              </button>
              <p class="settings-speedrun__warning">
                {{
                  speedrunActive
                    ? '退出会丢弃本次急速进度 并还原正式存档'
                    : '开启会备份当前存档并清空进度 重新开局；退出后自动还原'
                }}
              </p>
            </section>

            <div class="settings-row">
              <div class="settings-row__copy">
                <p class="settings-row__name">数字格式</p>
                <p class="settings-row__desc">切换全局数值显示方式 所有面板即时生效</p>
              </div>
              <div class="settings-segment" role="radiogroup" aria-label="数字格式">
                <button
                  type="button"
                  role="radio"
                  class="settings-segment__btn"
                  :class="{ 'settings-segment__btn--active': numberFormatMode === 'scientific' }"
                  :aria-checked="numberFormatMode === 'scientific'"
                  @click="setNumberFormat('scientific')"
                >
                  <span>科学计数法</span>
                  <small>1.23e6</small>
                </button>
                <button
                  type="button"
                  role="radio"
                  class="settings-segment__btn"
                  :class="{ 'settings-segment__btn--active': numberFormatMode === 'compact' }"
                  :aria-checked="numberFormatMode === 'compact'"
                  @click="setNumberFormat('compact')"
                >
                  <span>字母缩写</span>
                  <small>1.23M</small>
                </button>
                <button
                  type="button"
                  role="radio"
                  class="settings-segment__btn"
                  :class="{ 'settings-segment__btn--active': numberFormatMode === 'chinese' }"
                  :aria-checked="numberFormatMode === 'chinese'"
                  @click="setNumberFormat('chinese')"
                >
                  <span>中文万进制</span>
                  <small>1.23兆</small>
                </button>
              </div>
            </div>

            <button
              type="button"
              class="settings-row settings-row--action"
              role="switch"
              :aria-checked="audioMuted"
              @click="toggleAudioMute()"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">静音模式</span>
                <span class="settings-row__desc">关闭全部音效 点击 / 购买 / 转生反馈静默</span>
              </span>
              <span class="settings-switch" :class="{ 'settings-switch--on': audioMuted }" aria-hidden="true">
                <span class="settings-switch__knob"></span>
              </span>
            </button>

            <button
              type="button"
              class="settings-row settings-row--action"
              role="switch"
              :aria-checked="reducedMotion"
              @click="setReducedMotion(!reducedMotion)"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">减少动态效果</span>
                <span class="settings-row__desc">关闭屏幕震动与多余粒子特效 提升低端机性能</span>
              </span>
              <span class="settings-switch" :class="{ 'settings-switch--on': reducedMotion }" aria-hidden="true">
                <span class="settings-switch__knob"></span>
              </span>
            </button>

            <button
              type="button"
              class="settings-row settings-row--action"
              role="switch"
              :aria-checked="spectrumEnabled"
              @click="setSpectrumEnabled(!spectrumEnabled)"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">音频频谱律动</span>
                <span class="settings-row__desc">BGM 低频能量驱动核心光晕与边框脉动 关闭可降负载</span>
              </span>
              <span class="settings-switch" :class="{ 'settings-switch--on': spectrumEnabled }" aria-hidden="true">
                <span class="settings-switch__knob"></span>
              </span>
            </button>

            <button
              type="button"
              class="settings-row settings-row--action"
              role="switch"
              :aria-checked="particlesEnabled"
              @click="setParticlesEnabled(!particlesEnabled)"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">背景粒子动效</span>
                <span class="settings-row__desc">电路板数据流粒子持续运算 关闭后渲染为静态帧</span>
              </span>
              <span class="settings-switch" :class="{ 'settings-switch--on': particlesEnabled }" aria-hidden="true">
                <span class="settings-switch__knob"></span>
              </span>
            </button>

            <button
              type="button"
              class="settings-row settings-row--action"
              role="switch"
              :aria-checked="settings.showConfirm"
              @click="setShowConfirm(!settings.showConfirm)"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">显示确认弹窗</span>
                <span class="settings-row__desc">
                  开启时转生需二次确认 关闭后一键直接转生 适合后期老手
                </span>
              </span>
              <span
                class="settings-switch"
                :class="{ 'settings-switch--on': settings.showConfirm }"
                aria-hidden="true"
              >
                <span class="settings-switch__knob"></span>
              </span>
            </button>

            <button
              type="button"
              class="settings-row settings-row--action settings-archive"
              @click="openAbout"
            >
              <span class="settings-row__copy">
                <span class="settings-row__name">作品档案</span>
                <span class="settings-row__desc">
                  查看创作者署名 / Qoder 大赛参赛信息 / 构建档案
                </span>
              </span>
              <span class="settings-archive__cta">
                查看档案
                <span aria-hidden="true">→</span>
              </span>
            </button>
          </div>

          <footer class="settings-panel__foot">
            <span class="settings-panel__dot" aria-hidden="true"></span>
            设置已自动保存至本地存储
            <span class="settings-panel__hint">ESC // 关闭</span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
