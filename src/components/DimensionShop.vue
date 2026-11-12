<script setup>
import { formatMultiplier, formatNumber } from '../composables/useGameState'

defineProps({
  upgrades: { type: Array, required: true },
  shards: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  ascensions: { type: Number, default: 0 },
})

defineEmits(['buy'])
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="dimension-shop__balance">
      <span class="dimension-shop__scan" aria-hidden="true"></span>
      <span class="dimension-shop__mark" aria-hidden="true">Ω⁺</span>
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] tracking-[0.14em] text-amber-300/80">
            维度碎片储备
          </p>
          <p
            class="dimension-shop__value mt-1 truncate text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-none"
            :title="`${shards} 维度碎片`"
          >
            {{ formatNumber(shards).text }}
          </p>
          <p class="mt-1.5 text-[10px] tracking-[0.06em] text-slate-400">
            每次升格按总算力 ÷ {{ formatNumber('1e45').text }} 结算
          </p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-[10px] tracking-[0.1em] text-slate-500">高维加成</p>
          <p class="mt-1 text-[15px] font-semibold tabular-nums text-amber-200">
            ×{{ formatMultiplier(multiplier) }}
          </p>
          <p class="mt-1 text-[9px] tracking-[0.04em] text-slate-500">
            升格 ×{{ ascensions }}
          </p>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-y border-violet-800/40 py-2">
      <span class="text-[10px] tracking-[0.1em] text-amber-400/80">高维协议树</span>
      <span class="text-[10px] tracking-[0.06em] text-slate-500">仅限维度碎片 · 永久生效</span>
    </div>

    <div class="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-0.5">
      <article
        v-for="upgrade in upgrades"
        :key="upgrade.id"
        class="dimension-upgrade-card"
        :data-owned="upgrade.owned"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-[10px] tabular-nums"
            :class="upgrade.owned ? 'text-emerald-500' : 'text-amber-500'"
          >
            {{ String(upgrade.index).padStart(2, '0') }}
          </span>
          <h3
            class="text-[14px] font-bold tracking-[0.06em]"
            :class="upgrade.owned ? 'text-emerald-100' : 'text-amber-50'"
          >
            {{ upgrade.name }}
          </h3>
          <span
            class="ml-auto border px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em]"
            :class="
              upgrade.owned
                ? 'border-emerald-600/50 bg-emerald-500/[0.08] text-emerald-300'
                : 'border-amber-600/50 bg-amber-500/[0.06] text-amber-300'
            "
          >
            {{ upgrade.effect }}
          </span>
        </div>

        <p class="mt-2 text-[10px] leading-relaxed tracking-[0.02em] text-slate-400">
          {{ upgrade.description }}
        </p>

        <div class="mt-2.5 flex items-center justify-between gap-2">
          <span class="flex items-center gap-1.5 text-[10px] tracking-[0.04em]">
            <span class="text-slate-500">消耗</span>
            <span :class="upgrade.owned ? 'text-emerald-400/70 line-through' : 'text-amber-300'">
              {{ upgrade.cost }} 维度碎片
            </span>
          </span>
          <button
            type="button"
            class="dimension-upgrade-card__button"
            :class="{
              'dimension-upgrade-card__button--owned': upgrade.owned,
              'dimension-upgrade-card__button--ready': !upgrade.owned && upgrade.canAfford,
            }"
            :disabled="upgrade.owned || !upgrade.canAfford"
            :aria-label="
              upgrade.owned
                ? `${upgrade.name} 已激活`
                : `消耗 ${upgrade.cost} 维度碎片激活${upgrade.name}`
            "
            @click="$emit('buy', upgrade.id)"
          >
            {{ upgrade.owned ? '已激活' : upgrade.canAfford ? '消耗碎片' : '碎片不足' }}
          </button>
        </div>
      </article>
    </div>

    <p class="mt-3 border-t border-violet-900/40 pt-2.5 text-[10px] leading-relaxed tracking-[0.02em] text-slate-500">
      每 1 个维度碎片提供全局产出 ×1.5 | 消耗碎片同步降低当前高维加成
      <span class="text-amber-300">高维协议是永久投资</span>
    </p>
  </div>
</template>
