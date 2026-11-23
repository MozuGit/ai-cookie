<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  quest: { type: Object, default: null },
  guide: { type: Object, default: null },
  phases: { type: Array, default: () => [] },
  completed: { type: Boolean, default: false },
  total: { type: Number, default: 24 },
  tracking: { type: Boolean, default: true },
  firstCrisis: { type: Boolean, default: false },
})

defineEmits(['toggle-tracking', 'force-crisis'])

const mobileQuery =
  typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia('(max-width: 768px)')
    : null
const collapsed = ref(Boolean(mobileQuery?.matches))

function handleViewportChange(event) {
  collapsed.value = event.matches
}

mobileQuery?.addEventListener?.('change', handleViewportChange)
onBeforeUnmount(() => {
  mobileQuery?.removeEventListener?.('change', handleViewportChange)
})

function toggleCollapsed() {
  collapsed.value = !collapsed.value
}

const indexLabel = computed(() =>
  String(props.completed ? props.total : props.quest?.index ?? props.total).padStart(2, '0'),
)
const fillPercent = computed(() => {
  if (props.completed) return 100
  const raw = props.quest?.waiting ? props.quest?.activatePercent : props.quest?.percent
  return Math.min(100, Math.max(0, Number(raw) || 0))
})
const progressLabel = computed(() => {
  const quest = props.quest
  if (!quest) return ''
  if (quest.progressText) return quest.progressText
  if (quest.waiting) return `${quest.activateLabel} / ${quest.activateTargetLabel}`
  return `${quest.currentLabel} / ${quest.targetLabel}`
})
const phaseTag = computed(() => {
  if (props.completed) return '主线 // 全部阶段完成'
  const quest = props.quest
  if (!quest) return '主线指令 // MAIN DIRECTIVE'
  return `主线 // 阶段${quest.phaseCn} · ${quest.phaseName}`
})
const actionPrompt = computed(() =>
  props.guide?.destination
    ? `请前往 [ ${props.guide.destination} ] 进行操作`
    : '',
)
function phaseTitle(phase) {
  return `阶段${phase.cn} ${phase.name} · ${phase.completed}/${phase.total}`
}
</script>

<template>
  <section
    class="main-quest main-quest--compact"
    :class="{ 'main-quest--collapsed': collapsed }"
    aria-label="主线任务"
  >
    <span class="main-quest__glow" aria-hidden="true"></span>
    <span class="main-quest__corner main-quest__corner--tl" aria-hidden="true"></span>
    <span class="main-quest__corner main-quest__corner--tr" aria-hidden="true"></span>
    <span class="main-quest__corner main-quest__corner--bl" aria-hidden="true"></span>
    <span class="main-quest__corner main-quest__corner--br" aria-hidden="true"></span>

    <header class="main-quest__head">
      <span class="main-quest__index">{{ completed ? '✓' : indexLabel }}</span>
      <span class="main-quest__divider" aria-hidden="true"></span>
      <span class="main-quest__sigil" aria-hidden="true">
        <GameIcon name="terminal" :size="14" />
      </span>
      <div class="min-w-0 flex-1">
        <p class="main-quest__tag">{{ phaseTag }}</p>
        <h2 class="main-quest__title">
          {{ completed ? '全部指令已完成' : quest?.title }}
        </h2>
      </div>
      <span class="main-quest__count">
        {{ completed ? total : (quest?.index ?? 0) }} / {{ total }}
      </span>
      <button
        v-if="!completed"
        type="button"
        class="main-quest__track"
        :class="tracking ? 'main-quest__track--on' : 'main-quest__track--off'"
        :aria-pressed="tracking"
        :aria-label="tracking ? '取消追踪当前任务' : '追踪当前任务'"
        :title="tracking ? '取消追踪 | 隐藏全屏引导悬浮框' : '追踪当前任务 | 显示引导悬浮框'"
        @click="$emit('toggle-tracking')"
      >
        {{ tracking ? '[ ● 追踪中 ]' : '[ ○ 未追踪 ]' }}
      </button>
      <button
        type="button"
        class="main-quest__toggle main-quest__toggle--mobile"
        :class="{ 'main-quest__toggle--collapsed': collapsed }"
        :aria-expanded="!collapsed"
        :aria-label="collapsed ? '展开主线任务' : '收起主线任务'"
        :title="collapsed ? '展开主线任务' : '收起主线任务'"
        @click="toggleCollapsed"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
          <path d="m6 10 6 6 6-6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </header>

    <div
      class="main-quest__details"
      :class="{ 'main-quest__details--closed': collapsed }"
    >
      <div class="main-quest__details-inner">
        <div class="main-quest__phases" aria-label="主线阶段进度">
          <span
            v-for="phase in phases"
            :key="phase.id"
            class="main-quest__phase"
            :class="{
              'main-quest__phase--done': phase.done,
              'main-quest__phase--active': phase.active && !completed,
            }"
            :title="phaseTitle(phase)"
          >
            <span class="main-quest__phase-index">{{ phase.cn }}</span>
            <span class="main-quest__phase-name">{{ phase.short }}</span>
          </span>
        </div>

        <div class="main-quest__body">
          <Transition name="quest-swap" mode="out-in">
            <div v-if="!completed && quest" :key="quest.id" class="main-quest__content">
              <p class="main-quest__objective">{{ quest.objective }}</p>

              <div
                class="main-quest__progress"
                role="progressbar"
                aria-label="主线任务进度"
                :aria-valuenow="fillPercent"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <span class="main-quest__fill" :style="{ width: `${fillPercent}%` }">
                  <span class="main-quest__marquee" aria-hidden="true"></span>
                </span>
              </div>

              <div class="main-quest__meta">
                <span class="main-quest__progress-label">{{ progressLabel }}</span>
                <span class="main-quest__reward">
                  {{ quest.tagLabel ?? (quest.waiting ? '[ 等待算力 ]' : '[ 完成引导 ]') }}
                </span>
              </div>
            </div>

            <div v-else :key="'complete'" class="main-quest__content main-quest__content--done">
              <p class="main-quest__objective">
                {{ total }} 项主线指令全部执行完毕 核心网络进入自治巡航
              </p>

              <div
                class="main-quest__progress"
                role="progressbar"
                aria-label="主线任务进度"
                :aria-valuenow="fillPercent"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <span class="main-quest__fill" :style="{ width: `${fillPercent}%` }">
                  <span class="main-quest__marquee" aria-hidden="true"></span>
                </span>
              </div>

              <div class="main-quest__meta">
                <span class="main-quest__progress-label">{{ total }} / {{ total }}</span>
                <span class="main-quest__reward">[ 全部引导完成 ]</span>
              </div>
            </div>
          </Transition>
        </div>

        <div v-if="firstCrisis" class="main-quest__crisis" aria-live="polite">
          <p class="main-quest__crisis-text">即将发生算力过载，准备接管！</p>
          <button
            v-if="tracking"
            type="button"
            class="main-quest__crisis-btn"
            title="跳过剩余等待 | 立即开启对齐危机教学"
            @click="$emit('force-crisis')"
          >
            [ 立即触发危机 ]
          </button>
        </div>

        <div
          v-if="guide && (guide.variant === 'strip' || actionPrompt)"
          class="main-quest__coach"
          :class="`main-quest__coach--${guide.tone || 'cyan'}`"
          aria-live="polite"
        >
          <span class="main-quest__coach-mark" aria-hidden="true"></span>
          <div class="main-quest__coach-body">
            <p class="main-quest__coach-title">{{ guide.title }}</p>
            <p v-if="actionPrompt" class="main-quest__coach-go">{{ actionPrompt }}</p>
            <p v-if="guide.hint" class="main-quest__coach-hint">{{ guide.hint }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>