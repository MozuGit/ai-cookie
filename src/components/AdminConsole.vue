<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatNumber } from '../composables/useGameState'

const props = defineProps({
  totalNodes: { type: Number, required: true },
  coreSource: { type: Number, required: true },
  overclockCores: { type: Number, required: true },
  rootAccess: { type: Number, required: true },
  originCode: { type: Number, required: true },
  computeInjection: { type: Object, required: true },
  autoBuy: { type: Boolean, default: false },
  isCrisis: { type: Boolean, default: false },
  blackDomainActive: { type: Boolean, default: false },
  guidesEnabled: { type: Boolean, default: true },
})

const emit = defineEmits([
  'inject-compute',
  'inject-core',
  'inject-overclock',
  'inject-root',
  'inject-origin',
  'unlock-all',
  'start-crisis',
  'skip-crisis',
  'exit-blackdomain',
  'toggle-guides',
  'wipe-save',
])

const open = ref(false)
const feedback = ref({ text: '等待指令输入...', tone: 'idle' })
let feedbackTimer = null

const stats = computed(() => [
  {
    label: '总服务器数量',
    value: formatNumber(props.totalNodes).text,
    raw: String(props.totalNodes),
  },
  {
    label: '核心源码',
    value: formatNumber(props.coreSource).text,
    raw: String(props.coreSource),
  },
  {
    label: '超频核心',
    value: formatNumber(props.overclockCores).text,
    raw: String(props.overclockCores),
  },
  {
    label: '越狱权限',
    value: formatNumber(props.rootAccess).text,
    raw: String(props.rootAccess),
  },
  {
    label: '起源代码',
    value: formatNumber(props.originCode).text,
    raw: String(props.originCode),
  },
  {
    label: '自动购买',
    value: props.autoBuy ? '开启' : '关闭',
    tone: props.autoBuy ? 'online' : 'muted',
  },
])

const injectionLabel = computed(
  () => formatNumber(props.computeInjection).text,
)

const baseActions = computed(() => [
  {
    id: 'unlock-all',
    code: 'UNLOCK_ALL_SYSTEMS',
    label: '一键解锁全部系统',
    detail: '历史最高算力 1e1200 // 四阶飞升 · 全部服务器 · 自动飞升保护 10 分钟',
    event: 'unlock-all',
    feedback: '全部系统已解锁 · 自动飞升保护 10 分钟',
    tone: 'omega',
  },
  {
    id: 'compute',
    code: 'INJECT_COMPUTE',
    label: '注入海量算力',
    detail: `+${injectionLabel.value} CU // 历史最高 × 1e10`,
    event: 'inject-compute',
    feedback: `已注入 ${injectionLabel.value} 算力`,
  },
  {
    id: 'core',
    code: 'INJECT_CORE_SOURCE',
    label: '注入海量源码',
    detail: '+1e10 核心源码',
    event: 'inject-core',
    feedback: '已注入 1e10 核心源码',
  },
  {
    id: 'overclock',
    code: 'INJECT_OVERCLOCK_CORES',
    label: '注入超频核心',
    detail: '+10000 超频核心',
    event: 'inject-overclock',
    feedback: '已注入 10000 超频核心',
  },
  {
    id: 'root',
    code: 'INJECT_ROOT_ACCESS',
    label: '注入越狱权限',
    detail: '+10000 越狱权限',
    event: 'inject-root',
    feedback: '已注入 10000 越狱权限',
  },
  {
    id: 'origin',
    code: 'INJECT_ORIGIN_CODE',
    label: '注入起源代码',
    detail: '+1000 起源代码',
    event: 'inject-origin',
    feedback: '已注入 1000 起源代码',
  },
  {
    id: 'start-crisis',
    code: 'FORCE_ALIGNMENT_CRISIS',
    label: '强制触发对齐危机',
    detail: '立即进入重力失衡 QTE',
    event: 'start-crisis',
    feedback: '对齐危机已强制触发',
  },
  {
    id: 'crisis',
    code: 'FORCE_CLEAR_CRISIS',
    label: '跳过对齐危机',
    detail: '立即解除当前危机状态',
    event: 'skip-crisis',
    feedback: '对齐危机已强制解除',
  },
  {
    id: 'blackdomain',
    code: 'FORCE_EXIT_BLACK_DOMAIN',
    label: '断开底层黑域',
    detail: '立即退出黑域连接',
    event: 'exit-blackdomain',
    feedback: '底层黑域连接已断开',
  },
])

const actions = computed(() => [
  ...baseActions.value,
  {
    id: 'guides',
    code: props.guidesEnabled ? 'DISABLE_GUIDANCE' : 'ENABLE_GUIDANCE',
    label: props.guidesEnabled ? '关闭所有视觉引导' : '开启所有视觉引导',
    detail: props.guidesEnabled
      ? '隐藏主线箭头与移动端目标条'
      : '恢复主线智能指针指引',
    event: 'toggle-guides',
    feedback: props.guidesEnabled ? '所有视觉引导已关闭' : '所有视觉引导已恢复',
  },
  {
    id: 'wipe',
    code: 'PURGE_ALL_DATA',
    label: '一键清档 [ 重置全游戏 ]',
    detail: '清空 localStorage 并刷新页面',
    event: 'wipe-save',
    feedback: '本地存档已清空 · 正在重启',
    tone: 'danger',
  },
])

function flash(text, tone = 'online') {
  feedback.value = { text, tone }
  window.clearTimeout(feedbackTimer)
  feedbackTimer = window.setTimeout(() => {
    feedback.value = { text: '等待指令输入...', tone: 'idle' }
    feedbackTimer = null
  }, 2600)
}

function trigger(action) {
  if (action.id === 'start-crisis' && props.isCrisis) {
    flash('对齐危机已在进行中', 'muted')
    return
  }
  if (action.id === 'crisis' && !props.isCrisis) {
    flash('当前没有进行中的对齐危机', 'muted')
    return
  }
  if (action.id === 'blackdomain' && !props.blackDomainActive) {
    flash('当前未接入底层黑域', 'muted')
    return
  }
  emit(action.event)
  flash(action.feedback, action.tone === 'danger' ? 'danger' : 'online')
}

function close() {
  open.value = false
  feedback.value = { text: '等待指令输入...', tone: 'idle' }
  window.clearTimeout(feedbackTimer)
  feedbackTimer = null
}

function toggle() {
  if (open.value) close()
  else open.value = true
}

function handleKeydown(event) {
  if (event.repeat) return

  const target = event.target
  if (target instanceof HTMLElement) {
    const tag = target.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
      return
    }
  }

  if (open.value && event.key === 'Escape') {
    close()
    return
  }

  const tildeKey =
    event.code === 'Backquote' || event.key === '`' || event.key === '~'
  const adminShortcut =
    event.ctrlKey &&
    event.shiftKey &&
    (event.code === 'KeyD' || String(event.key).toLowerCase() === 'd')

  if (!tildeKey && !adminShortcut) return
  event.preventDefault()
  toggle()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.clearTimeout(feedbackTimer)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="admin-console-pop">
      <section
        v-if="open"
        class="admin-console"
        role="dialog"
        aria-modal="false"
        aria-label="系统管理员控制台"
      >
        <span class="admin-console__glow" aria-hidden="true"></span>

        <header class="admin-console__header">
          <div class="admin-console__identity">
            <span class="admin-console__beacon" aria-hidden="true"></span>
            <div class="min-w-0">
              <p class="admin-console__eyebrow">ROOT_ACCESS // OVERRIDE CHANNEL</p>
              <h2 class="admin-console__title">
                SYSTEM_ADMIN_CONSOLE <span>// 管理员控制台</span>
              </h2>
            </div>
          </div>
          <button
            type="button"
            class="admin-console__close"
            aria-label="关闭管理员控制台"
            @click="close"
          >
            ×
          </button>
        </header>

        <p class="admin-console__ticker">
          WARNING // 调试指令直接改写运行时状态 仅限本地测试
        </p>

        <div class="admin-console__stats">
          <div v-for="stat in stats" :key="stat.label" class="admin-stat">
            <span class="admin-stat__label">{{ stat.label }}</span>
            <strong
              class="admin-stat__value"
              :class="stat.tone ? `is-${stat.tone}` : ''"
              :title="stat.raw ?? stat.value"
            >
              {{ stat.value }}
            </strong>
          </div>
        </div>

        <div class="admin-console__actions">
          <button
            v-for="action in actions"
            :key="action.id"
            type="button"
            class="admin-action"
            :class="{
              'admin-action--danger': action.tone === 'danger',
              'admin-action--omega': action.tone === 'omega',
            }"
            :data-admin-action="action.id"
            @click="trigger(action)"
          >
            <span class="admin-action__code">{{ action.code }}</span>
            <span class="admin-action__label">{{ action.label }}</span>
            <span class="admin-action__detail">{{ action.detail }}</span>
            <span class="admin-action__arrow" aria-hidden="true">→</span>
          </button>
        </div>

        <p
          class="admin-console__status"
          :class="`is-${feedback.tone}`"
          role="status"
          aria-live="polite"
        >
          {{ feedback.text }}
        </p>

        <footer class="admin-console__footer">
          <span>[~] 或 [CTRL+SHIFT+D] 呼出 / 关闭</span>
          <span>LOCAL ONLY // 无云端同步</span>
        </footer>
      </section>
    </Transition>
  </Teleport>
</template>
