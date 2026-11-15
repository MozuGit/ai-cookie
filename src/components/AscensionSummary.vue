<script setup>
import { computed, inject } from 'vue'
import {
  formatMultiplier,
  formatNumber,
  formatScientific,
} from '../composables/useGameState'

const emit = defineEmits(['open-hub', 'open-origin'])

const game = inject('game')

const {
  ascensionTiers,
  coreSource,
  overclockCores,
  rootAccess,
  originCode,
  highestCompute,
  peakAlignedCompute,
  totalRebuilds,
  totalOverloads,
  totalCollapses,
  epochRestarts,
  matrixTotalLevels,
  matrixMultiplierLabel,
  matrixUnlocked,
  challengesCompletedCount,
  globalMilestonesUnlocked,
  originTreeUnlocked,
  challengeActive,
  challengeDefinition,
  challengeObjective,
  challengeProgress,
  blackDomainActive,
  blackDomainRootRate,
  blackDomainDrainRatio,
} = game

const tierTone = {
  reduction: 'amber',
  overload: 'cyan',
  collapse: 'violet',
  restart: 'gold',
}

const tierGainLabel = (tier) =>
  tier.id === 'reduction'
    ? formatScientific(tier.gain)
    : formatNumber(tier.gain).text

const progressLabel = computed(() => {
  if (challengeActive.value) {
    return `异常演练 // ${challengeDefinition.value?.name ?? '进行中'}`
  }
  const nextTier = ascensionTiers.value.find((tier) => !tier.ready)
  if (!nextTier) return '全部协议就绪'
  return `${nextTier.name} // ${Math.floor(nextTier.progress)}%`
})
</script>

<template>
  <div class="asc-summary">
    <div class="asc-summary__hero">
      <p class="asc-summary__eyebrow">
        <span>四阶跃迁 // ASCENSION</span>
        <span>{{ Math.max(globalMilestonesUnlocked, challengesCompletedCount) }} PROTOCOLS</span>
      </p>
      <p class="asc-summary__peak">
        {{ formatScientific(highestCompute) }}
        <small>历史最高算力 CU</small>
      </p>
      <div class="mt-2 flex flex-wrap items-center justify-between gap-1.5 text-[8px] tracking-[0.08em] text-slate-500">
        <span>本局峰值 {{ formatScientific(peakAlignedCompute) }} CU</span>
        <span class="text-amber-500/80">{{ progressLabel }}</span>
      </div>
    </div>

    <div class="asc-summary__resources">
      <div class="asc-resource asc-tone-amber">
        <span>核心源码</span>
        <strong>{{ formatScientific(coreSource) }}</strong>
      </div>
      <div class="asc-resource asc-tone-cyan">
        <span>超频核心</span>
        <strong>{{ formatNumber(overclockCores).text }}</strong>
      </div>
      <div class="asc-resource asc-tone-violet">
        <span>越狱权限</span>
        <strong>{{ formatScientific(rootAccess) }}</strong>
      </div>
      <div class="asc-resource asc-tone-gold">
        <span>起源代码</span>
        <strong>{{ formatNumber(originCode).text }}</strong>
      </div>
    </div>

    <div>
      <p class="text-[8px] tracking-[0.16em] text-slate-500">
        转生阶梯 // {{ totalRebuilds }} 重构 / {{ totalOverloads }} 超载 /
        {{ totalCollapses }} 坍缩 / {{ epochRestarts }} 重启
      </p>
    </div>

    <div class="asc-summary__tiers">
      <button
        v-for="tier in ascensionTiers"
        :key="tier.id"
        type="button"
        class="asc-summary-tier"
        :class="[
          `asc-tone-${tierTone[tier.id]}`,
          { 'asc-summary-tier--ready': tier.ready },
        ]"
        :title="`${tier.name} // ${tier.resetLabel}`"
        @click="emit('open-hub', 'tiers')"
      >
        <span class="asc-summary-tier__glyph" aria-hidden="true">{{ tier.glyph }}</span>
        <span class="asc-summary-tier__body">
          <span class="asc-summary-tier__name">0{{ tier.order }} {{ tier.name }}</span>
          <span class="asc-summary-tier__gain">
            +{{ tierGainLabel(tier) }} {{ tier.resourceName }}
          </span>
        </span>
        <span class="asc-summary-tier__state">
          {{ tier.ready ? 'READY' : `${Math.floor(tier.progress)}%` }}
        </span>
      </button>
    </div>

    <div
      v-if="challengeActive"
      class="asc-summary__live"
    >
      <p class="flex items-center justify-between gap-2">
        <span>⚠ 异常演练 // {{ challengeDefinition?.name }}</span>
        <span>{{ Math.floor(challengeProgress) }}%</span>
      </p>
      <p class="mt-1 text-[7px] tracking-[0.04em] text-red-300/70">
        {{ challengeObjective?.label }} · {{ challengeObjective?.currentLabel }} /
        {{ challengeObjective?.targetLabel }}
      </p>
      <div class="asc-meter mt-1.5 asc-tone-red">
        <div class="asc-meter__fill" :style="{ width: `${challengeProgress}%` }"></div>
      </div>
    </div>

    <div
      v-else-if="blackDomainActive"
      class="asc-summary__live border-violet-500/45 bg-violet-950/40 text-violet-200"
    >
      <p class="flex items-center justify-between gap-2">
        <span>◉ 黑域已接入</span>
        <span>{{ formatNumber(blackDomainDrainRatio * 100).text }}% 流失</span>
      </p>
      <p class="mt-1 text-[7px] tracking-[0.06em] text-violet-300/70">
        Root 析出 {{ formatNumber(blackDomainRootRate).text }} /s
      </p>
    </div>

    <div class="asc-summary__actions">
      <button
        type="button"
        class="asc-btn asc-btn--primary asc-tone-gold"
        @click="emit('open-hub', 'tiers')"
      >
        重构终端
      </button>
      <button
        v-if="originTreeUnlocked"
        type="button"
        class="asc-btn asc-tone-gold"
        @click="emit('open-origin')"
      >
        起源树
      </button>
      <button
        v-else
        type="button"
        class="asc-btn asc-tone-cyan"
        @click="emit('open-hub', 'matrix')"
      >
        协议矩阵
      </button>
    </div>

    <div class="flex flex-wrap gap-1.5">
      <span class="asc-reward-chip">
        矩阵 Lv.{{ matrixTotalLevels }}
        <template v-if="matrixUnlocked"> // ×{{ matrixMultiplierLabel }}</template>
      </span>
      <span class="asc-reward-chip">
        里程碑 {{ globalMilestonesUnlocked }}/9
      </span>
      <span class="asc-reward-chip">
        挑战 {{ challengesCompletedCount }}/10
      </span>
    </div>

    <p class="asc-summary__note">
      四阶转生互斥 更高阶重置所有低阶资源 超频核心用于协议矩阵 越狱权限用于黑域篡改
      起源代码只属于起源树
    </p>
  </div>
</template>
