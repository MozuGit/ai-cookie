<script setup>
import { formatNumber, formatScientific } from '../composables/useGameState'
import GameIcon from './GameIcon.vue'

defineProps({
  upgrades: { type: Array, required: true },
  coreSource: { type: Number, default: 0 },
  rebuilds: { type: Number, default: 0 },
  locked: { type: Boolean, default: false },
  lockHint: { type: String, default: '' },
})

defineEmits(['buy', 'buy-max'])
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="architecture-balance">
      <span class="architecture-balance__scan" aria-hidden="true"></span>
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] tracking-[0.14em] text-amber-400/80">
            核心源码储备
          </p>
          <p
            class="architecture-balance__value mt-1 truncate text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-none"
            :title="`${coreSource} 核心源码`"
          >
            {{ formatScientific(coreSource) }}
          </p>
          <p class="mt-1.5 text-[10px] tracking-[0.06em] text-slate-400">
            用于兑换跨周目永久增益
          </p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-[10px] tracking-[0.1em] text-slate-500">重构次数</p>
          <p class="mt-1 text-[15px] font-semibold tabular-nums text-amber-300">
            ×{{ rebuilds }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-y border-amber-800/35 py-2">
      <span class="flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-amber-400/80">
        <GameIcon name="architecture" :size="13" class="cyber-icon--inline" />
        架构实验室
      </span>
      <span v-if="locked" class="text-[10px] tracking-[0.08em] text-rose-400">
        协议封锁 // LOCKED
      </span>
      <span v-else class="text-[10px] tracking-[0.06em] text-slate-500">无限升级 · 费用 ×5/级</span>
    </div>

    <div
      v-if="locked"
      class="mt-2 flex items-start gap-2 border border-rose-500/45 bg-rose-500/[0.07] px-3 py-2"
      role="status"
    >
      <span class="text-[13px] leading-none text-rose-400" aria-hidden="true">⛔</span>
      <div class="min-w-0">
        <p class="text-[11px] font-semibold tracking-[0.08em] text-rose-300">
          核心源码升级协议已封锁
        </p>
        <p class="mt-0.5 text-[10px] leading-relaxed tracking-[0.02em] text-rose-200/70">
          {{ lockHint }}
        </p>
      </div>
    </div>

    <div class="architecture-list mt-3 flex min-h-0 flex-1 flex-col gap-2">
      <article
        v-for="upgrade in upgrades"
        :key="upgrade.id"
        class="architecture-card"
        :data-guide="upgrade.index === 1 ? 'architecture-upgrade' : null"
        :data-owned="upgrade.owned"
        :data-max="upgrade.isMax"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-[10px] tabular-nums"
            :class="upgrade.level > 0 ? 'text-emerald-500' : 'text-amber-700'"
          >
            {{ String(upgrade.index).padStart(2, '0') }}
          </span>
          <h3 class="truncate text-[14px] font-bold tracking-[0.06em] text-amber-50">
            {{ upgrade.name }}
          </h3>
          <span
            class="architecture-card__level ml-auto"
            :class="{
              'architecture-card__level--active': upgrade.level > 0,
              'architecture-card__level--max': upgrade.isMax,
            }"
          >
            Lv.{{ upgrade.level }}
          </span>
        </div>

        <div class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span class="architecture-card__effect">{{ upgrade.effect }}</span>
        </div>

        <p class="mt-1.5 text-[10px] leading-relaxed tracking-[0.02em] text-slate-400">
          {{ upgrade.description }}
        </p>

        <div class="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
          <span class="flex items-baseline gap-1 text-[10px] tracking-[0.04em]">
            <span class="text-slate-500">下级消耗</span>
            <span
              v-if="upgrade.isMax"
              class="font-semibold text-emerald-300"
            >
              已满级
            </span>
            <span
              v-else
              class="font-semibold text-amber-300"
              :title="`${upgrade.nextCost} 核心源码`"
            >
              {{ formatNumber(upgrade.nextCost).text }} 核心源码
            </span>
          </span>

          <span class="flex items-center gap-1.5">
            <button
              type="button"
              class="architecture-card__button"
              :class="{ 'architecture-card__button--ready': upgrade.canAfford && !locked }"
              :disabled="locked || !upgrade.canAfford"
              :aria-label="
                locked
                  ? `核心源码升级协议已封锁 无法升级 ${upgrade.name}`
                  : upgrade.isMax
                    ? `${upgrade.name} 已满级`
                    : `消耗 ${upgrade.nextCost} 核心源码升级${upgrade.name}至 ${upgrade.level + 1} 级`
              "
              @click="$emit('buy', upgrade.id)"
            >
              {{ locked ? '协议封锁' : upgrade.isMax ? '已满级' : `升级 (Lv.${upgrade.level})` }}
            </button>
            <button
              type="button"
              class="architecture-card__button architecture-card__button--bulk"
              :class="{ 'architecture-card__button--bulk-ready': upgrade.canAfford && !locked }"
              :disabled="locked || !upgrade.canAfford"
              :aria-label="`一键升级 ${upgrade.name} 直到核心源码不足`"
              @click="$emit('buy-max', upgrade.id)"
            >
              {{ locked ? '已封锁' : '一键升级' }}
            </button>
          </span>
        </div>
      </article>
    </div>

    <p class="mt-3 border-t border-amber-900/35 pt-2.5 text-[10px] leading-relaxed tracking-[0.02em] text-slate-500">
      升级费用每级 ×5 指数增长
      <span class="text-amber-500">一键升级连续购买直到源码不足</span>
    </p>
  </div>
</template>
