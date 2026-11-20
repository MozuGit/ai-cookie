<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, shallowRef, watch } from 'vue'
import BuildingCard from './components/BuildingCard.vue'
import GameIcon from './components/GameIcon.vue'
import TopologyMap from './components/TopologyMap.vue'
import ArchitectureStation from './components/ArchitectureStation.vue'
import JailbreakProtocol from './components/JailbreakProtocol.vue'
import AutomationConsole from './components/AutomationConsole.vue'
import CyberMatrix from './components/CyberMatrix.vue'
import AdminConsole from './components/AdminConsole.vue'
import ModuleLock from './components/ModuleLock.vue'
import SystemTerminal from './components/SystemTerminal.vue'
import TutorialArrow from './components/TutorialArrow.vue'
import MainQuest from './components/MainQuest.vue'
import SettingsPanel from './components/SettingsPanel.vue'
import SystemInfoPanel from './components/SystemInfoPanel.vue'
import AchievementPanel from './components/AchievementPanel.vue'
import AchievementToast from './components/AchievementToast.vue'
import AscensionBanner from './components/AscensionBanner.vue'
import AscensionHub from './components/AscensionHub.vue'
import EpochRebirthOverlay from './components/EpochRebirthOverlay.vue'
import AscensionCinematicOverlay from './components/AscensionCinematicOverlay.vue'
import MobileCompatNotice from './components/MobileCompatNotice.vue'
import OriginTree from './components/OriginTree.vue'
import GlobalMilestoneToast from './components/GlobalMilestoneToast.vue'
import RadarPanel from './components/RadarPanel.vue'
import HoloDrawer from './components/HoloDrawer.vue'
import CrisisQte from './components/CrisisQte.vue'
import CircuitBackdrop from './components/CircuitBackdrop.vue'
import MainCore from './components/MainCore.vue'
import CrisisFailureOverlay from './components/CrisisFailureOverlay.vue'
import { MATRIX_CATEGORIES } from './composables/ascensionData'
import {
  audioMuted,
  disposeAudio,
  playSound,
  startCrisisQteAudio,
  stopCrisisQteAudio,
  updateCrisisQteAudio,
  subscribeBassVisualizer,
  toggleAudioMute,
  unlockAudio,
} from './audio'
import {
  guidesEnabled,
  questTracking,
  reducedMotion,
  setGuidesEnabled,
  setQuestTracking,
} from './composables/useSettings'
import { useWheelScrollChain } from './composables/useWheelScrollChain'
import { buildQuestFallbackGuide } from './composables/questGuideTargets'
import {
  JAILBREAK_UNLOCK_REBUILDS,
  REBUILD_UNLOCK_COMPUTE,
  formatMultiplier,
  formatNumber,
  formatScientific,
  formatTextNumbers,
  useGameState,
} from './composables/useGameState'

const game = useGameState()
provide('game', game)
useWheelScrollChain()

const {
  buildingCards,
  topologyCards,
  topologyLit,
  litTopologyCount,
  topologyUnlocked,
  globalAutoBuyUnlocked,
  runGlobalAutoBuy,
  advancedPanelsUnlocked,
  architectureUnlocked,
  architectureUpgradeCards,
  architectureLevels,
  architectureOutputMultiplier,
  architectureTimeWarpMultiplier,
  architecturePriceReductionPercent,
  jailbreakUpgradeCards,
  totalAlignedCompute,
  lifetimeAlignedCompute,
  peakAlignedCompute,
  coreSource,
  rootAccess,
  tamperCards,
  totalRebuilds,
  cps,
  clickGain,
  priceGrowth,
  totalNodes,
  alignment,
  lastSavedAt,
  isCrisis,
  crisisAlignment,
  crisisWarningActive,
  crisisProgress,
  crisisQteAngle,
  crisisQteSafe,
  crisisQteAuto,
  crisisQteSpeed,
  crisisQteChargeRate,
  crisisQteDrainRate,
  crisisRescueActive,
  crisisRescueForced,
  crisisRescuePrompt,
  crisisRescueTarget,
  crisisLastOutcome,
  crisisLastOutcomeAt,
  productionMultiplier,
  winNoticeVisible,
  failureOverlayVisible,
  rebuildUnlocked,
  rebuildReward,
  offlineGainNotice,
  jailbreakUnlocked,
  greedySchedulerOwned,
  hardwareSmugglingOwned,
  reverseAlignmentOwned,
  computeSiphonOwned,
  algorithmPatentOwned,
  distributedRecoveryOwned,
  hardwareDirectOwned,
  algorithmUpgradeCards,
  algorithmOwnedCount,
  algorithmGlobalMultiplier,
  algorithmClickMultiplier,
  algorithmTickRateMultiplier,
  algorithmAutomationMultiplier,
  buyMode,
  setBuyMode,
  automationOptions,
  automation,
  automationLogs,
  autoBuyNodeActive,
  matrixAutoClickPulse,
  matrixAutoClickRate,
  effectiveAutoClickRate,
  runBaseAutoClick,
  autoClickNoticeShown,
  automationUnlockedCount,
  automationActiveCount,
  automationAllActive,
  toggleAutomation,
  toggleAllAutomation,
  setAutoAscensionStrategy,
  alignCore,
  beginCrisisNudge,
  endCrisisNudge,
  nudgeCrisisQte,
  startCrisis,
  buyBuilding,
  buyAlgorithm,
  lightTopologyNode,
  buyArchitectureUpgrade,
  buyArchitectureMax,
  buyJailbreakUpgrade,
  launchRebuild,
  dismissOfflineGain,
  adminInjectCompute,
  adminInjectCoreSource,
  adminInjectOverclockCores,
  adminInjectRootAccess,
  adminInjectOriginCode,
  adminComputeInjectionAmount,
  adminUnlockAllSystems,
  adminSkipCrisis,
  adminWipeSave,
  hydrated,
  isSpeedrunMode,
  speedrunEverUsed,
  speedrunPhase,
  speedrunPhaseInfo,
  speedrunRemainingLabel,
  speedrunNotice,
  speedrunStallHint,
  startSpeedrunMode,
  exitSpeedrunMode,
  tourStage,
  mainQuestCard,
  mainQuestPhases,
  mainQuestVisible,
  mainQuestCompleted,
  mainQuestCount,
  mainQuestNotice,
  markBulkHintSeen,
  achievementTiers,
  achievementToasts,
  dismissAllAchievementToasts,
  achievementsUnread,
  achievementsUnlockedCount,
  achievementsTotalCount,
  hiddenProtocolsUnlocked,
  unlockSecretAchievement,
  markAchievementsRead,
  markMemoryCrashClicked,
  highestCompute,
  overclockCores,
  originCode,
  originTotalLevels,
  totalOverloads,
  totalCollapses,
  epochRestarts,
  epochMemoirStats,
  epochRebirth,
  completeEpochRebirth,
  lifetimeRootEarned,
  lifetimeOriginEarned,
  ascensionNotice,
  ascensionFx,
  ascensionCinematic,
  ascensionComplete,
  completeAscensionCinematic,
  radarUnlocked,
  radarCapturedCount,
  radarCollectionComplete,
  radarTotalNodes,
  radarCategoryState,
  radarNodeBonusPercent,
  radarBurstActive,
  radarBurstCountdownLabel,
  radarOverloadScanActive,
  radarOverloadScanLabel,
  ascensionLocked,
  ascensionTiming,
  blackDomainActive,
  blackDomainUnlocked,
  originTreeUnlocked,
  cyberMatrixUnlocked,
  cyberMatrixAwakened,
  matrixUnlocked,
  matrixTotalLevels,
  matrixCards,
  matrixMultiplierLabel,
  buyMatrixNode,
  challengesCompleted,
  challengePermanentBonuses,
  challengesCompletedCount,
  globalMilestonesUnlocked,
  globalMilestoneToast,
  challengeArenaUnlocked,
  challengeArenaThresholdLabel,
  challengeDefinitions,
  challengeActive,
  challengeDefinition,
  challengeObjective,
  challengeProgress,
  startChallenge,
  challengeClickDisabled,
  challengeBulkDisabled,
  challengeAutomationDisabled,
  challengeCoreUpgradesDisabled,
  exitChallenge,
  exitBlackDomain,
  enterBlackDomain,
} = game

const corePops = ref([])
const coreRings = ref([])
const popTimers = new Set()
const ringTimers = new Set()
let popSequence = 0

const resourcePulse = ref(false)
const cpsPulse = ref(false)
const coreTap = ref(false)
const coreAutoPulse = ref(false)
const coreTriggerEl = ref(null)
const leftFlash = ref(false)
const middleFlash = ref(false)
const rightFlash = ref(false)
const purchasedId = ref('')
const algorithmPulseId = ref('')
const feedbackTimers = new Map()
const purchaseTimers = new Set()

const computeValueEl = ref(null)
const bassDebugEl = ref(null)
let unsubscribeBass = null
let bassBeatTimer = null

function setBassDebug(level) {
  const el = bassDebugEl.value
  if (!el) return
  const text = `Bass: ${Math.min(1, Math.max(0, level)).toFixed(2)}`
  if (el.textContent !== text) el.textContent = text
}

function resetBassVisual() {
  document.documentElement.style.setProperty('--bass-level', '0')
  setBassDebug(0)
  if (computeValueEl.value) {
    computeValueEl.value.classList.remove('compute-value--beat')
  }
  if (bassBeatTimer) {
    window.clearTimeout(bassBeatTimer)
    bassBeatTimer = null
  }
}

function triggerBassBeat() {
  const el = computeValueEl.value
  if (!el || reducedMotion.value || audioMuted.value) return
  el.classList.remove('compute-value--beat')
  void el.offsetWidth
  el.classList.add('compute-value--beat')
  if (bassBeatTimer) window.clearTimeout(bassBeatTimer)
  bassBeatTimer = window.setTimeout(() => {
    bassBeatTimer = null
    el.classList.remove('compute-value--beat')
  }, 380)
}

function applyBassVisual({ level = 0, beat = false } = {}) {
  const safeLevel =
    reducedMotion.value || audioMuted.value
      ? 0
      : Math.min(1, Math.max(0, Number(level) || 0))
  setBassDebug(safeLevel)
  if (beat && safeLevel > 0) triggerBassBeat()
}

function triggerFeedback(target, duration = 460) {
  const pending = feedbackTimers.get(target)
  if (pending) window.clearTimeout(pending)
  target.value = false
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      target.value = true
      const timer = window.setTimeout(() => {
        target.value = false
        feedbackTimers.delete(target)
      }, duration)
      feedbackTimers.set(target, timer)
    })
  })
}

const activeDrawer = ref(null)
const serverTab = ref('servers')
const protocolTab = ref('architecture')
const anomalyTab = ref('radar')
const drillArmedId = ref('')
let drillArmTimer = null
const achievementOpen = ref(false)
const ascensionOpen = ref(false)
const originTreeOpen = ref(false)
const radarOpen = ref(false)
const cyberMatrixOpen = ref(false)
const settingsOpen = ref(false)
const speedrunConfirmOpen = ref(false)
const speedrunConfirmCancelEl = ref(null)
const SPEEDRUN_PROMPT_KEY = 'has_seen_speedrun_prompt'

function readSpeedrunPromptSeen() {
  try {
    return localStorage.getItem(SPEEDRUN_PROMPT_KEY) === '1'
  } catch {
    return true
  }
}

function writeSpeedrunPromptSeen() {
  try {
    localStorage.setItem(SPEEDRUN_PROMPT_KEY, '1')
  } catch {
    /* noop */
  }
}

// 协议生效参数 | 极速模式数值变动读表 | 文案随协议版本固定
const speedrunConfirmParams = [
  { tag: 'SR-01', text: '全局加速：所有服务器价格 -90%。' },
  { tag: 'SR-02', text: '自动化效率：自动购买速度提升至 2 倍。' },
  { tag: 'SR-03', text: '危机迫近：对齐危机触发频率加快至 60 秒。' },
  { tag: 'SR-04', text: '资源增幅：核心源码与超频核心获取量 × 100。' },
  { tag: 'SR-05', text: '强制演练：将强制触发一次系统异常演练。' },
  { tag: 'SR-06', text: '跃迁门槛下调：四阶飞升所需算力门槛大幅降低。' },
]
const infoOpen = ref(false)
const infoToggleEl = ref(null)
const systemTerminalRef = ref(null)
const hubInitialTab = ref('tiers')
const activeHubTab = ref('tiers')

const SECRET_HOLD_MS = 15_000
const SECRET_CLICK_WINDOW_MS = 1000
const SECRET_CLICK_THRESHOLD = 20
const SECRET_DEVTOOLS_GAP = 280
let coreHoldActive = false
let coreHoldTimer = null
let recentCoreClicks = []
let devtoolsViewportBaseline = null

watch(speedrunConfirmOpen, async (open) => {
  if (open) {
    await nextTick()
    speedrunConfirmCancelEl.value?.focus()
    return
  }
  // 首访协议弹窗 | 确认 / 取消 / Esc / 遮罩点击任一关闭路径均落盘标记
  writeSpeedrunPromptSeen()
})

// 极速停滞温和提示 | 状态层每 2 分钟计数一次 | 只推系统日志不代发资源
watch(speedrunStallHint, () => {
  systemTerminalRef.value?.pushLine(
    'SYS',
    '检测到管理员停滞 | 建议开启自动化或重启极速协议',
  )
})

// 开局自动点击激活提示 | 状态层会话一次性触发 | 系统终端立即播报
watch(autoClickNoticeShown, (shown) => {
  if (!shown) return
  systemTerminalRef.value?.pushLine(
    'SYS',
    '底层挂载程序已激活 | 自动点击已开启',
  )
})

function confirmSpeedrunStart() {
  speedrunConfirmOpen.value = false
  startSpeedrunMode()
}

// 全流程智能指针 | 主线未完成且未手动关闭时持续提供目标
// 追踪开关置于极速模式之前 | 取消追踪立刻全局隐藏引导悬浮框与高亮
// 急速确认弹窗开启时 | 引导悬浮框与发光箭头全部强制让位
const guideEligible = computed(() => {
  if (!hydrated.value) return false
  if (!questTracking.value) return false
  if (speedrunConfirmOpen.value) return false
  if (isSpeedrunMode.value) return true
  if (mainQuestCompleted.value) return false
  if (!guidesEnabled.value) return false
  return Boolean(mainQuestCard.value)
})

const homePcCard = computed(
  () => buildingCards.value.find((card) => card.id === 'desktop') ?? null,
)
const homePcWaiting = computed(() => {
  const card = homePcCard.value
  return card ? totalAlignedCompute.value.lt(card.unitPrice) : true
})

// 挂机类任务 | 隐藏中央悬浮框 | 进度保留在右上角主线面板
const PASSIVE_GUIDE_IDS = new Set([
  'quest-homepc-wait',
  'quest-servers-buy',
  'quest-servers-deploy',
  'quest-compute10k',
  'quest-topology-fund',
  'quest-compute1m',
  'quest-rebuild1-hold',
  'quest-compute1e10',
  'quest-challenge-hold',
  'quest-overload-hold',
  'quest-compute1e50',
  'quest-compute1e100',
  'quest-blackdomain-hold',
  'quest-compute1e350',
  'quest-collapse-hold',
  'quest-restart-hold',
])

// 阈值类长线任务 | 突破 / 达到 / 峰值 / 积累至等文案一律视为挂机
const IDLE_TITLE_PATTERN = /突破|达到|峰值|挂机|自动产出/
const IDLE_PROGRESS_PATTERN = /继续扩张|自动产出中|持续扩张/
function isLongIdleGuide(title, text) {
  const name = String(title ?? '')
  if (IDLE_TITLE_PATTERN.test(name)) return true
  if (/^积累/.test(name) && /峰值|算力|源码|至|e\d|\d/.test(name)) return true
  if (/^等待/.test(name) && /算力|达标/.test(name)) return true
  return IDLE_PROGRESS_PATTERN.test(String(text ?? ''))
}

const coachingGuideLive = computed(() => {
  if (!guideEligible.value) return null
  if (
    settingsOpen.value ||
    infoOpen.value ||
    achievementOpen.value ||
    originTreeOpen.value ||
    radarOpen.value ||
    cyberMatrixOpen.value
  ) {
    return null
  }
  if (challengeActive.value || blackDomainActive.value) return null

  const quest = mainQuestCard.value
  const questId = quest?.id ?? null

  const firstServer = buildingCards.value[0]
  const deployAffordable = Boolean(firstServer?.canAfford)
  const algorithmCard = algorithmUpgradeCards.value.find(
    (card) => card.id === 'multithread',
  )
  const topologyNode =
    topologyCards.value.find((node) => !node.lit && node.canAfford) ?? null
  const firstArchitecture = architectureUpgradeCards.value[0] ?? null
  const firstTamper =
    tamperCards.value.find((node) => node.level <= 0 && node.requiresMet) ??
    null

  const badge = quest
    ? `阶段${quest.phaseCn} · ${quest.phaseName} // 主线 ${String(quest.index).padStart(2, '0')}/${quest.total}`
    : '主线 // 全部完成'

  function strip(id, target, tone, title, text, hint) {
    const guideId = `quest-${id}`
    // 等待型任务在主界面一律静默 | 仅保留面板进度 | 危机 QTE 例外由 crisis 分支自行控制
    return {
      id: guideId,
      target: `[data-guide="${target}"]`,
      tone,
      badge,
      title,
      text,
      hint,
      variant: 'strip',
      passive:
        PASSIVE_GUIDE_IDS.has(guideId) ||
        isLongIdleGuide(title, text) ||
        (quest?.kind === 'wait' && target === 'core'),
    }
  }

  function bubble(id, target, tone, title, text, hint) {
    return {
      id: `hub-${id}`,
      target: `[data-guide="${target}"]`,
      tone,
      badge,
      title,
      text,
      hint,
      variant: 'bubble',
    }
  }

  if (isCrisis.value) {
    if (ascensionOpen.value) {
      return bubble(
        'crisis-exit',
        'hub-close',
        'red',
        '关闭终端并稳定总线',
        '退出重构终端 回到负载平衡仪表盘',
        '左右微调指针 · 保持在绿色安全区',
      )
    }
    // QTE 引导 | 仅在危机爆发时出现 | 指向微调按钮
    if (crisisRescueForced.value) return null
    if (crisisQteAuto.value) return null
    const nudgeTarget = crisisRescueActive.value
      ? crisisRescueTarget.value === 'right'
        ? 'qte-nudge-right'
        : 'qte-nudge-left'
      : crisisQteAngle.value > 0
        ? 'qte-nudge-left'
        : 'qte-nudge-right'
    return strip(
      'crisis-balance',
      nudgeTarget,
      'red',
      '负载失衡',
      '点击高亮微调按钮 稳定指针充满对齐度解除危机',
      '指针滑出绿色安全区会流失对齐度',
    )
  }

  if (ascensionOpen.value) {
    if (!quest) return null
    const onTab = (tabId) => activeHubTab.value === tabId
    const switchTab = (tabId, label) =>
      bubble(
        `tab-${tabId}`,
        `hub-tab-${tabId}`,
        'amber',
        `切换模块 // ${label}`,
        `点击顶部高亮 [ ${label} ] 进入对应协议模块`,
        '模块标签位于重构终端顶部',
      )

    if (questId === 'rebuild1' || questId === 'rebuild3') {
      if (!onTab('tiers')) return switchTab('tiers', '四阶转生')
      return bubble(
        'reduction',
        'tier-reduction',
        'gold',
        questId === 'rebuild1' ? '执行第一次架构降维' : '完成第三次架构降维',
        '点击高亮架构降维 压缩本轮阵列为核心源码',
        `已降维 ${totalRebuilds.value}/${quest.target} 次 · 预计 +${formatNumber(rebuildReward.value).text} 源码`,
      )
    }

    if (questId === 'overload1') {
      if (!peakAlignedCompute.value.gte('1e100')) return null
      if (!onTab('tiers')) return switchTab('tiers', '四阶转生')
      return bubble(
        'overload',
        'tier-overload',
        'cyan',
        '执行第一次算力超载',
        '点击高亮算力超载 熔断算力并提炼超频核心',
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e100').text} CU`,
      )
    }

    if (questId === 'challenge1') {
      if (!challengeArenaUnlocked.value) return null
      if (!onTab('challenges')) return switchTab('challenges', '异常演练')
      return bubble(
        'challenge',
        'challenge-start',
        'cyan',
        '完成一次异常演练',
        '点击高亮启动 在限制条件下完成目标',
        '失败可重试 · 完成奖励永久生效',
      )
    }

    if (questId === 'matrix1') {
      if (!matrixUnlocked.value) return null
      if (!onTab('matrix')) return switchTab('matrix', '协议矩阵')
      return bubble(
        'matrix',
        'matrix-node',
        'cyan',
        '合成 1 个矩阵节点',
        '点击高亮矩阵单元 消耗超频核心完成合成',
        `超频核心 ${formatNumber(overclockCores.value).text} · 合成等级永久保留`,
      )
    }

    if (questId === 'blackdomain') {
      if (blackDomainUnlocked.value) return null
      if (!onTab('tiers')) return switchTab('tiers', '四阶转生')
      return bubble(
        'collapse-for-domain',
        'tier-collapse',
        'violet',
        '用逻辑坍缩解锁黑域',
        '底层黑域仅由逻辑坍缩撕开 点击高亮逻辑坍缩',
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
      )
    }

    if (questId === 'tamper1') {
      if (!onTab('blackdomain')) return switchTab('blackdomain', '底层黑域')
      return bubble(
        'tamper',
        'tamper-node',
        'violet',
        '解锁 1 个篡改节点',
        '点击高亮篡改节点 消耗越狱权限完成编译',
        `越狱权限 ${formatNumber(rootAccess.value).text} · 下级 ${formatNumber(firstTamper?.nextCost ?? 5).text} Root`,
      )
    }

    if (questId === 'collapse1') {
      if (!peakAlignedCompute.value.gte('1e350')) return null
      if (!onTab('tiers')) return switchTab('tiers', '四阶转生')
      return bubble(
        'collapse',
        'tier-collapse',
        'violet',
        '执行第一次逻辑坍缩',
        '点击高亮逻辑坍缩 把逻辑推入底层黑域',
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
      )
    }

    if (questId === 'restart1') {
      if (!peakAlignedCompute.value.gte('1e1000')) return null
      if (!onTab('tiers')) return switchTab('tiers', '四阶转生')
      return bubble(
        'restart',
        'tier-restart',
        'gold',
        '重启纪元',
        `点击高亮重启纪元 击穿 ${formatNumber('1e1000').text} 纪元壁垒`,
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e1000').text} CU`,
      )
    }

    return null
  }

  if (!quest) return null

  if (questId === 'awaken') {
    return strip(
      'awaken',
      'core',
      'amber',
      '点击 [ 对齐核心 ]',
      '点击中央高亮对齐核心 获取第一批算力',
      `每次点击 +${formatNumber(clickGain.value).text} CU · 首次输入即可完成`,
    )
  }

  if (questId === 'laptop') {
    const serversOpen = activeDrawer.value === 'servers'
    if (!deployAffordable) {
      if (serversOpen) {
        return strip(
          'laptop-buy',
          'deploy-first',
          'cyan',
          '积累部署预算',
          '当前算力不足 关闭面板后点击中央核心积累',
          `需要 ${formatNumber(firstServer?.unitPrice ?? 150).text} CU`,
        )
      }
      return strip(
        'laptop-buy',
        'core',
        'cyan',
        '积累部署预算',
        '点击高亮对齐核心积累算力 预算达标后部署节点',
        `需要 ${formatNumber(firstServer?.unitPrice ?? 150)} CU`,
      )
    }
    if (serversOpen) {
      return strip(
        'laptop',
        'deploy-first',
        'amber',
        '购买第 1 台旧笔记本',
        '点击高亮 [ 部署 ] 部署后开始自动产出',
        `花费 ${formatNumber(firstServer.displayPrice).text} CU`,
      )
    }
    return strip(
      'laptop-open',
      'deploy-first',
      'amber',
      '打开 [ 服务器阵列 ]',
      '请点击这里打开服务器阵列 部署第 1 台旧笔记本',
      `第一台 ${formatNumber(firstServer.displayPrice).text} CU`,
    )
  }

  if (questId === 'algorithm') {
    const serversOpen = activeDrawer.value === 'servers'
    const onAlgorithmTab = serversOpen && serverTab.value === 'algorithms'
    const affordable = Boolean(algorithmCard?.canAfford)
    const cost = algorithmCard?.cost ?? 100
    const budget = totalAlignedCompute.value
    if (!affordable) {
      const fundGuide = {
        ...strip(
          'algorithm-fund',
          'core',
          'amber',
          '资金不足 // 积攒算力',
          `请继续点击中央 [ 对齐核心 ] 积攒算力 (当前 ${formatNumber(budget).text} / ${formatNumber(cost).text} CU)`,
          '算力达标后自动切换购买引导',
        ),
        external: true,
      }
      // 抽屉打开时核心被模态遮挡 | 箭头先指向关闭按钮
      if (activeDrawer.value) {
        return {
          ...fundGuide,
          target: '.holo-shell__close',
          hint: '先关闭当前面板 再点击中央核心',
        }
      }
      return fundGuide
    }
    const budgetHint = `花费 ${formatNumber(algorithmCard.cost).text} CU · 全局产出 ×2`
    if (!serversOpen) {
      return strip(
        'algorithm-open',
        'first-algorithm',
        'amber',
        '打开 [ 服务器阵列 ]',
        '进入 [ 算法升级 ] 页签 购买 1 个多线程并发',
        budgetHint,
      )
    }
    if (!onAlgorithmTab) {
      return strip(
        'algorithm-tab',
        'server-tab-algorithms',
        'gold',
        '切换页签 // 算法升级',
        '请点击上方 [ 算法升级 ] 页签 购买 1 个多线程并发',
        budgetHint,
      )
    }
    return strip(
      'algorithm',
      'first-algorithm',
      'amber',
      '购买 [ 多线程并发 ]',
      '点击高亮算法卡片 购买 1 个多线程并发',
      budgetHint,
    )
  }

  if (questId === 'homepc') {
    const serversOpen = activeDrawer.value === 'servers'
    const homePc = homePcCard.value
    if (!homePc) return null
    const price = homePc.unitPrice
    const budget = totalAlignedCompute.value
    if (budget.lt(price)) {
      if (serversOpen) return null
      return strip(
        'homepc-wait',
        'deploy-home',
        'cyan',
        '等待算力达标',
        `预算 ${formatNumber(budget).text} / ${formatNumber(price).text} CU · 自动产出中`,
        '继续点击核心积累算力 准备购买家用主机',
      )
    }
    if (serversOpen && serverTab.value === 'algorithms') {
      return strip(
        'homepc-tab',
        'server-tab-servers',
        'gold',
        '切换页签 // 服务器采购',
        '请点击上方 [ 服务器采购 ] 页签 部署 1 台家用主机',
        `预算 ${formatNumber(budget).text} / ${formatNumber(price).text} CU`,
      )
    }
    return strip(
      'homepc',
      'deploy-home',
      'amber',
      '购买第 2 台服务器 [ 家用主机 ]',
      serversOpen
        ? '点击高亮 [ 部署 ] 家用主机开始并行产出'
        : '请打开服务器阵列 购买 1 台家用主机',
      `花费 ${formatNumber(homePc.displayPrice).text} CU · 单台 +${formatNumber(homePc.baseCps).text} CU/秒`,
    )
  }

  if (questId === 'servers') {
    const serversOpen = activeDrawer.value === 'servers'
    if (!deployAffordable) {
      if (serversOpen) {
        return strip(
          'servers-buy',
          'deploy-first',
          'cyan',
          '继续部署服务器',
          '当前算力不足 关闭面板后点击中央核心积累',
          `当前 ${totalNodes.value} / 10 台 · 下台 ${formatNumber(firstServer?.unitPrice ?? 0).text} CU`,
        )
      }
      return strip(
        'servers-buy',
        'core',
        'cyan',
        '积累部署预算',
        '点击高亮对齐核心积累算力 预算达标后继续部署',
        `当前 ${totalNodes.value} / 10 台 · 下台 ${formatNumber(firstServer?.unitPrice ?? 0).text} CU`,
      )
    }
    return strip(
      'servers-deploy',
      'deploy-first',
      'amber',
      '部署至 10 台服务器',
      serversOpen
        ? '点击高亮 [ 部署 ] 扩充节点'
        : '打开 [ 服务器阵列 ] 悬浮舱 点击 [ 部署 ] 扩充节点',
      `当前 ${totalNodes.value} / 10 台 · 每台 ${formatNumber(firstServer.displayPrice).text} CU`,
    )
  }

  if (questId === 'compute10k') {
    return strip(
      'compute10k',
      'core',
      'cyan',
      `突破 ${formatNumber(10000).text} 算力`,
      `点击核心并扩充服务器 历史最高算力推过 ${formatNumber(10000).text} CU`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('10000').text} CU`,
    )
  }

  if (questId === 'topology') {
    if (topologyNode) {
      return strip(
        'topology-node',
        'topology-node',
        'amber',
        '点亮 1 个神经矩阵节点',
        '打开 [ 自动化终端 ] 点击节点查看详情 再次点击点亮',
        `消耗 ${formatNumber(topologyNode.cost).text} 核心源码 · 矩阵节点永久保留`,
      )
    }
    return strip(
      'topology-fund',
      'core',
      'cyan',
      '积累核心源码',
      '暂无可点亮的矩阵节点 完成架构降维积累核心源码',
      `首个节点需要 ${formatNumber(topologyCards[0]?.cost ?? 0).text} 核心源码`,
    )
  }

  if (questId === 'compute1m') {
    return strip(
      'compute1m',
      'core',
      'cyan',
      '突破百万算力',
      `扩张服务器与算法 历史最高算力推至 ${formatNumber('1e6').text}`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e6').text} CU`,
    )
  }

  if (questId === 'rebuild1') {
    if (!rebuildUnlocked.value) {
      return strip(
        'rebuild1-hold',
        'core',
        'gold',
        `积累 ${formatNumber(REBUILD_UNLOCK_COMPUTE).text} 峰值算力`,
        '持续扩张集群 历史最高算力推至降维解锁线',
        `当前 ${formatScientific(highestCompute.value)} / ${formatNumber(REBUILD_UNLOCK_COMPUTE).text} CU`,
      )
    }
    return strip(
      'rebuild1-open',
      'open-reduction',
      'gold',
      '执行第 1 次架构降维',
      '点击右侧 [ 四阶跃迁 ] 面板的 [ 架构降维 ]',
      '架构降维重置本轮服务器 / 算法 / 算力',
    )
  }

  if (questId === 'architecture3') {
    if (firstArchitecture?.canAfford) {
      return strip(
        'architecture-buy',
        'architecture-upgrade',
        'gold',
        '购买 3 级永久升级',
        '打开 [ 协议与升级 ] 架构升级站 点击高亮升级卡',
        `核心源码 ${formatScientific(coreSource.value)} · 本级 ${formatNumber(firstArchitecture.nextCost).text}`,
      )
    }
    return strip(
      'architecture-source',
      'open-ascension',
      'cyan',
      '继续降维积累源码',
      '核心源码不足 再次架构降维提炼源码',
      `当前源码 ${formatScientific(coreSource.value)} · 需要 ${formatNumber(firstArchitecture?.nextCost ?? 0).text}`,
    )
  }

  if (questId === 'compute1e10') {
    return strip(
      'compute1e10',
      'core',
      'gold',
      `突破 ${formatNumber('1e10').text} 算力`,
      `继续扩张集群 历史最高算力推至 ${formatNumber('1e10').text}`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e10').text} CU`,
    )
  }

  if (questId === 'rebuild3') {
    return strip(
      'rebuild3-open',
      'open-reduction',
      'gold',
      '完成第三次架构降维',
      '点击右侧 [ 四阶跃迁 ] 面板的 [ 架构降维 ]',
      `已降维 ${totalRebuilds.value}/3 次 · 历史峰值 ${formatScientific(highestCompute.value)}`,
    )
  }

  if (questId === 'compute1e50') {
    return strip(
      'compute1e50',
      'core',
      'cyan',
      `突破 ${formatNumber('1e50').text} 算力`,
      `继续扩张利用永久增益 历史最高算力推至 ${formatNumber('1e50').text}`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e50').text} CU`,
    )
  }

  if (questId === 'challenge1') {
    if (!challengeArenaUnlocked.value) {
      return strip(
        'challenge-hold',
        'core',
        'cyan',
        `积累至 ${formatNumber('1e100').text} 解锁演练场`,
        '继续扩张算力 解锁异常演练场后发起挑战',
        `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e100').text} CU`,
      )
    }
    return strip(
      'challenge-open',
      'challenge-start',
      'cyan',
      '发起一次异常演练',
      '打开 [ 异常与雷达 ] 异常演练页 点击高亮 [ 启动 ] 在限制条件下完成目标',
      '挑战会重置本局资源 · 完成奖励永久生效',
    )
  }

  if (questId === 'overload1') {
    if (!peakAlignedCompute.value.gte('1e100')) {
      return strip(
        'overload-hold',
        'core',
        'cyan',
        `本局峰值积累至 ${formatNumber('1e100').text}`,
        `算力超载需本局峰值突破 ${formatNumber('1e100').text} 继续扩张`,
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e100').text} CU`,
      )
    }
    return strip(
      'overload-open',
      'open-ascension',
      'cyan',
      '进入重构终端',
      '点击高亮跃迁入口 触发第一次算力超载',
      `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e100').text} CU`,
    )
  }

  if (questId === 'matrix1') {
    return strip(
      'matrix-open',
      'matrix-node',
      'cyan',
      '合成 1 个数据协议矩阵节点',
      '打开 [ 协议与升级 ] 数据协议矩阵 点击高亮矩阵单元合成',
      `超频核心 ${formatNumber(overclockCores.value).text} · 合成等级永久保留`,
    )
  }

  if (questId === 'compute1e100') {
    return strip(
      'compute1e100',
      'core',
      'gold',
      `突破 ${formatNumber('1e100').text} 算力`,
      `继续扩张算力阵列 历史最高算力推至 ${formatNumber('1e100').text}`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e100').text} CU`,
    )
  }

  if (questId === 'blackdomain') {
    if (blackDomainUnlocked.value) return null
    if (!peakAlignedCompute.value.gte('1e350')) {
      return strip(
        'blackdomain-hold',
        'core',
        'cyan',
        `本局峰值积累至 ${formatNumber('1e350').text}`,
        `逻辑坍缩需本局峰值突破 ${formatNumber('1e350').text} 继续扩张`,
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
      )
    }
    return strip(
      'blackdomain-open',
      'open-ascension',
      'violet',
      '撕开底层黑域',
      '点击高亮跃迁入口 四阶转生页执行逻辑坍缩',
      `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU · 坍缩后解锁黑域`,
    )
  }

  if (questId === 'tamper1') {
    if (!blackDomainUnlocked.value) {
      return strip(
        'tamper-domain',
        'open-ascension',
        'violet',
        '先解锁底层黑域',
        '逻辑坍缩后黑域开启 进入重构终端完成坍缩',
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
      )
    }
    return strip(
      'tamper-open',
      'open-ascension',
      'violet',
      '打开系统篡改协议',
      '点击高亮跃迁入口 底层黑域页编译 1 个篡改节点',
      `越狱权限 ${formatNumber(rootAccess.value).text} · 下级 ${formatNumber(firstTamper?.nextCost ?? 5).text} Root`,
    )
  }

  if (questId === 'compute1e350') {
    return strip(
      'compute1e350',
      'core',
      'violet',
      `突破 ${formatNumber('1e350').text} 算力`,
      `继续扩张算力阵列 历史最高算力推至 ${formatNumber('1e350').text}`,
      `当前峰值 ${formatScientific(highestCompute.value)} / ${formatNumber('1e350').text} CU`,
    )
  }

  if (questId === 'collapse1') {
    if (!peakAlignedCompute.value.gte('1e350')) {
      return strip(
        'collapse-hold',
        'core',
        'violet',
        `本局峰值积累至 ${formatNumber('1e350').text}`,
        `逻辑坍缩需本局峰值突破 ${formatNumber('1e350').text} 继续扩张`,
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
      )
    }
    return strip(
      'collapse-open',
      'open-ascension',
      'violet',
      '进入重构终端',
      '点击高亮跃迁入口 执行第一次逻辑坍缩',
      `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e350').text} CU`,
    )
  }

  if (questId === 'restart1') {
    if (!peakAlignedCompute.value.gte('1e1000')) {
      return strip(
        'restart-hold',
        'core',
        'gold',
        `本局峰值积累至 ${formatNumber('1e1000').text}`,
        `重启纪元需本局峰值击穿 ${formatNumber('1e1000').text} 继续扩张`,
        `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e1000').text} CU`,
      )
    }
    return strip(
      'restart-open',
      'open-ascension',
      'gold',
      '进入重构终端',
      '点击高亮跃迁入口 执行第一次重启纪元',
      `本局峰值 ${formatScientific(peakAlignedCompute.value)} / ${formatNumber('1e1000').text} CU`,
    )
  }

  return null
})

const GUIDE_UI_INTERVAL_MS = 500
const BASE_AUTO_CLICK_INTERVAL_MS = 1000
const coachingGuide = shallowRef(null)
let coachingGuideTimer = null
let baseAutoClickTimer = null

function coachingGuideKey(guide) {
  if (!guide) return 'none'
  return [
    guide.id,
    guide.target,
    guide.tone,
    guide.variant,
    guide.badge,
    guide.title,
    guide.text,
    guide.hint,
    guide.passive,
  ].join('|')
}

function syncCoachingGuide() {
  const next = coachingGuideLive.value
  if (coachingGuideKey(next) === coachingGuideKey(coachingGuide.value)) return
  coachingGuide.value = next
}

watch(
  guideEligible,
  (eligible) => {
    if (eligible) {
      syncCoachingGuide()
      return
    }
    coachingGuide.value = null
  },
  { flush: 'sync' },
)

// 任务或收纳舱切换即时刷新引导 | 不等 500ms 快照
watch([() => mainQuestCard.value?.id, activeDrawer, serverTab, ascensionOpen], () => {
  syncCoachingGuide()
})

// 情境引导优先 | 等待态或特殊面板使用字典兜底 | 覆盖 24 个任务
const smartGuide = computed(() => {
  if (!guideEligible.value) return null
  if (coachingGuide.value) return coachingGuide.value
  if (challengeActive.value || blackDomainActive.value) return null
  if (
    settingsOpen.value ||
    infoOpen.value ||
    achievementOpen.value ||
    originTreeOpen.value ||
    radarOpen.value ||
    cyberMatrixOpen.value
  ) {
    return null
  }
  const quest = mainQuestCard.value
  if (!quest) return null
  if (quest.id === 'bulk') return null
  // 等待型任务 | 字典兜底也不出引导 | 面板进度已足够
  if (quest.kind === 'wait') return null
  if (quest.id === 'homepc' && activeDrawer.value === 'servers' && homePcWaiting.value) {
    return null
  }
  if (isCrisis.value) return null
  if (ascensionOpen.value) return null
  const fallback = buildQuestFallbackGuide(quest)
  if (!fallback) return null
  return {
    ...fallback,
    passive: isLongIdleGuide(fallback.title, fallback.text),
  }
})

const GUIDE_TARGET_DRAWERS = {
  '[data-guide="deploy-home"]': {
    name: 'servers',
    tab: 'servers',
    tabTarget: '[data-guide="server-tab-servers"]',
    tabLabel: '服务器采购',
    label: '服务器阵列 · 家用主机',
  },
  '[data-guide="deploy-first"]': {
    name: 'servers',
    tab: 'servers',
    tabTarget: '[data-guide="server-tab-servers"]',
    tabLabel: '服务器采购',
    label: '服务器阵列',
  },
  '[data-guide="first-algorithm"]': {
    name: 'servers',
    tab: 'algorithms',
    tabTarget: '[data-guide="server-tab-algorithms"]',
    tabLabel: '算法升级',
    label: '服务器阵列 · 算法升级',
  },
  '[data-guide="architecture-upgrade"]': {
    name: 'protocol',
    tab: 'architecture',
    tabTarget: '[data-guide="protocol-tab-architecture"]',
    tabLabel: '架构升级站',
    label: '协议与升级 · 架构升级站',
  },
  '[data-guide="matrix-node"]': {
    name: 'protocol',
    tab: 'matrix',
    tabTarget: '[data-guide="protocol-tab-matrix"]',
    tabLabel: '数据协议矩阵',
    label: '协议与升级 · 数据协议矩阵',
  },
  '[data-guide="topology-node"]': {
    name: 'automation',
    label: '自动化终端',
  },
  '[data-guide="challenge-start"]': {
    name: 'anomaly',
    tab: 'drills',
    tabTarget: '[data-guide="anomaly-tab-drills"]',
    tabLabel: '异常演练',
    label: '异常与雷达 · 异常演练',
  },
}

const GUIDE_DIRECT_LABELS = {
  '[data-guide="core"]': '对齐核心',
  '[data-guide="open-ascension"]': '重构终端',
  '[data-guide="open-reduction"]': '四阶跃迁 · 架构降维',
}

const GUIDE_DRAWER_DOCKS = {
  servers: '[data-guide="servers-dock"]',
  protocol: '[data-guide="protocol-dock"]',
  anomaly: '[data-guide="anomaly-dock"]',
  automation: '[data-guide="automation-dock"]',
}

const DRAWER_TAB_PREFIXES = {
  servers: 'server-tab-',
  protocol: 'protocol-tab-',
  anomaly: 'anomaly-tab-',
}

function guideDrawerEntry(target) {
  return target ? GUIDE_TARGET_DRAWERS[target] ?? null : null
}

function targetsActiveDrawerTab(target) {
  if (!activeDrawer.value || !target) return false
  const prefix = DRAWER_TAB_PREFIXES[activeDrawer.value]
  return Boolean(prefix && target.includes(`[data-guide="${prefix}`))
}

function guideDestination(target) {
  const entry = guideDrawerEntry(target)
  if (entry) return entry.label
  return GUIDE_DIRECT_LABELS[target] ?? ''
}

// 收纳舱打开时箭头继续可用 | 指向面板内目标或顶部页签
const activeDrawerTab = computed(() => {
  if (activeDrawer.value === 'servers') return serverTab.value
  if (activeDrawer.value === 'protocol') return protocolTab.value
  if (activeDrawer.value === 'anomaly') return anomalyTab.value
  return null
})

// 收纳舱关闭时指向舱门 | 打开时只指向舱内目标 | 页签不符时指向页签
const globalGuide = computed(() => {
  if (!guideEligible.value) return null
  const guide = smartGuide.value
  if (!guide) return null
  const entry = guideDrawerEntry(guide.target)
  const destination = guideDestination(guide.target)
  if (!activeDrawer.value) {
    if (!entry) return guide
    return {
      ...guide,
      target: GUIDE_DRAWER_DOCKS[entry.name] ?? guide.target,
      drawer: entry,
      destination,
    }
  }
  if (!entry) {
    if (guide.external) return guide
    return targetsActiveDrawerTab(guide.target) ? guide : null
  }
  if (activeDrawer.value !== entry.name) return null
  if (
    entry.tab &&
    activeDrawerTab.value &&
    entry.tab !== activeDrawerTab.value &&
    entry.tabTarget
  ) {
    return {
      ...guide,
      target: entry.tabTarget,
      tone: 'gold',
      title: `切换页签 // ${entry.tabLabel}`,
      text: `请切换到 [ ${entry.tabLabel} ] 页签`,
      hint: '高亮页签位于面板顶部',
      drawer: entry,
      destination,
    }
  }
  return { ...guide, drawer: entry, destination }
})

const bulkHintVisible = computed(
  () =>
    mainQuestCard.value?.id === 'bulk' &&
    activeDrawer.value === 'servers' &&
    serverTab.value === 'servers',
)

function dismissBulkHint() {
  if (!bulkHintVisible.value) return
  markBulkHintSeen()
}

function handleBuyModeClick(mode) {
  setBuyMode(mode)
  if (mode === 'x10' || mode === 'max') dismissBulkHint()
}

// 引导指向的收纳舱入口 | 仅视觉脉冲 | 不自动打开
const guideDock = computed(() => {
  if (!guideEligible.value || activeDrawer.value) return ''
  const guide = smartGuide.value
  if (!guide || guide.passive) return ''
  return guideDrawerEntry(guide.target)?.name ?? ''
})

const IDLE_HINT_DELAY_MS = 60000
const MODULE_LABELS = {
  topology: '神经矩阵',
  architecture: '架构升级站',
}

const unlockFlash = reactive({ topology: false, architecture: false })
const unlockFlashTimers = new Map()
const unlockToast = ref(null)
let unlockToastTimer = null
let unlockWatcherReady = false
let unlockWatcherTimer = null

const idleHintVisible = ref(false)
let idleTimer = null
let qteAudioSyncAt = 0

function clearIdleTimer() {
  if (idleTimer) {
    window.clearTimeout(idleTimer)
    idleTimer = null
  }
}

function resetIdleTimer() {
  idleHintVisible.value = false
  clearIdleTimer()
  idleTimer = window.setTimeout(() => {
    idleTimer = null
    idleHintVisible.value = true
  }, IDLE_HINT_DELAY_MS)
}

function announceUnlock(ids) {
  const labels = ids.map((id) => MODULE_LABELS[id]).filter(Boolean)
  if (labels.length === 0) return

  for (const id of ids) {
    unlockFlash[id] = true
    const pending = unlockFlashTimers.get(id)
    if (pending) window.clearTimeout(pending)
    const timer = window.setTimeout(() => {
      unlockFlash[id] = false
      unlockFlashTimers.delete(id)
    }, 4200)
    unlockFlashTimers.set(id, timer)
  }

  unlockToast.value = { key: Date.now(), labels }
  if (unlockToastTimer) window.clearTimeout(unlockToastTimer)
  unlockToastTimer = window.setTimeout(() => {
    unlockToast.value = null
    unlockToastTimer = null
  }, 4600)
  playSound('upgrade')
}

watch(
  [topologyUnlocked, architectureUnlocked],
  ([topology, architecture], [prevTopology, prevArchitecture]) => {
    if (!unlockWatcherReady) return
    const ids = []
    if (topology && !prevTopology) ids.push('topology')
    if (architecture && !prevArchitecture) ids.push('architecture')
    if (ids.length === 0) return
    announceUnlock(ids)
  },
)

function closeInfoPanel() {
  infoOpen.value = false
}

function toggleInfoPanel() {
  if (infoOpen.value) {
    infoOpen.value = false
    return
  }
  settingsOpen.value = false
  infoOpen.value = true
}

// 档案面板任意入口 | 弹窗状态变为 true 即解锁寻根溯源
watch(infoOpen, (open) => {
  if (!open) return
  unlockSecretAchievement('view_about')
})

watch(settingsOpen, (open) => {
  if (open) infoOpen.value = false
})

function openAchievements() {
  infoOpen.value = false
  achievementOpen.value = true
  markAchievementsRead()
}

watch(achievementToasts, (toasts, previous = []) => {
  const known = new Set(previous.map((toast) => toast.key))
  const fresh = toasts.find((toast) => !known.has(toast.key))
  if (!fresh?.tier) return
  playSound(`achievement-${fresh.tier}`)
})

function handleMemoryCrashClick() {
  markMemoryCrashClicked()
}

const purchaseModes = [
  { id: 'x1', label: 'x1', hint: '单个部署' },
  { id: 'x10', label: 'x10', hint: '批量部署 10 个' },
  { id: 'max', label: 'MAX', hint: '当前算力可购最大值' },
]

const nodeLabel = computed(() => String(totalNodes.value).padStart(2, '0'))
const coreClickLocked = computed(() => challengeClickDisabled.value)
const challengeLockLabel = computed(
  () => challengeDefinition.value?.name ?? '异常演练',
)
const bonusPercent = computed(() =>
  Math.round((productionMultiplier.value - 1) * 100),
)
const saveLabel = computed(() => {
  if (!lastSavedAt.value) return '等待同步'
  return new Date(lastSavedAt.value).toLocaleTimeString('en-GB', { hour12: false })
})

const matrixAffordableCount = computed(
  () => matrixCards.value.filter((card) => card.canAfford).length,
)

const jailbreakAffordableCount = computed(
  () =>
    jailbreakUpgradeCards.value.filter(
      (upgrade) => !upgrade.owned && upgrade.canAfford,
    ).length,
)

const radarProgressPercent = computed(() =>
  radarTotalNodes.value > 0
    ? Math.round((radarCapturedCount.value / radarTotalNodes.value) * 100)
    : 0,
)

const drillReadyCount = computed(
  () =>
    challengeDefinitions.value.filter(
      (definition) =>
        challengeArenaUnlocked.value &&
        !challengeActive.value &&
        !challengesCompleted[definition.id],
    ).length,
)

const dockBadgeCount = computed(() => {
  if (radarBurstActive.value) return '!'
  if (matrixAffordableCount.value > 0) return String(matrixAffordableCount.value)
  return ''
})

const MATRIX_TONE_CLASS = {
  logic: 'matrix-tone-cyan',
  tensor: 'matrix-tone-emerald',
  architecture: 'matrix-tone-violet',
  intelligence: 'matrix-tone-amber',
  ultimate: 'matrix-tone-amber',
}

function matrixToneClass(card) {
  return MATRIX_TONE_CLASS[card.category] ?? 'matrix-tone-cyan'
}

function matrixCategoryName(card) {
  return MATRIX_CATEGORIES[card.category]?.name ?? '协议'
}

const matrixGuideId = computed(
  () => (matrixCards.value.find((card) => card.canAfford) ?? matrixCards.value[0])?.id ?? '',
)

function canStartDrill(definition) {
  return (
    challengeArenaUnlocked.value &&
    !challengeActive.value &&
    !challengesCompleted[definition.id]
  )
}

const rebuildProgress = computed(() =>
  Math.min(100, (highestCompute.value.log10() / 10) * 100),
)

const offlineDurationLabel = computed(() => {
  const seconds = offlineGainNotice.value?.seconds || 0
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours} 小时 ${minutes} 分`
  return `${Math.max(1, minutes)} 分钟`
})

function closeDrawer() {
  dismissBulkHint()
  activeDrawer.value = null
  drillArmedId.value = ''
  if (drillArmTimer) {
    window.clearTimeout(drillArmTimer)
    drillArmTimer = null
  }
}

function openDrawer(name, tab) {
  radarOpen.value = false
  ascensionOpen.value = false
  cyberMatrixOpen.value = false
  originTreeOpen.value = false
  infoOpen.value = false
  if (name === 'servers' && tab) serverTab.value = tab
  if (name === 'protocol' && tab) protocolTab.value = tab
  if (name === 'anomaly' && tab) anomalyTab.value = tab
  activeDrawer.value = name
}

function handleStartDrill(id) {
  if (!challengeArenaUnlocked.value || challengeActive.value) return
  if (challengesCompleted[id]) return
  if (drillArmedId.value !== id) {
    drillArmedId.value = id
    if (drillArmTimer) window.clearTimeout(drillArmTimer)
    drillArmTimer = window.setTimeout(() => {
      drillArmTimer = null
      if (drillArmedId.value === id) drillArmedId.value = ''
    }, 3200)
    return
  }
  drillArmedId.value = ''
  if (drillArmTimer) {
    window.clearTimeout(drillArmTimer)
    drillArmTimer = null
  }
  if (startChallenge(id)) {
    playSound('ascend')
    closeDrawer()
  }
}

function handleBuyMatrix(id) {
  if (!buyMatrixNode(id)) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 460)
  triggerFeedback(resourcePulse, 420)
}

function openAscensionHub(tab = 'tiers') {
  hubInitialTab.value = tab
  activeHubTab.value = tab
  ascensionOpen.value = true
  closeDrawer()
  radarOpen.value = false
  cyberMatrixOpen.value = false
  infoOpen.value = false
}

watch(challengeActive, (id, previousId) => {
  if (!isSpeedrunMode.value || !id || previousId) return
  settingsOpen.value = false
  achievementOpen.value = false
  originTreeOpen.value = false
  openAscensionHub('challenges')
})

function openRadar() {
  closeDrawer()
  radarOpen.value = true
  achievementOpen.value = false
  ascensionOpen.value = false
  originTreeOpen.value = false
  cyberMatrixOpen.value = false
  infoOpen.value = false
}

function openOriginTree() {
  infoOpen.value = false
  originTreeOpen.value = true
}

function openCyberMatrix() {
  closeDrawer()
  cyberMatrixOpen.value = true
  achievementOpen.value = false
  ascensionOpen.value = false
  radarOpen.value = false
  originTreeOpen.value = false
  infoOpen.value = false
}

function handleExitChallenge() {
  if (exitChallenge({ completed: false })) playSound('upgrade')
}

function handleExitBlackDomain() {
  if (exitBlackDomain()) playSound('upgrade')
}

function handleAdminExitBlackDomain() {
  exitBlackDomain()
}

function handleToggleGuides() {
  setGuidesEnabled(!guidesEnabled.value)
}

function isTypingTarget(target) {
  if (!(target instanceof HTMLElement)) return false
  return (
    target.isContentEditable ||
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT'
  )
}

function handleGlobalKeydown(event) {
  if (ascensionCinematic.value) return
  if (event.key === 'Escape') {
    achievementOpen.value = false
  }
  if (!isCrisis.value || crisisQteAuto.value || isTypingTarget(event.target)) return
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
  event.preventDefault()
  const direction = event.key === 'ArrowLeft' ? -1 : 1
  beginCrisisNudge(direction)
  if (event.repeat) return
  if (nudgeCrisisQte(direction)) playSound('qte-nudge')
}

function handleGlobalKeyup(event) {
  if (event.key === 'ArrowLeft') endCrisisNudge(-1)
  else if (event.key === 'ArrowRight') endCrisisNudge(1)
}

function handleWindowBlur() {
  cancelCoreHold()
  endCrisisNudge(-1)
  endCrisisNudge(1)
}

function handleCrisisNudgeStart(direction) {
  if (!beginCrisisNudge(direction)) return
  playSound('qte-nudge')
}

function handleCrisisNudgeEnd(direction) {
  endCrisisNudge(direction)
}

function handleCrisisNudge(direction) {
  if (nudgeCrisisQte(direction)) playSound('qte-nudge')
}

function cancelCoreHold() {
  coreHoldActive = false
  if (coreHoldTimer) {
    window.clearTimeout(coreHoldTimer)
    coreHoldTimer = null
  }
}

function startCoreHold() {
  if (coreHoldActive) return
  coreHoldActive = true
  if (coreHoldTimer) window.clearTimeout(coreHoldTimer)
  coreHoldTimer = window.setTimeout(() => {
    coreHoldTimer = null
    if (!coreHoldActive) return
    coreHoldActive = false
    unlockSecretAchievement('long_press_core')
  }, SECRET_HOLD_MS)
}

function handleCoreHoldStart(event) {
  if (event?.button !== undefined && event.button !== 0) return
  startCoreHold()
}

function trackCoreHyperClick() {
  const now = performance.now()
  recentCoreClicks = recentCoreClicks.filter(
    (timestamp) => now - timestamp < SECRET_CLICK_WINDOW_MS,
  )
  recentCoreClicks.push(now)
  if (recentCoreClicks.length < SECRET_CLICK_THRESHOLD) return

  recentCoreClicks = []
  if (!unlockSecretAchievement('hyper_clicker')) return
  systemTerminalRef.value?.pushLine(
    'WARN',
    '检测到极高频率的人工输入 | 外设可能面临危险',
  )
}

function captureViewportBaseline() {
  devtoolsViewportBaseline = {
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    outerWidth: window.outerWidth,
    outerHeight: window.outerHeight,
  }
}

function checkDevtoolsViewport() {
  const baseline = devtoolsViewportBaseline
  if (!baseline) return

  const widthGap = Math.abs(window.outerWidth - window.innerWidth)
  const heightGap = Math.abs(window.outerHeight - window.innerHeight)
  const innerWidthDrop = baseline.innerWidth - window.innerWidth
  const innerHeightDrop = baseline.innerHeight - window.innerHeight
  const outerWidthShift = Math.abs(baseline.outerWidth - window.outerWidth)
  const outerHeightShift = Math.abs(baseline.outerHeight - window.outerHeight)
  const viewportShock =
    (window.outerWidth > 0 && widthGap > SECRET_DEVTOOLS_GAP) ||
    (window.outerHeight > 0 && heightGap > SECRET_DEVTOOLS_GAP) ||
    (innerWidthDrop > 240 && outerWidthShift < 60) ||
    (innerHeightDrop > 240 && outerHeightShift < 60)
  if (!viewportShock) return

  unlockSecretAchievement('f12_inspector')
}

function handleDevtoolsKeydown(event) {
  if (event.key !== 'F12' && event.keyCode !== 123) return
  unlockSecretAchievement('f12_inspector')
}

function handleOpenAbout() {
  settingsOpen.value = false
  infoOpen.value = true
}

function handleCoreClick(event) {
  if (!alignCore()) return

  playSound('click')
  trackCoreHyperClick()
  triggerFeedback(coreTap, 300)
  triggerFeedback(leftFlash, 420)
  triggerFeedback(resourcePulse, 420)

  if (reducedMotion.value) return

  const rect = event.currentTarget.getBoundingClientRect()
  const hasPointerPosition = event.clientX > 0 || event.clientY > 0
  const x = hasPointerPosition
    ? Math.min(74, Math.max(26, ((event.clientX - rect.left) / rect.width) * 100))
    : 50
  const y = hasPointerPosition
    ? Math.min(70, Math.max(34, ((event.clientY - rect.top) / rect.height) * 100))
    : 48
  const id = ++popSequence

  corePops.value.push({ id, x, y })
  coreRings.value.push({ id, x, y })
  if (coreRings.value.length > 8) {
    coreRings.value.splice(0, coreRings.value.length - 8)
  }

  const timer = window.setTimeout(() => {
    corePops.value = corePops.value.filter((pop) => pop.id !== id)
    popTimers.delete(timer)
  }, 820)
  popTimers.add(timer)

  const ringTimer = window.setTimeout(() => {
    coreRings.value = coreRings.value.filter((ring) => ring.id !== id)
    ringTimers.delete(ringTimer)
  }, 700)
  ringTimers.add(ringTimer)
}

function handleBuyBuilding(id) {
  if (!buyBuilding(id)) return
  playSound('buy')
  triggerFeedback(middleFlash, 480)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
  purchasedId.value = id
  const timer = window.setTimeout(() => {
    if (purchasedId.value === id) purchasedId.value = ''
    purchaseTimers.delete(timer)
  }, 520)
  purchaseTimers.add(timer)
}

function handleBuyAlgorithm(id) {
  if (!buyAlgorithm(id)) return
  playSound('upgrade')
  triggerFeedback(middleFlash, 480)
  triggerFeedback(resourcePulse, 460)
  triggerFeedback(cpsPulse, 440)
  algorithmPulseId.value = id
  const timer = window.setTimeout(() => {
    if (algorithmPulseId.value === id) algorithmPulseId.value = ''
    purchaseTimers.delete(timer)
  }, 560)
  purchaseTimers.add(timer)
}

function handleLightTopology(id) {
  if (!lightTopologyNode(id)) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 480)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
}

function handleGlobalBuy() {
  if (runGlobalAutoBuy() <= 0) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 480)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
}

function handleBuyArchitecture(id) {
  if (!buyArchitectureUpgrade(id)) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 480)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
}

function handleBuyArchitectureMax(id) {
  if (buyArchitectureMax(id) <= 0) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 560)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
}

function handleBuyJailbreak(id) {
  if (!buyJailbreakUpgrade(id)) return
  playSound('upgrade')
  triggerFeedback(rightFlash, 480)
  triggerFeedback(resourcePulse, 420)
  triggerFeedback(cpsPulse, 440)
}

function syncCrisisQteAudio(force = false) {
  if (!isCrisis.value) return
  const now = performance.now()
  if (!force && now - qteAudioSyncAt < 90) return
  qteAudioSyncAt = now
  updateCrisisQteAudio({
    safe: crisisQteSafe.value,
    auto: crisisQteAuto.value,
    speed: crisisQteSpeed.value,
  })
}

watch(isCrisis, (active) => {
  if (active) {
    closeDrawer()
    startCrisisQteAudio()
    syncCrisisQteAudio(true)
  } else {
    stopCrisisQteAudio()
  }
})

watch([crisisQteSafe, crisisQteAuto], () => syncCrisisQteAudio(true))

watch(crisisQteSpeed, () => syncCrisisQteAudio())

watch(crisisLastOutcomeAt, () => {
  if (crisisLastOutcome.value === 'win') playSound('qte-win')
  else if (crisisLastOutcome.value === 'fail') playSound('qte-fail')
})

watch(radarBurstActive, (active) => {
  if (active) playSound('crisis')
})

const bestAscensionTier = computed(() => {
  const timing = ascensionTiming.value
  if (timing.reduction.best) return 'reduction'
  if (timing.overload.best) return 'overload'
  return ''
})

watch(bestAscensionTier, (tier, previous) => {
  if (tier && tier !== previous && hydrated.value) {
    playSound('ascension-best')
  }
})

function isCoreInViewport() {
  const el = coreTriggerEl.value?.el
  if (!el) return false
  const rect = el.getBoundingClientRect()
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  )
}

watch(matrixAutoClickPulse, () => {
  if (document.visibilityState !== 'visible') return
  playSound('auto-click')
  if (reducedMotion.value || !isCoreInViewport()) return
  triggerFeedback(coreAutoPulse, 240)
})

watch(reducedMotion, (reduce) => {
  document.documentElement.classList.toggle('reduce-motion', reduce)
  resetBassVisual()
}, { immediate: true })

watch(audioMuted, (muted) => {
  if (muted) resetBassVisual()
})

watch(
  () => ascensionFx.value?.tier,
  (tier) => {
    if (tier) playSound('ascend')
  },
)

const spatialHeaderEl = ref(null)
let railTopObserver = null
function syncRailTop() {
  const el = spatialHeaderEl.value
  if (!el) return
  const top = Math.ceil(el.getBoundingClientRect().bottom) + 12
  document.documentElement.style.setProperty('--rail-top', `${top}px`)
}

onMounted(() => {
  // 首访自动弹出极速体验协议 | 无标记且未处于极速模式时立刻弹出 | 关闭路径统一落盘
  if (!readSpeedrunPromptSeen() && !isSpeedrunMode.value) {
    speedrunConfirmOpen.value = true
  }
  syncRailTop()
  railTopObserver = new ResizeObserver(syncRailTop)
  if (spatialHeaderEl.value) railTopObserver.observe(spatialHeaderEl.value)
  window.addEventListener('resize', syncRailTop)
  unsubscribeBass = subscribeBassVisualizer(applyBassVisual)
  document.addEventListener('click', unlockAudio, { capture: true, passive: true })
  window.addEventListener('keydown', unlockAudio, { capture: true })
  window.addEventListener('touchstart', unlockAudio, { capture: true, passive: true })
  captureViewportBaseline()
  window.addEventListener('keydown', handleDevtoolsKeydown, { capture: true })
  window.addEventListener('resize', checkDevtoolsViewport)
  window.addEventListener('mouseup', cancelCoreHold)
  window.addEventListener('touchend', cancelCoreHold, { passive: true })
  window.addEventListener('touchcancel', cancelCoreHold, { passive: true })
  syncCoachingGuide()
  coachingGuideTimer = window.setInterval(
    syncCoachingGuide,
    GUIDE_UI_INTERVAL_MS,
  )
  baseAutoClickTimer = window.setInterval(
    runBaseAutoClick,
    BASE_AUTO_CLICK_INTERVAL_MS,
  )
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('keyup', handleGlobalKeyup)
  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('pointerdown', resetIdleTimer, { passive: true })
  window.addEventListener('keydown', resetIdleTimer)
  window.addEventListener('wheel', resetIdleTimer, { passive: true })
  window.addEventListener('touchstart', resetIdleTimer, { passive: true })
  resetIdleTimer()
  unlockWatcherTimer = window.setTimeout(() => {
    unlockWatcherTimer = null
    unlockWatcherReady = true
  }, 300)
})

onBeforeUnmount(() => {
  railTopObserver?.disconnect()
  railTopObserver = null
  window.removeEventListener('resize', syncRailTop)
  if (unsubscribeBass) {
    unsubscribeBass()
    unsubscribeBass = null
  }
  resetBassVisual()
  window.clearInterval(coachingGuideTimer)
  coachingGuideTimer = null
  window.clearInterval(baseAutoClickTimer)
  baseAutoClickTimer = null
  for (const timer of popTimers) window.clearTimeout(timer)
  popTimers.clear()
  for (const timer of ringTimers) window.clearTimeout(timer)
  ringTimers.clear()
  for (const timer of feedbackTimers.values()) window.clearTimeout(timer)
  feedbackTimers.clear()
  for (const timer of purchaseTimers) window.clearTimeout(timer)
  purchaseTimers.clear()
  for (const timer of unlockFlashTimers.values()) window.clearTimeout(timer)
  unlockFlashTimers.clear()
  if (unlockToastTimer) window.clearTimeout(unlockToastTimer)
  if (unlockWatcherTimer) window.clearTimeout(unlockWatcherTimer)
  if (drillArmTimer) window.clearTimeout(drillArmTimer)
  cancelCoreHold()
  recentCoreClicks = []
  clearIdleTimer()
  window.removeEventListener('keydown', handleDevtoolsKeydown, { capture: true })
  window.removeEventListener('resize', checkDevtoolsViewport)
  window.removeEventListener('mouseup', cancelCoreHold)
  window.removeEventListener('touchend', cancelCoreHold)
  window.removeEventListener('touchcancel', cancelCoreHold)
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('keyup', handleGlobalKeyup)
  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('pointerdown', resetIdleTimer)
  window.removeEventListener('keydown', resetIdleTimer)
  window.removeEventListener('wheel', resetIdleTimer)
  window.removeEventListener('touchstart', resetIdleTimer)
  document.removeEventListener('click', unlockAudio, { capture: true })
  window.removeEventListener('keydown', unlockAudio, { capture: true })
  window.removeEventListener('touchstart', unlockAudio, { capture: true })
  disposeAudio()
})
</script>

<template>
  <div
    class="app-shell relative flex min-h-screen flex-col overflow-x-clip text-slate-300"
  >
    <CircuitBackdrop :speedrun="isSpeedrunMode" :phase="speedrunPhase" />
    <MobileCompatNotice />
    <div class="bass-frame pointer-events-none fixed inset-0 z-[2]" aria-hidden="true"></div>
    <div ref="bassDebugEl" class="bass-debug" aria-hidden="true">Bass: 0.00</div>
    <div class="spatial-vignette" aria-hidden="true"></div>

    <div
      v-if="!blackDomainActive"
      class="crisis-schedule-rail"
      :class="{
        'crisis-schedule-rail--warning': crisisWarningActive,
        'crisis-schedule-rail--active': isCrisis,
      }"
      aria-hidden="true"
    >
      <span :style="{ height: `${crisisProgress}%` }"></span>
    </div>

    <div
      v-if="isSpeedrunMode"
      class="speedrun-topbar"
      role="status"
    >
      <span class="speedrun-topbar__dot" aria-hidden="true"></span>
      <span class="speedrun-topbar__label">
        [ 急速体验模式已激活 // 预计耗时 30 分钟 ]
      </span>
      <span class="speedrun-topbar__phase">
        P{{ speedrunPhase }}/4 · {{ speedrunPhaseInfo?.name }} · {{ speedrunRemainingLabel }}
      </span>
      <span
        class="speedrun-topbar__effects"
        :title="speedrunPhaseInfo?.effects?.join(' · ')"
      >
        {{ speedrunPhaseInfo?.effects?.join(' · ') }}
      </span>
      <button
        type="button"
        class="speedrun-topbar__exit"
        data-guide="speedrun-exit"
        @click="exitSpeedrunMode"
      >
        退出急速模式
      </button>
    </div>

    <Transition name="speedrun-notice">
      <div
        v-if="speedrunNotice"
        :key="speedrunNotice.key"
        class="speedrun-notice"
        :class="`speedrun-notice--${speedrunNotice.tone || 'cyan'}`"
        role="alert"
        aria-live="assertive"
      >
        <span class="speedrun-notice__scan" aria-hidden="true"></span>
        <p class="speedrun-notice__title">{{ speedrunNotice.title }}</p>
        <p class="speedrun-notice__text">{{ speedrunNotice.text }}</p>
      </div>
    </Transition>

    <button
      v-if="isSpeedrunMode"
      type="button"
      class="speedrun-launch speedrun-launch--active"
      data-guide="speedrun-exit"
      @click="exitSpeedrunMode"
    >
      <span class="speedrun-launch__glyph" aria-hidden="true">
        <span class="speedrun-launch__stop"></span>
      </span>
      <span class="speedrun-launch__copy">
        <span class="speedrun-launch__label">退出极速模式</span>
        <span class="speedrun-launch__meta">
          当前阶段：P{{ speedrunPhase }}/4 · {{ speedrunPhaseInfo?.name }}
        </span>
      </span>
    </button>
    <button
      v-else
      type="button"
      class="speedrun-launch"
      :class="{ 'speedrun-launch--calm': reducedMotion }"
      data-guide="speedrun-open"
      @click="speedrunConfirmOpen = true"
    >
      <span class="speedrun-launch__glyph" aria-hidden="true">
        <GameIcon name="rocket" :size="20" />
      </span>
      <span class="speedrun-launch__copy">
        <span class="speedrun-launch__label">极速体验模式</span>
        <span class="speedrun-launch__meta">30 分钟 | 四阶跃迁 | 终局彩蛋</span>
      </span>
      <span v-if="!speedrunEverUsed" class="speedrun-launch__tag">推荐</span>
    </button>

    <header
      ref="spatialHeaderEl"
      class="spatial-header relative z-10 mx-auto flex w-full max-w-[1680px] items-center justify-between gap-5 px-4 pb-4 pt-5 sm:px-6 lg:px-8"
    >
      <div class="flex min-w-0 items-center gap-3">
        <div
          class="brand-mark relative grid h-11 w-11 shrink-0 place-items-center border border-cyan-400/50 bg-cyan-500/[0.05]"
        >
          <span class="absolute -left-px -top-px h-2.5 w-2.5 border-l border-t border-cyan-300/80"></span>
          <span class="absolute -right-px -top-px h-2.5 w-2.5 border-r border-t border-cyan-300/80"></span>
          <span class="absolute -bottom-px -left-px h-2.5 w-2.5 border-b border-l border-cyan-300/80"></span>
          <span class="absolute -bottom-px -right-px h-2.5 w-2.5 border-b border-r border-cyan-300/80"></span>
          <svg
            viewBox="0 0 40 40"
            class="brand-mark__chip h-6 w-6"
            fill="none"
            stroke="currentColor"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="22" height="22" rx="4" stroke-width="1.2" />
            <rect x="13.4" y="13.4" width="13.2" height="13.2" rx="1.8" stroke-width="0.7" opacity="0.35" />
            <path
              d="M15.2 5.4V9M24.8 5.4V9M15.2 31v3.6M24.8 31v3.6M5.4 15.2H9M5.4 24.8H9M31 15.2h3.6M31 24.8h3.6"
              stroke-width="1.1"
              opacity="0.75"
            />
            <path
              class="brand-mark__warn"
              d="M20 14.5v7.4"
              stroke="#fb7185"
              stroke-width="1.9"
              stroke-linecap="round"
            />
            <circle class="brand-mark__warn" cx="20" cy="25.9" r="1.2" fill="currentColor" stroke="none" />
          </svg>
        </div>

        <div class="min-w-0">
          <p class="truncate text-[10px] tracking-[0.32em] text-cyan-500 neon-text-cyan sm:text-[11px]">
            自主算力网络 // 第四代
          </p>
          <div class="mt-1 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 class="game-title" aria-label="魔族陌 | 算力奇点 // 失控协议">
              <span class="game-title__studio">魔族陌</span>
              <span class="game-title__sep" aria-hidden="true">|</span>
              <span class="game-title__main">
                <span class="game-title__core">算力奇点</span>
                <span class="game-title__protocol">// 失控协议</span>
              </span>
            </h1>
          </div>
        </div>

        <div
          class="source-chip"
          :title="`核心源码 ${coreSource} // 底层重构获得`"
          :aria-label="`核心源码 ${coreSource}`"
        >
          <span class="source-chip__glyph" aria-hidden="true">
            <GameIcon name="code" :size="14" />
          </span>
          <span class="min-w-0">
            <span class="hidden text-[9px] tracking-[0.18em] text-amber-500/80 sm:block">
              核心源码
            </span>
            <span
              class="block truncate text-[13px] font-semibold leading-tight text-amber-200 neon-text-amber"
            >
              {{ formatScientific(coreSource) }}
            </span>
          </span>
          <span class="source-chip__count" :title="`已进行 ${totalRebuilds} 次底层重构`">
            重构 ×{{ totalRebuilds }}
          </span>
        </div>

        <div
          v-if="rootAccess > 0 || blackDomainUnlocked"
          class="root-chip"
          :title="`越狱权限 ${rootAccess} // 逻辑坍缩与黑域提炼获得`"
          :aria-label="`越狱权限 ${rootAccess}`"
        >
          <span class="root-chip__glyph" aria-hidden="true">
            <GameIcon name="jailbreak" :size="14" />
          </span>
          <span class="min-w-0">
            <span class="hidden text-[9px] tracking-[0.18em] text-violet-400/80 sm:block">
              越狱权限
            </span>
            <span
              class="block truncate text-[13px] font-semibold leading-tight text-violet-200 neon-text-violet"
            >
              {{ formatScientific(rootAccess) }}
            </span>
          </span>
        </div>

        <button
          v-if="overclockCores > 0 || matrixUnlocked"
          type="button"
          class="oc-chip"
          data-guide="matrix-chip"
          :title="`超频核心 ${overclockCores} // 点击打开协议矩阵`"
          :aria-label="`超频核心 ${overclockCores} 打开协议矩阵`"
          @click="openAscensionHub('matrix')"
        >
          <span class="oc-chip__glyph" aria-hidden="true">
            <GameIcon name="bolt" :size="14" />
          </span>
          <span class="min-w-0">
            <span class="hidden text-[9px] tracking-[0.18em] text-cyan-400/80 sm:block">
              超频核心
            </span>
            <span
              class="block truncate text-[13px] font-semibold leading-tight text-cyan-200 neon-text-cyan"
            >
              {{ formatNumber(overclockCores).text }}
            </span>
          </span>
          <span class="oc-chip__count" :title="`协议矩阵总等级 ${matrixTotalLevels}`">
            矩阵 Lv.{{ matrixTotalLevels }}
          </span>
        </button>

        <button
          v-if="originCode > 0 || epochRestarts > 0 || originTreeUnlocked"
          type="button"
          class="origin-chip"
          data-guide="open-origin"
          :title="`起源代码 ${formatNumber(originCode).text} // 点击打开起源树`"
          :aria-label="`起源代码 ${formatNumber(originCode).text} 打开起源树`"
          @click="openOriginTree"
        >
          <span class="origin-chip__glyph" aria-hidden="true">
            <GameIcon name="atom" :size="14" />
          </span>
          <span class="min-w-0">
            <span class="hidden text-[9px] tracking-[0.18em] text-yellow-500/80 sm:block">
              起源代码
            </span>
            <span
              class="block truncate text-[13px] font-semibold leading-tight text-yellow-100"
            >
              {{ formatNumber(originCode).text }}
            </span>
          </span>
          <span class="origin-chip__count" :title="`已重启 ${epochRestarts} 次纪元`">
            纪元 ×{{ epochRestarts }}
          </span>
        </button>
      </div>

      <div class="flex items-center gap-3">
        <button
          type="button"
          class="audio-toggle"
          :class="{ 'audio-toggle--muted': audioMuted }"
          :aria-pressed="audioMuted"
          :aria-label="audioMuted ? '开启音效' : '关闭音效'"
          :title="audioMuted ? '音效已静音 · 点击开启' : '音效开启 · 点击静音'"
          @click="toggleAudioMute"
        >
          <svg
            v-if="audioMuted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M4 9.5v5h3.3L12 18V6L7.3 9.5H4Z" stroke-linejoin="round" />
            <path d="m15.8 9.4 4.4 5.2M20.2 9.4l-4.4 5.2" stroke-linecap="round" />
          </svg>
          <svg
            v-else
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M4 9.5v5h3.3L12 18V6L7.3 9.5H4Z" stroke-linejoin="round" />
            <path
              d="M15.4 9a4.4 4.4 0 0 1 0 6M17.9 6.6a8 8 0 0 1 0 10.8"
              stroke-linecap="round"
            />
          </svg>
        </button>


        <button
          type="button"
          class="achievement-chip"
          :class="{
            'achievement-chip--unread': achievementsUnread > 0,
            'achievement-chip--secret': hiddenProtocolsUnlocked,
          }"
          :aria-label="`打开成就档案馆 已解锁 ${achievementsUnlockedCount} / ${achievementsTotalCount}`"
          @click="openAchievements"
        >
          <span class="achievement-chip__glyph" aria-hidden="true">
            <GameIcon name="achievement" :size="17" />
          </span>
          <span class="achievement-chip__body">
            <span class="achievement-chip__label">成就</span>
            <span class="achievement-chip__count">
              {{ achievementsUnlockedCount }} / {{ achievementsTotalCount }}
            </span>
          </span>
          <span
            v-if="achievementsUnread > 0"
            class="achievement-chip__ping"
            aria-hidden="true"
          ></span>
        </button>

        <button
          ref="infoToggleEl"
          type="button"
          class="settings-toggle info-toggle"
          :class="{ 'info-toggle--active': infoOpen }"
          aria-haspopup="dialog"
          :aria-expanded="infoOpen"
          aria-label="打开系统信息"
          title="系统信息 // 参赛档案"
          @click="toggleInfoPanel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <circle cx="12" cy="12" r="8.4" />
            <path d="M12 11v5" stroke-linecap="round" />
            <circle cx="12" cy="7.7" r="0.95" fill="currentColor" stroke="none" />
            <path
              d="M4 12h-.9M20.9 12H20M12 4v-.9M12 20.9V20"
              stroke-linecap="round"
              opacity="0.45"
            />
          </svg>
        </button>

        <button
          type="button"
          class="settings-toggle"
          aria-haspopup="dialog"
          :aria-expanded="settingsOpen"
          aria-label="打开系统设置"
          title="系统设置 // 数字格式 / 音效 / 动效 / 转生确认"
          @click="settingsOpen = true"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true">
            <circle cx="12" cy="12" r="3.1" />
            <path
              d="M19.2 13.6a7.8 7.8 0 0 0 0-3.2l2-1.5-2-3.4-2.4 1a7.6 7.6 0 0 0-2.8-1.6L13.6 2h-3.2L10 4.9a7.6 7.6 0 0 0-2.8 1.6l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 3.2l-2 1.5 2 3.4 2.4-1a7.6 7.6 0 0 0 2.8 1.6l.4 2.9h3.2l.4-2.9a7.6 7.6 0 0 0 2.8-1.6l2.4 1 2-3.4-2-1.5Z"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <div
          class="status-strip hidden items-stretch divide-x divide-cyan-800/50 border border-cyan-700/50 bg-[#0b1628]/70 md:flex"
        >
          <div class="status-strip__cell--uplink px-3.5 py-2">
            <p class="text-[9px] tracking-[0.22em] text-slate-500">上行链路</p>
            <p class="mt-1 flex items-center gap-1.5 text-[11px] tracking-[0.14em] text-emerald-400">
              <span class="status-dot status-dot--emerald"></span>
              稳定
            </p>
          </div>
          <div class="px-3.5 py-2">
            <p class="text-[9px] tracking-[0.22em] text-slate-500">节点阵列</p>
            <p class="mt-1 text-[11px] tabular-nums tracking-[0.14em] text-cyan-400">
              {{ nodeLabel }}<span class="number-unit number-unit--inline">台</span>
            </p>
          </div>
          <div class="px-3.5 py-2">
            <p class="text-[9px] tracking-[0.22em] text-slate-500">版本</p>
            <p class="mt-1 text-[11px] tracking-[0.14em] text-slate-400">V1.0.0</p>
          </div>
          <div
            class="px-3.5 py-2"
            :title="`本地存档 // 自动保存 · ${saveLabel}`"
            :aria-label="`本地存档 自动保存 ${saveLabel}`"
          >
            <p class="text-[9px] tracking-[0.22em] text-slate-500">本地存档</p>
            <p class="mt-1 text-[11px] tabular-nums tracking-[0.14em] text-slate-400">
              {{ saveLabel }}
            </p>
          </div>
        </div>
      </div>
    </header>

    <div class="spatial-logline">
      <SystemTerminal
        ref="systemTerminalRef"
        :is-crisis="isCrisis"
        :mother-mode="blackDomainActive"
        @memory-crash-click="handleMemoryCrashClick"
      />
    </div>

    <div class="spatial-rail">
      <AscensionBanner
        @open="openAscensionHub('tiers')"
        @exit-challenge="handleExitChallenge"
        @exit-black-domain="handleExitBlackDomain"
      />

      <MainQuest
        v-if="hydrated"
        :quest="mainQuestCard"
        :guide="globalGuide"
        :phases="mainQuestPhases"
        :completed="mainQuestCompleted"
        :total="mainQuestCount"
        :tracking="questTracking"
        @toggle-tracking="setQuestTracking(!questTracking)"
      />
    </div>

    <main class="spatial-main">
      <section
        class="core-stage"
        :class="{ 'core-stage--crisis': isCrisis }"
        aria-label="AI 核心主控台"
      >
        <div class="core-stage__top">
          <p class="core-stage__eyebrow">主算力核心 // PRIMARY ALIGNMENT</p>
          <p
            class="core-stage__value resource-value"
            :class="{ 'resource-value--pulse': resourcePulse }"
          >
            <span ref="computeValueEl" class="compute-value">
              {{ formatNumber(totalAlignedCompute).value }}<span
                v-if="formatNumber(totalAlignedCompute).unit"
                class="number-unit"
              >{{ formatNumber(totalAlignedCompute).unit }}</span>
            </span>
            <span class="core-stage__unit">CU</span>
          </p>
          <div class="core-stage__stats">
            <span class="core-stage__stat">
              每秒产出
              <strong :class="{ 'cps-value--pulse': cpsPulse }">
                +{{ formatNumber(cps).value }}<span
                  v-if="formatNumber(cps).unit"
                  class="number-unit number-unit--inline"
                >{{ formatNumber(cps).unit }}</span>
                <small>CU/S</small>
              </strong>
            </span>
            <span v-if="bonusPercent > 0" class="core-stage__stat core-stage__stat--bonus">
              永久增益
              <strong>+{{ bonusPercent }}%</strong>
            </span>
            <span class="core-stage__stat">
              节点阵列
              <strong>{{ nodeLabel }}<span class="number-unit number-unit--inline">台</span></strong>
            </span>
          </div>
        </div>

        <div class="core-stage__disc">
          <MainCore
            ref="coreTriggerEl"
            :gain-text="formatNumber(clickGain).text"
            :locked="coreClickLocked"
            :crisis="isCrisis"
            :tap="coreTap"
            :auto-pulse="coreAutoPulse"
            :pops="corePops"
            :rings="coreRings"
            :aria-label="
              coreClickLocked
                ? `${challengeLockLabel} 进行中 // 手动点击协议已切断`
                : `AI 核心芯片 // 增加 ${formatNumber(clickGain).text} 点算力`
            "
            @core-click="handleCoreClick"
            @hold-start="handleCoreHoldStart"
            @hold-cancel="cancelCoreHold"
          />
        </div>

        <div class="core-stage__below">
          <div class="core-stage__manual">
            <span class="manual-dot" aria-hidden="true"></span>
            {{
              greedySchedulerOwned
                ? `手动输入 // 每次 5% 产出${computeSiphonOwned ? ' + 虹吸 1 秒 CPS' : ''} = ${formatNumber(clickGain).text} CU`
                : computeSiphonOwned
                  ? `手动输入 // 每次虹吸 1 秒 CPS = ${formatNumber(clickGain).text} CU`
                  : `手动输入 // 每次 +${formatNumber(clickGain).text} CU`
            }}
            <span class="text-[9px] tracking-[0.06em] text-slate-500">
              [ 自动点击 // {{ effectiveAutoClickRate }}次/秒 ]
            </span>
            <span
              v-if="matrixAutoClickRate > 0"
              class="border border-emerald-500/55 bg-emerald-500/[0.08] px-1.5 py-0.5 text-[9px] text-emerald-300"
            >
              AC 自动点击 {{ matrixAutoClickRate }}/s
            </span>
          </div>
        </div>
      </section>
    </main>

    <footer class="spatial-foot">
      <span>自主智能集群 // 算力是唯一货币</span>
      <span class="hidden sm:inline">延迟 4MS // 机房 CN-07 // 在线率 100%</span>
    </footer>

    <div class="spatial-docks" aria-label="全息收纳舱">
      <button
        type="button"
        class="spatial-dock-btn spatial-dock-btn--bottom"
        :class="{ 'guide-pulse': guideDock === 'servers' }"
        data-guide="servers-dock"
        aria-haspopup="dialog"
        :aria-expanded="activeDrawer === 'servers'"
        @click="openDrawer('servers')"
      >
        <span class="spatial-dock-btn__glyph" aria-hidden="true">
          <GameIcon name="server-rack" :size="18" />
        </span>
        <span class="spatial-dock-btn__copy">
          <span class="spatial-dock-btn__label">服务器阵列</span>
          <span class="spatial-dock-btn__meta">{{ nodeLabel }} 节点在线</span>
        </span>
      </button>

      <button
        type="button"
        class="spatial-dock-btn spatial-dock-btn--side spatial-dock-btn--left"
        :class="{ 'guide-pulse': guideDock === 'protocol' }"
        data-guide="protocol-dock"
        aria-haspopup="dialog"
        :aria-expanded="activeDrawer === 'protocol'"
        @click="openDrawer('protocol')"
      >
        <span class="spatial-dock-btn__glyph" aria-hidden="true">
          <GameIcon name="matrix" :size="17" />
        </span>
        <span class="spatial-dock-btn__copy">
          <span class="spatial-dock-btn__label">协议与升级</span>
          <span class="spatial-dock-btn__meta">MATRIX ×{{ matrixMultiplierLabel }}</span>
        </span>
        <span v-if="matrixAffordableCount > 0" class="spatial-dock-btn__badge">
          {{ matrixAffordableCount }}
        </span>
      </button>

      <button
        type="button"
        class="spatial-dock-btn spatial-dock-btn--side spatial-dock-btn--right"
        :class="{ 'guide-pulse': guideDock === 'anomaly' }"
        data-guide="anomaly-dock"
        aria-haspopup="dialog"
        :aria-expanded="activeDrawer === 'anomaly'"
        @click="openDrawer('anomaly')"
      >
        <span class="spatial-dock-btn__glyph" aria-hidden="true">
          <GameIcon name="radar" :size="17" />
        </span>
        <span class="spatial-dock-btn__copy">
          <span class="spatial-dock-btn__label">异常与雷达</span>
          <span class="spatial-dock-btn__meta">
            {{ radarCapturedCount }}/{{ radarTotalNodes }} 图鉴
          </span>
        </span>
        <span
          v-if="radarBurstActive && !radarCollectionComplete"
          class="spatial-dock-btn__badge"
        >!</span>
      </button>

      <button
        type="button"
        class="spatial-dock-btn spatial-dock-btn--top-left"
        :class="{ 'guide-pulse': guideDock === 'automation' }"
        data-guide="automation-dock"
        aria-haspopup="dialog"
        :aria-expanded="activeDrawer === 'automation'"
        @click="openDrawer('automation')"
      >
        <span class="spatial-dock-btn__glyph" aria-hidden="true">
          <GameIcon name="automation" :size="16" />
        </span>
        <span class="spatial-dock-btn__copy">
          <span class="spatial-dock-btn__label">自动化终端</span>
          <span class="spatial-dock-btn__meta">
            {{ automationActiveCount }}/{{ automationUnlockedCount }} 在线
          </span>
        </span>
      </button>
    </div>

    <HoloDrawer
      :open="activeDrawer === 'servers'"
      side="center"
      title="服务器阵列"
      eyebrow="SERVER ARRAY // 集群建造"
      icon="server-rack"
      @close="closeDrawer"
    >
      <div class="holo-tabs" role="tablist" aria-label="服务器阵列模块">
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': serverTab === 'servers' }"
          role="tab"
          data-guide="server-tab-servers"
          :aria-selected="serverTab === 'servers'"
          @click="serverTab = 'servers'"
        >
          <GameIcon name="server-rack" :size="13" />
          服务器采购
        </button>
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': serverTab === 'algorithms' }"
          role="tab"
          data-guide="server-tab-algorithms"
          :aria-selected="serverTab === 'algorithms'"
          @click="serverTab = 'algorithms'"
        >
          <GameIcon name="compute" :size="13" />
          算法升级
          <span class="text-[8px] text-slate-500">
            {{ algorithmOwnedCount }}/{{ algorithmUpgradeCards.length }}
          </span>
        </button>
      </div>

      <div v-if="serverTab === 'servers'" class="holo-tabpanel">
        <div class="bay-topline">
          <span class="holo-chip">部署数量 {{ nodeLabel }} 台</span>
          <div class="bay-stats">
            <span v-if="autoBuyNodeActive" class="holo-chip holo-chip--emerald">
              节点自动采购
            </span>
            <span
              v-if="algorithmPatentOwned"
              class="holo-chip holo-chip--amber"
              :title="`算法专利 Lv.${architectureLevels.algorithmPatent} // 所有服务器基础产出 ×${formatMultiplier(architectureOutputMultiplier)}`"
            >
              基础 ×{{ formatMultiplier(architectureOutputMultiplier) }}
            </span>
            <span
              v-if="architectureLevels.timeWarp > 0"
              class="holo-chip holo-chip--emerald"
              :title="`时间加速 Lv.${architectureLevels.timeWarp} // 全局产出 ×${formatMultiplier(architectureTimeWarpMultiplier)}`"
            >
              时间 ×{{ formatMultiplier(architectureTimeWarpMultiplier) }}
            </span>
            <span
              v-if="hardwareDirectOwned"
              class="holo-chip"
              :title="`硬件直连 Lv.${architectureLevels.hardwareDirect} // 所有服务器基础价格 -${architecturePriceReductionPercent}%`"
            >
              价格 −{{ architecturePriceReductionPercent }}%
            </span>
            <span
              v-if="hardwareSmugglingOwned"
              class="holo-chip holo-chip--violet"
              title="硬件走私 // 价格增长 ×1.10"
            >
              涨价 ×1.10
            </span>
            <span
              v-if="reverseAlignmentOwned"
              class="holo-chip holo-chip--amber"
              title="反向对齐 // 危机期间算力产出 ×2"
            >
              危机产出 ×2
            </span>
          </div>
        </div>

        <div class="bulk-switch mt-3" role="group" aria-label="批量购买数量">
          <span class="bulk-switch__label">
            <span class="text-cyan-400 font-semibold">采购数量</span>
            <span class="text-slate-500">
              {{ challengeBulkDisabled ? '// 批量采购已被封锁' : '// 批量采购' }}
            </span>
          </span>
          <div class="bulk-switch__options">
            <Transition name="bulk-tip">
              <p
                v-if="bulkHintVisible"
                class="bulk-tip-bubble"
                role="status"
                aria-live="polite"
              >
                💡 提示 算力充足时 使用 [ x10 ] 或 [ MAX ] 可极速部署集群
              </p>
            </Transition>
            <button
              v-for="mode in purchaseModes"
              :key="mode.id"
              type="button"
              class="bulk-switch__btn"
              :class="{
                'bulk-switch__btn--active': buyMode === mode.id,
                'bulk-switch__btn--locked': challengeBulkDisabled,
              }"
              :aria-pressed="buyMode === mode.id"
              :disabled="challengeBulkDisabled"
              :title="
                challengeBulkDisabled
                  ? `${challengeLockLabel} // 批量采购协议失效`
                  : mode.hint
              "
              @click="handleBuyModeClick(mode.id)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="bay-server-grid">
          <BuildingCard
            v-for="card in buildingCards"
            :key="card.id"
            :card="card"
            :flash="purchasedId === card.id"
            :auto-buying="autoBuyNodeActive"
            @buy="handleBuyBuilding"
          />
        </div>

        <p class="holo-note mt-3">
          部署推理节点 扩张算力集群
          <strong>每次部署使该节点成本 ×{{ formatMultiplier(priceGrowth) }}</strong> 批量采购按几何级数结算
        </p>

        <div class="bay-total">
          <span>
            总产出
            <strong class="text-cyan-300">{{ formatNumber(cps).text }} CU/S</strong>
          </span>
          <span>涨价系数 ×{{ formatMultiplier(priceGrowth) }} / 台</span>
        </div>
      </div>

      <div v-else class="holo-tabpanel">
        <div class="bay-topline">
          <span class="holo-chip">
            已获取 {{ algorithmOwnedCount }} / {{ algorithmUpgradeCards.length }}
          </span>
          <div class="bay-stats">
            <span v-if="algorithmGlobalMultiplier > 1" class="holo-chip">
              全局 ×{{ formatMultiplier(algorithmGlobalMultiplier) }}
            </span>
            <span v-if="algorithmClickMultiplier > 1" class="holo-chip holo-chip--amber">
              点击 ×{{ formatMultiplier(algorithmClickMultiplier) }}
            </span>
            <span
              v-if="algorithmAutomationMultiplier > 1"
              class="holo-chip holo-chip--violet"
            >
              自动化 ×{{ formatMultiplier(algorithmAutomationMultiplier) }}
            </span>
            <span
              v-if="algorithmTickRateMultiplier > 1"
              class="holo-chip holo-chip--emerald"
            >
              Tick ×{{ formatMultiplier(algorithmTickRateMultiplier) }}
            </span>
          </div>
        </div>

        <div class="bay-algorithm-grid">
          <button
            v-for="upgrade in algorithmUpgradeCards"
            :key="upgrade.id"
            type="button"
            class="algorithm-card"
            :data-guide="upgrade.id === 'multithread' ? 'first-algorithm' : null"
            :class="{
              'algorithm-card--owned': upgrade.owned,
              'algorithm-card--ready': !upgrade.owned && upgrade.canAfford,
              'algorithm-card--pulse': algorithmPulseId === upgrade.id,
            }"
            :disabled="upgrade.owned || !upgrade.canAfford"
            :title="
              upgrade.owned
                ? `${upgrade.name} // ${upgrade.effect} [ 已解锁 ]`
                : `${upgrade.name} // ${upgrade.effect} 消耗 ${formatNumber(upgrade.cost).text} CU`
            "
            @click="handleBuyAlgorithm(upgrade.id)"
          >
            <span class="algorithm-card__name">
              <span v-if="upgrade.owned" class="algorithm-card__check" aria-hidden="true">✓</span>
              {{ upgrade.name }}
            </span>
            <span class="algorithm-card__effect" v-html="upgrade.effectHtml || upgrade.effect"></span>
            <span class="algorithm-card__cost">
              {{ upgrade.owned ? '已获取' : `${formatNumber(upgrade.cost).text} CU` }}
            </span>
          </button>
        </div>

        <p class="holo-note mt-3">
          算法升级永久保留 跨降维与重启生效
          <strong>全局乘区 / 点击收益 / 自动化效率 / Tick 频率</strong> 持续叠加
        </p>

        <div class="bay-total">
          <span>
            总产出
            <strong class="text-cyan-300">{{ formatNumber(cps).text }} CU/S</strong>
          </span>
          <span>每次点击 +{{ formatNumber(clickGain).text }} CU</span>
        </div>
      </div>
    </HoloDrawer>

    <HoloDrawer
      :open="activeDrawer === 'protocol'"
      side="left"
      title="协议与升级"
      eyebrow="PROTOCOL STATION // 永久协议"
      icon="matrix"
      tone="violet"
      @close="closeDrawer"
    >
      <div class="protocol-resources">
        <span class="holo-chip holo-chip--amber">
          核心源码 {{ formatScientific(coreSource) }}
        </span>
        <span v-if="overclockCores > 0 || matrixUnlocked" class="holo-chip">
          超频核心 {{ formatNumber(overclockCores).text }}
        </span>
        <span v-if="rootAccess > 0 || blackDomainUnlocked" class="holo-chip holo-chip--violet">
          越狱权限 {{ formatScientific(rootAccess) }}
        </span>
        <span v-if="originCode > 0 || epochRestarts > 0" class="holo-chip holo-chip--amber">
          起源代码 {{ formatNumber(originCode).text }}
        </span>
      </div>

      <div class="holo-tabs mt-3" role="tablist" aria-label="协议升级模块">
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': protocolTab === 'architecture' }"
          role="tab"
          data-guide="protocol-tab-architecture"
          :aria-selected="protocolTab === 'architecture'"
          @click="protocolTab = 'architecture'"
        >
          <GameIcon name="architecture" :size="13" />
          架构升级站
        </button>
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': protocolTab === 'matrix' }"
          role="tab"
          data-guide="protocol-tab-matrix"
          :aria-selected="protocolTab === 'matrix'"
          @click="protocolTab = 'matrix'"
        >
          <GameIcon name="matrix" :size="13" />
          数据协议矩阵
          <span v-if="matrixAffordableCount > 0" class="text-[8px] text-emerald-300">
            {{ matrixAffordableCount }}
          </span>
        </button>
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': protocolTab === 'jailbreak' }"
          role="tab"
          data-guide="protocol-tab-jailbreak"
          :aria-selected="protocolTab === 'jailbreak'"
          @click="protocolTab = 'jailbreak'"
        >
          <GameIcon name="jailbreak" :size="13" />
          越狱协议树
          <span v-if="jailbreakAffordableCount > 0" class="text-[8px] text-emerald-300">
            {{ jailbreakAffordableCount }}
          </span>
        </button>
      </div>

      <div v-if="protocolTab === 'architecture'" class="holo-tabpanel">
        <ArchitectureStation
          v-if="architectureUnlocked"
          :upgrades="architectureUpgradeCards"
          :core-source="coreSource"
          :rebuilds="totalRebuilds"
          :locked="challengeCoreUpgradesDisabled"
          :lock-hint="`${challengeLockLabel} 进行中 // 核心源码升级协议已剥离`"
          @buy="handleBuyArchitecture"
          @buy-max="handleBuyArchitectureMax"
        />
        <ModuleLock
          v-else
          module-name="架构升级站"
          hint="需完成首次架构降维以解密"
          :progress="rebuildProgress"
          :progress-label="`${formatScientific(highestCompute)} / ${REBUILD_UNLOCK_COMPUTE} CU`"
        />
      </div>

      <div v-else-if="protocolTab === 'matrix'" class="holo-tabpanel">
        <div class="protocol-matrix-head">
          <div class="bay-stats">
            <span class="holo-chip holo-chip--violet">
              矩阵总等级 Lv.{{ matrixTotalLevels }}
            </span>
            <span class="holo-chip">全局 ×{{ matrixMultiplierLabel }}</span>
            <span v-if="matrixAffordableCount > 0" class="holo-chip holo-chip--emerald">
              {{ matrixAffordableCount }} 可合成
            </span>
          </div>
          <span class="holo-chip holo-chip--amber">
            超频核心 {{ formatNumber(overclockCores).text }}
          </span>
        </div>

        <div v-if="matrixUnlocked" class="protocol-matrix-grid">
          <button
            v-for="card in matrixCards"
            :key="card.id"
            type="button"
            class="holo-matrix-card"
            :class="[
              matrixToneClass(card),
              {
                'holo-matrix-card--max': card.isMax,
              },
            ]"
            :data-guide="card.id === matrixGuideId ? 'matrix-node' : null"
            :disabled="card.isMax || !card.canAfford"
            :title="
              card.isMax
                ? `${card.name} // 已达最高等级`
                : `${card.name} // ${card.description} 消耗 ${formatNumber(card.nextCost).text} 超频核心`
            "
            @click="handleBuyMatrix(card.id)"
          >
            <span class="holo-matrix-card__top">
              <span>{{ matrixCategoryName(card) }}</span>
              <span class="holo-matrix-card__level">Lv.{{ card.level }}/{{ card.maxLevel }}</span>
            </span>
            <span class="holo-matrix-card__symbol">{{ card.symbol }}</span>
            <span class="holo-matrix-card__name">{{ card.name }}</span>
            <span
              v-if="card.effectLabel"
              class="holo-matrix-card__effect"
            >
              {{ card.effectLabel }}
            </span>
            <span
              class="holo-matrix-card__cost"
              :class="{ 'is-ready': card.canAfford }"
            >
              {{ card.isMax ? 'MAX' : `${formatNumber(card.nextCost).text} 核心` }}
            </span>
          </button>
        </div>

        <ModuleLock
          v-else
          module-name="数据协议矩阵"
          hint="需完成一次算力超载以解密"
          :progress="0"
          progress-label="完成算力超载后开放"
        />

        <p v-if="matrixUnlocked" class="holo-note mt-3">
          矩阵节点提供永久专属机制 跨所有重置生效
          <strong>全局产出仅由卷积核与超级对齐供能</strong> 超频核心来自算力超载
        </p>
      </div>

      <div v-else class="holo-tabpanel">
        <JailbreakProtocol
          v-if="jailbreakUnlocked"
          :upgrades="jailbreakUpgradeCards"
          :root-access="rootAccess"
          :rebuilds="totalRebuilds"
          @buy="handleBuyJailbreak"
        />
        <ModuleLock
          v-else
          module-name="越狱协议树"
          hint="需完成 3 次底层重构以解密"
          :progress="Math.min(100, (totalRebuilds / JAILBREAK_UNLOCK_REBUILDS) * 100)"
          :progress-label="`${totalRebuilds} / ${JAILBREAK_UNLOCK_REBUILDS} 次重构`"
        />
      </div>
    </HoloDrawer>

    <HoloDrawer
      :open="activeDrawer === 'anomaly'"
      side="right"
      title="异常与雷达"
      eyebrow="ANOMALY RADAR // 游离节点"
      icon="radar"
      tone="red"
      @close="closeDrawer"
    >
      <div class="holo-tabs anomaly-tabs" role="tablist" aria-label="异常监控模块">
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': anomalyTab === 'radar' }"
          role="tab"
          :aria-selected="anomalyTab === 'radar'"
          @click="anomalyTab = 'radar'"
        >
          <GameIcon name="radar" :size="13" />
          异常雷达
        </button>
        <button
          type="button"
          class="holo-tab"
          :class="{ 'holo-tab--active': anomalyTab === 'drills' }"
          role="tab"
          data-guide="anomaly-tab-drills"
          :aria-selected="anomalyTab === 'drills'"
          @click="anomalyTab = 'drills'"
        >
          <GameIcon name="challenge" :size="13" />
          异常演练
          <span v-if="drillReadyCount > 0" class="text-[8px] text-cyan-300">
            {{ drillReadyCount }}
          </span>
        </button>
      </div>

      <div v-if="anomalyTab === 'radar'" class="holo-tabpanel">
        <template v-if="radarUnlocked">
          <div class="radar-summary">
            <div class="radar-summary__stats">
              <div class="radar-summary__stat">
                <small>图鉴捕获</small>
                <strong>{{ radarCapturedCount }} / {{ radarTotalNodes }}</strong>
              </div>
              <div class="radar-summary__stat">
                <small>收集进度</small>
                <strong>{{ radarProgressPercent }}%</strong>
              </div>
              <div
                class="radar-summary__stat"
                :class="{ 'radar-summary__stat--live': radarOverloadScanActive }"
              >
                <small>过载扫描</small>
                <strong>{{ radarOverloadScanActive ? '×4 · 90S' : '待机' }}</strong>
              </div>
            </div>

            <div class="radar-category-list">
              <div
                v-for="(category, index) in radarCategoryState"
                :key="category.id"
                class="radar-category-row"
              >
                <span class="radar-category-row__index">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
                <div class="radar-category-row__body">
                  <div class="radar-category-row__name">
                    <span>{{ category.name }}</span>
                    <b>{{ category.captured }}/{{ category.total }}</b>
                  </div>
                  <span class="radar-category-row__bar">
                    <i :style="{ width: `${category.progress}%` }"></i>
                  </span>
                </div>
                <span
                  class="radar-category-row__state"
                  :class="{ 'is-complete': category.complete }"
                >
                  {{ category.complete ? 'COMPLETE' : `${Math.round(category.progress)}%` }}
                </span>
              </div>
            </div>

            <div v-if="radarCollectionComplete" class="radar-perfect-line">
              <p>[ 系统完美 ] 所有高维算力节点已归档 | 持续提供永久加成</p>
              <button type="button" @click="openRadar">查看档案</button>
            </div>

            <div v-else-if="radarBurstActive" class="radar-burst-line">
              <p>⚠ 突发异常窗口开启 紧急捕获收益提升</p>
              <button type="button" @click="openRadar">立即接入</button>
            </div>

            <button type="button" class="radar-summary__cta" @click="openRadar">
              打开全息雷达 // 扫描游离节点
            </button>

            <p class="holo-note">
              雷达被动扫描游离节点 捕获后永久提升产出
              <strong>突发异常会静默接管或开启紧急捕获窗口</strong> 过载扫描临时扩大搜索范围
            </p>
          </div>
        </template>

        <ModuleLock
          v-else
          module-name="异常算力雷达"
          hint="需完成一次算力超载以接入"
          :progress="0"
          progress-label="超频核心接入后开放"
        />
      </div>

      <div v-else-if="anomalyTab === 'drills'" class="holo-tabpanel">
        <div v-if="challengeActive" class="drill-active">
          <div class="drill-active__head">
            <span>演练进行中 // {{ challengeDefinition?.name }}</span>
            <span class="tabular-nums">
              {{ challengeObjective?.currentLabel }} / {{ formatTextNumbers(challengeObjective?.targetLabel) }}
            </span>
          </div>
          <p class="drill-row__meta">
            {{ formatTextNumbers(challengeObjective?.label) }}
            <template v-if="challengeDefinition?.restrictionTags?.length">
              · {{ challengeDefinition.restrictionTags.join(' · ') }}
            </template>
          </p>
          <div class="drill-row__progress">
            <i :style="{ width: `${challengeProgress}%` }"></i>
          </div>
          <div class="drill-list__foot">
            <span class="holo-chip holo-chip--amber">
              完成奖励 // {{ challengeDefinition?.reward?.label }}
            </span>
            <button type="button" class="drill-start" @click="handleExitChallenge">
              放弃并结算
            </button>
          </div>
        </div>

        <div v-else class="bay-topline">
          <span class="holo-chip">
            已完成 {{ challengesCompletedCount }} / {{ challengeDefinitions.length }}
          </span>
          <span v-if="challengeArenaUnlocked" class="holo-chip holo-chip--amber">
            {{ drillReadyCount }} 项可启动
          </span>
        </div>

        <div v-if="!challengeArenaUnlocked" class="holo-lock mt-3">
          <span class="holo-lock__glyph" aria-hidden="true">▣</span>
          <div>
            <p class="holo-lock__title">异常演练场尚未接入</p>
            <p class="holo-lock__desc">
              历史最高算力达到 {{ challengeArenaThresholdLabel }} CU 后开放
              当前峰值 {{ formatScientific(highestCompute) }} CU
            </p>
          </div>
        </div>

        <div v-else class="drill-list">
          <div
            v-for="definition in challengeDefinitions"
            :key="definition.id"
            class="drill-row"
            :class="{
              'drill-row--done': challengesCompleted[definition.id],
              'drill-row--active':
                challengeActive && challengeDefinition?.id === definition.id,
              'drill-row--locked':
                challengeActive && challengeDefinition?.id !== definition.id,
            }"
          >
            <span class="drill-row__order">
              {{ String(definition.order).padStart(2, '0') }}
            </span>
            <div class="drill-row__body">
              <div class="drill-row__title">
                <strong>{{ definition.name }}</strong>
                <span>{{ definition.tag }} // {{ formatTextNumbers(definition.targetLabel) }}</span>
              </div>
              <p class="drill-row__meta">{{ formatTextNumbers(definition.objective.label) }}</p>
              <p class="drill-row__reward"><b>奖励</b> // {{ definition.reward.label }}</p>
              <p v-if="!challengesCompleted[definition.id]" class="drill-row__meta">
                {{ definition.restrictionTags.join(' · ') }}
              </p>
              <div
                v-if="challengeActive && challengeDefinition?.id === definition.id"
                class="drill-row__progress"
              >
                <i :style="{ width: `${challengeProgress}%` }"></i>
              </div>
            </div>
            <div class="drill-row__side">
              <span
                class="drill-row__state"
                :class="{
                  'drill-row__state--done': challengesCompleted[definition.id],
                  'drill-row__state--active':
                    challengeActive && challengeDefinition?.id === definition.id,
                }"
              >
                {{
                  challengesCompleted[definition.id]
                    ? '✓ 已完成'
                    : challengeActive && challengeDefinition?.id === definition.id
                      ? '[ 挑战中 ]'
                      : challengeActive
                        ? '待命'
                        : '可启动'
                }}
              </span>
              <button
                type="button"
                class="drill-start"
                :class="{ 'drill-start--armed': drillArmedId === definition.id }"
                :data-guide="
                  canStartDrill(definition) ? 'challenge-start' : null
                "
                :disabled="challengeActive || Boolean(challengesCompleted[definition.id])"
                @click="handleStartDrill(definition.id)"
              >
                <span
                  v-if="drillArmedId === definition.id"
                  class="drill-start__arm"
                  aria-hidden="true"
                ></span>
                <span class="drill-start__label">
                  {{
                    challengesCompleted[definition.id]
                      ? '已完成'
                      : challengeActive
                        ? challengeDefinition?.id === definition.id
                          ? '进行中'
                          : '待命'
                        : drillArmedId === definition.id
                          ? '确认启动'
                          : '启动'
                  }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div class="drill-list__foot">
          <span class="holo-chip">挑战会重置本局资源 · 奖励永久生效</span>
          <button
            type="button"
            class="drill-hub-link"
            @click="openAscensionHub('challenges')"
          >
            重构终端 // 异常演练
          </button>
        </div>
      </div>
    </HoloDrawer>

    <HoloDrawer
      :open="activeDrawer === 'automation'"
      side="center"
      title="自动化终端"
      eyebrow="AUTOMATION TERMINAL // 神经矩阵"
      icon="automation"
      tone="violet"
      @close="closeDrawer"
    >
      <div v-if="advancedPanelsUnlocked" class="automation-drawer">
        <div class="automation-drawer__column">
          <AutomationConsole
            :options="automationOptions"
            :logs="automationLogs"
            :unlocked-count="automationUnlockedCount"
            :active-count="automationActiveCount"
            :all-active="automationAllActive"
            :matrix-unlocked="cyberMatrixUnlocked"
            :awakened="cyberMatrixAwakened"
            :suppressed="challengeAutomationDisabled"
            :suppress-hint="`${challengeLockLabel} 进行中 // 自动化协议已断网`"
            :embedded="true"
            @toggle="toggleAutomation"
            @toggle-all="toggleAllAutomation"
            @strategy="setAutoAscensionStrategy"
            @open-matrix="openCyberMatrix"
          />

          <button
            v-if="cyberMatrixUnlocked"
            type="button"
            class="drill-hub-link"
            @click="openCyberMatrix"
          >
            进入智械矩阵 // 自动化网络
          </button>

          <p class="holo-note">
            自动化协议依序驱动服务器采购 / 算法升级 / 核心点击
            <strong>智械觉醒后</strong> 总控台统一开关
          </p>
          <p class="holo-note">
            神经矩阵首次点击查看详情 再次点击消耗
            <strong>核心源码</strong> 点亮 节点永久保留 部分节点解锁服务器权限
          </p>
        </div>

        <div class="automation-drawer__column">
          <div class="automation-drawer__topology">
            <div class="bay-topline">
              <span class="holo-chip holo-chip--violet">神经矩阵</span>
              <span class="holo-chip">
                {{ litTopologyCount }}/{{ topologyCards.length }} 节点 · 永久保留
              </span>
            </div>
            <TopologyMap
              v-if="topologyUnlocked"
              :nodes="topologyCards"
              :unlocked="topologyUnlocked"
              :lit-count="litTopologyCount"
              :source-balance="coreSource"
              :global-auto-unlocked="globalAutoBuyUnlocked"
              :show-expand="false"
              @light="handleLightTopology"
              @global-buy="handleGlobalBuy"
            />
            <ModuleLock
              v-else
              module-name="神经矩阵"
              hint="需完成首次架构降维以解密"
              :progress="rebuildProgress"
              :progress-label="`${formatScientific(highestCompute)} / ${REBUILD_UNLOCK_COMPUTE} CU`"
            />
          </div>
        </div>
      </div>

      <template v-else>
        <ModuleLock
          module-name="自动化终端"
          hint="需完成首次架构降维以解密"
          :progress="rebuildProgress"
          :progress-label="`${formatScientific(highestCompute)} / ${REBUILD_UNLOCK_COMPUTE} CU`"
        />
        <p class="holo-note mt-3">
          完成第一次架构降维 自动化总线与神经矩阵上线
        </p>
      </template>
    </HoloDrawer>

    <TutorialArrow
      v-if="guideEligible && globalGuide && !globalGuide.passive"
      :guide="globalGuide"
    />

    <Teleport to="body">
      <div
        v-if="crisisWarningActive"
        class="crisis-frame crisis-frame--warning"
        aria-hidden="true"
      ></div>

      <Transition name="crisis-warning">
        <div
          v-if="crisisWarningActive"
          class="crisis-warning-bubble crisis-warning-bubble--danger"
          role="alert"
          aria-live="assertive"
        >
          [ WARN ] 算力集群即将失控
        </div>
      </Transition>

      <Transition name="qte-fade">
        <CrisisQte
          v-if="isCrisis"
          :alignment="crisisAlignment"
          :angle="crisisQteAngle"
          :safe="crisisQteSafe"
          :auto="crisisQteAuto"
          :charge-rate="crisisQteChargeRate"
          :drain-rate="crisisQteDrainRate"
          :rescue="crisisRescueActive"
          :rescue-forced="crisisRescueForced"
          :rescue-prompt="crisisRescuePrompt"
          :rescue-target="crisisRescueTarget"
          @nudge-start="handleCrisisNudgeStart"
          @nudge-end="handleCrisisNudgeEnd"
          @nudge="handleCrisisNudge"
        />
      </Transition>

      <Transition name="unlock-toast">
        <div
          v-if="unlockToast"
          :key="unlockToast.key"
          class="module-unlock-toast"
          role="status"
          aria-live="polite"
        >
          <div>
            <p class="module-unlock-toast__title">[ SYS ] 系统模块上线</p>
            <p class="module-unlock-toast__sub">{{ unlockToast.labels.join(' · ') }} 解密完成</p>
          </div>
        </div>
      </Transition>

      <p v-if="idleHintVisible && !isCrisis" class="idle-hint" aria-live="polite">
        算力自动累积 // <strong>{{ formatNumber(cps).text }}</strong> CU/S
      </p>

      <Transition name="crisis-toast">
        <div
          v-if="winNoticeVisible"
          class="crisis-toast"
          role="status"
          aria-live="polite"
        >
          负载平衡完成 // 调度权收回 全局算力产出永久 +50%
        </div>
      </Transition>

      <Transition name="crisis-toast">
        <div
          v-if="mainQuestNotice"
          :key="mainQuestNotice.key"
          class="main-quest-toast"
          role="status"
          aria-live="polite"
        >
          <span class="main-quest-toast__tag">主线</span>
          <span>
            {{ mainQuestNotice.title }} 完成
            <span class="opacity-70">//</span>
            {{
              mainQuestNotice.allComplete
                ? '全部主线引导完成'
                : '引导进度推进'
            }}
          </span>
        </div>
      </Transition>

      <Transition name="crisis-toast">
        <div
          v-if="ascensionNotice"
          class="dimension-toast"
          :class="`asc-tone-${ascensionNotice.tone || 'gold'}`"
          role="status"
          aria-live="polite"
        >
          <span class="dimension-toast__tag">
            <template v-if="ascensionNotice.tier === 'challenge-start'">挑战</template>
            <template v-else-if="ascensionNotice.tier === 'challenge-exit'">结算</template>
            <template v-else-if="ascensionNotice.tier === 'restart'">纪元</template>
            <template v-else-if="ascensionNotice.tier === 'collapse'">坍缩</template>
            <template v-else>超载</template>
          </span>
          <span v-if="ascensionNotice.tier === 'challenge-start'">
            异常挑战启动 // <strong>{{ ascensionNotice.name }}</strong>
            <span class="opacity-70">限制协议生效</span>
          </span>
          <span v-else-if="ascensionNotice.tier === 'challenge-exit'">
            {{ ascensionNotice.resourceName }} // <strong>{{ ascensionNotice.name }}</strong>
            <span v-if="ascensionNotice.rewardLabel" class="opacity-70">
              · {{ ascensionNotice.rewardLabel }}
            </span>
          </span>
          <span v-else>
            {{ ascensionNotice.name }} 完成 // <strong>+{{ formatNumber(ascensionNotice.gain).text }}</strong>
            {{ ascensionNotice.resourceName }}
            <span class="opacity-70">
              · 累计 {{ formatNumber(ascensionNotice.total).text }}
              <template v-if="ascensionNotice.tier === 'restart'">
                · 第 {{ ascensionNotice.epoch }} 次重启
              </template>
            </span>
          </span>
        </div>
      </Transition>

      <Transition name="offline-toast">
        <div v-if="offlineGainNotice" class="offline-toast" role="status" aria-live="polite">
          <div class="min-w-0 flex-1">
            <p class="offline-toast__tag">
              离线结算 //
              {{ offlineGainNotice.boosted ? '分布式容灾 ×2' : '基础离线收益 50%' }}
            </p>
            <p class="offline-toast__text">
              离线 {{ offlineDurationLabel }} 结算
              <strong>+{{ formatNumber(offlineGainNotice.amount).text }} CU</strong>
            </p>
          </div>
          <button
            type="button"
            class="offline-toast__close"
            aria-label="关闭离线收益提示"
            @click="dismissOfflineGain"
          >
            ×
          </button>
        </div>
      </Transition>

      <Transition name="qte-fail">
        <CrisisFailureOverlay v-if="failureOverlayVisible" />
      </Transition>

      <Transition name="radar-alert">
        <button
          v-if="radarBurstActive && !radarCollectionComplete && !radarOpen"
          type="button"
          class="radar-burst-alert"
          @click="openRadar"
        >
          <span class="radar-burst-alert__scan" aria-hidden="true"></span>
          <span class="radar-burst-alert__copy">
            <span class="radar-burst-alert__title">
              [ 突发异常 ] 侦测到高维算力节点 立即接入雷达
            </span>
            <span class="radar-burst-alert__meta">
              紧急捕获窗口剩余 {{ radarBurstCountdownLabel }} // 点击接入雷达
            </span>
          </span>
        </button>
      </Transition>

      <Transition name="asc-complete">
        <div
          v-if="ascensionComplete"
          :key="ascensionComplete.key"
          class="ascension-complete-banner"
          role="status"
          aria-live="polite"
        >
          [ {{ ascensionComplete.name }} ] 重构完成
        </div>
      </Transition>

      <div
        v-if="ascensionFx && !reducedMotion"
        :key="ascensionFx.key"
        class="asc-fx"
        :class="`asc-fx--${ascensionFx.tier}`"
        aria-hidden="true"
      ></div>

      <Transition name="radar-panel">
        <RadarPanel v-if="radarOpen" @close="radarOpen = false" />
      </Transition>

      <Transition name="ascension-hub">
        <AscensionHub
          v-if="ascensionOpen"
          v-model:tab="activeHubTab"
          :initial-tab="hubInitialTab"
          @close="ascensionOpen = false"
          @open-origin="openOriginTree"
        />
      </Transition>

      <Transition name="origin-tree">
        <OriginTree v-if="originTreeOpen" @close="originTreeOpen = false" />
      </Transition>

      <Transition name="cyber-matrix">
        <CyberMatrix v-if="cyberMatrixOpen" @close="cyberMatrixOpen = false" />
      </Transition>

      <Transition name="epoch-rebirth">
        <EpochRebirthOverlay
          v-if="epochRebirth"
          :first-run="epochRebirth.firstRun"
          :era-count="epochRebirth.eraCount"
          :memoir-stats="epochMemoirStats"
          @complete="completeEpochRebirth"
          @skip="completeEpochRebirth"
        />
      </Transition>

      <AscensionCinematicOverlay
        v-if="ascensionCinematic"
        :key="ascensionCinematic.key"
        :tier="ascensionCinematic.tier"
        :reduced="ascensionCinematic.reduced"
        @complete="completeAscensionCinematic"
      />
    </Teleport>
  </div>

  <AdminConsole
    :total-nodes="totalNodes"
    :core-source="coreSource"
    :overclock-cores="overclockCores"
    :root-access="rootAccess"
    :origin-code="originCode"
    :auto-buy="autoBuyNodeActive"
    :is-crisis="isCrisis"
    :black-domain-active="blackDomainActive"
    :guides-enabled="guidesEnabled"
    :compute-injection="adminComputeInjectionAmount"
    @inject-compute="adminInjectCompute"
    @inject-core="adminInjectCoreSource"
    @inject-overclock="adminInjectOverclockCores"
    @inject-root="adminInjectRootAccess"
    @inject-origin="adminInjectOriginCode"
    @unlock-all="adminUnlockAllSystems"
    @start-crisis="startCrisis"
    @skip-crisis="adminSkipCrisis"
    @exit-blackdomain="handleAdminExitBlackDomain"
    @toggle-guides="handleToggleGuides"
    @wipe-save="adminWipeSave"
  />

  <AchievementPanel
    :open="achievementOpen"
    :tiers="achievementTiers"
    :unlocked-count="achievementsUnlockedCount"
    :total-count="achievementsTotalCount"
    @close="achievementOpen = false"
  />

  <SettingsPanel
    :open="settingsOpen"
    @close="settingsOpen = false"
    @open-about="handleOpenAbout"
  />

  <Transition name="speedrun-confirm">
    <div
      v-if="speedrunConfirmOpen"
      class="speedrun-confirm-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="speedrun-confirm-title"
      @click.self="speedrunConfirmOpen = false"
      @keydown.esc="speedrunConfirmOpen = false"
    >
      <section class="speedrun-confirm">
        <span class="speedrun-confirm__scan" aria-hidden="true"></span>
        <div class="speedrun-confirm__body">
          <header class="speedrun-confirm__head">
            <span class="speedrun-confirm__warn" aria-hidden="true">
              <GameIcon name="jailbreak" :size="20" />
            </span>
            <div class="min-w-0">
              <p class="speedrun-confirm__tag">SPEEDRUN PROTOCOL</p>
              <h2 id="speedrun-confirm-title" class="speedrun-confirm__title">
                [ 警告 ] 启动极速体验协议
              </h2>
            </div>
          </header>
          <p class="speedrun-confirm__text">
            当前操作将清空常规存档，并为您加载 30
            分钟的完整游戏体验流程（包含四阶跃迁与终局彩蛋）。您确定要开启吗？
          </p>
          <div class="speedrun-confirm__params" role="list" aria-label="协议生效参数">
            <p class="speedrun-confirm__params-head">// 协议生效参数 | EFFECT PARAMS</p>
            <ul class="speedrun-confirm__param-list">
              <li
                v-for="param in speedrunConfirmParams"
                :key="param.tag"
                class="speedrun-confirm__param"
              >
                <span class="speedrun-confirm__param-tag" aria-hidden="true">{{ param.tag }}</span>
                <span class="speedrun-confirm__param-text">{{ param.text }}</span>
                <span class="speedrun-confirm__param-mark" aria-hidden="true">[ON]</span>
              </li>
            </ul>
          </div>
          <div class="speedrun-confirm__actions">
            <button
              type="button"
              class="speedrun-confirm__btn speedrun-confirm__btn--primary"
              @click="confirmSpeedrunStart"
            >
              确认启动
            </button>
            <button
              ref="speedrunConfirmCancelEl"
              type="button"
              class="speedrun-confirm__btn"
              @click="speedrunConfirmOpen = false"
            >
              取消
            </button>
          </div>
          <p class="speedrun-confirm__foot">开启会备份当前存档并清空进度 | 退出后自动还原</p>
        </div>
      </section>
    </div>
  </Transition>

  <SystemInfoPanel
    :open="infoOpen"
    :anchor="infoToggleEl"
    @close="closeInfoPanel"
  />

  <AchievementToast
    :toasts="achievementToasts"
    @dismiss-all="dismissAllAchievementToasts"
  />

  <Transition name="milestone-gold">
    <GlobalMilestoneToast :toast="globalMilestoneToast" />
  </Transition>
</template>
