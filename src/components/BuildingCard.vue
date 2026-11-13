<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { formatNumber } from '../composables/useGameState'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  card: { type: Object, required: true },
  flash: { type: Boolean, default: false },
  autoBuying: { type: Boolean, default: false },
})

const emit = defineEmits(['buy'])

const indexLabel = computed(() => String(props.card.index).padStart(2, '0'))
const deployLabel = computed(() =>
  props.card.isMaxMode ? 'MAX' : `×${props.card.purchaseCount}`,
)
const unlockTitle = computed(
  () =>
    props.card.unlockHint ||
    `需先部署 1 台 [ ${props.card.unlockRequirement || '上一级服务器'} ] 以解锁该节点`,
)
const buyTitle = computed(() => {
  if (props.card.locked) return unlockTitle.value
  if (props.card.challengeLocked) {
    return `${props.card.name} // 本局演练封锁 仅可购买前 1 种服务器`
  }
  if (props.card.isMaxMode) {
    return props.card.canAfford
      ? `MAX 采购 ${props.card.name} // 可购买 ${props.card.maxQuantity} 台 总价 ${formatNumber(props.card.displayPrice).text} CU`
      : `MAX 采购 ${props.card.name} // 可购买 0 台 算力不足 1 台 单价 ${formatNumber(props.card.unitPrice).text} CU`
  }
  return `购买 ${props.card.purchaseCount} 个 总价 ${formatNumber(props.card.displayPrice).text} CU`
})
const buyAriaLabel = computed(() => {
  if (props.card.locked) {
    return `${unlockTitle.value} 无法购买`
  }
  if (props.card.challengeLocked) {
    return `${props.card.name} 被异常演练封锁 无法购买`
  }
  if (props.card.isMaxMode) {
    return props.card.canAfford
      ? `MAX 采购 ${props.card.name} 可购买 ${props.card.maxQuantity} 台 总价 ${formatNumber(props.card.displayPrice).text} 算力`
      : `MAX 采购 ${props.card.name} 可购买 0 台 算力不足 单台价格 ${formatNumber(props.card.unitPrice).text} 算力`
  }
  return `部署 ${props.card.name} ${props.card.purchaseCount} 个 需要 ${formatNumber(props.card.displayPrice).text} 算力`
})

const insufficientVisible = ref(false)
const denyMessage = ref('算力不足')
let insufficientTimer = null

function handleBuyClick() {
  if (!props.card.canAfford) {
    denyMessage.value = props.card.challengeLocked ? '协议封锁' : '算力不足'
    insufficientVisible.value = true
    if (insufficientTimer) window.clearTimeout(insufficientTimer)
    insufficientTimer = window.setTimeout(() => {
      insufficientVisible.value = false
      insufficientTimer = null
    }, 1500)
    return
  }
  emit('buy', props.card.id)
}

onBeforeUnmount(() => {
  if (insufficientTimer) window.clearTimeout(insufficientTimer)
})
</script>

<template>
  <article
    class="building-card group relative flex flex-none overflow-hidden border bg-[#0a1626]/55 transition-colors duration-200"
    :class="[
      card.count > 0 ? 'border-cyan-500/55' : 'border-cyan-800/45',
      card.canAfford ? 'hover:border-cyan-300/75' : '',
      card.locked ? 'building-card--locked cursor-not-allowed' : '',
      flash ? 'building-card--flash' : '',
    ]"
    :data-owned="card.count > 0"
    :data-affordable="card.canAfford && !card.challengeLocked"
    :data-locked="card.locked"
    :title="card.locked ? unlockTitle : undefined"
  >
    <span
      class="absolute inset-y-0 left-0 w-px transition-colors"
      :class="card.count > 0 ? 'bg-cyan-300/90 shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'bg-cyan-700/60'"
      aria-hidden="true"
    ></span>

    <div
      class="building-card__body flex w-full items-stretch"
      :class="card.locked ? 'building-card__body--locked' : ''"
    >
      <div class="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3">
        <div class="flex items-center gap-2.5">
          <span class="building-card__icon cyber-icon-frame cyber-icon-frame--sm" aria-hidden="true">
            <GameIcon :name="card.id" :size="17" />
          </span>
          <span class="text-[10px] tracking-[0.1em]" :class="card.count > 0 ? 'text-cyan-400' : 'text-cyan-700'">
            {{ indexLabel }}
          </span>
          <h3
            class="truncate text-[16px] font-bold tracking-[0.06em]"
            :class="card.count > 0 ? 'text-cyan-50' : 'text-slate-200'"
          >
            {{ card.name }}
          </h3>
          <span
            v-if="card.challengeLocked"
            class="ml-auto shrink-0 border border-rose-500/50 bg-rose-500/[0.08] px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em] text-rose-300"
          >
            LOCK
          </span>
          <span
            class="shrink-0 border px-2 py-0.5 text-[11px] font-semibold tabular-nums tracking-[0.04em]"
            :class="[
              card.challengeLocked ? 'ml-1.5' : 'ml-auto',
              card.count > 0
                ? 'border-cyan-500/50 bg-cyan-500/[0.08] text-cyan-300 neon-text-cyan'
                : 'border-cyan-900/70 text-slate-500',
            ]"
          >
            ×{{ card.count }}
          </span>
        </div>

        <p class="mt-1.5 truncate text-[11px] leading-relaxed tracking-[0.03em] text-slate-400">
          {{ card.description }}
        </p>

        <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] tracking-[0.04em]">
          <span class="flex items-center gap-1.5">
            <span class="text-slate-500">单台</span>
            <span class="font-semibold text-cyan-400 neon-text-cyan">+{{ formatNumber(card.baseCps).text }}/秒</span>
          </span>
          <span class="flex items-center gap-1.5">
            <span class="text-slate-500">群组</span>
            <span :class="card.count > 0 ? 'text-slate-200' : 'text-slate-600'">
              {{ formatNumber(card.totalCps).text }}/秒
            </span>
          </span>
        </div>
      </div>

      <button
        type="button"
        class="building-buy relative flex w-[112px] shrink-0 flex-col items-center justify-center gap-1.5 border-l px-2 text-center transition duration-200"
        :data-guide="
          card.id === 'desktop'
            ? 'deploy-home'
            : card.index === 1
              ? 'deploy-first'
              : null
        "
        :class="[
          card.canAfford
            ? 'border-cyan-200/90 bg-cyan-400 text-slate-950 shadow-[0_0_22px_rgba(34,211,238,0.45)] hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.65)] active:bg-cyan-200'
            : 'cursor-not-allowed border-slate-700/80 bg-[#0a1018]/85 text-slate-600',
          card.locked ? 'building-card__buy--locked' : '',
          autoBuying && card.canAfford ? 'building-buy--auto' : '',
        ]"
        :disabled="card.locked"
        :aria-disabled="!card.canAfford"
        :title="buyTitle"
        :aria-label="buyAriaLabel"
        @click="handleBuyClick"
      >
        <span
          class="text-[10px] font-semibold tracking-[0.08em]"
          :class="card.canAfford ? 'text-slate-950' : 'text-slate-600'"
        >
          部署 <span class="text-[12px]">{{ deployLabel }}</span>
        </span>
        <span
          class="flex max-w-full items-center gap-1 text-[15px] font-bold tabular-nums"
          :class="card.canAfford ? 'text-slate-950' : 'text-slate-700'"
        >
          <svg
            viewBox="0 0 12 12"
            class="h-2.5 w-2.5 shrink-0"
            :class="card.canAfford ? 'text-slate-950' : 'text-slate-700'"
            aria-hidden="true"
          >
            <path d="M6 0.8 11.2 6 6 11.2 0.8 6Z" fill="none" stroke="currentColor" stroke-width="1.2" />
            <path d="M6 3.2 8.8 6 6 8.8 3.2 6Z" fill="currentColor" opacity="0.35" />
          </svg>
          <span class="truncate">{{ formatNumber(card.displayPrice).text }}</span>
        </span>
        <span
          v-if="card.locked"
          class="text-[9px] tracking-[0.08em] text-amber-500/80"
        >
          {{ card.lockTag || '节点锁定' }}
        </span>
        <span
          v-else-if="card.challengeLocked"
          class="text-[9px] tracking-[0.08em] text-rose-400"
        >
          协议封锁
        </span>
        <span
          v-else-if="card.isMaxMode"
          class="text-[9px] tracking-[0.06em]"
          :class="card.canAfford ? 'text-slate-800' : 'text-slate-700'"
        >
          可购买 {{ card.maxQuantity }} 台
        </span>
        <span
          v-else
          class="text-[9px] tracking-[0.08em]"
          :class="card.canAfford ? 'text-slate-800' : 'text-slate-700'"
        >
          {{ card.canAfford ? '可购买' : '算力不足' }}
        </span>

        <Transition name="buy-bubble">
          <span
            v-if="insufficientVisible"
            class="buy-short-bubble"
            role="status"
            aria-live="polite"
          >
            {{ denyMessage }}
          </span>
        </Transition>
      </button>
    </div>

    <span v-if="card.locked" class="building-card__lock-flag" aria-hidden="true">
      [ 🔒 锁定 ]
    </span>
    <p v-if="card.locked" class="building-card__lock-hint" aria-hidden="true">
      {{ unlockTitle }}
    </p>
  </article>
</template>
