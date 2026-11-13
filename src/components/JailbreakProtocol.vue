<script setup>
import { computed } from 'vue'
import { formatNumber } from '../composables/useGameState'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  upgrades: { type: Array, required: true },
  rootAccess: { type: Number, default: 0 },
  rebuilds: { type: Number, default: 0 },
})

defineEmits(['buy'])

const ownedCount = computed(
  () => props.upgrades.filter((upgrade) => upgrade.owned).length,
)
const affordableCount = computed(
  () =>
    props.upgrades.filter((upgrade) => !upgrade.owned && upgrade.canAfford)
      .length,
)
</script>

<template>
  <div
    class="jailbreak-protocol flex min-h-0 flex-1 flex-col"
    :class="{ 'jailbreak-protocol--ready': affordableCount > 0 }"
    :data-ready="affordableCount > 0"
  >
    <div class="jailbreak-balance">
      <span class="jailbreak-balance__scan" aria-hidden="true"></span>
      <span class="jailbreak-balance__mark" aria-hidden="true">ROOT</span>
      <div class="relative z-10 flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] tracking-[0.14em] text-violet-400/80">
            越狱权限储备
          </p>
          <p
            class="jailbreak-balance__value mt-1 truncate text-[clamp(1.7rem,2.8vw,2.2rem)] font-semibold leading-none"
            :title="`${rootAccess} 越狱权限`"
          >
            {{ formatNumber(rootAccess).text }}
          </p>
          <p class="mt-1.5 text-[10px] tracking-[0.06em] text-slate-400">
            超频散热消耗结算获得
          </p>
        </div>
        <div class="shrink-0 text-right">
          <p class="text-[10px] tracking-[0.1em] text-slate-500">重构次数</p>
          <p class="mt-1 text-[15px] font-semibold tabular-nums text-violet-300">
            ×{{ rebuilds }}
          </p>
          <span
            v-if="affordableCount > 0"
            class="jailbreak-balance__ready mt-2 inline-flex items-center gap-1 border border-violet-300/70 bg-violet-400/15 px-1.5 py-0.5 text-[9px] font-semibold tracking-[0.08em] text-violet-100"
          >
            <span class="h-1 w-1 rounded-full bg-violet-200" aria-hidden="true"></span>
            可注入 {{ affordableCount }} 项
          </span>
        </div>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-y border-violet-800/40 py-2">
      <span class="flex items-center gap-1.5 text-[10px] tracking-[0.1em] text-violet-400/80">
        <GameIcon name="jailbreak" :size="13" class="cyber-icon--inline" />
        越狱协议树
      </span>
      <span
        class="text-[10px] tracking-[0.06em]"
        :class="affordableCount > 0 ? 'text-violet-200' : 'text-slate-500'"
      >
        {{
          affordableCount > 0
            ? `权限充足 · 可注入 ${affordableCount} 项`
            : `已注入 ${ownedCount} / ${upgrades.length}`
        }}
      </span>
    </div>

    <div class="jailbreak-list mt-3 flex min-h-0 flex-1 flex-col gap-2">
      <article
        v-for="upgrade in upgrades"
        :key="upgrade.id"
        class="jailbreak-card"
        :data-owned="upgrade.owned"
        :data-ready="!upgrade.owned && upgrade.canAfford"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-[10px] tabular-nums"
            :class="upgrade.owned ? 'text-emerald-500' : 'text-violet-500'"
          >
            {{ String(upgrade.index).padStart(2, '0') }}
          </span>
          <h3
            class="text-[14px] font-bold tracking-[0.06em]"
            :class="upgrade.owned ? 'text-emerald-100' : 'text-violet-50'"
          >
            {{ upgrade.name }}
          </h3>
          <span
            class="ml-auto border px-2 py-0.5 text-[10px] font-semibold tracking-[0.04em]"
            :class="
              upgrade.owned
                ? 'border-emerald-600/50 bg-emerald-500/[0.08] text-emerald-300'
                : 'border-violet-700/60 text-violet-300'
            "
          >
            {{ upgrade.effect }}
          </span>
        </div>

        <p class="mt-2 text-[10px] leading-relaxed tracking-[0.02em] text-slate-400">
          {{ upgrade.description }}
        </p>

        <div class="mt-2.5">
          <button
            type="button"
            class="jailbreak-card__button w-full"
            :class="{
              'jailbreak-card__button--owned': upgrade.owned,
              'jailbreak-card__button--ready': !upgrade.owned && upgrade.canAfford,
            }"
            :disabled="upgrade.owned || !upgrade.canAfford"
            :aria-label="
              upgrade.owned
                ? `${upgrade.name} 已解锁`
                : `消耗 ${upgrade.cost} 越狱权限解锁${upgrade.name}`
            "
            @click="$emit('buy', upgrade.id)"
          >
            {{ upgrade.owned ? '已解锁' : upgrade.canAfford ? '注入解锁' : '权限不足' }}
          </button>
          <p
            class="mt-1.5 text-center text-[10px] tracking-[0.04em]"
            :class="upgrade.owned ? 'text-emerald-500/80' : 'text-slate-500'"
          >
            <template v-if="upgrade.owned">已注入 · 永久生效</template>
            <template v-else>
              消耗
              <strong
                class="font-semibold tabular-nums"
                :class="upgrade.canAfford ? 'text-violet-200' : 'text-slate-400'"
              >
                {{ formatNumber(upgrade.cost).text }}
              </strong>
              越狱权限
              <span class="text-slate-600">
                · 持有 {{ formatNumber(rootAccess).text }}
              </span>
            </template>
          </p>
        </div>
      </article>
    </div>

    <p class="mt-3 border-t border-violet-900/40 pt-2.5 text-[10px] leading-relaxed tracking-[0.02em] text-slate-500">
      越狱权限只来自极限超频时的散热消耗
      <span class="text-violet-400">底层重构不会清除这些协议</span>
    </p>
  </div>
</template>
