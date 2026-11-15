<script setup>
import { computed, inject } from 'vue'
import { formatNumber, formatTextNumbers } from '../composables/useGameState'

const emit = defineEmits(['open', 'exit-challenge', 'exit-black-domain'])

const game = inject('game')

const {
  ascensionTiers,
  ascensionTiming,
  highestCompute,
  challengeActive,
  challengeDefinition,
  challengeObjective,
  challengeProgress,
  blackDomainActive,
  blackDomainDrainRatio,
  blackDomainRootRate,
  totalRebuilds,
  totalOverloads,
  totalCollapses,
  epochRestarts,
  mainQuestCard,
} = game

const variant = computed(() => {
  if (challengeActive.value) return 'challenge'
  if (blackDomainActive.value) return 'blackdomain'
  return 'normal'
})

// 架构降维指令进行中 | 右侧终端按钮切换为直达降维
const reduceQuestActive = computed(() => {
  const id = mainQuestCard.value?.id
  return id === 'rebuild1' || id === 'rebuild3'
})

const readyCount = computed(
  () => ascensionTiers.value.filter((tier) => tier.ready).length,
)

const bestCount = computed(
  () =>
    ascensionTiers.value.filter((tier) => ascensionTiming.value[tier.id]?.best)
      .length,
)

function tierTiming(tier) {
  return ascensionTiming.value[tier.id] || null
}

function stepState(tier) {
  if (tier.ready) return 'ready'
  if (tier.id === 'reduction') return totalRebuilds.value > 0 ? 'lit' : ''
  if (tier.id === 'overload') return totalOverloads.value > 0 ? 'lit' : ''
  if (tier.id === 'collapse') return totalCollapses.value > 0 ? 'lit' : ''
  return epochRestarts.value > 0 ? 'lit' : ''
}
</script>

<template>
  <div
    class="asc-rail"
    :class="{
      'asc-rail--challenge': variant === 'challenge',
      'asc-rail--blackdomain': variant === 'blackdomain',
    }"
  >
    <div class="asc-rail__top">
      <span class="asc-rail__glyph" aria-hidden="true">
        {{ variant === 'challenge' ? '⚠' : variant === 'blackdomain' ? '◉' : '∞' }}
      </span>

      <div class="asc-rail__copy">
        <p class="asc-rail__tag">
          <span v-if="variant === 'challenge'">异常挑战 // LIVE</span>
          <span v-else-if="variant === 'blackdomain'">底层黑域 // CONNECTED</span>
          <span v-else>赛博四阶跃迁 // 转生协议</span>
        </p>
        <p class="asc-rail__title">
          <template v-if="variant === 'challenge'">
            {{ challengeDefinition?.name }} · 进行中
          </template>
          <template v-else-if="variant === 'blackdomain'">黑域吞噬算力中</template>
          <template v-else>
            四阶跃迁
            <span class="asc-rail__ready" :class="{ 'asc-rail__ready--best': bestCount > 0 }">
              {{
                bestCount > 0
                  ? `⭐ ${bestCount} 条最佳时机`
                  : readyCount > 0
                    ? `${readyCount} 条协议就绪`
                    : '等待峰值突破'
              }}
            </span>
          </template>
        </p>
      </div>

      <span class="asc-rail__peak">
        峰值<br />
        {{ formatNumber(highestCompute).value }}<span
          v-if="formatNumber(highestCompute).unit"
          class="number-unit number-unit--inline"
        >{{ formatNumber(highestCompute).unit }}</span>
      </span>
    </div>

    <div v-if="variant === 'normal'" class="asc-rail__row asc-rail__row--tiers">
      <div class="asc-rail__steps" aria-label="算力演替链状态">
        <span
          v-for="tier in ascensionTiers"
          :key="tier.id"
          class="asc-rail__step"
          :class="{
            'is-lit': stepState(tier) === 'lit',
            'is-ready': stepState(tier) === 'ready',
            'is-best': tierTiming(tier)?.best,
          }"
          :title="`${tier.name} // ${formatTextNumbers(tier.requirement)} // ${tier.resetLabel}`"
        >
          <span aria-hidden="true">{{ tierTiming(tier)?.best ? '⭐' : tier.glyph }}</span>
          <b>0{{ tier.order }} {{ tier.name }}</b>
        </span>
      </div>

      <button
        type="button"
        class="asc-rail__cta"
        :class="{
          'asc-rail__cta--reduction': reduceQuestActive,
          'asc-rail__cta--best': bestCount > 0,
        }"
        :data-guide="reduceQuestActive ? 'open-reduction' : 'open-ascension'"
        @click="emit('open')"
      >
        {{ bestCount > 0 ? '⭐ 最佳时机' : reduceQuestActive ? '架构降维' : '重构终端' }}
      </button>
    </div>

    <div v-else class="asc-rail__row">
      <template v-if="variant === 'challenge'">
        <span class="asc-rail__challenge-copy">
          {{ challengeObjective?.currentLabel }} / {{ formatTextNumbers(challengeObjective?.targetLabel) }} ·
          {{ Math.floor(challengeProgress) }}%
        </span>
        <span class="asc-rail__challenge-meter" aria-hidden="true">
          <span :style="{ width: `${challengeProgress}%` }"></span>
        </span>
        <button
          type="button"
          class="asc-rail__exit"
          @click="emit('exit-challenge')"
        >
          中止
        </button>
      </template>

      <template v-else>
        <span class="asc-rail__challenge-copy">
          每秒吞噬 {{ formatNumber(blackDomainDrainRatio * 100).text }}% · Root
          {{ formatNumber(blackDomainRootRate).text }}/s
        </span>
        <button
          type="button"
          class="asc-rail__exit asc-rail__exit--violet"
          @click="emit('exit-black-domain')"
        >
          断开
        </button>
      </template>

      <button
        type="button"
        class="asc-rail__cta"
        data-guide="open-ascension"
        @click="emit('open')"
      >
        终端
      </button>
    </div>
  </div>
</template>
