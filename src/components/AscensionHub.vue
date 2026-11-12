<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CHALLENGE_DEFS,
  MATRIX_CATEGORIES,
  TAMPER_LINKS,
} from '../composables/ascensionData'
import { showConfirm } from '../composables/useSettings'
import {
  formatMultiplier,
  formatNumber,
  formatScientific,
  formatTextNumbers,
} from '../composables/useGameState'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  initialTab: { type: String, default: 'tiers' },
  tab: { type: String, default: '' },
})

const emit = defineEmits(['close', 'open-origin', 'update:tab'])

const game = inject('game')

const {
  ascensionTiers,
  ascensionTiming,
  ascensionLocked,
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
  overclockCoresGainMultiplier,
  sourceGainMultiplier,
  rootGainMultiplier,
  originGainMultiplier,
  matrixCards,
  matrixTotalLevels,
  matrixMultiplierLabel,
  matrixUnlocked,
  tamperCards,
  blackDomainUnlocked,
  blackDomainActive,
  blackDomainRootRate,
  blackDomainDrainRatio,
  blackDomainDrainRate,
  originTreeUnlocked,
  lifetimeRootEarned,
  challengeActive,
  challengeDefinition,
  challengeObjective,
  challengeProgress,
  challengeArenaUnlocked,
  challengePermanentBonuses,
  challengeAllowsOverload,
  challengeClickFatigue,
  challengeServerDrainRate,
  challengePurchases,
  challengeTakeovers,
  challengeProduced,
  challengesCompleted,
  challengesCompletedCount,
  globalMilestones,
  globalMilestonesUnlocked,
  isCrisis,
  isOverclocking,
  launchRebuild,
  overloadAscension,
  collapseAscension,
  restartEpoch,
  startChallenge,
  exitChallenge,
  buyMatrixNode,
  buyTamperNode,
  enterBlackDomain,
  exitBlackDomain,
} = game

const activeTab = ref(props.tab || props.initialTab || 'tiers')
const armed = ref(null)
const armProgress = ref(0)
const hoveredMatrixId = ref('perceptron')
const ARM_DURATION_MS = 1500
let armInterval = null
let armTimeout = null

const categoryTone = {
  logic: 'cyan',
  tensor: 'emerald',
  architecture: 'violet',
  intelligence: 'amber',
  ultimate: 'gold',
}

const readyTierCount = computed(
  () => ascensionTiers.value.filter((tier) => tier.ready).length,
)

const bestTierCount = computed(
  () =>
    ascensionTiers.value.filter((tier) => timingFor(tier)?.best).length,
)

function timingFor(tier) {
  return ascensionTiming.value[tier.id] || null
}

function tierBreathSeconds(tier) {
  const timing = timingFor(tier)
  const progress = Math.min(100, Math.max(0, timing?.progress || 0))
  return `${(3.2 - 2.4 * (progress / 100)).toFixed(2)}s`
}

function formatEta(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return ''
  if (seconds < 60) return `${Math.max(1, Math.ceil(seconds))} 秒`
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return `${minutes} 分钟`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    const rest = minutes % 60
    return rest > 0 ? `${hours} 小时 ${rest} 分钟` : `${hours} 小时`
  }
  return ''
}

function tierTip(tier) {
  const timing = timingFor(tier)
  if (!timing) return ''
  const gainText =
    tier.id === 'reduction'
      ? formatScientific(tier.gain)
      : formatNumber(tier.gain).text
  const head = `当前飞升预计获得 [ ${tier.resourceName} x ${gainText} ]`
  if (timing.best) return `${head} | 已是最佳时机 | 立即执行`
  if (!tier.ready) return `${head} | 尚未满足飞升条件`
  if (timing.gainMet) return `${head} | 收益已达标 | 等待飞升窗口`
  const eta = formatEta(timing.etaSeconds)
  if (eta) return `${head} | 建议再挂机 ${eta}以获取最大收益`
  if (timing.stalled) return `${head} | 增长进入平台期 | 可执行飞升`
  return `${head} | 建议持续挂机以获取最大收益`
}

const tabs = computed(() => [
  {
    id: 'tiers',
    label: '飞升阶梯',
    icon: 'ascension',
    locked: false,
    badge:
      bestTierCount.value > 0
        ? `${bestTierCount.value} BEST`
        : readyTierCount.value > 0
          ? `${readyTierCount.value} READY`
          : '',
    tone: 'gold',
  },
  {
    id: 'challenges',
    label: '异常挑战',
    icon: 'challenge',
    locked: !challengeArenaUnlocked.value,
    badge: challengeActive.value
      ? 'LIVE'
      : `${challengesCompletedCount.value}/${CHALLENGE_DEFS.length}`,
    tone: challengeActive.value ? 'red' : '',
  },
  {
    id: 'matrix',
    label: '协议矩阵',
    icon: 'matrix',
    locked: !matrixUnlocked.value,
    badge: matrixUnlocked.value ? `LV.${matrixTotalLevels.value}` : 'LOCK',
    tone: 'cyan',
  },
  {
    id: 'blackdomain',
    label: '底层黑域',
    icon: 'blackdomain',
    locked: !blackDomainUnlocked.value,
    badge: blackDomainActive.value
      ? 'LIVE'
      : blackDomainUnlocked.value
        ? 'OPEN'
        : 'LOCK',
    tone: 'violet',
  },
])

const hoveredMatrix = computed(
  () =>
    matrixCards.value.find((node) => node.id === hoveredMatrixId.value) ??
    matrixCards.value[0],
)

const tamperPositions = computed(() => {
  const positions = {}
  for (const node of tamperCards.value) {
    positions[node.id] = {
      x: ((node.col - 0.5) / 3) * 100,
      y: ((node.tier - 0.5) / 5) * 100,
    }
  }
  return positions
})

const tamperLines = computed(() =>
  TAMPER_LINKS.map(([from, to]) => {
    const start = tamperPositions.value[from]
    const end = tamperPositions.value[to]
    if (!start || !end) return null
    const fromNode = tamperCards.value.find((node) => node.id === from)
    const toNode = tamperCards.value.find((node) => node.id === to)
    return {
      from,
      to,
      start,
      end,
      lit: (fromNode?.level || 0) > 0 && (toNode?.level || 0) > 0,
    }
  }).filter(Boolean),
)

const milestoneList = computed(() => globalMilestonesUnlocked.value)

const guideChallengeId = computed(
  () => CHALLENGE_DEFS.find((challenge) => !challengesCompleted[challenge.id])?.id ?? null,
)

const guideMatrixId = computed(() => {
  const unowned = matrixCards.value.filter((node) => node.level <= 0)
  return (unowned.find((node) => node.canAfford) ?? unowned[0])?.id ?? null
})

const guideTamperId = computed(() => {
  const unowned = tamperCards.value.filter((node) => node.level <= 0)
  return (unowned.find((node) => node.requiresMet) ?? unowned[0])?.id ?? null
})

function challengeProgressFor(challenge) {
  if (challengesCompleted[challenge.id]) return 100
  if (challengeActive.value === challenge.id) return challengeProgress.value
  return 0
}

function challengeMeterLabel(challenge) {
  if (challengesCompleted[challenge.id]) return '永久增益已生效'
  if (challengeActive.value === challenge.id && challengeObjective.value) {
    return `${challengeObjective.value.currentLabel} / ${challengeObjective.value.targetLabel}`
  }
  return `目标 ${challenge.targetLabel}`
}

function canStartChallenge(challenge) {
  return (
    challengeArenaUnlocked.value &&
    !challengeActive.value &&
    !blackDomainActive.value &&
    !isCrisis.value &&
    !isOverclocking.value &&
    !challengesCompleted[challenge.id]
  )
}

function challengeActionLabel(challenge) {
  if (challengesCompleted[challenge.id]) return '已完成'
  if (challengeActive.value === challenge.id) return '中止演练'
  if (challengeActive.value) return '演练占用'
  if (!challengeArenaUnlocked.value) return '未解锁'
  if (isArmed('challenge', challenge.id)) return '再次点击确认'
  return '进入演练'
}

function openTab(tabId) {
  clearArm()
  activeTab.value = tabId
  emit('update:tab', tabId)
}

function clearArm() {
  if (armInterval) {
    window.clearInterval(armInterval)
    armInterval = null
  }
  if (armTimeout) {
    window.clearTimeout(armTimeout)
    armTimeout = null
  }
  armed.value = null
  armProgress.value = 0
}

function armAction(kind, id) {
  clearArm()
  armed.value = { kind, id }
  const startedAt = performance.now()
  armInterval = window.setInterval(() => {
    armProgress.value = Math.min(
      100,
      ((performance.now() - startedAt) / ARM_DURATION_MS) * 100,
    )
  }, 30)
  armTimeout = window.setTimeout(clearArm, ARM_DURATION_MS)
}

function isArmed(kind, id) {
  return armed.value?.kind === kind && armed.value?.id === id
}

function executeTier(tier) {
  const id = tier?.id
  let gained = 0
  if (id === 'reduction') gained = launchRebuild()
  else if (id === 'overload') gained = overloadAscension()
  else if (id === 'collapse') gained = collapseAscension()
  else if (id === 'restart') gained = restartEpoch()
  if (gained > 0 && (id === 'reduction' || id === 'overload')) emit('close')
}

function isTierDisabled(tier) {
  if (challengeActive.value) {
    if (
      challengeAllowsOverload.value &&
      tier.id === 'overload' &&
      tier.ready &&
      !isCrisis.value &&
      !isOverclocking.value
    ) {
      return false
    }
    return true
  }
  return ascensionLocked.value || !tier.ready
}

function tierActionLabel(tier) {
  if (isArmed('tier', tier.id)) return '再次点击确认'
  if (challengeActive.value === 'time-stasis' && tier.id === 'overload') {
    return '执行超载 · 完成演练'
  }
  if (!tier.ready) return tier.disabledReason
  return showConfirm.value ? '执行飞升' : '一键飞升'
}

function requestTier(tier) {
  if (isTierDisabled(tier)) return
  if (!showConfirm.value) {
    clearArm()
    executeTier(tier)
    return
  }
  if (isArmed('tier', tier.id)) {
    clearArm()
    executeTier(tier)
    return
  }
  armAction('tier', tier.id)
}

watch(showConfirm, () => clearArm())

function handleChallengeAction(challenge) {
  if (challengeActive.value === challenge.id) {
    clearArm()
    exitChallenge({ completed: false })
    return
  }
  if (!canStartChallenge(challenge)) return
  if (isArmed('challenge', challenge.id)) {
    clearArm()
    startChallenge(challenge.id)
    return
  }
  armAction('challenge', challenge.id)
}

function buyMatrix(node) {
  if (!node.canAfford) return
  buyMatrixNode(node.id)
}

function buyTamper(node) {
  if (!node.canAfford) return
  buyTamperNode(node.id)
}

function toggleBlackDomain() {
  if (blackDomainActive.value) exitBlackDomain()
  else enterBlackDomain()
}

function matrixCostLabel(node) {
  if (node.isMax) return '已满级'
  return `${formatNumber(node.nextCost).text} OC`
}

function closeOnEscape(event) {
  if (event.key !== 'Escape') return
  if (armed.value) {
    clearArm()
    return
  }
  emit('close')
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => {
  clearArm()
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div class="ascension-hub" role="dialog" aria-modal="true" aria-label="赛博四阶飞升终端">
    <div class="ascension-hub__backdrop" @click="emit('close')"></div>

    <div class="ascension-hub__frame">
      <header class="ascension-hub__header">
        <div class="ascension-hub__brand">
          <span class="ascension-hub__sigil" aria-hidden="true">∞</span>
          <div class="min-w-0">
            <p class="ascension-hub__eyebrow">CYBER ASCENSION // 四阶转生协议</p>
            <h2 class="ascension-hub__title">赛博四阶飞升终端</h2>
          </div>
        </div>

        <div class="ascension-hub__resources">
          <span class="asc-resource asc-tone-amber">
            <span>核心源码</span>
            <strong>{{ formatScientific(coreSource) }}</strong>
          </span>
          <span class="asc-resource asc-tone-cyan">
            <span>超频核心</span>
            <strong>{{ formatNumber(overclockCores).text }}</strong>
          </span>
          <span class="asc-resource asc-tone-violet">
            <span>越狱权限</span>
            <strong>{{ formatScientific(rootAccess) }}</strong>
          </span>
          <span class="asc-resource asc-tone-gold">
            <span>起源代码</span>
            <strong>{{ formatNumber(originCode).text }}</strong>
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            v-if="originTreeUnlocked"
            type="button"
            class="asc-btn asc-tone-gold"
            @click="emit('open-origin')"
          >
            起源树
          </button>
          <button
            type="button"
            class="ascension-hub__close"
            data-guide="hub-close"
            aria-label="关闭飞升终端"
            @click="emit('close')"
          >
            ×
          </button>
        </div>
      </header>

      <nav class="ascension-hub__nav" role="tablist" aria-label="飞升模块">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          class="ascension-nav-tab"
          :data-guide="`hub-tab-${tab.id}`"
          :data-locked="tab.locked"
          :class="{ 'ascension-nav-tab--active': activeTab === tab.id }"
          :aria-selected="activeTab === tab.id"
          @click="openTab(tab.id)"
        >
          <span class="ascension-nav-tab__icon" aria-hidden="true">
            <GameIcon :name="tab.icon" :size="13" />
          </span>
          {{ tab.label }}
          <span
            v-if="tab.badge"
            class="ascension-nav-tab__badge"
            :class="{
              'ascension-nav-tab__badge--red': tab.tone === 'red',
              'ascension-nav-tab__badge--violet': tab.tone === 'violet',
            }"
          >
            {{ tab.badge }}
          </span>
        </button>
      </nav>

      <div class="ascension-hub__body">
        <!-- ============ 飞升阶梯 ============ -->
        <template v-if="activeTab === 'tiers'">
          <div class="ascension-section-head">
            <div>
              <p class="ascension-section-title">
                <GameIcon name="ascension" :size="14" class="ascension-section-icon" />
                四阶转生协议
                <span>ASCENSION LADDER</span>
              </p>
              <p class="ascension-section-meta ascension-section-note">
                历史最高算力 {{ formatScientific(highestCompute) }} CU //
                本局峰值 {{ formatScientific(peakAlignedCompute) }} CU
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="asc-reward-chip asc-reward-chip--best">⭐ 最佳时机实时判定</span>
              <span class="asc-reward-chip">降维 ×{{ formatMultiplier(sourceGainMultiplier) }}</span>
              <span class="asc-reward-chip">超载 ×{{ formatMultiplier(overclockCoresGainMultiplier) }}</span>
              <span class="asc-reward-chip">坍缩 ×{{ formatMultiplier(rootGainMultiplier) }}</span>
              <span class="asc-reward-chip">重启 ×{{ formatMultiplier(originGainMultiplier) }}</span>
            </div>
          </div>

          <div class="asc-tier-grid">
            <article
              v-for="tier in ascensionTiers"
              :key="tier.id"
              class="asc-tier"
              :class="[
                `asc-tone-${tier.tone}`,
                {
                  'asc-tier--ready': tier.ready && !ascensionLocked,
                  'asc-tier--locked': !tier.ready,
                  'asc-tier--best': timingFor(tier)?.best,
                },
              ]"
              :style="
                timingFor(tier)
                  ? { '--asc-breath': tierBreathSeconds(tier) }
                  : null
              "
            >
              <span class="asc-tier__order" aria-hidden="true">0{{ tier.order }}</span>

              <div class="asc-tier__head">
                <div class="flex items-start gap-2.5">
                  <span class="asc-tier__glyph" aria-hidden="true">{{ tier.glyph }}</span>
                  <div>
                    <h3 class="asc-tier__name">{{ tier.name }}</h3>
                    <p class="asc-tier__code">{{ tier.code }}</p>
                  </div>
                </div>
                <span
                  class="asc-tier__badge"
                  :class="{ 'asc-tier__badge--best': timingFor(tier)?.best }"
                >
                  {{
                    timingFor(tier)?.best
                      ? '⭐ BEST'
                      : tier.ready
                        ? 'READY'
                        : 'LOCKED'
                  }}
                </span>
              </div>

              <p class="asc-tier__desc">
                {{
                  tier.id === 'reduction'
                    ? '拆解整套算力阵列 | 服务器与算法压缩为核心源码 | 为下一次扩张蓄能'
                    : tier.id === 'overload'
                      ? formatTextNumbers('算力突破 1e100 物理临界点 | 熔断散热锁 | 提炼超频核心 | 清空一阶资源')
                      : tier.id === 'collapse'
                        ? '逻辑推入底层黑域 | 换取越狱权限 | 黑域吞噬算力 | 持续析出 Root'
                        : formatTextNumbers('击穿 1e1000 纪元壁垒 | 重置全部进度 | 按本局表现提炼起源代码')
                }}
              </p>

              <div class="asc-tier__stats">
                <div>
                  <p class="asc-tier__gain-label">预计获得</p>
                  <p
                    class="asc-tier__gain"
                    :class="{ 'asc-tier__gain--locked': tier.gain <= 0 }"
                  >
                    +{{ tier.id === 'reduction' ? formatScientific(tier.gain) : formatNumber(tier.gain).text }}
                    <small>{{ tier.resourceName }}</small>
                  </p>
                </div>
                <div class="asc-tier__meta">
                  <p>条件 <strong>{{ formatTextNumbers(tier.requirement) }}</strong></p>
                  <p>累计 <strong>{{ tier.id === 'reduction' ? totalRebuilds : tier.id === 'overload' ? totalOverloads : tier.id === 'collapse' ? totalCollapses : epochRestarts }}</strong> 次</p>
                </div>
              </div>

              <div class="asc-meter">
                <div class="asc-meter__fill" :style="{ width: `${tier.progress}%` }"></div>
              </div>

              <div class="asc-tier__footer">
                <span class="asc-tier__reset">{{ tier.resetLabel }}</span>
                <span
                  class="asc-tier__action"
                >
                  <span
                    v-if="timingFor(tier)?.best"
                    class="asc-best-tag"
                    :class="
                      tier.id === 'reduction'
                        ? 'asc-best-tag--gold'
                        : 'asc-best-tag--violet'
                    "
                  >
                    [ ⭐
                    {{ tier.id === 'reduction' ? '最佳降维时机' : '最佳超载时机' }}
                    ]
                  </span>
                  <span
                    v-if="timingFor(tier)"
                    class="asc-best-tip"
                    role="tooltip"
                  >
                    {{ tierTip(tier) }}
                  </span>
                  <span class="asc-btn-wrap">
                    <svg
                      v-if="timingFor(tier)?.best"
                      class="asc-btn-aura"
                      viewBox="0 0 120 32"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <ellipse
                        class="asc-btn-aura__ring"
                        cx="60"
                        cy="16"
                        rx="58"
                        ry="14.5"
                      />
                    </svg>
                    <button
                      type="button"
                      class="asc-btn asc-btn--primary"
                      :data-guide="
                        tier.id === 'reduction'
                          ? 'tier-reduction'
                          : tier.id === 'overload'
                            ? 'tier-overload'
                            : tier.id === 'collapse'
                              ? 'tier-collapse'
                              : 'tier-restart'
                      "
                      :class="{
                        'asc-btn--arming': isArmed('tier', tier.id),
                        'asc-btn--best': timingFor(tier)?.best,
                        'asc-btn--timed':
                          Boolean(timingFor(tier)) && tier.ready,
                      }"
                      :disabled="isTierDisabled(tier)"
                      @click="requestTier(tier)"
                    >
                      <span
                        v-if="isArmed('tier', tier.id)"
                        class="asc-btn__arm"
                        :style="{ width: `${armProgress}%` }"
                        aria-hidden="true"
                      ></span>
                      <span class="asc-btn__label">{{ tierActionLabel(tier) }}</span>
                    </button>
                  </span>
                </span>
              </div>
            </article>
          </div>

          <div class="ascension-section-head mt-4">
            <div>
              <p class="ascension-section-title">
                <GameIcon name="achievement" :size="14" class="ascension-section-icon" />
                全局里程碑
                <span>GLOBAL MILESTONES</span>
              </p>
              <p class="ascension-section-note">
                历史最高算力永久解锁 | 达成时弹出金色协议提示
              </p>
            </div>
            <span class="asc-reward-chip">
              {{ milestoneList }} / 9 已解锁
            </span>
          </div>

          <div class="grid grid-cols-3 gap-2 sm:grid-cols-5 xl:grid-cols-9">
            <div
              v-for="milestone in [
                { id: 'gm-1e40', thresholdLabel: '1e40', name: '自治采购', effect: '自动采购频率 ×2' },
                { id: 'gm-1e45', thresholdLabel: '1e45', name: '自动降维', effect: '最佳降维时机自动执行' },
                { id: 'gm-1e58', thresholdLabel: '1e58', name: '拓扑锚定', effect: '降维保留神经拓扑' },
                { id: 'gm-1e78', thresholdLabel: '1e78', name: '集群残响', effect: '降维保留 10% 服务器' },
                { id: 'gm-1e110', thresholdLabel: '1e110', name: '超频共振', effect: '超频核心产出 ×2' },
                { id: 'gm-1e174', thresholdLabel: '1e174', name: '超频奇点', effect: '超频核心产出 ×3' },
                { id: 'gm-1e206', thresholdLabel: '1e206', name: '源码洪流', effect: '核心源码产出 ×2' },
                { id: 'gm-1e270', thresholdLabel: '1e270', name: '黑域共鸣', effect: '黑域 Root 产出 +50%' },
                { id: 'gm-1e290', thresholdLabel: '1e290', name: '纪元回响', effect: '永久全局产出 ×10' },
              ]"
              :key="milestone.id"
              class="border p-2"
              :class="
                globalMilestones[milestone.id]
                  ? 'border-amber-400/60 bg-amber-400/[0.08] shadow-[0_0_14px_rgba(251,191,36,0.16)]'
                  : 'border-slate-700/60 bg-[#050b16]/80 opacity-60'
              "
              :title="`${milestone.name} // ${milestone.effect}`"
            >
              <p
                class="text-[8px] tracking-[0.12em]"
                :class="globalMilestones[milestone.id] ? 'text-amber-300' : 'text-slate-500'"
              >
                {{ formatTextNumbers(milestone.thresholdLabel) }}
              </p>
              <p class="mt-0.5 text-[9px] font-semibold tracking-[0.04em] text-slate-200">
                {{ milestone.name }}
              </p>
              <p class="mt-0.5 text-[7px] leading-snug text-slate-500">
                {{ milestone.effect }}
              </p>
            </div>
          </div>

          <div
            v-if="ascensionLocked"
            class="asc-challenge-live mt-3"
          >
            <div class="asc-challenge-live__head">
              <span>⚠ 飞升协议暂时锁定</span>
              <span>
                {{
                  challengeActive
                    ? '异常挑战进行中'
                    : blackDomainActive
                      ? '黑域连接中'
                      : isOverclocking
                        ? '超频进行中'
                        : '对齐危机进行中'
                }}
              </span>
            </div>
          </div>
        </template>

        <!-- ============ 异常挑战 ============ -->
        <template v-else-if="activeTab === 'challenges'">
          <div class="ascension-section-head">
            <div>
              <p class="ascension-section-title">
                <GameIcon name="challenge" :size="14" class="ascension-section-icon" />
                系统异常演练
                <span>ANOMALY ARENA · 10 PROTOCOLS</span>
              </p>
              <p class="ascension-section-note">
                主动接入异常环境 | 严苛限制下重新推演算力曲线 | 完成即刻结算永久全局增益 | 跨越四阶转生永久生效
              </p>
            </div>
            <div class="flex flex-wrap gap-2">
              <span class="asc-reward-chip">
                已突破 {{ challengesCompletedCount }} / {{ CHALLENGE_DEFS.length }}
              </span>
              <span class="asc-reward-chip">
                永久增益 {{ challengePermanentBonuses.length }} 项
              </span>
            </div>
          </div>

          <div v-if="!challengeArenaUnlocked" class="asc-challenge-arena-lock">
            <span class="asc-challenge-arena-lock__glyph" aria-hidden="true">▣</span>
            <div>
              <p class="asc-challenge-arena-lock__title">异常演练模拟器尚未解锁</p>
              <p class="asc-challenge-arena-lock__desc">
                历史最高算力达到 1e100 CU [ 完成一次算力超载 ] 后 | 异常环境接入
              </p>
            </div>
          </div>

          <div
            v-if="challengeActive && challengeDefinition"
            class="asc-challenge-live asc-challenge-live--panel"
          >
            <div class="asc-challenge-live__head">
              <span>
                ⚠ 演练进行中 // 0{{ challengeDefinition.order }}
                {{ challengeDefinition.name }}
                <span class="asc-challenge-live__code">{{ challengeDefinition.code }}</span>
              </span>
              <span>{{ formatTextNumbers(challengeDefinition.objective.label) }}</span>
            </div>
            <div class="asc-challenge-live__stats">
              <span>
                进度
                <strong>
                  {{ challengeObjective?.currentLabel }} /
                  {{ formatTextNumbers(challengeObjective?.targetLabel) }}
                </strong>
              </span>
              <span v-if="challengeActive === 'click-overload'">
                CPS 压制 <strong class="text-red-300">-{{ challengeClickFatigue }}%</strong>
              </span>
              <span v-else-if="challengeActive === 'server-blackhole'">
                流失速度
                <strong class="text-red-300">{{ formatNumber(challengeServerDrainRate).text }} 台/秒</strong>
              </span>
              <span v-else-if="challengeActive === 'load-penalty'">
                本局采购 <strong class="text-amber-300">{{ challengePurchases }} 台</strong>
              </span>
              <span v-else-if="challengeActive === 'jailbreak-offline'">
                手动接管 <strong class="text-red-300">{{ challengeTakeovers }} / 3</strong>
              </span>
              <span v-else-if="challengeActive === 'compute-sterile'">
                本局产出 <strong class="text-violet-300">{{ formatScientific(challengeProduced) }}</strong>
              </span>
              <span class="asc-challenge-live__restrictions">
                限制 // {{ challengeDefinition.restrictionTags.join(' · ') }}
              </span>
            </div>
            <div class="asc-meter mt-2 asc-challenge-live__bar">
              <div class="asc-meter__fill" :style="{ width: `${challengeProgress}%` }"></div>
            </div>
            <div class="asc-challenge-live__actions">
              <span class="tabular-nums">{{ Math.floor(challengeProgress) }}%</span>
              <button
                type="button"
                class="asc-btn asc-btn--danger"
                @click="exitChallenge({ completed: false })"
              >
                中止演练
              </button>
            </div>
          </div>

          <div class="asc-challenge-list">
            <article
              v-for="challenge in CHALLENGE_DEFS"
              :key="challenge.id"
              class="asc-challenge-row"
              :class="[
                `asc-tone-${challenge.tone}`,
                {
                  'asc-challenge-row--done': challengesCompleted[challenge.id],
                  'asc-challenge-row--active': challengeActive === challenge.id,
                  'asc-challenge-row--locked': !challengeArenaUnlocked,
                },
              ]"
            >
              <div class="asc-challenge-row__main">
                <span class="asc-challenge-row__glyph" aria-hidden="true">
                  {{ challenge.glyph }}
                </span>

                <div class="asc-challenge-row__body">
                  <div class="asc-challenge-row__head">
                    <span class="asc-challenge-row__order">
                      {{ String(challenge.order).padStart(2, '0') }}
                    </span>
                    <h3 class="asc-challenge-row__name">{{ challenge.name }}</h3>
                    <span class="asc-challenge-row__tag">{{ challenge.tag }}</span>
                    <span class="asc-challenge-row__code">{{ challenge.code }}</span>
                  </div>

                  <p class="asc-challenge-row__desc">{{ formatTextNumbers(challenge.description) }}</p>

                  <div class="asc-challenge-row__tags">
                    <span
                      v-for="tag in challenge.restrictionTags"
                      :key="tag"
                      class="asc-challenge-row__restriction"
                    >
                      ⛔ {{ tag }}
                    </span>
                    <span class="asc-challenge-row__reward">
                      ◈ 永久奖励 // {{ challenge.reward.label }}
                    </span>
                  </div>
                </div>

                <div class="asc-challenge-row__side">
                  <span class="asc-challenge-row__target">{{ formatTextNumbers(challenge.targetLabel) }}</span>
                  <span
                    class="asc-challenge-row__state"
                    :class="{
                      'asc-challenge-row__state--done': challengesCompleted[challenge.id],
                      'asc-challenge-row__state--active': challengeActive === challenge.id,
                    }"
                  >
                    {{
                      challengesCompleted[challenge.id]
                        ? 'DONE'
                        : challengeActive === challenge.id
                          ? 'LIVE'
                          : challengeArenaUnlocked
                            ? 'READY'
                            : 'LOCK'
                    }}
                  </span>
                  <button
                    type="button"
                    class="asc-challenge-row__button"
                    :data-guide="
                      challenge.id === guideChallengeId ? 'challenge-start' : null
                    "
                    :class="{
                      'asc-challenge-row__button--active': challengeActive === challenge.id,
                      'asc-challenge-row__button--done': challengesCompleted[challenge.id],
                      'asc-challenge-row__button--arming': isArmed('challenge', challenge.id),
                    }"
                    :disabled="
                      challengeActive !== challenge.id && !canStartChallenge(challenge)
                    "
                    @click="handleChallengeAction(challenge)"
                  >
                    <span
                      v-if="isArmed('challenge', challenge.id)"
                      class="asc-btn__arm"
                      :style="{ width: `${armProgress}%` }"
                      aria-hidden="true"
                    ></span>
                    <span class="asc-btn__label">{{ challengeActionLabel(challenge) }}</span>
                  </button>
                </div>
              </div>

              <div class="asc-challenge-row__progress">
                <div class="asc-challenge-row__progress-head">
                  <span>目标 // {{ formatTextNumbers(challenge.objective.label) }}</span>
                  <span class="tabular-nums">{{ challengeMeterLabel(challenge) }}</span>
                </div>
                <div class="asc-meter">
                  <div
                    class="asc-meter__fill"
                    :style="{ width: `${challengeProgressFor(challenge)}%` }"
                  ></div>
                </div>
              </div>
            </article>
          </div>

          <div v-if="challengePermanentBonuses.length" class="asc-challenge-bonuses">
            <p class="asc-challenge-bonuses__title">已生效的永久异常增益</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="bonus in challengePermanentBonuses"
                :key="bonus.id"
                class="asc-reward-chip"
              >
                ✓ {{ bonus.name }} // {{ bonus.label }}
              </span>
            </div>
          </div>

          <p class="asc-challenge-footnote">
            进入演练清空当前周目算力 / 服务器 / 算法 / 神经拓扑 / 核心源码升级 | 转生资源 / 协议矩阵 / 已完成挑战增益不受影响
            中途放弃不损失已获永久奖励
          </p>
        </template>

        <!-- ============ 协议矩阵 ============ -->
        <template v-else-if="activeTab === 'matrix'">
          <div class="ascension-section-head">
            <div>
              <p class="ascension-section-title">
                <GameIcon name="matrix" :size="14" class="ascension-section-icon" />
                数据协议矩阵
                <span>PROTOCOL MATRIX</span>
              </p>
              <p class="ascension-section-note">
                消耗超频核心点亮矩阵节点 | 每级总等级让全局产出 ×2
              </p>
            </div>
            <div class="matrix-kpis">
              <span class="matrix-kpi asc-tone-cyan">
                <span>总等级</span>
                <strong>{{ matrixTotalLevels }}</strong>
              </span>
              <span class="matrix-kpi asc-tone-amber">
                <span>全局</span>
                <strong>×{{ matrixMultiplierLabel }}</strong>
              </span>
              <span class="matrix-kpi asc-tone-gold">
                <span>持有</span>
                <strong>{{ formatNumber(overclockCores).text }} OC</strong>
              </span>
            </div>
          </div>

          <div class="asc-matrix-wrap">
            <div class="asc-matrix-grid">
              <button
                v-for="node in matrixCards"
                :key="node.id"
                type="button"
                class="matrix-cell"
                :data-guide="node.id === guideMatrixId ? 'matrix-node' : null"
                :class="[
                  `asc-tone-${categoryTone[node.category]}`,
                  {
                    'matrix-cell--hover': hoveredMatrixId === node.id,
                    'matrix-cell--owned': node.level > 0,
                    'matrix-cell--max': node.isMax,
                  },
                ]"
                :style="{ gridRow: node.row, gridColumn: node.col }"
                :disabled="!node.canAfford"
                :title="`${node.name} // ${formatTextNumbers(node.description)} // ${matrixCostLabel(node)}`"
                @mouseenter="hoveredMatrixId = node.id"
                @focus="hoveredMatrixId = node.id"
                @click="buyMatrix(node)"
              >
                <span class="matrix-cell__atomic">{{ String(node.atomic).padStart(2, '0') }}</span>
                <span class="matrix-cell__level">Lv {{ node.level }}/{{ node.maxLevel }}</span>
                <span class="matrix-cell__symbol">{{ node.symbol }}</span>
                <span class="matrix-cell__name">{{ node.name }}</span>
                <span
                  class="matrix-cell__cost"
                  :class="{ 'matrix-cell__cost--ready': node.canAfford }"
                >
                  {{ matrixCostLabel(node) }}
                </span>
              </button>
            </div>

            <div class="matrix-category-legend">
              <span
                v-for="(category, key) in MATRIX_CATEGORIES"
                :key="key"
                class="matrix-legend"
                :class="`asc-tone-${categoryTone[key]}`"
              >
                <span class="matrix-legend__dot"></span>
                {{ category.name }}
              </span>
            </div>

            <div
              v-if="hoveredMatrix"
              class="matrix-detail"
              :class="`asc-tone-${categoryTone[hoveredMatrix.category]}`"
            >
              <div class="matrix-detail__main">
                <p class="matrix-detail__title">
                  {{ hoveredMatrix.name }}
                  <span>{{ MATRIX_CATEGORIES[hoveredMatrix.category]?.name }}</span>
                </p>
                <p class="matrix-detail__desc">{{ hoveredMatrix.description }}</p>
              </div>
              <div class="matrix-detail__stats">
                <span>当前等级 <strong>{{ hoveredMatrix.level }} / {{ hoveredMatrix.maxLevel }}</strong></span>
                <span>
                  下一级
                  <strong class="matrix-detail__cost">{{ hoveredMatrix.isMax ? 'MAX' : `${formatNumber(hoveredMatrix.nextCost).text} OC` }}</strong>
                </span>
                <span v-if="hoveredMatrix.level > 0">
                  节点贡献 <strong>×{{ formatMultiplier(Math.pow(2, hoveredMatrix.level)) }}</strong>
                </span>
                <span v-if="hoveredMatrix.id === 'autoClick'">
                  自动点击 <strong>{{ hoveredMatrix.level }} 次/秒</strong>
                </span>
              </div>
            </div>
          </div>

          <div
            v-if="!matrixUnlocked"
            class="asc-challenge-live mt-3"
          >
            <div class="asc-challenge-live__head">
              <span>矩阵尚未接入</span>
              <span>完成一次算力超载以获取首枚超频核心</span>
            </div>
          </div>
        </template>

        <!-- ============ 底层黑域 ============ -->
        <template v-else-if="activeTab === 'blackdomain'">
          <div class="ascension-section-head">
            <div>
              <p class="ascension-section-title">
                <GameIcon name="blackdomain" :size="14" class="ascension-section-icon" />
                底层黑域
                <span>UNDERLYING BLACK DOMAIN</span>
              </p>
              <p class="ascension-section-note">
                黑域持续吞噬算力 | 流失算力提炼为越狱权限 | 系统篡改协议永久强化黑域与全局生产
              </p>
            </div>
            <span class="asc-resource asc-tone-violet">
              <span>越狱权限</span>
              <strong>{{ formatScientific(rootAccess) }}</strong>
            </span>
          </div>

          <template v-if="blackDomainUnlocked">
            <div class="black-status" :class="blackDomainActive ? 'asc-tone-violet' : 'asc-tone-cyan'">
              <div>
                <p class="black-status__title">
                  {{ blackDomainActive ? '黑域连接已建立' : '黑域入口待命' }}
                </p>
                <p class="black-status__sub">
                  {{
                    blackDomainActive
                      ? `每秒吞噬 ${formatNumber(blackDomainDrainRatio * 100).text}% 算力产出 | 析出 Root`
                      : '建立连接后算力库存净流出 80% | 持续产出越狱权限'
                  }}
                </p>
              </div>
              <div class="black-status__metrics">
                <div class="black-metric">
                  <span>当前 Root 产出</span>
                  <strong>{{ formatNumber(blackDomainRootRate).text }} /s</strong>
                </div>
                <div class="black-metric">
                  <span>算力流失速率</span>
                  <strong>{{ formatNumber(blackDomainDrainRate).text }} CU/s</strong>
                </div>
                <div class="black-metric">
                  <span>累计获得</span>
                  <strong>{{ formatNumber(lifetimeRootEarned).text }}</strong>
                </div>
              </div>
              <button
                type="button"
                class="asc-btn asc-btn--primary"
                data-guide="blackdomain-entry"
                :class="blackDomainActive ? 'asc-btn--danger' : 'asc-tone-violet'"
                :disabled="challengeActive || isOverclocking"
                @click="toggleBlackDomain"
              >
                {{ blackDomainActive ? '断开黑域' : '接入黑域' }}
              </button>
            </div>

            <div class="ascension-section-head mt-4">
              <div>
                <p class="ascension-section-title">
                  <GameIcon name="jailbreak" :size="14" class="ascension-section-icon" />
                  系统篡改协议
                  <span>SYSTEM TAMPER TREE</span>
                </p>
                <p class="ascension-section-note">
                  消耗越狱权限编译篡改节点 | 前置节点点亮后继续深入
                </p>
              </div>
              <span class="asc-reward-chip">黑域等级 {{ tamperCards.filter((n) => n.level > 0).length }} / {{ tamperCards.length }}</span>
            </div>

            <div class="tamper-tree">
              <svg
                class="tamper-tree__lines"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <line
                  v-for="line in tamperLines"
                  :key="`${line.from}-${line.to}`"
                  :x1="line.start.x"
                  :y1="line.start.y"
                  :x2="line.end.x"
                  :y2="line.end.y"
                  class="tamper-line"
                  :class="{ 'tamper-line--lit': line.lit }"
                />
              </svg>

              <div
                v-for="node in tamperCards"
                :key="node.id"
                class="tamper-node"
                :data-guide="node.id === guideTamperId ? 'tamper-node' : null"
                :class="{
                  'tamper-node--lit': node.level > 0,
                  'tamper-node--ready': node.canAfford,
                  'tamper-node--locked': !node.requiresMet,
                }"
                :style="{
                  left: `${tamperPositions[node.id].x}%`,
                  top: `${tamperPositions[node.id].y}%`,
                }"
              >
                <div class="tamper-node__head">
                  <span class="tamper-node__glyph" aria-hidden="true">{{ node.glyph }}</span>
                  <span class="tamper-node__name">{{ node.name }}</span>
                  <span class="tamper-node__level">Lv {{ node.level }}/{{ node.maxLevel }}</span>
                </div>
                <p class="tamper-node__effect">{{ node.effect }}</p>
                <div class="tamper-node__foot">
                  <span class="tamper-node__cost">
                    {{ node.isMax ? 'MAX' : `${formatNumber(node.nextCost).text} Root` }}
                  </span>
                  <button
                    type="button"
                    class="tamper-node__buy"
                    :disabled="!node.canAfford"
                    :title="node.requiresMet ? formatTextNumbers(node.description) : '需要先点亮前置节点'"
                    @click="buyTamper(node)"
                  >
                    {{ node.isMax ? '已满' : node.requiresMet ? '编译' : '锁定' }}
                  </button>
                </div>
              </div>
            </div>
          </template>

          <div v-else class="black-domain-locked">
            <p class="black-domain-locked__glyph" aria-hidden="true">◉</p>
            <p class="black-domain-locked__title">黑域入口尚未解析</p>
            <p class="black-domain-locked__hint">
              完成一次 [ 逻辑坍缩 ] 后 | 底层黑域入口永久解锁<br />
              可主动接入黑域 | 吞噬算力转化为越狱权限
            </p>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
