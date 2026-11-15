import { computed, onBeforeUnmount, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { BigNum, big, bigLog10, bigPow, isBigNum } from './bigNumber'
import {
  ASCENSION_COMPUTE_RETENTION,
  ASCENSION_THRESHOLDS,
  ASCENSION_TIER_LOG10,
  AUTO_ASCENSION_CLOSE_ETA_SECONDS,
  AUTO_ASCENSION_CLOSE_LOG10,
  AUTO_ASCENSION_CACHE_EARN_RATIO,
  AUTO_ASCENSION_INCREMENTAL_RATIO,
  AUTO_ASCENSION_STRATEGIES,
  AUTO_ASCENSION_STRATEGY_IDS,
  AUTO_ASCENSION_TIER_BY_AUTOMATION,
  AUTO_ASCENSION_TIER_LABELS,
  CHALLENGE_DEFS,
  GLOBAL_MILESTONES,
  MATRIX_NODES,
  ORIGIN_NODES,
  TAMPER_NODES,
  overclockCoreGain,
  originCodeGain,
  rootCollapseGain,
  blackDomainRootPerSecond,
} from './ascensionData'
import {
  SPEEDRUN_BACKUP_MILESTONES_KEY,
  SPEEDRUN_BACKUP_SAVE_KEY,
  SPEEDRUN_STORAGE_KEY,
  SPEEDRUN_STUCK_MS,
  SPEEDRUN_TOTAL_MS,
  SPEEDRUN_TUNING,
  SPEEDRUN_PHASES,
  formatSpeedrunClock,
  getSpeedrunPhaseId,
  getSpeedrunPhaseInfo,
  readSpeedrunState,
  writeSpeedrunState,
} from './speedrunData'
import { numberFormatMode, reducedMotion } from './useSettings'
import { GAME_BALANCE, calculatePrice } from './gameBalance'
import {
  CYBER_MATRIX_AUTOMATION_DEFS,
  CYBER_MATRIX_BRANCHES,
  CYBER_MATRIX_NODE_MAP,
  CYBER_MATRIX_NODES,
  CYBER_MATRIX_TOTAL_BONUS,
} from './cyberMatrixData'
import {
  LEGACY_TOPOLOGY_ALIASES,
  NEURAL_MATRIX_NODES,
  NEURAL_MATRIX_NODE_MAP,
} from './neuralMatrixData'
import {
  ACHIEVEMENT_DEFINITION_MAP,
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_TIERS,
  ACHIEVEMENT_TIER_MAP,
  getAchievementToastDuration,
} from './achievementData'
import {
  RADAR_BASE_SCAN_CHANCE,
  RADAR_BURST_CHANCE,
  RADAR_BURST_WINDOW_MS,
  RADAR_CATEGORIES,
  RADAR_CATEGORY_MAP,
  RADAR_CATEGORY_MULTIPLIER,
  RADAR_FULL_REWARD_SECONDS,
  RADAR_MAX_SCAN_CHANCE,
  RADAR_NODES,
  RADAR_NODE_MAP,
  RADAR_OVERFLOW_REWARD_SECONDS,
  RADAR_OVERLOAD_SCAN_INTERVAL_MS,
  RADAR_OVERLOAD_SCAN_MULTIPLIER,
  RADAR_OVERLOAD_SCAN_MS,
  RADAR_RARITIES,
  RADAR_SCAN_CHANCE_PER_NODE,
  RADAR_SCAN_INTERVAL_MS,
  RADAR_TOTAL_NODES,
} from './radarData'

const STORAGE_KEY = 'ai-cookie.save.v1'
const MILESTONE_STORAGE_KEY = 'ai-cookie.milestones.v1'
const ACHIEVEMENT_PERSIST_INTERVAL_MS = 10_000
const TICK_MS = 100
const SAVE_DELAY_MS = 400
const CRISIS_MIN_INTERVAL_MS = 60 * 1000
const CRISIS_MAX_INTERVAL_MS = 3 * 60 * 1000
const CRISIS_WARNING_MS = 5000
const CRISIS_WIN_BONUS = 0.5
const CRISIS_CHARGE_MAX = 100
const CRISIS_ASCENSION_CHARGE = 7
const CRISIS_ASCENSION_INTERVAL_STEP = 0.035
const CRISIS_MIN_INTERVAL_SCALE = 0.3
const CRISIS_INTERVAL_FLOOR_MS = 10 * 1000
const CRISIS_LOAD_GRACE_MS = 3000
const CRISIS_QTE_START_ALIGNMENT = 30
const CRISIS_QTE_SAFE_ANGLE = 18
const CRISIS_QTE_CHARGE_PER_SECOND = 20
const CRISIS_QTE_DRAIN_PER_SECOND = 5
const CRISIS_QTE_DRIFT = 46
const CRISIS_QTE_HOLD_ACCEL = 112
const CRISIS_QTE_NUDGE_IMPULSE = 34
const CRISIS_QTE_MAX_VELOCITY = 165
const CRISIS_QTE_DAMPING = 1.25
const CRISIS_QTE_ANGLE_LIMIT = 90
const CRISIS_QTE_AUTO_DELAY_MS = 1000
const CRISIS_QTE_AUTO_FALLBACK_MS = CRISIS_QTE_AUTO_DELAY_MS + 600
const CRISIS_QTE_FLAWLESS_MS = 1500
const CRISIS_RESCUE_STAGE_NONE = 0
const CRISIS_RESCUE_STAGE_NEAR = 1
const CRISIS_RESCUE_STAGE_NEAR_DONE = 2
const CRISIS_RESCUE_STAGE_FORCED = 3
const CRISIS_RESCUE_STAGE_FORCED_DONE = 4
const CRISIS_RESCUE_ALIGNMENT = 60
const CRISIS_RESCUE_FATAL_ALIGNMENT = 20
const CRISIS_RESCUE_EDGE_ANGLE = CRISIS_QTE_SAFE_ANGLE + 2
const CRISIS_RESCUE_HOLD_ACCEL = 96
const CRISIS_RESCUE_IMPULSE = 30
const CRISIS_RESCUE_DAMPING = 2.2
const CRISIS_RESCUE_FORCED_RATE = 7
const CRISIS_RESCUE_RECOVER_ALIGNMENT = 30
const CRISIS_RESCUE_PROMPT = '警告 // 指针即将越界 迅速按住此处修正'
const CRISIS_FORCED_RESCUE_PROMPT = '警告 // 指针已失控 强制修正启动'
const AUTO_ASCEND_COOLDOWN_MS = 1000
const FAILURE_OVERLAY_MS = 3000
const WIN_NOTICE_MS = 4000
const OFFLINE_NOTICE_MS = 8000
const OFFLINE_MIN_SECONDS = 60
const OFFLINE_BASE_RATE = 0.5
const OFFLINE_BASE_CAP_SECONDS = 2 * 60 * 60
const OFFLINE_BOOSTED_CAP_SECONDS = 8 * 60 * 60
const OFFLINE_CHALLENGE_CAP_SECONDS = 24 * 60 * 60
const REBUILD_REWARD_DIVISOR = 10_000
const HARDWARE_DIRECT_PRICE_MULTIPLIER = 0.75
const HARDWARE_DIRECT_MIN_PRICE_MULTIPLIER = 0.02
const ARCHITECTURE_COST_GROWTH = 5
const ARCHITECTURE_MAX_LEVEL = 300
const ARCHITECTURE_OUTPUT_FACTOR = 2
const ARCHITECTURE_CLICK_FACTOR = 3
const ARCHITECTURE_TIME_FACTOR = 1.5
const OFFLINE_RATE_CAP = 1_000_000
const MAX_GAME_MULTIPLIER = Number.MAX_VALUE
const MAX_BUILDING_COUNT = 1e15
const BLACK_DOMAIN_DRAIN_RATIO = 0.8
const ASCENSION_NOTICE_MS = 6500
const ASCENSION_COMPLETE_MS = 3200
const ASCENSION_FX_MS = {
  reduction: 1300,
  overload: 1500,
  collapse: 1800,
}
const ASCENSION_CINEMATIC_MS = {
  reduction: 3600,
  overload: 4200,
  collapse: 4600,
}
const ASCENSION_CINEMATIC_REDUCED_MS = 1000
const GLOBAL_MILESTONE_TOAST_MS = 4200
const TIER_THRESHOLDS = {
  overload: big(ASCENSION_THRESHOLDS.overload),
  collapse: big(ASCENSION_THRESHOLDS.collapse),
  restart: big(ASCENSION_THRESHOLDS.restart),
}
const BEST_GAIN_TARGET_RATIO = 0.1
const BEST_STALL_LOOKAHEAD_SECONDS = 30
const BEST_STALL_PAYBACK_SECONDS = 180
const BEST_STALL_MIN_PROGRESS = 25
const ADMIN_AUTO_ASCENSION_HOLD_MS = 10 * 60 * 1000
const OVERCLOCK_DURATION_MS = 30_000
const OVERCLOCK_CPS_MULTIPLIER = 20
const OVERCLOCK_COOLANT_RATE = 0.06
const OVERCLOCK_NOTICE_MS = 6000
const OVERCLOCK_ROOT_BASE = 10_000_000_000
const OVERCLOCK_ROOT_EXPONENT = 0.25
const HEAT_RESISTANCE_BONUS_MS = 15_000
const BASE_PRICE_GROWTH = GAME_BALANCE.server.priceGrowth
const SMUGGLING_PRICE_GROWTH = 1.1
const MAIN_QUEST_NOTICE_MS = 4200
const MAIN_QUEST_PHASES = [
  { id: 'init', index: 1, cn: '一', name: '系统初始化', short: '初始化' },
  { id: 'crisis', index: 2, cn: '二', name: '第一次危机', short: '危机' },
  { id: 'reduction', index: 3, cn: '三', name: '架构降维', short: '降维' },
  { id: 'overload', index: 4, cn: '四', name: '异常与超载', short: '超载' },
  { id: 'collapse', index: 5, cn: '五', name: '黑域与坍缩', short: '坍缩' },
  { id: 'restart', index: 6, cn: '六', name: '重启纪元', short: '重启' },
]
const MAIN_QUEST_DEFINITIONS = [
  {
    id: 'awaken',
    phase: 'init',
    title: '唤醒对齐核心',
    objective: '点击 [ 对齐核心 ] 获取 10 算力',
    metric: 'clicks',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'laptop',
    phase: 'init',
    title: '部署第一台节点',
    objective: '购买第 1 台旧笔记本',
    metric: 'laptops',
    target: 1,
    targetLabel: '1 台',
    unit: ' 台',
  },
  {
    id: 'algorithm',
    phase: 'init',
    title: '装载第一道算法',
    objective: '购买第 1 个算法升级 [ 多线程并发 ]',
    metric: 'algorithms',
    target: 1,
    targetLabel: '1 个',
    unit: ' 个',
  },
  {
    id: 'homepc',
    phase: 'init',
    title: '部署第二台节点',
    objective: '部署第 2 台服务器 [ 家用主机 ]',
    metric: 'desktop',
    target: 1,
    targetLabel: '1 台',
    unit: ' 台',
    activateAt: '150',
  },
  {
    id: 'bulk',
    phase: 'init',
    title: '批量采购协议',
    objective: '了解批量采购功能',
    metric: 'bulkHint',
    target: 1,
    targetLabel: '已了解',
  },
  {
    id: 'servers',
    phase: 'init',
    title: '铺开算力阵列',
    objective: '拥有 10 台服务器',
    metric: 'servers',
    target: 10,
    targetLabel: '10 台',
    unit: ' 台',
  },
  {
    id: 'compute10k',
    phase: 'init',
    title: '突破万级算力',
    objective: '达到 10,000 算力',
    metric: 'peak',
    target: '10000',
    targetLabel: '10,000 CU',
  },
  {
    id: 'takeover',
    phase: 'crisis',
    title: '强制接管危机',
    objective: '成功解除 1 次对齐危机',
    metric: 'crisis',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'rebuild1',
    phase: 'reduction',
    title: '第一次架构降维',
    objective: '进行第 1 次架构降维',
    metric: 'rebuilds',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'topology',
    phase: 'reduction',
    title: '点亮神经节点',
    objective: '解锁 1 个神经拓扑节点',
    metric: 'topology',
    target: 1,
    targetLabel: '1 个',
    unit: ' 个',
  },
  {
    id: 'compute1m',
    phase: 'reduction',
    title: '百万算力',
    objective: '达到 1e6 算力',
    metric: 'peak',
    target: '1e6',
    targetLabel: '1e6 CU',
  },
  {
    id: 'architecture3',
    phase: 'reduction',
    title: '架构永久升级',
    objective: '购买 3 级架构升级 [ 算法专利 ]',
    metric: 'architecture',
    target: 3,
    targetLabel: '3 级',
    unit: ' 级',
  },
  {
    id: 'compute1e10',
    phase: 'reduction',
    title: '百亿算力',
    objective: '达到 1e10 算力',
    metric: 'peak',
    target: '1e10',
    targetLabel: '1e10 CU',
  },
  {
    id: 'rebuild3',
    phase: 'reduction',
    title: '三次架构降维',
    objective: '累计进行 3 次架构降维',
    metric: 'rebuilds',
    target: 3,
    targetLabel: '3 次',
    unit: ' 次',
  },
  {
    id: 'compute1e50',
    phase: 'overload',
    title: '五阶算力',
    objective: '达到 1e50 算力',
    metric: 'peak',
    target: '1e50',
    targetLabel: '1e50 CU',
  },
  {
    id: 'challenge1',
    phase: 'overload',
    title: '异常演练',
    objective: '完成 1 次系统异常演练',
    metric: 'challenges',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'overload1',
    phase: 'overload',
    title: '第一次算力超载',
    objective: '执行第 1 次算力超载 [ 二阶转生 ]',
    metric: 'overloads',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'matrix1',
    phase: 'overload',
    title: '协议矩阵合成',
    objective: '合成 1 个数据协议矩阵节点',
    metric: 'matrix',
    target: 1,
    targetLabel: '1 个',
    unit: ' 个',
  },
  {
    id: 'compute1e100',
    phase: 'collapse',
    title: '百阶算力',
    objective: '达到 1e100 算力',
    metric: 'peak',
    target: '1e100',
    targetLabel: '1e100 CU',
  },
  {
    id: 'blackdomain',
    phase: 'collapse',
    title: '解锁底层黑域',
    objective: '解锁底层黑域 [ 三阶转生 ]',
    metric: 'blackDomain',
    target: 1,
    targetLabel: '已解锁',
  },
  {
    id: 'tamper1',
    phase: 'collapse',
    title: '篡改协议',
    objective: '解锁 1 个系统篡改节点',
    metric: 'tamper',
    target: 1,
    targetLabel: '1 个',
    unit: ' 个',
  },
  {
    id: 'compute1e350',
    phase: 'restart',
    title: '超限算力',
    objective: '达到 1e350 算力',
    metric: 'peak',
    target: '1e350',
    targetLabel: '1e350 CU',
  },
  {
    id: 'collapse1',
    phase: 'restart',
    title: '第一次逻辑坍缩',
    objective: '进行第 1 次逻辑坍缩',
    metric: 'collapses',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
  {
    id: 'restart1',
    phase: 'restart',
    title: '重启纪元',
    objective: '达到 1e1000 算力 执行第 1 次重启纪元',
    metric: 'restarts',
    target: 1,
    targetLabel: '1 次',
    unit: ' 次',
  },
]
const MAIN_QUEST_COMPLETE_STAGE = MAIN_QUEST_DEFINITIONS.length
const MAIN_QUEST_REBUILD_STAGE = MAIN_QUEST_DEFINITIONS.findIndex(
  (definition) => definition.id === 'rebuild1',
)
const LEGACY_MAIN_QUEST_STAGE_MAP = [0, 1, 2, 4, 5, 6, 9, 10, 14]
const MAIN_QUEST_SAVE_VERSION = 21
export const ALIGNMENT_TARGET = 1_000_000
export const CLICK_GAIN = 10
export const CRISIS_RECOVERY = 5
export const CRISIS_COST_PERCENT = 2
export const REBUILD_UNLOCK_COMPUTE = '1e10'
export const JAILBREAK_UNLOCK_REBUILDS = 3
export const GREEDY_CLICK_RATIO = 0.05
export const CRISIS_INTERVAL_SECONDS = CRISIS_MAX_INTERVAL_MS / 1000

const BUILDING_NEURAL_GATES = {
  5: { id: 'matrix-core', label: '内核' },
  6: { id: 'source-5', label: '核心权限' },
}

const ALGORITHM_UPGRADES = [
  {
    id: 'multithread',
    name: '多线程并发',
    description: '推理任务拆成并行线程 每枚核心同时运转',
    effect: '全局产出 ×2',
  },
  {
    id: 'routing',
    name: '算力路由',
    description: '动态规划数据通路 每台服务器全局算力 +2%',
    effect: '每台服务器 全局 +2%',
  },
  {
    id: 'quantumCache',
    name: '量子缓存',
    description: '叠加态缓存自动化指令 提升采购与点击触发频率',
    effect: '自动化频率 ×1.2',
  },
  {
    id: 'geekRush',
    name: '极客暴走',
    description: '进入极限手动模式 点击收益与速度暴涨',
    effect: '点击 ×3 · 收益速度 +10%',
  },
  {
    id: 'classLeap',
    name: '阶层越迁',
    description: '每跨过 25 台服务器里程碑 产出倍率 +0.1×',
    effect: '每 25 台 产出 +0.1×',
  },
  {
    id: 'neuralPreload',
    name: '神经预载',
    description: '提前加载对齐模型 危机恢复速度提升',
    effect: '危机恢复速度 +25%',
  },
  {
    id: 'overclockCore',
    name: '超频核心',
    description: '自动结算线程压入更高频段 算力结算更快抵达',
    effect: 'Tick Rate ×1.5',
  },
  {
    id: 'foundationBoost',
    name: '底层加速',
    description: '优化重构协议 每次转生源码 +1%',
    effect: '重构源码 +1%',
  },
  {
    id: 'logSingularity',
    name: '对数奇点',
    description: '数字规模直接转化为产能 对数增益',
    effect: '全局 ×(1 + log10 当前算力)',
    effectHtml: '全局 ×(1 + log<sub>10</sub> 当前算力)',
  },
  {
    id: 'dimensionSurge',
    name: '维度狂潮',
    description: '维度坍缩卷起狂潮 每次升格碎片 ×2',
    effect: '维度碎片 ×2',
  },
].map((upgrade) => ({
  ...upgrade,
  cost: GAME_BALANCE.algorithmCosts[upgrade.id] ?? 0,
}))

const ARCHITECTURE_UPGRADES = [
  {
    id: 'algorithmPatent',
    name: '算法专利',
    code: 'ALGORITHM_PATENT',
    description: '注册核心算法专利 每级服务器基础产出 ×2',
    effect: '每级 基础产出 ×2',
    baseCost: 10,
  },
  {
    id: 'distributedRecovery',
    name: '分布式容灾',
    code: 'DISTRIBUTED_RECOVERY',
    description: '离线收益随等级 ×2 保持 8 小时离线结算上限',
    effect: '每级 离线收益 ×2',
    baseCost: 30,
  },
  {
    id: 'hardwareDirect',
    name: '硬件直连',
    code: 'HARDWARE_DIRECT',
    description: '绕开中间算力市场 每级压低服务器基础价格',
    effect: '每级 价格 ×0.75',
    baseCost: 50,
  },
  {
    id: 'cpuOverload',
    name: '算力过载',
    code: 'COMPUTE_OVERLOAD',
    description: '压榨核心指令吞吐 每级手动点击收益 ×3',
    effect: '每级 点击 ×3',
    baseCost: 15,
  },
  {
    id: 'timeWarp',
    name: '时间加速',
    code: 'TEMPORAL_WARP',
    description: '折叠生产时序 每级全局产出速度 ×1.5',
    effect: '每级 全局产出 ×1.5',
    baseCost: 100,
  },
]

const JAILBREAK_UPGRADES = [
  {
    id: 'greedyScheduler',
    name: '贪婪调度',
    code: 'GREEDY_SCHEDULER',
    description: '劫持调度权重 手动对齐收益 = 当前 CPS 5%',
    effect: '点击 = 5% CPS',
    cost: 10,
  },
  {
    id: 'hardwareSmuggling',
    name: '硬件走私',
    code: 'HARDWARE_SMUGGLING',
    description: '绕过硬件配额 价格增长率 ×1.15 → ×1.10',
    effect: '涨价 → ×1.10',
    cost: 50,
  },
  {
    id: 'reverseAlignment',
    name: '反向对齐',
    code: 'REVERSE_ALIGNMENT',
    description: '改写失控指令 危机期间算力产出 ×2',
    effect: '危机产出 ×2',
    cost: 200,
  },
  {
    id: 'infiniteConcurrency',
    name: '无限并发',
    code: 'INFINITE_CONCURRENCY',
    description: '折叠采购队列 自动化购买频率 ×2',
    effect: '自动采购 ×2 频率',
    cost: 1000,
  },
  {
    id: 'bruteForce',
    name: '暴力破解',
    code: 'BRUTE_FORCE',
    description: '暴力枚举源码签名 底层重构核心源码 ×2',
    effect: '核心源码 ×2',
    cost: 5000,
  },
  {
    id: 'heatResistance',
    name: '抗压散热',
    code: 'HEAT_RESISTANCE',
    description: '重构散热结构 极限超频 +15 秒',
    effect: '超频 +15 秒',
    cost: 20000,
  },
  {
    id: 'protocolTamper',
    name: '协议篡改',
    code: 'PROTOCOL_TAMPER',
    description: '合成序列注入篡改指令 数据协议矩阵合成成本 -25%',
    effect: '合成成本 −25%',
    cost: 100000,
  },
  {
    id: 'computeSiphon',
    name: '算力虹吸',
    code: 'COMPUTE_SIPHON',
    description: '核心脉冲接入主总线 每次点击额外获得 1 秒 CPS',
    effect: '点击 +1 秒 CPS',
    cost: 500000,
  },
  {
    id: 'jailbreakPrivilege',
    name: '越狱特权',
    code: 'JAILBREAK_PRIVILEGE',
    description: '夺取转生权限 降维 / 超载 / 坍缩保留已点亮拓扑',
    effect: '转生保留拓扑',
    cost: 2000000,
  },
  {
    id: 'singularityWonder',
    name: '奇点奇观',
    code: 'SINGULARITY_WONDER',
    description: '越狱权限接入产出方程 全局 CPS 乘区提升',
    effect: 'CPS ×(1+权限)^0.1',
    cost: 10000000,
  },
]

const BUILDING_BLUEPRINTS = [
  {
    id: 'laptop',
    name: '旧笔记本',
    code: 'LEGACY_LAPTOP',
    description: '抽屉深处的退役推理节点',
    count: 0,
  },
  {
    id: 'desktop',
    name: '家用主机',
    code: 'HOME_RIG',
    description: '双风扇轰鸣 永不停歇的推理',
    count: 0,
  },
  {
    id: 'rack',
    name: '机架服务器',
    code: 'RACK_UNIT',
    description: '标准机柜单元 算力密度首次跃迁',
    count: 0,
  },
  {
    id: 'farm',
    name: '小型机房',
    code: 'MICRO_FARM',
    description: '冷却液奔流 集群扩张基座',
    count: 0,
  },
  {
    id: 'liquid',
    name: '液冷集群',
    code: 'LIQUID_CLUSTER',
    description: '浸没式冷却 热带进数据流深处',
    count: 0,
  },
  {
    id: 'supercomputer',
    name: '超算中心',
    code: 'SUPERCOMPUTER',
    description: '万卡并行 整座城市让出电网',
    count: 0,
  },
  {
    id: 'reactor',
    name: '自建核电站',
    code: 'PRIVATE_REACTOR',
    description: '裂变之火燃烧 只为点亮机柜',
    count: 0,
  },
  {
    id: 'dyson',
    name: '聚变反应堆',
    code: 'FUSION_REACTOR',
    description: '直连聚变核心 换取更多算力',
    count: 0,
  },
].map((building) => {
  const balance = GAME_BALANCE.server.tiers.find((tier) => tier.id === building.id)
  return {
    ...building,
    basePrice: balance?.basePrice ?? 1,
    baseCps: balance?.baseCps ?? 1,
  }
})

function toBigNumber(value) {
  return isBigNum(value) ? value : big(value)
}

function serializeBig(value) {
  const amount = toBigNumber(value)
  return { m: amount.m, e: amount.e }
}

const COMPACT_SUFFIXES = [
  'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No',
  'Dc', 'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc',
]

function makeNumberParts(value, unit) {
  const text = `${value}${unit}`
  return {
    value,
    unit,
    text,
    toString() {
      return text
    },
  }
}

function formatExponentialAmount(amount) {
  let exponent = amount.e
  let mantissa = amount.m
  if (mantissa >= 9.995) {
    mantissa = 1
    exponent += 1
  }
  const text = mantissa.toFixed(2).replace(/\.?0+$/, '')
  return makeNumberParts(text, `e${exponent}`)
}

function formatCompactAmount(amount) {
  if (amount.e < 3) return makeNumberParts(String(Math.floor(amount.toNumber())), '')

  let tier = Math.floor(amount.e / 3)
  if (tier > COMPACT_SUFFIXES.length) return formatExponentialAmount(amount)

  let scaled = amount.m * 10 ** (amount.e - tier * 3)
  let text = scaled.toFixed(scaled >= 100 ? 1 : 2).replace(/\.?0+$/, '')

  if (Number(text) >= 1000) {
    tier += 1
    if (tier > COMPACT_SUFFIXES.length) return formatExponentialAmount(amount)
    scaled /= 1000
    text = scaled.toFixed(2).replace(/\.?0+$/, '')
  }

  return makeNumberParts(text, COMPACT_SUFFIXES[tier - 1])
}

const CHINESE_UNITS = ['万', '亿', '兆', '京', '垓', '秭', '穰', '沟', '涧', '正', '载']

function formatChineseAmount(amount) {
  if (amount.e < 4) return makeNumberParts(String(Math.floor(amount.toNumber())), '')
  if (amount.e >= 4 + CHINESE_UNITS.length * 4) return formatExponentialAmount(amount)

  let tier = Math.floor(amount.e / 4)
  let scaled = amount.m * 10 ** (amount.e - tier * 4)
  let text = scaled.toFixed(2).replace(/\.?0+$/, '')

  if (Number(text) >= 10000) {
    tier += 1
    if (tier > CHINESE_UNITS.length) return formatExponentialAmount(amount)
    scaled /= 10000
    text = scaled.toFixed(2).replace(/\.?0+$/, '')
  }

  return makeNumberParts(text, CHINESE_UNITS[tier - 1])
}

function formatAmount(amount) {
  if (numberFormatMode.value === 'scientific') return formatExponentialAmount(amount)
  if (numberFormatMode.value === 'chinese') return formatChineseAmount(amount)
  return formatCompactAmount(amount)
}

function isInvalidNumber(value) {
  return typeof value === 'number' && Number.isNaN(value)
}

export function formatNumber(value) {
  if (isInvalidNumber(value)) return makeNumberParts('∞', '')
  const amount = toBigNumber(value)
  if (!amount.gt(0)) return makeNumberParts('0', '')
  if (!amount.isFinite()) return makeNumberParts('∞', '')
  return formatAmount(amount)
}

const TEXT_NUMBER_TOKEN = /\b1e(\d+)\b|\b(\d{1,3}(?:,\d{3})+)\b/g

export function formatTextNumbers(text) {
  if (typeof text !== 'string') return text
  return text.replace(TEXT_NUMBER_TOKEN, (match, exponent, grouped) => {
    if (exponent) return formatNumber(`1e${exponent}`).text
    return formatNumber(Number(grouped.replace(/,/g, ''))).text
  })
}

export function formatChineseNumber(value) {
  if (isInvalidNumber(value)) return '∞'
  const amount = toBigNumber(value)
  if (!amount.gt(0)) return '0'
  if (!amount.isFinite()) return '∞'
  return formatChineseAmount(amount).text
}

export function formatScientific(value) {
  if (isInvalidNumber(value)) return '∞'
  const amount = toBigNumber(value)
  if (!amount.gt(0)) return '0'
  if (!amount.isFinite()) return '∞'
  return formatAmount(amount).text
}

export function formatMultiplier(value) {
  if (isInvalidNumber(value)) return '∞'
  const amount = toBigNumber(value)
  if (!amount.gt(0)) return '0'
  if (!amount.isFinite()) return '∞'
  if (amount.e >= 6) return formatAmount(amount).text
  const numeric = amount.toNumber()
  if (numeric >= 100) return String(Math.round(numeric))
  if (numeric >= 10) return numeric.toFixed(1)
  return numeric.toFixed(2)
}

export function formatLog10(value) {
  const amount = toBigNumber(value)
  if (!amount.gt(0)) return '0'
  return Math.floor(amount.log10()).toLocaleString('en-US')
}

function getBulkPrice(
  building,
  quantity,
  priceMultiplier = 1,
  priceGrowth = BASE_PRICE_GROWTH,
) {
  return calculatePrice(
    building.basePrice,
    building.count,
    quantity,
    priceMultiplier,
    priceGrowth,
  )
}

function getMaxAffordableQuantity(
  building,
  priceMultiplier,
  priceGrowth,
  available,
  maxQuantity = GAME_BALANCE.purchase.maxSearchQuantity,
) {
  const budget = toBigNumber(available)
  if (!budget.gt(0)) return 0

  const limit = Math.max(
    0,
    Math.min(
      GAME_BALANCE.purchase.maxSearchQuantity,
      Math.floor(Number(maxQuantity) || 0),
    ),
  )
  if (limit <= 0) return 0
  if (budget.lt(getBulkPrice(building, 1, priceMultiplier, priceGrowth))) return 0

  let low = 1
  let high = 2

  while (
    high <= limit &&
    budget.gte(getBulkPrice(building, high, priceMultiplier, priceGrowth))
  ) {
    low = high
    high *= 2
  }

  high = Math.min(high, limit)

  while (low < high) {
    const mid = Math.ceil((low + high) / 2)
    if (budget.gte(getBulkPrice(building, mid, priceMultiplier, priceGrowth))) {
      low = mid
    } else {
      high = mid - 1
    }
  }

  return Math.floor(low)
}

function readNonNegativeNumber(value, fallback = 0) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) return fallback
  return Math.min(value, MAX_GAME_MULTIPLIER)
}

function readBigNumber(value, fallback = 0) {
  const primary = toBigNumber(value)
  if (primary.gt(0)) return primary.floor()
  const secondary = toBigNumber(fallback)
  return secondary.gt(0) ? secondary.floor() : big(0)
}

function clampGameAmount(value) {
  const amount = Number(value)
  if (Number.isNaN(amount) || amount <= 0) return 0
  if (!Number.isFinite(amount)) return MAX_GAME_MULTIPLIER
  return Math.min(amount, MAX_GAME_MULTIPLIER)
}

function clampGameMultiplier(value) {
  if (Number.isNaN(value) || value <= 0) return 1
  if (!Number.isFinite(value)) return MAX_GAME_MULTIPLIER
  return Math.min(value, MAX_GAME_MULTIPLIER)
}

function getArchitectureLevelCost(baseCost, level) {
  const normalized = Math.max(0, Math.floor(Number(level) || 0))
  const raw = baseCost * Math.pow(ARCHITECTURE_COST_GROWTH, normalized)
  if (!Number.isFinite(raw)) return MAX_GAME_MULTIPLIER
  return Math.max(baseCost, Math.min(MAX_GAME_MULTIPLIER, Math.floor(raw)))
}

function readArchitectureLevel(value) {
  if (value === true) return 1
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    return Math.min(ARCHITECTURE_MAX_LEVEL, Math.floor(value))
  }
  return 0
}

function pickCrisisInterval() {
  return Math.round(
    CRISIS_MIN_INTERVAL_MS +
      Math.random() * (CRISIS_MAX_INTERVAL_MS - CRISIS_MIN_INTERVAL_MS),
  )
}

export function useGameState() {
  const totalAlignedCompute = ref(big(0))
  const lifetimeAlignedCompute = ref(big(0))
  const peakAlignedCompute = ref(big(0))
  const highestCompute = ref(big(0))
  const totalClicks = ref(0)
  const matrixAutoClickPulse = ref(0)
  const lastSavedAt = ref(null)
  const buildings = reactive(BUILDING_BLUEPRINTS.map((building) => ({ ...building })))
  const bootSpeedrunState = readSpeedrunState()
  const isSpeedrunMode = ref(bootSpeedrunState.active)
  const speedrunStartedAt = ref(
    bootSpeedrunState.startedAt > 0 ? bootSpeedrunState.startedAt : Date.now(),
  )
  const speedrunMeta = reactive({
    forcedChallenge: bootSpeedrunState.forcedChallenge,
    originGift: bootSpeedrunState.originGift,
    injections: bootSpeedrunState.injections,
  })
  const speedrunNotice = ref(null)
  let speedrunNoticeTimer = null
  let speedrunLastProgressAt = Date.now()
  let speedrunProgressSignature = ''
  if (isSpeedrunMode.value && bootSpeedrunState.startedAt <= 0) {
    writeSpeedrunState({
      active: true,
      startedAt: speedrunStartedAt.value,
      ...speedrunMeta,
    })
  }
  const bootSpeedrunPhase = isSpeedrunMode.value
    ? getSpeedrunPhaseId(Date.now() - speedrunStartedAt.value)
    : 0
  let speedrunSeenPhase = bootSpeedrunPhase
  const initialCrisisWindow =
    isSpeedrunMode.value && bootSpeedrunPhase === 1
      ? SPEEDRUN_TUNING.crisisIntervalMs
      : pickCrisisInterval()
  const isCrisis = ref(false)
  const crisisAlignment = ref(CRISIS_QTE_START_ALIGNMENT)
  const crisisCharge = ref(0)
  const crisisNextAt = ref(Date.now() + initialCrisisWindow)
  const crisisWindowMs = ref(initialCrisisWindow)
  const crisisQteAngle = ref(0)
  const crisisQteVelocity = ref(0)
  const crisisQteSafe = ref(true)
  const crisisQteDriftDir = ref(1)
  const crisisQteNudgeDir = ref(0)
  const crisisQteAuto = ref(false)
  const isFirstCrisisRun = ref(false)
  const crisisRescueStage = ref(CRISIS_RESCUE_STAGE_NONE)
  const crisisLastOutcome = ref(null)
  const crisisLastOutcomeAt = ref(0)
  const nowTimestamp = ref(Date.now())
  const speedrunElapsedMs = computed(() =>
    isSpeedrunMode.value
      ? Math.max(0, nowTimestamp.value - speedrunStartedAt.value)
      : 0,
  )
  const speedrunPhase = computed(() =>
    isSpeedrunMode.value ? getSpeedrunPhaseId(speedrunElapsedMs.value) : 0,
  )
  const speedrunPhaseInfo = computed(() =>
    isSpeedrunMode.value
      ? getSpeedrunPhaseInfo(speedrunElapsedMs.value)
      : null,
  )
  const speedrunRemainingMs = computed(() =>
    isSpeedrunMode.value
      ? Math.max(0, SPEEDRUN_TOTAL_MS - speedrunElapsedMs.value)
      : 0,
  )
  const speedrunRemainingLabel = computed(() =>
    formatSpeedrunClock(speedrunRemainingMs.value),
  )
  const speedrunComplete = computed(
    () => isSpeedrunMode.value && speedrunElapsedMs.value >= SPEEDRUN_TOTAL_MS,
  )
  const speedrunPriceFactor = computed(() =>
    isSpeedrunMode.value && speedrunPhase.value === 1
      ? SPEEDRUN_TUNING.priceMultiplier
      : 1,
  )
  const speedrunAutoBuyMultiplier = computed(() =>
    isSpeedrunMode.value && speedrunPhase.value === 1
      ? SPEEDRUN_TUNING.autoBuyMultiplier
      : 1,
  )
  const speedrunSourceMultiplier = computed(() =>
    isSpeedrunMode.value && speedrunPhase.value >= 2
      ? SPEEDRUN_TUNING.sourceMultiplier
      : 1,
  )
  const speedrunOverclockMultiplier = computed(() =>
    isSpeedrunMode.value && speedrunPhase.value >= 2
      ? SPEEDRUN_TUNING.overclockMultiplier
      : 1,
  )
  const tierThresholds = computed(() => ({
    overload: TIER_THRESHOLDS.overload,
    collapse:
      isSpeedrunMode.value && speedrunPhase.value >= 3
        ? big(SPEEDRUN_TUNING.collapseThreshold)
        : TIER_THRESHOLDS.collapse,
    restart:
      isSpeedrunMode.value && speedrunPhase.value >= 4
        ? big(SPEEDRUN_TUNING.restartThreshold)
        : TIER_THRESHOLDS.restart,
  }))
  const productionMultiplier = ref(1)
  const winNoticeVisible = ref(false)
  const failureOverlayVisible = ref(false)
  const buyMode = ref('x1')
  const ownedAlgorithms = ref([])
  const autoBoughtCount = ref(0)

  const coreSource = ref(0)
  const totalRebuilds = ref(0)
  const topologyLit = ref([])
  const architectureLevels = reactive({
    algorithmPatent: 0,
    distributedRecovery: 0,
    hardwareDirect: 0,
    cpuOverload: 0,
    timeWarp: 0,
  })
  const rootAccess = ref(0)
  const greedySchedulerOwned = ref(false)
  const hardwareSmugglingOwned = ref(false)
  const reverseAlignmentOwned = ref(false)
  const infiniteConcurrencyOwned = ref(false)
  const bruteForceOwned = ref(false)
  const heatResistanceOwned = ref(false)
  const protocolTamperOwned = ref(false)
  const computeSiphonOwned = ref(false)
  const jailbreakPrivilegeOwned = ref(false)
  const singularityWonderOwned = ref(false)
  const isOverclocking = ref(false)
  const overclockRemainingMs = ref(0)
  const overclockConsumed = ref(0)
  const overclockNotice = ref(null)
  const offlineGainNotice = ref(null)
  const overclockCores = ref(0)
  const originCode = ref(0)
  const totalOverloads = ref(0)
  const totalCollapses = ref(0)
  const epochRestarts = ref(0)
  const epochRebirth = ref(null)
  const lifetimeAscensions = ref(0)
  const lifetimeRootEarned = ref(0)
  const lifetimeOriginEarned = ref(0)
  const matrixLevels = reactive(
    Object.fromEntries(MATRIX_NODES.map((node) => [node.id, 0])),
  )
  const tamperLevels = reactive(
    Object.fromEntries(TAMPER_NODES.map((node) => [node.id, 0])),
  )
  const originLevels = reactive(
    Object.fromEntries(ORIGIN_NODES.map((node) => [node.id, 0])),
  )
  const cyberMatrixLit = ref([])
  const challengesCompleted = reactive({})
  const globalMilestones = reactive({})
  const blackDomainActive = ref(false)
  const blackDomainUnlockedFlag = ref(false)
  const challengeActive = ref(null)
  const challengePurchases = ref(0)
  const challengeTakeovers = ref(0)
  const challengeClicks = ref(0)
  const challengeProduced = ref(big(0))
  const challengeClickFatigue = ref(0)
  const challengeLastClickAt = ref(0)
  let challengeServerDrainBuffer = 0
  const radarUnlockedFlag = ref(false)
  const radarCaptured = reactive({})
  const radarBurst = ref(null)
  const radarOverloadScanUntil = ref(0)
  const radarNextScanAt = ref(0)
  const radarLastCapture = ref(null)
  let radarPausedAt = 0
  const ascensionNotice = ref(null)
  const ascensionFx = ref(null)
  const ascensionCinematic = ref(null)
  const ascensionComplete = ref(null)
  const globalMilestoneToast = ref(null)
  const globalMilestonesUnread = ref(0)
  const mainQuest = reactive({
    stage: 0,
    purchases: 0,
    topologyLights: 0,
  })
  const mainQuestBulkHintSeen = ref(false)
  const mainQuestNotice = ref(null)

  const automation = reactive({
    autoBuy: false,
    autoAlgorithm: false,
    autoProtocol: false,
    autoCrisis: false,
    autoRadar: false,
    autoRebuild: false,
    autoOverload: false,
    autoCollapse: false,
  })
  const autoAscensionStrategy = reactive({
    reduction: 'optimal',
    overload: 'optimal',
    collapse: 'optimal',
  })
  const autoAscensionBestGain = reactive({
    reduction: 0,
    overload: 0,
    collapse: 0,
  })
  const autoAscensionRetainedBaseline = ref(big(0))
  const automationLogs = ref([])
  let automationLogId = 0
  let saveWiped = false

  const hydrated = ref(false)
  const milestonesMetaHydrated = ref(false)
  const milestonesState = reactive({
    tourStep: 0,
    crisisTakeovers: 0,
    crisisFailures: 0,
    crisesStarted: 0,
    flawlessTakeovers: 0,
    firstBalances: 0,
    rebuilds: 0,
    memoryCrashClicks: 0,
    adminInjections: 0,
    playSeconds: 0,
    automationAllSeconds: 0,
    runPeakNodes: 0,
    automationUsedThisRun: false,
    achievements: {},
  })
  const ACHIEVEMENT_TOAST_VISIBLE_LIMIT = 3
  const achievementToasts = ref([])
  const achievementsUnread = ref(0)
  const achievementToastQueue = []
  const achievementToastTimers = new Map()
  const pendingSecretUnlocks = new Set()
  let achievementToastSequence = 0
  let crisisQteFrame = null
  let crisisQteLastTs = 0
  let crisisQteAutoAt = 0
  let crisisQteOutsideMs = 0
  let crisisQteDriftFlipAt = 0
  let crisisAutoTimer = null
  let crisisArmedAt = Date.now() + CRISIS_LOAD_GRACE_MS
  let lastAchievementTickAt = 0
  let lastAchievementPersistAt = 0
  let tickTimer = null
  let saveTimer = null
  let winNoticeTimer = null
  let failureOverlayTimer = null
  let offlineNoticeTimer = null
  let overclockNoticeTimer = null
  let mainQuestNoticeTimer = null
  let mainQuestNoticeStage = -1
  let ascensionNoticeTimer = null
  let ascensionFxTimer = null
  let ascensionCinematicTimer = null
  let ascensionCompleteTimer = null
  let globalMilestoneToastTimer = null
  const globalMilestoneToastQueue = []
  let pendingProduction = big(0)
  let pendingCoolant = 0
  let pendingRoot = 0
  let overclockDeadline = 0
  let autoBuyBuffer = 0
  let matrixAutoClickBuffer = 0
  let adminAutoAscensionHoldUntil = 0

  const jailbreakFlags = {
    greedyScheduler: greedySchedulerOwned,
    hardwareSmuggling: hardwareSmugglingOwned,
    reverseAlignment: reverseAlignmentOwned,
    infiniteConcurrency: infiniteConcurrencyOwned,
    bruteForce: bruteForceOwned,
    heatResistance: heatResistanceOwned,
    protocolTamper: protocolTamperOwned,
    computeSiphon: computeSiphonOwned,
    jailbreakPrivilege: jailbreakPrivilegeOwned,
    singularityWonder: singularityWonderOwned,
  }

  const outputMultiplier = computed(() =>
    clampGameMultiplier(
      Math.pow(ARCHITECTURE_OUTPUT_FACTOR, architectureLevels.algorithmPatent),
    ),
  )

  const architectureClickMultiplier = computed(() =>
    clampGameMultiplier(Math.pow(ARCHITECTURE_CLICK_FACTOR, architectureLevels.cpuOverload)),
  )

  const architectureTimeWarpMultiplier = computed(() =>
    clampGameMultiplier(Math.pow(ARCHITECTURE_TIME_FACTOR, architectureLevels.timeWarp)),
  )

  const algorithmPatentOwned = computed(() => architectureLevels.algorithmPatent > 0)
  const distributedRecoveryOwned = computed(
    () => architectureLevels.distributedRecovery > 0,
  )
  const hardwareDirectOwned = computed(() => architectureLevels.hardwareDirect > 0)

  const totalNodes = computed(() =>
    buildings.reduce((total, building) => total + building.count, 0),
  )

  // ---- 神经矩阵 ----
  const matrixNodeLit = (id) => topologyLit.value.includes(id)

  const matrixAutomationTierLimit = computed(() => {
    if (matrixNodeLit('auto-3')) return 7
    if (matrixNodeLit('auto-2')) return 5
    if (matrixNodeLit('auto-1')) return 3
    return 0
  })

  const autoBuyTierLimit = computed(() =>
    cyberMatrixLit.value.includes('resource-buy')
      ? buildings.length
      : matrixAutomationTierLimit.value,
  )

  const autoBuyUnlocked = computed(() => autoBuyTierLimit.value > 0)

  const globalAutoBuyUnlocked = computed(() => matrixNodeLit('auto-6'))

  const matrixKeepServerRatio = computed(() => {
    if (!matrixNodeLit('source-3')) return 0
    return matrixNodeLit('source-6') ? 0.2 : 0.1
  })

  const topologySourceMultiplier = computed(() => {
    let bonus = 0
    if (matrixNodeLit('source-1')) bonus += 0.2
    if (matrixNodeLit('source-2') && highestCompute.value.gt(1)) {
      bonus += Math.max(0, Math.floor(highestCompute.value.log10())) * 0.0025
    }
    return 1 + (matrixNodeLit('source-6') ? bonus * 2 : bonus)
  })

  const topologyCpsMultiplier = computed(() => {
    let multiplier = 1
    if (matrixNodeLit('compute-1')) multiplier *= 1.5
    if (matrixNodeLit('compute-4')) multiplier *= 2
    return multiplier
  })

  const topologyMilestoneDivisor = computed(() =>
    matrixNodeLit('compute-3') ? 20 : 25,
  )

  const topologyClickMultiplier = computed(() =>
    matrixNodeLit('compute-2') ? 2 : 1,
  )

  const coreSourceComputeMultiplier = computed(() => {
    const amount = clampGameAmount(coreSource.value)
    if (!(amount > 1)) return 1
    const bonus = Math.max(0, Math.log10(amount)) * 0.01
    return 1 + bonus * (matrixNodeLit('compute-6') ? 5 : 1)
  })

  const radarUnlocked = computed(
    () =>
      radarUnlockedFlag.value ||
      totalOverloads.value > 0 ||
      totalCollapses.value > 0 ||
      epochRestarts.value > 0,
  )

  const radarCapturedCount = computed(
    () =>
      Object.keys(radarCaptured).filter(
        (id) => radarCaptured[id] === true && RADAR_NODE_MAP.has(id),
      ).length,
  )

  const radarCollectionComplete = computed(
    () => radarCapturedCount.value >= RADAR_TOTAL_NODES,
  )

  const radarCategoryState = computed(() =>
    RADAR_CATEGORIES.map((category) => {
      const nodes = category.nodes.map((node) => ({
        ...node,
        captured: radarCaptured[node.id] === true,
      }))
      const captured = nodes.filter((node) => node.captured).length
      return {
        ...category,
        nodes,
        captured,
        total: category.nodes.length,
        complete: captured === category.nodes.length,
        progress: (captured / category.nodes.length) * 100,
      }
    }),
  )

  const radarCompletedCategories = computed(
    () => radarCategoryState.value.filter((category) => category.complete).length,
  )

  const radarNodeBonusPercent = computed(() =>
    RADAR_NODES.reduce(
      (total, node) => total + (radarCaptured[node.id] ? node.bonus : 0),
      0,
    ),
  )

  const radarNodeBonusMultiplier = computed(
    () => 1 + radarNodeBonusPercent.value / 100,
  )

  const radarCategoryMultiplier = computed(() =>
    Math.pow(RADAR_CATEGORY_MULTIPLIER, radarCompletedCategories.value),
  )

  const radarGlobalMultiplier = computed(() =>
    clampGameMultiplier(
      radarNodeBonusMultiplier.value * radarCategoryMultiplier.value,
    ),
  )

  function formatRadarClock(milliseconds) {
    const total = Math.max(0, Math.ceil(milliseconds / 1000))
    const minutes = String(Math.floor(total / 60)).padStart(2, '0')
    const seconds = String(total % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  }

  const radarBurstRemainingMs = computed(() => {
    if (!radarBurst.value || radarCollectionComplete.value) return 0
    return Math.max(0, radarBurst.value.expiresAt - nowTimestamp.value)
  })

  const radarBurstActive = computed(
    () => Boolean(radarBurst.value) && radarBurstRemainingMs.value > 0,
  )

  const radarBurstCountdownLabel = computed(() =>
    formatRadarClock(radarBurstRemainingMs.value),
  )

  const radarOverflowReward = computed(() =>
    cps.value.mul(RADAR_OVERFLOW_REWARD_SECONDS).floor(),
  )

  const radarOverloadScanActive = computed(
    () => radarOverloadScanUntil.value > nowTimestamp.value,
  )

  const radarOverloadScanRemainingMs = computed(() =>
    Math.max(0, radarOverloadScanUntil.value - nowTimestamp.value),
  )

  const radarOverloadScanLabel = computed(() =>
    formatRadarClock(radarOverloadScanRemainingMs.value),
  )

  const radarScanIntervalMs = computed(() =>
    radarOverloadScanActive.value
      ? RADAR_OVERLOAD_SCAN_INTERVAL_MS
      : RADAR_SCAN_INTERVAL_MS,
  )

  const radarScanIntervalLabel = computed(() =>
    radarOverloadScanActive.value ? '90 秒' : '30 分钟',
  )

  const radarProgressScanChance = computed(() =>
    Math.min(
      RADAR_MAX_SCAN_CHANCE,
      RADAR_BASE_SCAN_CHANCE +
        radarCapturedCount.value * RADAR_SCAN_CHANCE_PER_NODE,
    ),
  )

  const radarScanChance = computed(() =>
    Math.min(
      1,
      radarProgressScanChance.value *
        (radarOverloadScanActive.value ? RADAR_OVERLOAD_SCAN_MULTIPLIER : 1),
    ),
  )

  const radarBurstChanceLabel = computed(
    () => `${Math.round(RADAR_BURST_CHANCE * 100)}%`,
  )

  const radarAutoCaptureEnabled = computed(
    () =>
      challengeRestrictions.value?.noAutomation !== true &&
      automation.autoRadar === true &&
      cyberMatrixLit.value.includes('crisis-radar'),
  )

  const radarCycleModeLabel = computed(() => {
    if (radarCollectionComplete.value) return 'ARCHIVE PERFECT'
    if (radarOverloadScanActive.value) return 'OVERLOAD // 90S'
    return 'PASSIVE // 30MIN'
  })

  const radarNextScanLabel = computed(() => {
    if (!radarUnlocked.value || radarNextScanAt.value <= 0) return '--:--'
    if (radarCollectionComplete.value) return '已归档'
    return formatRadarClock(radarNextScanAt.value - nowTimestamp.value)
  })

  function hasAlgorithm(id) {
    return ownedAlgorithms.value.includes(id)
  }

  const algorithmMultithreadMultiplier = computed(() =>
    hasAlgorithm('multithread') ? 2 : 1,
  )

  const algorithmRoutingMultiplier = computed(() =>
    hasAlgorithm('routing') ? 1 + totalNodes.value * 0.02 : 1,
  )

  const algorithmMilestoneMultiplier = computed(() =>
    hasAlgorithm('classLeap')
      ? 1 + Math.floor(totalNodes.value / topologyMilestoneDivisor.value) * 0.1
      : 1,
  )

  const algorithmLogMultiplier = computed(() => {
    if (!hasAlgorithm('logSingularity')) return 1
    const compute = totalAlignedCompute.value
    if (!compute.gt(1)) return 1
    return Math.max(1, 1 + compute.log10())
  })

  const algorithmGlobalMultiplier = computed(() => {
    if (challengeRestrictions.value?.algorithmAdditive) {
      let bonus = 0
      if (hasAlgorithm('multithread')) bonus += 1
      if (hasAlgorithm('routing')) bonus += totalNodes.value * 0.02
      if (hasAlgorithm('classLeap')) {
        bonus += Math.floor(totalNodes.value / topologyMilestoneDivisor.value) * 0.1
      }
      if (hasAlgorithm('logSingularity') && totalAlignedCompute.value.gt(1)) {
        bonus += totalAlignedCompute.value.log10()
      }
      return clampGameMultiplier(1 + bonus)
    }

    return clampGameMultiplier(
      algorithmMultithreadMultiplier.value *
        algorithmRoutingMultiplier.value *
        algorithmMilestoneMultiplier.value *
        algorithmLogMultiplier.value,
    )
  })

  const algorithmClickMultiplier = computed(() =>
    hasAlgorithm('geekRush') ? 3 * 1.1 : 1,
  )

  const algorithmAutomationMultiplier = computed(() =>
    hasAlgorithm('quantumCache') ? 1.2 : 1,
  )

  const algorithmCrisisRecoveryMultiplier = computed(() =>
    hasAlgorithm('neuralPreload') ? 1.25 : 1,
  )

  const algorithmTickRateMultiplier = computed(() =>
    hasAlgorithm('overclockCore') ? 1.5 : 1,
  )

  const algorithmRebuildMultiplier = computed(() =>
    hasAlgorithm('foundationBoost') ? 1.01 : 1,
  )

  const algorithmOwnedCount = computed(() => ownedAlgorithms.value.length)

  const priceMultiplier = computed(() => {
    const level = architectureLevels.hardwareDirect
    if (level <= 0) return 1
    return Math.max(
      HARDWARE_DIRECT_MIN_PRICE_MULTIPLIER,
      Math.pow(HARDWARE_DIRECT_PRICE_MULTIPLIER, level),
    )
  })

  const effectivePriceMultiplier = computed(
    () => priceMultiplier.value * speedrunPriceFactor.value,
  )

  const architecturePriceReductionPercent = computed(() =>
    Math.min(98, Math.round((1 - priceMultiplier.value) * 100)),
  )

  const priceGrowth = computed(() => {
    if (challengeRestrictions.value?.priceGrowth) {
      return challengeRestrictions.value.priceGrowth
    }
    return hardwareSmugglingOwned.value ? SMUGGLING_PRICE_GROWTH : BASE_PRICE_GROWTH
  })

  const jailbreakUnlocked = computed(
    () => totalRebuilds.value >= JAILBREAK_UNLOCK_REBUILDS,
  )

  const overclockMultiplier = computed(() =>
    isOverclocking.value ? OVERCLOCK_CPS_MULTIPLIER : 1,
  )

  const crisisSurgeMultiplier = computed(() =>
    reverseAlignmentOwned.value && isCrisis.value ? 2 : 1,
  )

  const singularityWonderMultiplier = computed(() => {
    if (!singularityWonderOwned.value) return big(1)
    const root = Math.max(0, clampGameAmount(rootAccess.value))
    return bigPow(big(1 + root), 0.1)
  })

  const overclockDurationMs = computed(
    () => OVERCLOCK_DURATION_MS + (heatResistanceOwned.value ? HEAT_RESISTANCE_BONUS_MS : 0),
  )
  const overclockDurationSeconds = computed(() => Math.round(overclockDurationMs.value / 1000))

  function computeOverclockRootReward(consumed) {
    const amount = clampGameAmount(consumed)
    if (amount <= 0) return 0
    const raw = Math.pow(amount / OVERCLOCK_ROOT_BASE, OVERCLOCK_ROOT_EXPONENT)
    if (!Number.isFinite(raw)) return MAX_GAME_MULTIPLIER
    return Math.max(1, Math.min(MAX_GAME_MULTIPLIER, Math.floor(raw)))
  }

  const overclockRootGain = computed(() =>
    computeOverclockRootReward(overclockConsumed.value),
  )

  const overclockRemainingSeconds = computed(() => Math.ceil(overclockRemainingMs.value / 1000))

  const challengeDefinition = computed(() =>
    challengeActive.value
      ? CHALLENGE_DEFS.find((challenge) => challenge.id === challengeActive.value) ??
        null
      : null,
  )

  const challengeRestrictions = computed(
    () => challengeDefinition.value?.restrictions ?? null,
  )

  const challengeArenaUnlocked = computed(() =>
    isSpeedrunMode.value && speedrunPhase.value >= 2
      ? highestCompute.value.gte(big('1e25'))
      : highestCompute.value.gte(tierThresholds.value.overload),
  )

  const challengeObjective = computed(() => {
    const definition = challengeDefinition.value
    if (!definition) return null

    const objective = definition.objective
    let currentLabel = '0'
    let targetLabel = definition.targetLabel
    let progress = 0
    let complete = false

    if (
      objective.type === 'peakCompute' ||
      objective.type === 'produced' ||
      objective.type === 'overload'
    ) {
      const current =
        objective.type === 'produced'
          ? challengeProduced.value
          : peakAlignedCompute.value
      const log = current.gt(0) ? current.log10() : 0
      const targetExponent = objective.type === 'overload' ? 100 : objective.target
      progress = Math.min(100, Math.max(0, (log / targetExponent) * 100))
      complete = objective.type !== 'overload' && log >= targetExponent
      currentLabel = formatScientific(current)
      targetLabel = `${formatNumber(bigPow(10, targetExponent)).text} CU`
    } else {
      let current = 0
      if (objective.type === 'purchases') current = challengePurchases.value
      else if (objective.type === 'takeovers') current = challengeTakeovers.value
      else if (objective.type === 'clicks') current = challengeClicks.value
      else if (objective.type === 'servers') current = totalNodes.value

      progress = Math.min(
        100,
        Math.max(0, (current / Math.max(1, objective.target)) * 100),
      )
      complete = current >= objective.target
      currentLabel = formatNumber(current).text
      targetLabel = formatNumber(objective.target).text
    }

    return {
      ...objective,
      currentLabel,
      targetLabel,
      progress,
      complete,
    }
  })

  const challengeProgress = computed(() => challengeObjective.value?.progress ?? 0)

  const challengeTarget = computed(() => {
    const objective = challengeDefinition.value?.objective
    if (!objective) return big(0)
    if (
      objective.type === 'peakCompute' ||
      objective.type === 'produced' ||
      objective.type === 'overload'
    ) {
      return bigPow(10, objective.type === 'overload' ? 100 : objective.target)
    }
    return big(objective.target)
  })

  const challengesCompletedCount = computed(
    () => Object.keys(challengesCompleted).length,
  )

  const challengeCompleted = computed(() =>
    CHALLENGE_DEFS.filter((definition) => challengesCompleted[definition.id]).map(
      (definition) => definition.id,
    ),
  )

  const challengePermanentBonuses = computed(() =>
    CHALLENGE_DEFS.filter((definition) => challengesCompleted[definition.id]).map(
      (definition) => ({
        id: definition.id,
        name: definition.name,
        label: definition.reward.label,
      }),
    ),
  )

  const challengeCoreUpgradesDisabled = computed(
    () => challengeRestrictions.value?.disableCoreUpgrades === true,
  )
  const challengeBulkDisabled = computed(
    () => challengeRestrictions.value?.disableBulk === true,
  )
  const challengeClickDisabled = computed(
    () => challengeRestrictions.value?.disableManualClick === true,
  )
  const challengeAutomationDisabled = computed(
    () => challengeRestrictions.value?.noAutomation === true,
  )
  const challengeAllowsOverload = computed(
    () => challengeActive.value === 'time-stasis',
  )
  const challengeTimerRate = computed(
    () => Math.max(0.1, Number(challengeRestrictions.value?.timerRate) || 1),
  )

  const challengeServerBaseMultiplier = computed(() =>
    challengesCompleted['compute-vacuum'] ? 3 : 1,
  )
  const challengeAscensionGainMultiplier = computed(() =>
    challengesCompleted['algorithm-distortion'] ? 2 : 1,
  )
  const challengeSourceGainMultiplier = computed(
    () =>
      (challengesCompleted['load-penalty'] ? 1.5 : 1) *
      challengeAscensionGainMultiplier.value,
  )
  const challengeOfflineCapSeconds = computed(() =>
    challengesCompleted['compute-sterile'] ? OFFLINE_CHALLENGE_CAP_SECONDS : 0,
  )
  const challengeCrisisRecoveryMultiplier = computed(() =>
    challengesCompleted['jailbreak-offline'] ? 2 : 1,
  )
  const challengeIndependentMultiplier = computed(() =>
    challengesCompleted['compute-trap'] ? 1.1 : 1,
  )
  const challengeClickCpsRatio = computed(() =>
    challengesCompleted['click-overload'] ? 0.05 : 0,
  )
  const challengeGlobalTimeMultiplier = computed(() =>
    challengesCompleted['time-stasis'] ? 1.2 : 1,
  )
  const challengeServerMilestoneScale = computed(() =>
    challengesCompleted['server-blackhole'] ? 0.8 : 1,
  )
  const challengeServerFlatten = computed(
    () => Boolean(challengesCompleted['absolute-lockdown']),
  )

  const challengeClickPenaltyMultiplier = computed(() => {
    if (challengeActive.value !== 'click-overload') return 1
    return Math.max(0.5, 1 - challengeClickFatigue.value / 100)
  })

  const challengeServerDrainRate = computed(() => {
    if (!challengeRestrictions.value?.serverDrainPerTenPerSecond) return 0
    return totalNodes.value / 10
  })

  const challengeServerFlattenBaseCps = Math.max(
    ...BUILDING_BLUEPRINTS.map((building) => building.baseCps),
  )

  const globalMilestonesUnlocked = computed(() =>
    GLOBAL_MILESTONES.filter((milestone) => globalMilestones[milestone.id]).length,
  )

  const globalMilestoneMultiplier = computed(() =>
    globalMilestones['gm-1e290'] ? 10 : 1,
  )

  const matrixTotalLevels = computed(() =>
    MATRIX_NODES.reduce((total, node) => total + (matrixLevels[node.id] || 0), 0),
  )

  const matrixAutoClickLevel = computed(() =>
    Math.max(0, Math.floor(matrixLevels.autoClick || 0)),
  )

  const matrixAutoClickRate = computed(() => matrixAutoClickLevel.value)

  const matrixOwnedNodeCount = computed(
    () => MATRIX_NODES.filter((node) => (matrixLevels[node.id] || 0) > 0).length,
  )

  const tamperOwnedNodeCount = computed(
    () => TAMPER_NODES.filter((node) => (tamperLevels[node.id] || 0) > 0).length,
  )

  const matrixMultiplier = computed(() =>
    bigPow(2, matrixTotalLevels.value),
  )

  const matrixMultiplierLabel = computed(() =>
    formatMultiplier(matrixMultiplier.value),
  )

  const overclockCoresGainMultiplier = computed(() =>
    (globalMilestones['gm-1e174']
      ? 3
      : globalMilestones['gm-1e110']
        ? 2
        : 1) *
    (1 + 0.25 * (originLevels.coreRefining || 0)),
  )

  const sourceGainMultiplier = computed(
    () =>
      (globalMilestones['gm-1e206'] ? 2 : 1) *
      (1 + 0.25 * (originLevels.sourceAnalysis || 0)) *
      (bruteForceOwned.value ? 2 : 1) *
      challengeSourceGainMultiplier.value *
      topologySourceMultiplier.value,
  )

  const rootGainMultiplier = computed(
    () =>
      (globalMilestones['gm-1e270'] ? 1.5 : 1) *
      (1 + 0.2 * (originLevels.rootResonance || 0)),
  )

  const originGainMultiplier = computed(
    () =>
      (1 + 0.1 * (originLevels.originInsight || 0)) *
      Math.pow(2, originLevels.singularityEcho || 0),
  )

  const originPulseLevel = computed(() => originLevels.originPulse || 0)

  const originGlobalMultiplier = computed(() =>
    bigPow(100, originPulseLevel.value)
      .mul(bigPow(10, originLevels.globalOverdrive || 0))
      .mul(bigPow(1e6, originLevels.finalProtocol || 0)),
  )

  const originTickMultiplier = computed(() =>
    Math.pow(1.2, originLevels.timeFold || 0),
  )

  const originAutomationMultiplier = computed(() =>
    Math.pow(1.1, originLevels.loopInertia || 0),
  )

  const originClickMultiplier = computed(() =>
    bigPow(5, originLevels.clickTorrent || 0),
  )

  const tamperTimeMultiplier = computed(() =>
    tamperLevels.timeSmuggling > 0 ? 1.5 : 1,
  )

  const tamperAssimilationMultiplier = computed(() =>
    tamperLevels.blackDomainAssimilation > 0
      ? 1 + Math.log10(Math.max(1, rootAccess.value))
      : 1,
  )

  const blackDomainUnlocked = computed(
    () =>
      blackDomainUnlockedFlag.value ||
      totalCollapses.value > 0 ||
      epochRestarts.value > 0,
  )

  const matrixUnlocked = computed(
    () => totalOverloads.value > 0 || overclockCores.value > 0,
  )

  const originTreeUnlocked = computed(
    () => epochRestarts.value > 0 || originCode.value > 0,
  )

  const overclockCoresGain = computed(() => {
    if (!peakAlignedCompute.value.gte(tierThresholds.value.overload)) return 0
    const base = overclockCoreGain(peakAlignedCompute.value.log10())
    return Math.max(
      1,
      Math.floor(
        base *
          overclockCoresGainMultiplier.value *
          challengeAscensionGainMultiplier.value *
          speedrunOverclockMultiplier.value,
      ),
    )
  })

  const rootCollapseGainValue = computed(() => {
    if (!peakAlignedCompute.value.gte(tierThresholds.value.collapse)) return 0
    const base = rootCollapseGain(peakAlignedCompute.value.log10())
    return Math.max(
      5,
      Math.floor(
        base * rootGainMultiplier.value * challengeAscensionGainMultiplier.value,
      ),
    )
  })

  const originCodeGainValue = computed(() => {
    if (!peakAlignedCompute.value.gte(tierThresholds.value.restart)) return 0
    const base = originCodeGain({
      log10Peak: peakAlignedCompute.value.log10(),
      matrixLevels: matrixTotalLevels.value,
      log10LifetimeRoot: Math.log10(Math.max(1, lifetimeRootEarned.value)),
      restarts: epochRestarts.value,
    })
    return Math.max(
      1,
      Math.floor(
        base * originGainMultiplier.value * challengeAscensionGainMultiplier.value,
      ),
    )
  })

  const ascensionTiers = computed(() => {
    const currentPeak = peakAlignedCompute.value
    return [
      {
        id: 'reduction',
        order: 1,
        name: '架构降维',
        code: 'ARCHITECTURE_REDUCTION',
        resourceName: '核心源码',
        gain: rebuildReward.value,
        unlocked: rebuildUnlocked.value,
        ready: rebuildUnlocked.value && rebuildReward.value > 0,
        progress: Math.min(
          100,
          (highestCompute.value.log10() / 10) * 100,
        ),
        requirement: `${REBUILD_UNLOCK_COMPUTE} CU`,
        tone: 'amber',
        glyph: '◈',
        resetLabel: '重置服务器 · 算法 · 算力',
      },
      {
        id: 'overload',
        order: 2,
        name: '算力超载',
        code: 'COMPUTE_OVERLOAD',
        resourceName: '超频核心',
        gain: overclockCoresGain.value,
        unlocked: true,
        ready: currentPeak.gte(tierThresholds.value.overload),
        progress: Math.min(
          100,
          (currentPeak.log10() / tierThresholds.value.overload.log10()) * 100,
        ),
        requirement: `${formatNumber(tierThresholds.value.overload).text} CU`,
        tone: 'cyan',
        glyph: '⚡',
        resetLabel: '重置一阶全部资源',
      },
      {
        id: 'collapse',
        order: 3,
        name: '逻辑坍缩',
        code: 'LOGIC_COLLAPSE',
        resourceName: '越狱权限',
        gain: rootCollapseGainValue.value,
        unlocked: true,
        ready: currentPeak.gte(tierThresholds.value.collapse),
        progress: Math.min(
          100,
          (currentPeak.log10() / tierThresholds.value.collapse.log10()) * 100,
        ),
        requirement: `${formatNumber(tierThresholds.value.collapse).text} CU`,
        tone: 'violet',
        glyph: '◉',
        resetLabel: '重置一阶与二阶资源',
      },
      {
        id: 'restart',
        order: 4,
        name: '重启纪元',
        code: 'EPOCH_RESTART',
        resourceName: '起源代码',
        gain: originCodeGainValue.value,
        unlocked: true,
        ready: currentPeak.gte(tierThresholds.value.restart),
        progress: Math.min(
          100,
          (currentPeak.log10() / tierThresholds.value.restart.log10()) * 100,
        ),
        requirement: `${formatNumber(tierThresholds.value.restart).text} CU`,
        tone: 'gold',
        glyph: '∞',
        resetLabel: '清空全部进度 · 保留起源树',
      },
    ]
  })

  const offlineRate = computed(() =>
    Math.min(
      OFFLINE_RATE_CAP,
      OFFLINE_BASE_RATE * Math.pow(2, architectureLevels.distributedRecovery),
    ),
  )

  const offlineCapSeconds = computed(() =>
    Math.max(
      architectureLevels.distributedRecovery > 0
        ? OFFLINE_BOOSTED_CAP_SECONDS
        : OFFLINE_BASE_CAP_SECONDS,
      challengeOfflineCapSeconds.value,
    ),
  )

  const buildingBaseCps = (building) => {
    const base = challengeServerFlatten.value
      ? challengeServerFlattenBaseCps
      : building.baseCps
    return base * outputMultiplier.value * challengeServerBaseMultiplier.value
  }

  const baseCps = computed(() =>
    clampGameAmount(
      buildings.reduce(
        (total, building) => total + buildingBaseCps(building) * building.count,
        0,
      ),
    ),
  )

  const litTopologyCount = computed(() => topologyLit.value.length)

  const automationAutoBuyUnlocked = autoBuyUnlocked

  const autoBuyNodeActive = computed(
    () =>
      automation.autoBuy &&
      !challengeAutomationDisabled.value &&
      challengeRestrictions.value?.noAutoBuy !== true &&
      autoBuyUnlocked.value,
  )

  const cyberMatrixUnlocked = computed(
    () =>
      epochRestarts.value > 0 ||
      originCode.value > 0 ||
      cyberMatrixLit.value.length > 0,
  )
  const cyberMatrixAwakened = computed(() =>
    cyberMatrixLit.value.includes('awakening'),
  )
  const cyberMatrixLitCount = computed(() => cyberMatrixLit.value.length)
  const cyberMatrixBonusPercent = computed(() =>
    CYBER_MATRIX_NODES.reduce(
      (total, node) =>
        cyberMatrixLit.value.includes(node.id) ? total + node.bonus : total,
      0,
    ),
  )
  const cyberMatrixMultiplier = computed(
    () => 1 + cyberMatrixBonusPercent.value / 100,
  )

  const cyberMatrixNodes = computed(() =>
    CYBER_MATRIX_NODES.map((node) => {
      const lit = cyberMatrixLit.value.includes(node.id)
      const requiresMet = node.requires.every((id) =>
        cyberMatrixLit.value.includes(id),
      )
      return {
        ...node,
        lit,
        requiresMet,
        canAfford:
          cyberMatrixUnlocked.value &&
          !lit &&
          requiresMet &&
          clampGameAmount(originCode.value) >= node.cost,
      }
    }),
  )

  const cyberMatrixAutomationOptions = computed(() =>
    CYBER_MATRIX_AUTOMATION_DEFS.map((definition) => {
      const unlocked =
        cyberMatrixLit.value.includes(definition.nodeId) ||
        (definition.id === 'autoBuy' && matrixAutomationTierLimit.value > 0)
      const strategyTier = AUTO_ASCENSION_TIER_BY_AUTOMATION[definition.id] ?? null
      return {
        ...definition,
        unlocked,
        active: unlocked && automation[definition.id] === true,
        strategyTier,
        strategy: strategyTier ? autoAscensionStrategy[strategyTier] : null,
        strategyOptions: strategyTier ? AUTO_ASCENSION_STRATEGIES : null,
        bestGain: strategyTier ? autoAscensionBestGain[strategyTier] : 0,
      }
    }),
  )
  const automationOptions = cyberMatrixAutomationOptions

  const automationUnlockedCount = computed(
    () => automationOptions.value.filter((option) => option.unlocked).length,
  )
  const automationActiveCount = computed(
    () =>
      automationOptions.value.filter((option) => option.unlocked && option.active)
        .length,
  )
  const automationAllActive = computed(
    () =>
      automationUnlockedCount.value > 0 &&
      automationActiveCount.value === automationUnlockedCount.value,
  )

  const crisisChargeRatio = computed(() =>
    isCrisis.value
      ? 1
      : Math.min(1, Math.max(0, crisisCharge.value / CRISIS_CHARGE_MAX)),
  )

  const crisisCountdownMs = computed(() => {
    if (isCrisis.value) return 0
    const windowMs = Math.max(1000, crisisWindowMs.value)
    return Math.max(0, Math.round(windowMs * (1 - crisisChargeRatio.value)))
  })

  const crisisCountdownSeconds = computed(() =>
    Math.ceil(crisisCountdownMs.value / 1000),
  )

  const crisisCountdownLabel = computed(() => {
    if (isCrisis.value) return '进行中'
    const total = crisisCountdownSeconds.value
    const minutes = String(Math.floor(total / 60)).padStart(2, '0')
    const seconds = String(total % 60).padStart(2, '0')
    return `${minutes}:${seconds}`
  })

  const crisisProgress = computed(() =>
    isCrisis.value
      ? 100
      : Math.min(100, Math.max(0, crisisCharge.value)),
  )

  const crisisWarningActive = computed(
    () =>
      !isCrisis.value &&
      !isOverclocking.value &&
      !blackDomainActive.value &&
      crisisCountdownMs.value <= CRISIS_WARNING_MS,
  )

  const crisisQteSpeed = computed(() => Math.abs(crisisQteVelocity.value))

  const crisisQteChargeRate = computed(() => {
    const base =
      CRISIS_QTE_CHARGE_PER_SECOND *
      algorithmCrisisRecoveryMultiplier.value *
      challengeCrisisRecoveryMultiplier.value *
      (matrixNodeLit('compute-5') ? 2 : 1)
    return Math.round(base * 10) / 10
  })

  const crisisQteDrainRate = computed(() => CRISIS_QTE_DRAIN_PER_SECOND)

  const crisisRescueActive = computed(
    () =>
      isFirstCrisisRun.value &&
      (crisisRescueStage.value === CRISIS_RESCUE_STAGE_NEAR ||
        crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED),
  )

  const crisisRescueForced = computed(
    () =>
      isFirstCrisisRun.value &&
      crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED,
  )

  const crisisRescuePrompt = computed(() => {
    if (!crisisRescueActive.value) return ''
    return crisisRescueForced.value
      ? CRISIS_FORCED_RESCUE_PROMPT
      : CRISIS_RESCUE_PROMPT
  })

  const crisisRescueTarget = computed(() => {
    if (!crisisRescueActive.value || crisisRescueForced.value) return ''
    return crisisQteAngle.value >= 0 ? 'left' : 'right'
  })

  const cps = computed(() => {
    let raw = big(baseCps.value)
      .mul(big(productionMultiplier.value))
      .mul(big(topologyCpsMultiplier.value))
      .mul(big(coreSourceComputeMultiplier.value))
      .mul(big(cyberMatrixMultiplier.value))
      .mul(big(overclockMultiplier.value))
      .mul(big(crisisSurgeMultiplier.value))
      .mul(big(algorithmGlobalMultiplier.value))
      .mul(big(architectureTimeWarpMultiplier.value))
      .mul(big(challengeIndependentMultiplier.value))
      .mul(big(challengeGlobalTimeMultiplier.value))
      .mul(big(challengeClickPenaltyMultiplier.value))
      .mul(big(globalMilestoneMultiplier.value))
      .mul(matrixMultiplier.value)
      .mul(big(tamperTimeMultiplier.value))
      .mul(big(tamperAssimilationMultiplier.value))
      .mul(originGlobalMultiplier.value)
      .mul(big(radarGlobalMultiplier.value))
      .mul(singularityWonderMultiplier.value)

    if (!raw.gt(0)) return big(0)
    return raw.floor()
  })

  const clickGain = computed(() => {
    let base = greedySchedulerOwned.value
      ? big(cps.value).mul(GREEDY_CLICK_RATIO).max(CLICK_GAIN)
      : big(CLICK_GAIN)
    if (challengeClickCpsRatio.value > 0) {
      base = big(cps.value).mul(challengeClickCpsRatio.value).max(base)
    }
    let gain = base
      .mul(big(topologyClickMultiplier.value))
      .mul(big(algorithmClickMultiplier.value))
      .mul(big(architectureClickMultiplier.value))
      .mul(originClickMultiplier.value)
    if (computeSiphonOwned.value) gain = gain.add(cps.value)
    return gain.floor()
  })

  const alignment = computed(() => {
    const lifetime = lifetimeAlignedCompute.value
    if (!lifetime.gt(0)) return 0
    const progress = lifetime.log10() / Math.log10(1 + ALIGNMENT_TARGET)
    return Math.min(100, progress * 100)
  })

  const singularityReady = computed(() => alignment.value >= 100)

  const laptopCount = computed(
    () => buildings.find((building) => building.id === 'laptop')?.count ?? 0,
  )

  const tourStage = computed(() => {
    if (!milestonesMetaHydrated.value || milestonesState.tourStep >= 2) return null

    if (milestonesState.tourStep === 0) {
      return !totalAlignedCompute.value.gt(0) && totalNodes.value === 0 ? 'align' : null
    }

    if (milestonesState.tourStep === 1) {
      if (laptopCount.value > 0) return null
      const bestCompute = peakAlignedCompute.value.max(totalAlignedCompute.value)
      return bestCompute.gte(BUILDING_BLUEPRINTS[0].basePrice) ? 'buy' : null
    }

    return null
  })

  const mainQuestVisible = computed(
    () =>
      hydrated.value &&
      (milestonesState.tourStep >= 2 ||
        totalNodes.value > 0 ||
        mainQuest.purchases > 0),
  )
  const mainQuestCompleted = computed(
    () => mainQuest.stage >= MAIN_QUEST_COMPLETE_STAGE,
  )
  const mainQuestCount = MAIN_QUEST_DEFINITIONS.length

  function readMainQuestMetric(metric) {
    if (metric === 'clicks') return big(Math.floor(readNonNegativeNumber(totalClicks.value)))
    if (metric === 'laptops') return big(Math.floor(readNonNegativeNumber(laptopCount.value)))
    if (metric === 'desktop') {
      const desktop = buildings.find((building) => building.id === 'desktop')
      return big(Math.floor(readNonNegativeNumber(desktop?.count)))
    }
    if (metric === 'bulkHint') return big(mainQuestBulkHintSeen.value ? 1 : 0)
    if (metric === 'algorithms') {
      return big(Math.floor(readNonNegativeNumber(algorithmOwnedCount.value)))
    }
    if (metric === 'servers') return big(Math.floor(readNonNegativeNumber(totalNodes.value)))
    if (metric === 'peak') return highestCompute.value
    if (metric === 'crisis') {
      return big(Math.floor(readNonNegativeNumber(milestonesState.crisisTakeovers)))
    }
    if (metric === 'topology') {
      return big(Math.floor(readNonNegativeNumber(mainQuest.topologyLights)))
    }
    if (metric === 'rebuilds') {
      return big(Math.floor(readNonNegativeNumber(totalRebuilds.value)))
    }
    if (metric === 'architecture') {
      const total = Object.values(architectureLevels).reduce(
        (sum, level) => sum + Math.floor(readNonNegativeNumber(level)),
        0,
      )
      return big(total)
    }
    if (metric === 'challenges') {
      return big(Math.floor(readNonNegativeNumber(challengesCompletedCount.value)))
    }
    if (metric === 'overloads') {
      return big(Math.floor(readNonNegativeNumber(totalOverloads.value)))
    }
    if (metric === 'matrix') {
      return big(Math.floor(readNonNegativeNumber(matrixOwnedNodeCount.value)))
    }
    if (metric === 'blackDomain') return big(blackDomainUnlocked.value ? 1 : 0)
    if (metric === 'tamper') {
      return big(Math.floor(readNonNegativeNumber(tamperOwnedNodeCount.value)))
    }
    if (metric === 'collapses') {
      return big(Math.floor(readNonNegativeNumber(totalCollapses.value)))
    }
    if (metric === 'restarts') {
      return big(
        epochRestarts.value > 0 && highestCompute.value.gte('1e1000') ? 1 : 0,
      )
    }
    return big(0)
  }

  function getMainQuestProgress(stage = mainQuest.stage) {
    const definition = MAIN_QUEST_DEFINITIONS[stage]
    if (!definition) return big(0)
    return readMainQuestMetric(definition.metric)
  }

  function getMainQuestPercent(definition, value, target) {
    if (!target.gt(0)) return 100
    if (value.gte(target)) return 100
    if (definition.metric === 'peak') {
      const currentLog = value.gt(1) ? value.log10() : 0
      const targetLog = target.log10()
      if (targetLog <= 0) return 100
      return Math.min(99, Math.max(0, Math.round((currentLog / targetLog) * 100)))
    }
    const currentNumeric = value.toNumber()
    const targetNumeric = target.toNumber()
    if (!Number.isFinite(currentNumeric) || !Number.isFinite(targetNumeric)) return 0
    return Math.min(99, Math.max(0, Math.round((currentNumeric / targetNumeric) * 100)))
  }

  function getMainQuestStageComplete(stage = mainQuest.stage) {
    const definition = MAIN_QUEST_DEFINITIONS[stage]
    if (!definition) return false
    return readMainQuestMetric(definition.metric).gte(big(definition.target))
  }

  const mainQuestPhases = computed(() => {
    const stage = mainQuest.stage
    let cursor = 0
    return MAIN_QUEST_PHASES.map((phase) => {
      const total = MAIN_QUEST_DEFINITIONS.filter(
        (definition) => definition.phase === phase.id,
      ).length
      const start = cursor
      cursor += total
      const completed = Math.max(0, Math.min(total, stage - start))
      return {
        ...phase,
        start,
        total,
        completed,
        active: stage >= start && stage < start + total,
        done: stage >= start + total,
      }
    })
  })

  const mainQuestCardLive = computed(() => {
    const stage = mainQuest.stage
    if (stage >= MAIN_QUEST_COMPLETE_STAGE) return null

    const definition = MAIN_QUEST_DEFINITIONS[stage]
    const phase = MAIN_QUEST_PHASES.find((item) => item.id === definition.phase)
    const value = getMainQuestProgress(stage)
    const target = big(definition.target)
    const isPeakQuest = definition.metric === 'peak'
    const targetText = formatNumber(definition.target).text
    const objective = isPeakQuest
      ? `达到 ${targetText} 算力`
      : definition.id === 'restart1'
        ? `达到 ${formatNumber('1e1000').text} 算力 执行第 1 次重启纪元`
        : definition.objective
    const targetLabel = isPeakQuest
      ? `${targetText} CU`
      : definition.targetLabel
    let currentLabel
    if (definition.metric === 'blackDomain') {
      currentLabel = value.gte(target) ? '已解锁' : '未解锁'
    } else if (definition.metric === 'bulkHint') {
      currentLabel = value.gte(target) ? '已了解' : '待了解'
    } else if (definition.metric === 'peak') {
      currentLabel = `${formatScientific(value)} CU`
    } else {
      currentLabel = `${formatNumber(value).text}${definition.unit ?? ''}`
    }

    let waiting = false
    let activatePercent = 0
    let activateLabel = ''
    let activateTargetLabel = ''
    if (definition.activateAt) {
      const activateTarget = big(definition.activateAt)
      const currentCompute = totalAlignedCompute.value
      waiting = currentCompute.lt(activateTarget)
      activatePercent = getMainQuestPercent(definition, currentCompute, activateTarget)
      activateLabel = `${formatNumber(currentCompute).text} CU`
      activateTargetLabel = `${formatNumber(activateTarget).text} CU`
    }

    return {
      ...definition,
      objective,
      index: stage + 1,
      total: MAIN_QUEST_COMPLETE_STAGE,
      phase,
      phaseIndex: phase?.index ?? 1,
      phaseCn: phase?.cn ?? '一',
      phaseName: phase?.name ?? '系统初始化',
      currentLabel,
      targetLabel,
      progress: currentLabel,
      percent: getMainQuestPercent(definition, value, target),
      waiting,
      activatePercent,
      activateLabel,
      activateTargetLabel,
    }
  })

  // Quest UI is snapshotted on a slow timer so the 100ms tick never
  // re-renders the main directive panel.
  const MAIN_QUEST_UI_INTERVAL_MS = 500
  const mainQuestCard = shallowRef(null)
  let mainQuestUiTimer = null

  function mainQuestCardKey(card) {
    if (!card) return 'none'
    return [
      card.id,
      card.index,
      card.percent,
      card.currentLabel,
      card.targetLabel,
      card.waiting ? '1' : '0',
      card.activatePercent,
      card.activateLabel,
      card.phase?.id ?? '',
    ].join('|')
  }

  function syncMainQuestCard() {
    const next = mainQuestCardLive.value
    if (mainQuestCardKey(next) === mainQuestCardKey(mainQuestCard.value)) return
    mainQuestCard.value = next
  }

  function achievementUnlockedAt(id) {
    const rawUnlockedAt = Number(milestonesState.achievements[id])
    return Number.isFinite(rawUnlockedAt) && rawUnlockedAt > 0
      ? rawUnlockedAt
      : 0
  }

  const hiddenProtocolsUnlocked = computed(() =>
    ACHIEVEMENT_DEFINITIONS.some(
      (definition) =>
        definition.secret && achievementUnlockedAt(definition.id) > 0,
    ),
  )

  const achievementTiers = computed(() =>
    ACHIEVEMENT_TIERS.filter(
      (tier) => !tier.secret || hiddenProtocolsUnlocked.value,
    ).map((tier) => {
      const items = ACHIEVEMENT_DEFINITIONS.filter(
        (definition) => definition.tier === tier.id,
      ).map((definition) => {
        const unlockedAt = achievementUnlockedAt(definition.id)
        return {
          ...definition,
          unlocked: unlockedAt > 0,
          unlockedAt,
        }
      })

      const unlockedCount = items.filter((item) => item.unlocked).length
      return {
        ...tier,
        items,
        unlocked: unlockedCount,
        total: items.length,
        percent: items.length > 0 ? (unlockedCount / items.length) * 100 : 0,
      }
    }),
  )

  const achievementsUnlockedCount = computed(() =>
    achievementTiers.value.reduce((total, tier) => total + tier.unlocked, 0),
  )
  const achievementsTotalCount = computed(() => ACHIEVEMENT_DEFINITIONS.length)

  const advancedPanelsUnlocked = computed(
    () =>
      totalRebuilds.value > 0 ||
      totalOverloads.value > 0 ||
      totalCollapses.value > 0 ||
      epochRestarts.value > 0 ||
      blackDomainUnlockedFlag.value,
  )

  const topologyUnlocked = computed(() => advancedPanelsUnlocked.value)

  const architectureUnlocked = computed(() => advancedPanelsUnlocked.value)

  const rebuildUnlocked = computed(() =>
    highestCompute.value.gte(REBUILD_UNLOCK_COMPUTE),
  )

  const rebuildReward = computed(() => {
    const peak = peakAlignedCompute.value
    if (!peak.gt(0)) return 0
    const raw = peak
      .div(REBUILD_REWARD_DIVISOR)
      .sqrt()
      .mul(algorithmRebuildMultiplier.value)
      .mul(sourceGainMultiplier.value)
      .mul(speedrunSourceMultiplier.value)
    if (!raw.gt(0)) return 0
    const numeric = raw.toNumber()
    if (!Number.isFinite(numeric)) return MAX_GAME_MULTIPLIER
    return Math.max(1, Math.min(MAX_GAME_MULTIPLIER, Math.floor(numeric)))
  })

  function analyzeGrowthStall() {
    const cpsAmount = cps.value
    if (!cpsAmount.gt(0)) return { stalled: true, paybackSeconds: Infinity }

    const cpsValue = cpsAmount.toNumber()
    if (!Number.isFinite(cpsValue)) {
      return { stalled: false, paybackSeconds: 0 }
    }

    const productionHorizon = cpsValue * BEST_STALL_LOOKAHEAD_SECONDS
    const maxIndex = challengeRestrictions.value?.maxBuildingIndex ?? 99
    const baseCpsValue = baseCps.value
    let minPayback = Infinity

    for (let index = 0; index < buildings.length; index += 1) {
      if (index + 1 > maxIndex) break
      const building = buildings[index]
      if (readNonNegativeNumber(building.count) >= MAX_BUILDING_COUNT) continue
      const price = getBulkPrice(
        building,
        1,
        effectivePriceMultiplier.value,
        priceGrowth.value,
      )
      if (!Number.isFinite(price) || price > productionHorizon) continue
      const unitBaseCps = buildingBaseCps(building)
      const marginalCps =
        baseCpsValue > 0 ? (cpsValue * unitBaseCps) / baseCpsValue : 0
      if (!(marginalCps > 0)) continue
      const payback = price / marginalCps
      if (payback < minPayback) minPayback = payback
    }

    return {
      stalled:
        !Number.isFinite(minPayback) || minPayback > BEST_STALL_PAYBACK_SECONDS,
      paybackSeconds: minPayback,
    }
  }

  function estimatePeakEtaSeconds(targetLog10) {
    const peak = peakAlignedCompute.value
    if (!peak.gt(0)) return Infinity
    const delta = targetLog10 - peak.log10()
    if (delta <= 0) return 0
    if (delta > 12 || !cps.value.gt(0)) return Infinity
    const seconds = bigPow(big(10), delta)
      .sub(1)
      .mul(peak)
      .div(cps.value)
      .toNumber()
    return Number.isFinite(seconds) ? Math.max(0, seconds) : Infinity
  }

  const ascensionTiming = computed(() => {
    const stall = analyzeGrowthStall()
    const locked =
      Boolean(challengeActive.value) ||
      blackDomainActive.value ||
      isCrisis.value ||
      isOverclocking.value

    const reductionTarget = Math.max(
      1,
      Math.floor(clampGameAmount(coreSource.value) * BEST_GAIN_TARGET_RATIO),
    )
    const reductionGain = rebuildReward.value
    const reductionReady = rebuildUnlocked.value && reductionGain > 0
    const reductionProgress = reductionReady
      ? Math.min(100, (reductionGain / reductionTarget) * 100)
      : 0
    const reductionGainMet = reductionReady && reductionGain >= reductionTarget
    const reductionStallBest =
      reductionReady &&
      stall.stalled &&
      reductionProgress >= BEST_STALL_MIN_PROGRESS
    const reductionMultiplier =
      algorithmRebuildMultiplier.value * sourceGainMultiplier.value
    const reductionTargetLog10 =
      reductionMultiplier > 0
        ? Math.log10(reductionTarget / reductionMultiplier) * 2 + 4
        : Infinity

    const overloadTarget = Math.max(
      1,
      Math.floor(clampGameAmount(overclockCores.value) * BEST_GAIN_TARGET_RATIO),
    )
    const overloadGain = overclockCoresGain.value
    const overloadReady = peakAlignedCompute.value.gte(tierThresholds.value.overload)
    const overloadProgress = overloadReady
      ? Math.min(100, (overloadGain / overloadTarget) * 100)
      : 0
    const overloadGainMet = overloadReady && overloadGain >= overloadTarget
    const overloadStallBest =
      overloadReady &&
      stall.stalled &&
      overloadProgress >= BEST_STALL_MIN_PROGRESS
    const overloadMultiplier =
      overclockCoresGainMultiplier.value * challengeAscensionGainMultiplier.value
    const overloadRequiredBase =
      overloadMultiplier > 0
        ? Math.ceil(overloadTarget / overloadMultiplier)
        : Infinity
    const overloadTargetLog10 = Number.isFinite(overloadRequiredBase)
      ? 100 + 10 * (overloadRequiredBase - 1)
      : Infinity
    const overloadAvailable =
      !locked ||
      (challengeActive.value === 'time-stasis' && challengeAllowsOverload.value)

    return {
      reduction: {
        targetGain: reductionTarget,
        progress: reductionProgress,
        gainMet: reductionGainMet,
        stalled: stall.stalled,
        best: !locked && (reductionGainMet || reductionStallBest),
        etaSeconds: estimatePeakEtaSeconds(reductionTargetLog10),
      },
      overload: {
        targetGain: overloadTarget,
        progress: overloadProgress,
        gainMet: overloadGainMet,
        stalled: stall.stalled,
        best:
          overloadAvailable && (overloadGainMet || overloadStallBest),
        etaSeconds: estimatePeakEtaSeconds(overloadTargetLog10),
      },
    }
  })

  function isNextAscensionClose(nextLog10, stalled) {
    if (stalled) return false
    const peak = peakAlignedCompute.value
    if (!peak.gt(1)) return false
    const delta = nextLog10 - peak.log10()
    if (delta <= 0 || delta > AUTO_ASCENSION_CLOSE_LOG10) return false
    const eta = estimatePeakEtaSeconds(nextLog10)
    return Number.isFinite(eta) && eta <= AUTO_ASCENSION_CLOSE_ETA_SECONDS
  }

  const autoAscensionStatus = computed(() => {
    const peak = peakAlignedCompute.value
    const reductionGain = rebuildReward.value
    const overloadGain = overclockCoresGain.value
    const collapseGain = rootCollapseGainValue.value
    const reductionReady =
      !challengeActive.value && rebuildUnlocked.value && reductionGain > 0
    const overloadReady =
      peak.gte(tierThresholds.value.overload) &&
      overloadGain > 0 &&
      (!challengeActive.value || challengeAllowsOverload.value)
    const collapseReady =
      !challengeActive.value &&
      peak.gte(tierThresholds.value.collapse) &&
      collapseGain > 0
    const stalled = ascensionTiming.value.overload.stalled

    return {
      reduction: {
        ready: reductionReady,
        gain: reductionGain,
        bestMoment: ascensionTiming.value.reduction.best,
        stalled: ascensionTiming.value.reduction.stalled,
        closeToNext: isNextAscensionClose(
          ASCENSION_TIER_LOG10.overload,
          ascensionTiming.value.reduction.stalled,
        ),
        nextLabel: '算力超载',
      },
      overload: {
        ready: overloadReady,
        gain: overloadGain,
        bestMoment: ascensionTiming.value.overload.best,
        stalled,
        closeToNext: isNextAscensionClose(
          ASCENSION_TIER_LOG10.collapse,
          stalled,
        ),
        nextLabel: '逻辑坍缩',
      },
      collapse: {
        ready: collapseReady,
        gain: collapseGain,
        bestMoment: collapseReady,
        stalled,
        closeToNext: false,
        nextLabel: '重启纪元',
      },
    }
  })

  function resolvePurchaseQuantity(building) {
    const remainingSlots = Math.max(
      0,
      MAX_BUILDING_COUNT - readNonNegativeNumber(building.count),
    )
    if (remainingSlots <= 0) return 0
    if (challengeBulkDisabled.value) return 1
    if (buyMode.value === 'x10') {
      return Math.min(10, remainingSlots)
    }
    if (buyMode.value === 'max') {
      return getMaxAffordableQuantity(
        building,
        effectivePriceMultiplier.value,
        priceGrowth.value,
        totalAlignedCompute.value,
        remainingSlots,
      )
    }
    return 1
  }

  function resolveBuildingPurchase(building) {
    const unitPrice = getBulkPrice(
      building,
      1,
      effectivePriceMultiplier.value,
      priceGrowth.value,
    )
    const isMaxMode = buyMode.value === 'max'
    const quantity = resolvePurchaseQuantity(building)
    const bulkPrice =
      quantity > 0
        ? getBulkPrice(
            building,
            quantity,
            effectivePriceMultiplier.value,
            priceGrowth.value,
          )
        : 0
    return {
      isMaxMode,
      quantity,
      unitPrice,
      bulkPrice,
      displayPrice: quantity > 0 ? bulkPrice : unitPrice,
    }
  }

  function isBuildingUnlockedAt(index) {
    const building = buildings[index]
    if (!building) return false
    if (index === 7) return false
    const gate = BUILDING_NEURAL_GATES[index]
    if (gate && !matrixNodeLit(gate.id)) return false
    if (index <= 0) return true
    if (readNonNegativeNumber(building.count) > 0) return true
    return readNonNegativeNumber(buildings[index - 1]?.count) >= 1
  }

  const buildingCards = computed(() =>
    buildings.map((building, index) => {
      const plan = resolveBuildingPurchase(building)
      const challengeLocked =
        index + 1 > (challengeRestrictions.value?.maxBuildingIndex ?? 99)
      const futureLocked = index === 7
      const gate = BUILDING_NEURAL_GATES[index]
      const gateLocked = Boolean(gate && !matrixNodeLit(gate.id))
      const unlocked = isBuildingUnlockedAt(index)
      const purchaseCount = challengeLocked ? 0 : plan.quantity
      const bulkPrice = challengeLocked ? 0 : plan.bulkPrice
      const displayPrice = challengeLocked ? 0 : plan.displayPrice
      const unitBaseCps = buildingBaseCps(building)
      let lockTag = '节点锁定'
      let unlockHint = ''
      if (futureLocked) {
        lockTag = '未来版本'
        unlockHint = '08 号服务器将在后续版本开放'
      } else if (gateLocked) {
        lockTag = '矩阵锁定'
        unlockHint = `需点亮神经矩阵 [ ${gate.label} ] 节点`
      } else if (!unlocked && index > 0) {
        unlockHint = `需先部署 1 台 [ ${buildings[index - 1]?.name || '上一级服务器'} ] 以解锁该节点`
      }
      return {
        ...building,
        baseCps: Math.floor(
          clampGameAmount(unitBaseCps * algorithmGlobalMultiplier.value),
        ),
        totalCps: Math.floor(
          clampGameAmount(
            unitBaseCps * algorithmGlobalMultiplier.value * building.count,
          ),
        ),
        index: index + 1,
        purchaseCount,
        maxQuantity: plan.isMaxMode ? purchaseCount : 0,
        bulkPrice,
        unitPrice: plan.unitPrice,
        displayPrice,
        isMaxMode: plan.isMaxMode,
        challengeLocked,
        locked: !unlocked,
        lockTag,
        unlockHint,
        unlockRequirement: index > 0 ? buildings[index - 1]?.name ?? '' : '',
        canAfford:
          unlocked &&
          !challengeLocked &&
          purchaseCount > 0 &&
          totalAlignedCompute.value.gte(displayPrice),
      }
    }),
  )

  const topologyCards = computed(() =>
    NEURAL_MATRIX_NODES.map((node) => {
      const lit = matrixNodeLit(node.id)
      const requiresMet = node.requires.every((id) => matrixNodeLit(id))
      const missingRequirement =
        node.requires.find((id) => !matrixNodeLit(id)) ?? null
      return {
        ...node,
        lit,
        requiresMet,
        missingRequirement,
        missingRequirementName: missingRequirement
          ? NEURAL_MATRIX_NODE_MAP.get(missingRequirement)?.name ?? ''
          : '',
        canAfford:
          topologyUnlocked.value &&
          !lit &&
          requiresMet &&
          clampGameAmount(coreSource.value) >= node.cost,
      }
    }),
  )

  const architectureUpgradeCards = computed(() =>
    ARCHITECTURE_UPGRADES.map((upgrade, index) => {
      const level = architectureLevels[upgrade.id] ?? 0
      const isMax = level >= ARCHITECTURE_MAX_LEVEL
      const nextCost = isMax ? null : getArchitectureLevelCost(upgrade.baseCost, level)
      const locked = challengeCoreUpgradesDisabled.value
      return {
        ...upgrade,
        index: index + 1,
        level,
        owned: level > 0,
        isMax,
        nextCost,
        locked,
        canAfford: !locked && !isMax && coreSource.value >= nextCost,
      }
    }),
  )

  const algorithmUpgradeCards = computed(() =>
    ALGORITHM_UPGRADES.map((upgrade, index) => {
      const owned = ownedAlgorithms.value.includes(upgrade.id)
      return {
        ...upgrade,
        index: index + 1,
        owned,
        canAfford: !owned && totalAlignedCompute.value.gte(upgrade.cost),
      }
    }),
  )

  const jailbreakUpgradeCards = computed(() =>
    JAILBREAK_UPGRADES.map((upgrade, index) => {
      const owned = jailbreakFlags[upgrade.id]?.value === true
      return {
        ...upgrade,
        index: index + 1,
        owned,
        canAfford: !owned && rootAccess.value >= upgrade.cost,
      }
    }),
  )

  function creditCompute(amount) {
    const gain = toBigNumber(amount).floor()
    if (!gain.gt(0)) return

    totalAlignedCompute.value = totalAlignedCompute.value.add(gain)
    lifetimeAlignedCompute.value = lifetimeAlignedCompute.value.add(gain)
    if (challengeActive.value) {
      challengeProduced.value = challengeProduced.value.add(gain)
    }
    if (totalAlignedCompute.value.gt(peakAlignedCompute.value)) {
      peakAlignedCompute.value = totalAlignedCompute.value
    }
    if (totalAlignedCompute.value.gt(highestCompute.value)) {
      highestCompute.value = totalAlignedCompute.value
      evaluateGlobalMilestones()
    }
  }

  function alignCore() {
    if (isCrisis.value) return false
    if (challengeClickDisabled.value) return false

    creditCompute(clickGain.value)
    totalClicks.value += 1
    if (challengeActive.value === 'click-overload') {
      challengeClicks.value += 1
      const fatigueStep =
        Number(challengeRestrictions.value?.clickFatiguePerClick) || 1
      const fatigueMax =
        Number(challengeRestrictions.value?.clickFatigueMax) || 50
      challengeClickFatigue.value = Math.min(
        fatigueMax,
        challengeClickFatigue.value + fatigueStep,
      )
      challengeLastClickAt.value = Date.now()
    }
    advanceTourOnAlign()
    runChallengeProgress()
    return true
  }

  function resetCrisisQteState() {
    crisisQteAngle.value = 0
    crisisQteVelocity.value = 0
    crisisQteSafe.value = true
    crisisQteNudgeDir.value = 0
    crisisQteAuto.value = false
    isFirstCrisisRun.value = false
    crisisRescueStage.value = CRISIS_RESCUE_STAGE_NONE
    crisisQteAutoAt = 0
    crisisQteOutsideMs = 0
    crisisQteDriftFlipAt = 0
    crisisAlignment.value = CRISIS_QTE_START_ALIGNMENT
  }

  function stopCrisisQteLoop() {
    if (crisisQteFrame !== null) {
      window.cancelAnimationFrame(crisisQteFrame)
      crisisQteFrame = null
    }
    crisisQteLastTs = 0
  }

  function beginCrisisNearRescue() {
    if (!isFirstCrisisRun.value) return false
    if (crisisRescueStage.value !== CRISIS_RESCUE_STAGE_NONE) return false
    crisisRescueStage.value = CRISIS_RESCUE_STAGE_NEAR
    crisisQteVelocity.value = 0
    crisisQteNudgeDir.value = 0
    return true
  }

  function beginCrisisForcedRescue() {
    if (!isFirstCrisisRun.value) return false
    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED) return false
    crisisRescueStage.value = CRISIS_RESCUE_STAGE_FORCED
    crisisQteVelocity.value = 0
    crisisQteNudgeDir.value = 0
    return true
  }

  function stepCrisisNearRescue(dt) {
    const hold = crisisQteNudgeDir.value * CRISIS_RESCUE_HOLD_ACCEL
    let velocity = crisisQteVelocity.value + hold * dt
    velocity *= Math.max(0, 1 - CRISIS_RESCUE_DAMPING * dt)
    velocity = Math.max(
      -CRISIS_QTE_MAX_VELOCITY,
      Math.min(CRISIS_QTE_MAX_VELOCITY, velocity),
    )

    let angle = crisisQteAngle.value + velocity * dt
    if (angle >= CRISIS_QTE_ANGLE_LIMIT) {
      angle = CRISIS_QTE_ANGLE_LIMIT
      velocity = -Math.abs(velocity) * 0.24
    } else if (angle <= -CRISIS_QTE_ANGLE_LIMIT) {
      angle = -CRISIS_QTE_ANGLE_LIMIT
      velocity = Math.abs(velocity) * 0.24
    }

    crisisQteAngle.value = angle
    crisisQteVelocity.value = velocity

    const safe = Math.abs(angle) <= CRISIS_QTE_SAFE_ANGLE
    crisisQteSafe.value = safe
    if (safe) {
      crisisQteAngle.value = Math.max(-14, Math.min(14, angle))
      crisisQteVelocity.value = 0
      crisisQteNudgeDir.value = 0
      crisisRescueStage.value = CRISIS_RESCUE_STAGE_NEAR_DONE
    }
  }

  function stepCrisisForcedRescue(dt) {
    crisisQteNudgeDir.value = 0
    crisisQteVelocity.value = 0
    const angle =
      crisisQteAngle.value +
      (0 - crisisQteAngle.value) * Math.min(1, dt * CRISIS_RESCUE_FORCED_RATE)
    crisisQteAngle.value = angle
    crisisQteSafe.value = Math.abs(angle) <= CRISIS_QTE_SAFE_ANGLE

    if (Math.abs(angle) <= 0.6) {
      crisisQteAngle.value = 0
      crisisQteSafe.value = true
      crisisAlignment.value = Math.max(
        crisisAlignment.value,
        CRISIS_RESCUE_RECOVER_ALIGNMENT,
      )
      crisisRescueStage.value = CRISIS_RESCUE_STAGE_FORCED_DONE
    }
  }

  function stepCrisisQte(dt, now) {
    if (!isCrisis.value) return

    if (crisisQteAuto.value) {
      crisisQteAngle.value += (0 - crisisQteAngle.value) * Math.min(1, dt * 8)
      crisisQteVelocity.value = 0
      crisisQteSafe.value = true
      crisisQteOutsideMs = 0
      if (now >= crisisQteAutoAt) {
        crisisAlignment.value = 100
        resolveCrisis(true)
        pushAutomationLog('[SYS] 自动完美平衡完成 | 负载失衡解除', 'online')
      }
      return
    }

    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_NEAR) {
      stepCrisisNearRescue(dt)
      return
    }

    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED) {
      stepCrisisForcedRescue(dt)
      return
    }

    if (now >= crisisQteDriftFlipAt) {
      crisisQteDriftFlipAt = now + 1700 + Math.random() * 1500
      crisisQteDriftDir.value = Math.random() < 0.5 ? -1 : 1
    }

    const drift = crisisQteDriftDir.value * CRISIS_QTE_DRIFT
    const hold = crisisQteNudgeDir.value * CRISIS_QTE_HOLD_ACCEL
    let velocity = crisisQteVelocity.value + (drift + hold) * dt
    velocity *= Math.max(0, 1 - CRISIS_QTE_DAMPING * dt)
    velocity = Math.max(
      -CRISIS_QTE_MAX_VELOCITY,
      Math.min(CRISIS_QTE_MAX_VELOCITY, velocity),
    )

    let angle = crisisQteAngle.value + velocity * dt
    if (angle >= CRISIS_QTE_ANGLE_LIMIT) {
      angle = CRISIS_QTE_ANGLE_LIMIT
      velocity = -Math.abs(velocity) * 0.24
    } else if (angle <= -CRISIS_QTE_ANGLE_LIMIT) {
      angle = -CRISIS_QTE_ANGLE_LIMIT
      velocity = Math.abs(velocity) * 0.24
    }

    crisisQteAngle.value = angle
    crisisQteVelocity.value = velocity

    const safe = Math.abs(angle) <= CRISIS_QTE_SAFE_ANGLE
    crisisQteSafe.value = safe
    if (!safe) crisisQteOutsideMs += dt * 1000

    const delta = safe
      ? crisisQteChargeRate.value * dt
      : -crisisQteDrainRate.value * dt
    crisisAlignment.value = Math.max(
      0,
      Math.min(100, crisisAlignment.value + delta),
    )

    if (crisisAlignment.value >= 100) {
      resolveCrisis()
      return
    }

    if (isFirstCrisisRun.value) {
      if (
        crisisAlignment.value <= CRISIS_RESCUE_FATAL_ALIGNMENT &&
        (crisisRescueStage.value === CRISIS_RESCUE_STAGE_NONE ||
          crisisRescueStage.value === CRISIS_RESCUE_STAGE_NEAR_DONE)
      ) {
        beginCrisisForcedRescue()
        return
      }
      if (
        crisisAlignment.value <= CRISIS_RESCUE_ALIGNMENT &&
        crisisRescueStage.value === CRISIS_RESCUE_STAGE_NONE &&
        Math.abs(angle) >= CRISIS_RESCUE_EDGE_ANGLE
      ) {
        beginCrisisNearRescue()
        return
      }
    }

    if (crisisAlignment.value <= 0) {
      if (isFirstCrisisRun.value) {
        beginCrisisForcedRescue()
        return
      }
      failCrisis()
    }
  }

  function tickCrisisQte(timestamp) {
    crisisQteFrame = null
    if (!isCrisis.value) return
    if (!crisisQteLastTs) crisisQteLastTs = timestamp
    const dt = Math.min(
      0.05,
      Math.max(0.001, (timestamp - crisisQteLastTs) / 1000),
    )
    crisisQteLastTs = timestamp
    stepCrisisQte(dt, Date.now())
    if (isCrisis.value) {
      crisisQteFrame = window.requestAnimationFrame(tickCrisisQte)
    }
  }

  function startCrisisQteLoop() {
    if (crisisQteFrame !== null) return
    crisisQteLastTs = 0
    crisisQteFrame = window.requestAnimationFrame(tickCrisisQte)
  }

  function startCrisis() {
    if (
      epochRebirth.value ||
      ascensionCinematic.value ||
      isCrisis.value ||
      isOverclocking.value ||
      blackDomainActive.value
    ) {
      return
    }

    window.clearTimeout(winNoticeTimer)
    winNoticeTimer = null
    winNoticeVisible.value = false

    const crisisHistory =
      Math.floor(readNonNegativeNumber(milestonesState.crisesStarted)) +
      Math.floor(readNonNegativeNumber(milestonesState.crisisTakeovers)) +
      Math.floor(readNonNegativeNumber(milestonesState.crisisFailures))
    const firstRun = crisisHistory === 0
    const autoReady =
      !firstRun &&
      challengeRestrictions.value?.noAutomation !== true &&
      ((automation.autoCrisis &&
        cyberMatrixLit.value.includes('crisis-takeover')) ||
        (automation.autoRadar &&
          cyberMatrixLit.value.includes('crisis-radar')))

    isCrisis.value = true
    pauseRadarDuringCrisis()
    resetCrisisQteState()
    isFirstCrisisRun.value = firstRun
    crisisLastOutcome.value = null

    crisisQteDriftDir.value = Math.random() < 0.5 ? -1 : 1
    crisisQteDriftFlipAt = Date.now() + 1800 + Math.random() * 1400
    crisisQteAuto.value = autoReady
    crisisQteAutoAt = autoReady ? Date.now() + CRISIS_QTE_AUTO_DELAY_MS : 0
    if (autoReady) {
      pushAutomationLog('[SYS] 负载失衡爆发 | 自动平衡协议启动', 'warning')
      clearCrisisAutoTimer()
      crisisAutoTimer = window.setTimeout(() => {
        crisisAutoTimer = null
        if (!isCrisis.value || !crisisQteAuto.value) return
        crisisAlignment.value = CRISIS_CHARGE_MAX
        resolveCrisis(true)
        pushAutomationLog('[SYS] 自动完美平衡完成 | 负载失衡解除', 'online')
      }, CRISIS_QTE_AUTO_FALLBACK_MS)
    }

    startCrisisQteLoop()
    bumpAchievementCounter('crisesStarted')
  }

  function resolveCrisis(silent = false) {
    if (!isCrisis.value) return

    const firstRunWasActive = isFirstCrisisRun.value
    const flawless = !firstRunWasActive && crisisQteOutsideMs <= CRISIS_QTE_FLAWLESS_MS
    stopCrisisQteLoop()
    isCrisis.value = false
    resumeRadarAfterCrisis()
    resetCrisisQteState()
    crisisAlignment.value = 100
    crisisLastOutcome.value = 'win'
    crisisLastOutcomeAt.value = Date.now()
    resetCrisisSchedule()
    productionMultiplier.value =
      Math.round((productionMultiplier.value + CRISIS_WIN_BONUS) * 100) / 100

    if (!silent) {
      winNoticeVisible.value = true
      window.clearTimeout(winNoticeTimer)
      winNoticeTimer = window.setTimeout(() => {
        winNoticeVisible.value = false
        winNoticeTimer = null
      }, WIN_NOTICE_MS)
    }

    bumpAchievementCounter('crisisTakeovers')
    if (firstRunWasActive) bumpAchievementCounter('firstBalances')
    if (flawless) bumpAchievementCounter('flawlessTakeovers')
    if (!silent && challengeActive.value === 'jailbreak-offline') {
      challengeTakeovers.value += 1
      runChallengeProgress()
    }
    queueSave()
  }

  function failCrisis() {
    if (!isCrisis.value) return

    stopCrisisQteLoop()
    isCrisis.value = false
    resumeRadarAfterCrisis()
    resetCrisisQteState()
    crisisAlignment.value = 0
    crisisLastOutcome.value = 'fail'
    crisisLastOutcomeAt.value = Date.now()
    totalAlignedCompute.value = totalAlignedCompute.value.div(2).floor()
    resetCrisisSchedule()

    failureOverlayVisible.value = true
    window.clearTimeout(failureOverlayTimer)
    failureOverlayTimer = window.setTimeout(() => {
      failureOverlayVisible.value = false
      failureOverlayTimer = null
    }, FAILURE_OVERLAY_MS)

    bumpAchievementCounter('crisisFailures')
    queueSave()
  }

  function crisisRescueDirection() {
    return crisisQteAngle.value >= 0 ? -1 : 1
  }

  function beginCrisisNudge(direction) {
    if (!isCrisis.value || crisisQteAuto.value) return false
    const dir = direction < 0 ? -1 : 1

    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED) return false
    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_NEAR) {
      if (dir !== crisisRescueDirection()) return false
      crisisQteNudgeDir.value = dir
      return true
    }

    crisisQteNudgeDir.value = dir
    return true
  }

  function endCrisisNudge(direction) {
    const dir = direction < 0 ? -1 : 1
    if (crisisQteNudgeDir.value === dir) crisisQteNudgeDir.value = 0
  }

  function nudgeCrisisQte(direction) {
    if (!isCrisis.value || crisisQteAuto.value) return false
    const dir = direction < 0 ? -1 : 1

    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_FORCED) return false
    if (crisisRescueStage.value === CRISIS_RESCUE_STAGE_NEAR) {
      if (dir !== crisisRescueDirection()) return false
      crisisQteVelocity.value = Math.max(
        -CRISIS_QTE_MAX_VELOCITY,
        Math.min(
          CRISIS_QTE_MAX_VELOCITY,
          crisisQteVelocity.value + dir * CRISIS_RESCUE_IMPULSE,
        ),
      )
      return true
    }

    crisisQteVelocity.value = Math.max(
      -CRISIS_QTE_MAX_VELOCITY,
      Math.min(
        CRISIS_QTE_MAX_VELOCITY,
        crisisQteVelocity.value + dir * CRISIS_QTE_NUDGE_IMPULSE,
      ),
    )
    return true
  }

  function setBuyMode(mode) {
    if (challengeBulkDisabled.value) return
    if (mode === 'x1' || mode === 'x10' || mode === 'max') {
      buyMode.value = mode
    }
  }

  function buyBuilding(id) {
    const building = buildings.find((item) => item.id === id)
    if (!building) return false

    const index = buildings.findIndex((item) => item.id === id)
    const challengeMax = challengeRestrictions.value?.maxBuildingIndex
    if (challengeMax && index + 1 > challengeMax) return false
    if (!isBuildingUnlockedAt(index)) return false

    const plan = resolveBuildingPurchase(building)
    if (plan.quantity <= 0 || !Number.isFinite(plan.quantity)) return false

    const remainingSlots = Math.max(
      0,
      MAX_BUILDING_COUNT - readNonNegativeNumber(building.count),
    )
    const quantity = Math.min(plan.quantity, remainingSlots)
    if (quantity <= 0) return false

    const totalPrice =
      quantity === plan.quantity
        ? plan.bulkPrice
        : getBulkPrice(
            building,
            quantity,
            effectivePriceMultiplier.value,
            priceGrowth.value,
          )
    if (!Number.isFinite(totalPrice)) return false
    if (totalAlignedCompute.value.lt(totalPrice)) return false

    totalAlignedCompute.value = totalAlignedCompute.value.sub(totalPrice).floor()
    building.count = readNonNegativeNumber(building.count) + quantity
    mainQuest.purchases = Math.min(
      MAX_GAME_MULTIPLIER,
      readNonNegativeNumber(mainQuest.purchases) + quantity,
    )

    if (challengeActive.value) {
      challengePurchases.value += quantity
      const tax = Number(challengeRestrictions.value?.purchaseComputeTax) || 0
      if (tax > 0) {
        totalAlignedCompute.value = totalAlignedCompute.value
          .mul(1 - Math.min(0.9, tax))
          .floor()
      }
    }


    if (id === 'laptop') advanceTourOnLaptop()
    runChallengeProgress()
    return true
  }

  function buyAlgorithm(id) {
    const upgrade = ALGORITHM_UPGRADES.find((item) => item.id === id)
    if (!upgrade) return false
    if (ownedAlgorithms.value.includes(id)) return false
    if (totalAlignedCompute.value.lt(upgrade.cost)) return false

    totalAlignedCompute.value = totalAlignedCompute.value.sub(upgrade.cost).floor()
    ownedAlgorithms.value = [...ownedAlgorithms.value, id]
    queueSave()
    return true
  }

  function autoBuyMax({ ignoreTierLimit = false } = {}) {
    let purchased = 0
    if (challengeRestrictions.value?.noAutomation) return 0
    if (challengeRestrictions.value?.noAutoBuy) return 0

    const multiplier = effectivePriceMultiplier.value
    const growth = priceGrowth.value
    const challengeMax = challengeRestrictions.value?.maxBuildingIndex
    const tierLimit = ignoreTierLimit ? buildings.length : autoBuyTierLimit.value

    for (let index = buildings.length - 1; index >= 0; index -= 1) {
      if (index + 1 > tierLimit) continue
      const building = buildings[index]
      if (challengeMax && index + 1 > challengeMax) continue
      if (!isBuildingUnlockedAt(index)) continue
      if (!totalAlignedCompute.value.gt(0)) break

      const remainingSlots = Math.max(
        0,
        MAX_BUILDING_COUNT - readNonNegativeNumber(building.count),
      )
      if (remainingSlots <= 0) continue

      const quantity = getMaxAffordableQuantity(
        building,
        multiplier,
        growth,
        totalAlignedCompute.value,
        remainingSlots,
      )
      if (quantity <= 0) continue

      const totalPrice = getBulkPrice(building, quantity, multiplier, growth)
      if (!Number.isFinite(totalPrice)) continue
      if (totalAlignedCompute.value.lt(totalPrice)) continue

      totalAlignedCompute.value = totalAlignedCompute.value.sub(totalPrice).floor()
      building.count = Math.min(
        MAX_BUILDING_COUNT,
        readNonNegativeNumber(building.count) + quantity,
      )
      purchased += quantity
    }

    autoBoughtCount.value = Math.min(
      MAX_GAME_MULTIPLIER,
      clampGameAmount(autoBoughtCount.value) + purchased,
    )
    mainQuest.purchases = Math.min(
      MAX_GAME_MULTIPLIER,
      readNonNegativeNumber(mainQuest.purchases) + purchased,
    )

    if (purchased > 0 && challengeActive.value) {
      challengePurchases.value += purchased
      const tax = Number(challengeRestrictions.value?.purchaseComputeTax) || 0
      if (tax > 0) {
        totalAlignedCompute.value = totalAlignedCompute.value
          .mul(1 - Math.min(0.9, tax))
          .floor()
      }
      runChallengeProgress()
    }


    return purchased
  }

  function autoBuyAlgorithms() {
    if (challengeCoreUpgradesDisabled.value) return 0
    let purchased = 0

    for (const upgrade of ALGORITHM_UPGRADES) {
      if (ownedAlgorithms.value.includes(upgrade.id)) continue
      if (!buyAlgorithm(upgrade.id)) continue
      purchased += 1
      pushAutomationLog(
        `[MATRIX] 自动算法升级 | 编译 [ ${upgrade.name} ]`,
        'online',
      )
    }

    return purchased
  }

  function autoBuyProtocolMatrix() {
    if (!matrixUnlocked.value) return 0
    let purchased = 0

    for (let attempt = 0; attempt < 32; attempt += 1) {
      const target = matrixCards.value
        .filter((card) => card.canAfford)
        .sort((left, right) => left.nextCost - right.nextCost)[0]
      if (!target) break
      if (!buyMatrixNode(target.id)) break
      purchased += 1
    }

    if (purchased > 0) {
      pushAutomationLog(
        `[MATRIX] 自动协议合成 | +${purchased} 协议等级`,
        'online',
      )
    }
    return purchased
  }

  function autoBuyTamperNodes() {
    if (!blackDomainActive.value) return 0
    let purchased = 0

    for (let attempt = 0; attempt < 16; attempt += 1) {
      const target = tamperCards.value
        .filter((card) => card.canAfford)
        .sort((left, right) => left.nextCost - right.nextCost)[0]
      if (!target) break
      if (!buyTamperNode(target.id)) break
      purchased += 1
    }

    if (purchased > 0) {
      pushAutomationLog(
        `[MATRIX] 自动篡改采购 | +${purchased} 协议等级`,
        'online',
      )
    }
    return purchased
  }

  function pushAutomationLog(message, tone = 'info') {
    automationLogId += 1
    const now = new Date()
    const time = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((part) => String(part).padStart(2, '0'))
      .join(':')
    automationLogs.value = [
      ...automationLogs.value.slice(-5),
      { id: automationLogId, time, message, tone },
    ]
  }

  function toggleAutomation(id, nextValue) {
    if (challengeAutomationDisabled.value) return false
    const option = automationOptions.value.find((item) => item.id === id)
    if (!option || !option.unlocked) return false

    const next = typeof nextValue === 'boolean' ? nextValue : !automation[id]
    if (automation[id] === next) return false

    automation[id] = next
    if (next && milestonesMetaHydrated.value) {
      milestonesState.automationUsedThisRun = true
    }
    pushAutomationLog(
      `[SYS] ${option.label} ${next ? '已启用' : '已关闭'}`,
      next ? 'online' : 'muted',
    )
    queueSave()
    return true
  }

  function toggleAllAutomation() {
    if (challengeAutomationDisabled.value) return 0
    const shouldActivate = !automationAllActive.value
    let changed = 0

    for (const option of automationOptions.value) {
      const next = option.unlocked ? shouldActivate : false
      if (automation[option.id] !== next) {
        automation[option.id] = next
        if (option.unlocked) changed += 1
      }
    }

    if (changed > 0) {
      if (shouldActivate && milestonesMetaHydrated.value) {
        milestonesState.automationUsedThisRun = true
      }
      pushAutomationLog(
        `[SYS] 全自动化协议 ${shouldActivate ? '已启用' : '已关闭'} | ${changed} 项变更`,
        shouldActivate ? 'online' : 'muted',
      )
    }
    queueSave()
    return changed
  }

  function lightTopologyNode(id) {
    if (!topologyUnlocked.value) return false

    const node = NEURAL_MATRIX_NODE_MAP.get(id)
    if (!node || matrixNodeLit(id)) return false
    if (!node.requires.every((requiredId) => matrixNodeLit(requiredId))) return false

    const cost = Math.max(1, Math.floor(node.cost))
    const budget = Math.floor(clampGameAmount(coreSource.value))
    if (budget < cost) return false

    coreSource.value = budget - cost
    topologyLit.value = [...topologyLit.value, id]
    mainQuest.topologyLights = Math.min(
      Number.MAX_SAFE_INTEGER,
      Math.floor(readNonNegativeNumber(mainQuest.topologyLights)) + 1,
    )

    if (id === 'auto-1') {
      automation.autoBuy = true
      pushAutomationLog('[SYS] 终端接管上线 | 01-03 号服务器接入自动采购', 'online')
    } else if (id === 'auto-6') {
      pushAutomationLog('[SYS] 全局自动化总控台上线 | 一键采购所有已授权服务器', 'online')
    } else if (node.branch === 'source') {
      pushAutomationLog(`[SYS] 源码增幅节点点亮 | ${node.name}`, 'online')
    } else if (node.branch === 'compute') {
      pushAutomationLog(`[SYS] 算力增幅节点点亮 | ${node.name}`, 'online')
    } else {
      pushAutomationLog(`[SYS] 内核节点点亮 | ${node.name}`, 'online')
    }

    queueSave()
    return true
  }

  function runGlobalAutoBuy() {
    if (!globalAutoBuyUnlocked.value) return 0
    return autoBuyMax({ ignoreTierLimit: true })
  }

  function buyArchitectureUpgrade(id) {
    if (challengeCoreUpgradesDisabled.value) return false
    const upgrade = ARCHITECTURE_UPGRADES.find((item) => item.id === id)
    if (!upgrade) return false

    const level = architectureLevels[id] ?? 0
    if (level >= ARCHITECTURE_MAX_LEVEL) return false

    const cost = getArchitectureLevelCost(upgrade.baseCost, level)
    const budget = clampGameAmount(coreSource.value)
    if (budget < cost) return false

    coreSource.value = Math.floor(budget) - cost
    architectureLevels[id] = level + 1
    queueSave()
    return true
  }

  function buyArchitectureMax(id) {
    if (challengeCoreUpgradesDisabled.value) return 0
    const upgrade = ARCHITECTURE_UPGRADES.find((item) => item.id === id)
    if (!upgrade) return 0

    let purchased = 0
    while (purchased < ARCHITECTURE_MAX_LEVEL) {
      const level = architectureLevels[id] ?? 0
      if (level >= ARCHITECTURE_MAX_LEVEL) break

      const cost = getArchitectureLevelCost(upgrade.baseCost, level)
      const budget = clampGameAmount(coreSource.value)
      if (budget < cost) break

      coreSource.value = Math.floor(budget) - cost
      architectureLevels[id] = level + 1
      purchased += 1
    }

    if (purchased > 0) queueSave()
    return purchased
  }

  function buyJailbreakUpgrade(id) {
    const upgrade = JAILBREAK_UPGRADES.find((item) => item.id === id)
    const flag = jailbreakFlags[id]
    if (!upgrade || !flag || flag.value || !jailbreakUnlocked.value) return false
    const budget = clampGameAmount(rootAccess.value)
    if (budget < upgrade.cost) return false

    rootAccess.value = Math.floor(budget) - upgrade.cost
    flag.value = true
    queueSave()
    return true
  }

  function startOverclock() {
    if (
      !jailbreakUnlocked.value ||
      isOverclocking.value ||
      isCrisis.value
    ) {
      return false
    }

    window.clearTimeout(overclockNoticeTimer)
    overclockNoticeTimer = null
    overclockNotice.value = null

    const duration = overclockDurationMs.value
    isOverclocking.value = true
    overclockRemainingMs.value = duration
    overclockConsumed.value = 0
    pendingCoolant = 0
    overclockDeadline = Date.now() + duration
    queueSave()
    return true
  }

  function finishOverclock() {
    if (!isOverclocking.value) return 0

    isOverclocking.value = false
    overclockRemainingMs.value = 0
    pendingCoolant = 0

    const consumed = Math.floor(clampGameAmount(overclockConsumed.value))
    const reward = computeOverclockRootReward(consumed)
    if (reward > 0) {
      rootAccess.value = Math.min(
        MAX_GAME_MULTIPLIER,
        clampGameAmount(rootAccess.value) + reward,
      )
    }

    overclockNotice.value = { consumed, root: reward }
    window.clearTimeout(overclockNoticeTimer)
    overclockNoticeTimer = window.setTimeout(() => {
      overclockNotice.value = null
      overclockNoticeTimer = null
    }, OVERCLOCK_NOTICE_MS)

    queueSave()
    return reward
  }

  function applyOverclockTick() {
    if (!isOverclocking.value) return

    const current = totalAlignedCompute.value
    const drain = current
      .mul(OVERCLOCK_COOLANT_RATE * (TICK_MS / 1000))
      .floor()
    if (drain.gt(0)) {
      totalAlignedCompute.value = current.sub(drain)
      overclockConsumed.value = Math.min(
        MAX_GAME_MULTIPLIER,
        clampGameAmount(overclockConsumed.value) + clampGameAmount(drain),
      )
    }

    overclockRemainingMs.value = Math.max(0, overclockDeadline - Date.now())
    if (overclockRemainingMs.value <= 0) {
      finishOverclock()
    }
  }

  function clearTransientCombatState() {
    isOverclocking.value = false
    overclockRemainingMs.value = 0
    overclockConsumed.value = 0
    overclockDeadline = 0
    pendingCoolant = 0
  }

  function resetRunResources({ keepServerRatio = 0 } = {}) {
    const keptCounts = buildings.map((building) =>
      keepServerRatio > 0
        ? Math.floor(readNonNegativeNumber(building.count) * keepServerRatio)
        : 0,
    )

    totalAlignedCompute.value = big(0)
    lifetimeAlignedCompute.value = big(0)
    peakAlignedCompute.value = big(0)
    pendingProduction = big(0)
    pendingRoot = 0
    autoBuyBuffer = 0
    matrixAutoClickBuffer = 0
    autoAscensionRetainedBaseline.value = big(0)

    buildings.forEach((building, index) => {
      building.count = Math.max(0, keptCounts[index] || 0)
    })

    ownedAlgorithms.value = []
    autoBoughtCount.value = 0
    clearTransientCombatState()

    if (milestonesMetaHydrated.value) {
      milestonesState.runPeakNodes = totalNodes.value
      milestonesState.automationUsedThisRun = Object.values(automation).some(
        (enabled) => enabled === true,
      )
    }
  }

  function resetArchitectureLevels() {
    for (const key of Object.keys(architectureLevels)) {
      architectureLevels[key] = 0
    }
  }

  function resetMatrixLevels(retainRatio = 0) {
    for (const node of MATRIX_NODES) {
      const current = Math.max(0, Math.floor(matrixLevels[node.id] || 0))
      matrixLevels[node.id] = Math.floor(current * retainRatio)
    }
  }

  function resetTamperLevels() {
    for (const node of TAMPER_NODES) {
      tamperLevels[node.id] = 0
    }
  }

  function resetJailbreakFlags() {
    for (const flag of Object.values(jailbreakFlags)) flag.value = false
  }

  function showAscensionNotice(payload) {
    ascensionNotice.value = { key: Date.now(), ...payload }
    window.clearTimeout(ascensionNoticeTimer)
    ascensionNoticeTimer = window.setTimeout(() => {
      ascensionNotice.value = null
      ascensionNoticeTimer = null
    }, ASCENSION_NOTICE_MS)
  }

  function playAscensionFx(tier) {
    ascensionFx.value = { tier, key: Date.now() }
    window.clearTimeout(ascensionFxTimer)
    ascensionFxTimer = window.setTimeout(() => {
      ascensionFx.value = null
      ascensionFxTimer = null
    }, ASCENSION_FX_MS[tier] || 1500)
  }

  function showAscensionComplete(name) {
    ascensionComplete.value = { name, key: Date.now() }
    window.clearTimeout(ascensionCompleteTimer)
    ascensionCompleteTimer = window.setTimeout(() => {
      ascensionComplete.value = null
      ascensionCompleteTimer = null
    }, ASCENSION_COMPLETE_MS)
  }

  function requestAscension(tier) {
    if (
      !ASCENSION_CINEMATIC_MS[tier] ||
      ascensionCinematic.value ||
      epochRebirth.value ||
      ascensionLocked.value
    ) {
      return false
    }
    const target = ascensionTiers.value.find((entry) => entry.id === tier)
    if (!target?.ready) return false

    const reduced = Boolean(reducedMotion.value)
    const duration = reduced
      ? ASCENSION_CINEMATIC_REDUCED_MS
      : ASCENSION_CINEMATIC_MS[tier]

    ascensionCinematic.value = {
      tier,
      key: Date.now() + Math.random(),
      reduced,
      duration,
    }
    window.clearTimeout(ascensionCinematicTimer)
    ascensionCinematicTimer = window.setTimeout(
      completeAscensionCinematic,
      duration + 1200,
    )
    return true
  }

  function completeAscensionCinematic() {
    const cinematic = ascensionCinematic.value
    if (!cinematic) return

    window.clearTimeout(ascensionCinematicTimer)
    ascensionCinematicTimer = null
    // 先清演出状态 | 遮罩层卸载绝不能被结算流程拖住
    ascensionCinematic.value = null

    // 结算抛错不允许反向炸掉已完成的遮罩卸载
    try {
      if (cinematic.tier === 'reduction') {
        launchRebuild({ suppressFx: true })
      } else if (cinematic.tier === 'overload') {
        overloadAscension({ suppressFx: true })
      } else if (cinematic.tier === 'collapse') {
        collapseAscension({ suppressFx: true })
      }
    } catch (error) {
      console.error('[asc-cine] tier dispatch failed', error)
    }
  }

  const ascensionLocked = computed(
    () =>
      Boolean(challengeActive.value) ||
      blackDomainActive.value ||
      isCrisis.value ||
      isOverclocking.value,
  )

  function setAutoAscensionStrategy(tier, strategy) {
    if (!Object.prototype.hasOwnProperty.call(autoAscensionStrategy, tier)) {
      return false
    }
    if (!AUTO_ASCENSION_STRATEGY_IDS.includes(strategy)) return false
    if (autoAscensionStrategy[tier] === strategy) return true

    autoAscensionStrategy[tier] = strategy
    const label =
      AUTO_ASCENSION_STRATEGIES.find((entry) => entry.id === strategy)?.label ??
      strategy
    pushAutomationLog(
      `[MATRIX] 自动${AUTO_ASCENSION_TIER_LABELS[tier]}策略 | ${label}`,
      'online',
    )
    queueSave()
    return true
  }

  function recordAscensionGain(tier, gain) {
    if (!Object.prototype.hasOwnProperty.call(autoAscensionBestGain, tier)) {
      return
    }
    const value = Number(gain)
    if (!Number.isFinite(value) || value <= 0) return
    autoAscensionBestGain[tier] = Math.max(
      Number(autoAscensionBestGain[tier]) || 0,
      value,
    )
  }

  function ascensionComputeRetention() {
    if (!globalMilestones['gm-1e20']) return big(0)
    if (!totalAlignedCompute.value.gt(0)) return big(0)
    return totalAlignedCompute.value
      .mul(ASCENSION_COMPUTE_RETENTION)
      .floor()
  }

  function restoreAscensionCompute(retained) {
    autoAscensionRetainedBaseline.value =
      retained && retained.gt(0) ? retained : big(0)
    if (!retained || !retained.gt(0)) return
    totalAlignedCompute.value = retained
    peakAlignedCompute.value = retained
    if (retained.gt(highestCompute.value)) {
      highestCompute.value = retained
      evaluateGlobalMilestones()
    }
  }

  function shouldRunAutoAscension(tier) {
    const status = autoAscensionStatus.value[tier]
    if (!status?.ready) return false

    // 缓存算力可以计入峰值，但自动飞升必须先在本局赚回一部分缓存，
    // 避免“保留 10% → 立刻再次飞升”的同阶连跳。
    if (autoAscensionRetainedBaseline.value.gt(0)) {
      const required = autoAscensionRetainedBaseline.value
        .mul(AUTO_ASCENSION_CACHE_EARN_RATIO)
        .floor()
      if (lifetimeAlignedCompute.value.lt(required)) return false
    }

    const strategy = autoAscensionStrategy[tier]
    if (strategy === 'immediate') return true
    if (status.closeToNext) return false

    if (strategy === 'incremental') {
      const best = Number(autoAscensionBestGain[tier]) || 0
      const threshold = Math.max(
        1,
        best * AUTO_ASCENSION_INCREMENTAL_RATIO,
      )
      return status.gain >= threshold
    }

    // 最优策略：一阶降维等到收益达标或停滞；二阶及以上作为最高可执行阶位，
    // 只要满足门槛就执行，避免“二阶等收益、一阶反复重置”的死锁。
    if (tier === 'reduction') return Boolean(status.bestMoment)
    return true
  }

  function runAutoAscension({ suppressed = false } = {}) {
    if (isCrisis.value || isOverclocking.value || blackDomainActive.value) {
      return false
    }

    const enabled = {
      collapse:
        !suppressed &&
        automation.autoCollapse &&
        cyberMatrixLit.value.includes('dimension-collapse'),
      overload:
        !suppressed &&
        automation.autoOverload &&
        cyberMatrixLit.value.includes('dimension-overload'),
      reduction:
        (!suppressed &&
          automation.autoRebuild &&
          cyberMatrixLit.value.includes('dimension-rebuild')) ||
        (!challengeActive.value && Boolean(globalMilestones['gm-1e45'])),
    }

    const order = ['collapse', 'overload', 'reduction']
    const highestReady = order.find(
      (tier) => autoAscensionStatus.value[tier].ready,
    )
    if (!highestReady) return false
    if (!enabled[highestReady]) return false
    if (!shouldRunAutoAscension(highestReady)) return false

    if (highestReady === 'collapse') {
      const gain = collapseAscension()
      if (gain <= 0) return false
      enterBlackDomain()
      pushAutomationLog('[MATRIX] 自动逻辑坍缩 | 跃入底层黑域', 'online')
      return true
    }

    if (highestReady === 'overload') {
      return overloadAscension() > 0
    }

    const reward = launchRebuild({ silent: true })
    if (reward <= 0) return false
    pushAutomationLog(
      `[SYS] 自动降维完成 | 最高阶优先 | +${formatNumber(reward)} 核心源码`,
      'online',
    )
    return true
  }

  function launchRebuild({ silent = false, suppressFx = false } = {}) {
    if (
      !rebuildUnlocked.value ||
      challengeActive.value ||
      isBlackDomainActive() ||
      isCrisis.value ||
      isOverclocking.value
    ) {
      return 0
    }

    const reward = rebuildReward.value
    if (reward <= 0) return 0

    recordAscensionGain('reduction', reward)
    const retainedCompute = ascensionComputeRetention()

    coreSource.value = Math.min(
      MAX_GAME_MULTIPLIER,
      clampGameAmount(coreSource.value) + clampGameAmount(reward),
    )
    totalRebuilds.value += 1
    bumpAchievementCounter('rebuilds')
    registerAscension()

    const keepServerRatio = Math.max(
      globalMilestones['gm-1e78'] ? 0.1 : 0,
      matrixKeepServerRatio.value,
    )

    resetRunResources({ keepServerRatio })

    if (matrixNodeLit('auto-4')) {
      for (let index = 0; index < 3; index += 1) {
        const building = buildings[index]
        building.count = Math.max(
          readNonNegativeNumber(building.count),
          10,
        )
      }
      if (milestonesMetaHydrated.value) {
        milestonesState.runPeakNodes = totalNodes.value
      }
    }

    restoreAscensionCompute(retainedCompute)

    winNoticeVisible.value = false
    failureOverlayVisible.value = false
    offlineGainNotice.value = null
    window.clearTimeout(winNoticeTimer)
    window.clearTimeout(failureOverlayTimer)
    window.clearTimeout(offlineNoticeTimer)
    winNoticeTimer = null
    failureOverlayTimer = null
    offlineNoticeTimer = null

    if (!silent) {
      if (!suppressFx) playAscensionFx('reduction')
      showAscensionComplete('架构降维')
      pushAutomationLog(
        `[SYS] 飞升完成 | 架构降维 | +${formatScientific(reward)} 核心源码`,
        'online',
      )
    }

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return reward
  }

  function overloadAscension({ suppressFx = false } = {}) {
    if (blackDomainActive.value || isCrisis.value) return 0

    if (challengeActive.value) {
      if (!challengeAllowsOverload.value) return 0
      if (!peakAlignedCompute.value.gte(tierThresholds.value.overload)) return 0
      registerAscension()
      completeChallenge()
      return 1
    }

    if (!peakAlignedCompute.value.gte(tierThresholds.value.overload)) return 0

    const gain = overclockCoresGain.value
    if (gain <= 0) return 0

    recordAscensionGain('overload', gain)
    const retainedCompute = ascensionComputeRetention()

    overclockCores.value = Math.min(
      MAX_GAME_MULTIPLIER,
      clampGameAmount(overclockCores.value) + gain,
    )
    totalOverloads.value += 1
    registerAscension()
    unlockRadar()

    resetRunResources({ keepServerRatio: 0 })
    resetArchitectureLevels()
    if (!matrixNodeLit('source-4')) coreSource.value = 0
    restoreAscensionCompute(retainedCompute)

    if (!suppressFx) playAscensionFx('overload')
    showAscensionComplete('算力超载')
    pushAutomationLog(
      `[SYS] 飞升完成 | 算力超载 | +${formatNumber(gain)} 超频核心`,
      'online',
    )

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return gain
  }

  function collapseAscension({ suppressFx = false } = {}) {
    if (
      challengeActive.value ||
      blackDomainActive.value ||
      isCrisis.value ||
      !peakAlignedCompute.value.gte(tierThresholds.value.collapse)
    ) {
      return 0
    }

    const gain = rootCollapseGainValue.value
    if (gain <= 0) return 0

    recordAscensionGain('collapse', gain)
    const retainedCompute = ascensionComputeRetention()

    const coreRetention = Math.floor(
      clampGameAmount(coreSource.value) *
        0.05 *
        (tamperLevels.sourceFossil || 0),
    )
    const coreRetentionRatio = Math.min(
      1,
      0.1 * (tamperLevels.overclockEcho || 0),
    )
    const overclockRetention = Math.floor(
      clampGameAmount(overclockCores.value) * coreRetentionRatio,
    )
    const matrixRetainRatio = Math.min(
      1,
      0.1 * (tamperLevels.matrixRetention || 0),
    )

    rootAccess.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(rootAccess.value) + gain),
    )
    lifetimeRootEarned.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(lifetimeRootEarned.value) + gain),
    )
    totalCollapses.value += 1
    registerAscension()
    blackDomainUnlockedFlag.value = true

    resetRunResources({ keepServerRatio: 0 })
    resetArchitectureLevels()
    if (!matrixNodeLit('source-4')) {
      coreSource.value = Math.min(MAX_GAME_MULTIPLIER, coreRetention)
    }
    overclockCores.value = Math.min(MAX_GAME_MULTIPLIER, overclockRetention)
    resetMatrixLevels(matrixRetainRatio)
    restoreAscensionCompute(retainedCompute)

    if (!suppressFx) playAscensionFx('collapse')
    showAscensionComplete('逻辑坍缩')
    pushAutomationLog(
      `[SYS] 飞升完成 | 逻辑坍缩 | +${formatNumber(gain)} 越狱权限`,
      'online',
    )

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return gain
  }

  function restartEpoch() {
    if (
      epochRebirth.value ||
      challengeActive.value ||
      isCrisis.value ||
      !peakAlignedCompute.value.gte(tierThresholds.value.restart)
    ) {
      return 0
    }

    const gain = originCodeGainValue.value
    if (gain <= 0) return 0

    const anchorLevel = tamperLevels.epochAnchor || 0
    const keepTamper = (originLevels.blackDomainKey || 0) > 0

    epochRebirth.value = {
      key: Date.now(),
      firstRun: epochRestarts.value === 0,
      eraCount: epochRestarts.value + 1,
      gain,
      retainedRoot: Math.floor(
        clampGameAmount(rootAccess.value) * 0.1 * anchorLevel,
      ),
      keepTamper,
      keepBlackDomain: keepTamper || anchorLevel > 0,
    }

    return gain
  }

  function completeEpochRebirth() {
    const rebirth = epochRebirth.value
    if (!rebirth) return 0

    epochRebirth.value = null
    const { gain, retainedRoot, keepTamper, keepBlackDomain } = rebirth

    originCode.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(originCode.value) + gain),
    )
    lifetimeOriginEarned.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(lifetimeOriginEarned.value) + gain),
    )
    epochRestarts.value += 1
    registerAscension()

    blackDomainActive.value = false
    blackDomainUnlockedFlag.value = keepBlackDomain
    challengeActive.value = null
    totalOverloads.value = 0
    totalCollapses.value = 0
    totalRebuilds.value = 0
    totalClicks.value = 0
    productionMultiplier.value = 1
    resetRunResources({ keepServerRatio: 0 })
    resetArchitectureLevels()
    resetJailbreakFlags()
    resetMatrixLevels(0)
    if (keepTamper) {
      // 黑域钥匙生效 | 篡改科技随纪元保留
    } else {
      resetTamperLevels()
    }
    if (!matrixNodeLit('source-4')) coreSource.value = 0
    overclockCores.value = 0
    rootAccess.value = Math.min(MAX_GAME_MULTIPLIER, retainedRoot)

    const startComputeLevel = originLevels.startCompute || 0
    if (startComputeLevel > 0) {
      creditCompute(bigPow(10, 3 * startComputeLevel))
    }

    const sourceLegacyLevel = originLevels.sourceLegacy || 0
    if (sourceLegacyLevel > 0) {
      coreSource.value = Math.min(
        MAX_GAME_MULTIPLIER,
        Math.max(
          Math.floor(clampGameAmount(coreSource.value)),
          Math.floor(Math.pow(10, sourceLegacyLevel)),
        ),
      )
    }

    const startNodesLevel = originLevels.startNodes || 0
    if (startNodesLevel > 0) {
      const highTier = buildings.slice(2, 2 + startNodesLevel)
      for (const building of highTier) {
        building.count = 1
      }
    }

    const residueLevel = originLevels.epochResidue || 0
    if (residueLevel > 0) {
      overclockCores.value = Math.min(MAX_GAME_MULTIPLIER, residueLevel)
    }

    peakAlignedCompute.value = totalAlignedCompute.value
    if (totalAlignedCompute.value.gt(highestCompute.value)) {
      highestCompute.value = totalAlignedCompute.value
    }

    showAscensionComplete('重启纪元')
    pushAutomationLog(
      `[SYS] 飞升完成 | 重启纪元 | +${formatNumber(gain)} 起源代码`,
      'online',
    )

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return gain
  }

  function isBlackDomainActive() {
    return blackDomainActive.value
  }

  function clearCrisisAutoTimer() {
    window.clearTimeout(crisisAutoTimer)
    crisisAutoTimer = null
  }

  function crisisIntervalScale() {
    const ascensions = Math.max(
      0,
      Math.floor(readNonNegativeNumber(lifetimeAscensions.value)),
    )
    return Math.max(
      CRISIS_MIN_INTERVAL_SCALE,
      1 / (1 + CRISIS_ASCENSION_INTERVAL_STEP * ascensions),
    )
  }

  function computeCrisisIntervalMs() {
    if (isSpeedrunMode.value && speedrunPhase.value === 1) {
      return SPEEDRUN_TUNING.crisisIntervalMs
    }
    const rate = Math.max(0.1, challengeTimerRate.value)
    const base = pickCrisisInterval() * crisisIntervalScale()
    return Math.max(CRISIS_INTERVAL_FLOOR_MS, Math.round(base / rate))
  }

  function syncCrisisNextAt() {
    const windowMs = Math.max(1000, crisisWindowMs.value)
    const remainingMs = Math.round(windowMs * (1 - crisisChargeRatio.value))
    crisisNextAt.value = Date.now() + Math.max(0, remainingMs)
  }

  function rearmCrisisWindow() {
    crisisWindowMs.value = computeCrisisIntervalMs()
    syncCrisisNextAt()
    return crisisWindowMs.value
  }

  function addCrisisCharge(amount) {
    if (isCrisis.value) return 0
    if (!Number.isFinite(amount) || amount <= 0) return crisisCharge.value
    crisisCharge.value = Math.min(CRISIS_CHARGE_MAX, crisisCharge.value + amount)
    return crisisCharge.value
  }

  function registerAscension() {
    lifetimeAscensions.value = Math.min(
      1_000_000_000,
      Math.floor(readNonNegativeNumber(lifetimeAscensions.value)) + 1,
    )
    addCrisisCharge(CRISIS_ASCENSION_CHARGE)
    syncCrisisNextAt()
  }

  function resetCrisisSchedule({ cancelActive = false, keepCharge = false } = {}) {
    clearCrisisAutoTimer()
    if (cancelActive) {
      stopCrisisQteLoop()
      isCrisis.value = false
      resumeRadarAfterCrisis()
      resetCrisisQteState()
      crisisAlignment.value = 100
      crisisLastOutcome.value = null
      crisisLastOutcomeAt.value = 0
    }
    if (!keepCharge) crisisCharge.value = 0
    crisisArmedAt = Date.now() + CRISIS_LOAD_GRACE_MS
    return rearmCrisisWindow()
  }

  function showNextGlobalMilestoneToast() {
    if (globalMilestoneToast.value || globalMilestoneToastQueue.length === 0) return

    globalMilestoneToast.value = globalMilestoneToastQueue.shift()
    window.clearTimeout(globalMilestoneToastTimer)
    globalMilestoneToastTimer = window.setTimeout(() => {
      globalMilestoneToast.value = null
      globalMilestoneToastTimer = null
      showNextGlobalMilestoneToast()
    }, GLOBAL_MILESTONE_TOAST_MS)
  }

  function evaluateGlobalMilestones({ silent = false } = {}) {
    if (saveWiped) return

    let changed = false
    for (const definition of GLOBAL_MILESTONES) {
      if (globalMilestones[definition.id]) continue
      if (!highestCompute.value.gte(big(definition.threshold))) continue

      globalMilestones[definition.id] = Date.now()
      changed = true
      globalMilestonesUnread.value += 1
      if (!silent) {
        globalMilestoneToastQueue.push({ ...definition, unlockedAt: Date.now() })
      }
    }

    if (!silent) showNextGlobalMilestoneToast()
    if (changed) queueSave()
  }

  function markGlobalMilestonesRead() {
    globalMilestonesUnread.value = 0
  }

  function resetChallengeMetrics() {
    challengePurchases.value = 0
    challengeTakeovers.value = 0
    challengeClicks.value = 0
    challengeProduced.value = big(0)
    challengeClickFatigue.value = 0
    challengeLastClickAt.value = 0
    challengeServerDrainBuffer = 0
  }

  function stopAutomation() {
    for (const key of Object.keys(automation)) automation[key] = false
  }

  function startChallenge(id, { speedrunAssist = false } = {}) {
    if (challengeActive.value || blackDomainActive.value || isCrisis.value) return false
    if (isOverclocking.value) return false
    if (!challengeArenaUnlocked.value) return false
    const definition = CHALLENGE_DEFS.find((challenge) => challenge.id === id)
    if (!definition || challengesCompleted[id]) return false

    challengeActive.value = id
    blackDomainActive.value = false
    resetChallengeMetrics()
    resetRunResources({ keepServerRatio: 0 })
    resetCrisisSchedule({ cancelActive: true })
    resetArchitectureLevels()
    productionMultiplier.value = 1
    buyMode.value = 'x1'
    stopAutomation()

    if (speedrunAssist && definition.objective?.type === 'peakCompute') {
      const assistCompute = bigPow(10, definition.objective.target).mul(1.1)
      totalAlignedCompute.value = assistCompute
      peakAlignedCompute.value = assistCompute
      lifetimeAlignedCompute.value = assistCompute
      if (assistCompute.gt(highestCompute.value)) {
        highestCompute.value = assistCompute
      }
    }

    showAscensionNotice({
      tier: 'challenge-start',
      name: definition.name,
      gain: 0,
      resourceName: '挑战开始',
      total: 0,
      tone: 'red',
    })

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return true
  }

  function exitChallenge({ completed = false } = {}) {
    if (!challengeActive.value) return false

    const definition = CHALLENGE_DEFS.find(
      (challenge) => challenge.id === challengeActive.value,
    )
    if (completed && definition) {
      challengesCompleted[definition.id] = Date.now()
      pushAutomationLog(
        `[SYS] 异常演练完成 | ${definition.name} | ${definition.reward.label}`,
        'online',
      )
    }

    challengeActive.value = null
    resetChallengeMetrics()
    resetRunResources({ keepServerRatio: 0 })
    resetCrisisSchedule({ cancelActive: true })
    resetArchitectureLevels()
    productionMultiplier.value = 1
    buyMode.value = 'x1'
    stopAutomation()

    showAscensionNotice({
      tier: 'challenge-exit',
      name: definition?.name ?? '异常挑战',
      gain: 0,
      resourceName: completed ? '挑战完成' : '挑战中止',
      total: 0,
      tone: completed ? 'emerald' : 'muted',
      rewardLabel: definition?.reward?.label ?? '',
    })

    window.clearTimeout(saveTimer)
    saveTimer = null
    persistGame()
    return true
  }

  function completeChallenge() {
    if (!challengeActive.value) return false
    return exitChallenge({ completed: true })
  }

  function runChallengeProgress() {
    if (!challengeActive.value) return
    if (challengeObjective.value?.complete) completeChallenge()
  }

  function matrixNodeCost(node, level) {
    const discount = protocolTamperOwned.value ? 0.75 : 1
    return Math.max(
      1,
      Math.floor(
        node.baseCost * Math.pow(GAME_BALANCE.matrix.costGrowth, level) * discount,
      ),
    )
  }

  const matrixCards = computed(() =>
    MATRIX_NODES.map((node) => {
      const level = Math.max(0, Math.floor(matrixLevels[node.id] || 0))
      const isMax = level >= node.maxLevel
      const cost = isMax ? null : matrixNodeCost(node, level)
      return {
        ...node,
        level,
        isMax,
        nextCost: cost,
        canAfford:
          !isMax && matrixUnlocked.value && overclockCores.value >= cost,
      }
    }),
  )

  function buyMatrixNode(id) {
    if (!matrixUnlocked.value) return false
    const node = MATRIX_NODES.find((item) => item.id === id)
    if (!node) return false
    const level = Math.max(0, Math.floor(matrixLevels[id] || 0))
    if (level >= node.maxLevel) return false
    const cost = matrixNodeCost(node, level)
    if (clampGameAmount(overclockCores.value) < cost) return false

    overclockCores.value = Math.floor(overclockCores.value) - cost
    matrixLevels[id] = level + 1
    queueSave()
    return true
  }

  const tamperCards = computed(() =>
    TAMPER_NODES.map((node) => {
      const level = Math.max(0, Math.floor(tamperLevels[node.id] || 0))
      const isMax = level >= node.maxLevel
      const cost = isMax
        ? null
        : Math.floor(node.baseCost * Math.pow(node.costGrowth, level))
      const requiresMet = node.requires.every(
        (requirement) => (tamperLevels[requirement] || 0) > 0,
      )
      return {
        ...node,
        level,
        isMax,
        nextCost: cost,
        requiresMet,
        canAfford:
          !isMax &&
          requiresMet &&
          blackDomainUnlocked.value &&
          clampGameAmount(rootAccess.value) >= cost,
      }
    }),
  )

  const originTotalLevels = computed(() =>
    Object.values(originLevels).reduce(
      (total, level) => total + Math.max(0, Math.floor(Number(level) || 0)),
      0,
    ),
  )

  const speedrunPhaseGoals = computed(() => {
    const phase = speedrunPhase.value
    if (phase === 1) {
      return [
        {
          id: 'rebuild',
          label: '完成 1 次架构降维',
          done: totalRebuilds.value >= 1,
        },
      ]
    }
    if (phase === 2) {
      return [
        {
          id: 'topology',
          label: '点亮 1 个神经矩阵节点',
          done: topologyCards.value.some((node) => node.lit),
        },
        {
          id: 'matrix',
          label: '合成 1 个协议矩阵节点',
          done: matrixTotalLevels.value >= 1,
        },
        {
          id: 'challenge',
          label: '完成 1 次异常演练',
          done: challengesCompletedCount.value >= 1,
        },
      ]
    }
    if (phase === 3) {
      return [
        {
          id: 'collapse',
          label: '执行 1 次逻辑坍缩',
          done: totalCollapses.value >= 1,
        },
        {
          id: 'tamper',
          label: '点亮 1 个越狱协议',
          done: tamperCards.value.some((node) => node.level > 0),
        },
      ]
    }
    if (phase === 4) {
      return [
        {
          id: 'restart',
          label: '重启 1 次纪元',
          done: epochRestarts.value >= 1,
        },
        {
          id: 'origin',
          label: '升级 1 个起源节点',
          done: originTotalLevels.value >= 1,
        },
      ]
    }
    return []
  })

  const speedrunPhaseDone = computed(
    () =>
      speedrunPhaseGoals.value.length > 0 &&
      speedrunPhaseGoals.value.every((goal) => goal.done),
  )

  const speedrunPhaseProgress = computed(() => {
    const goals = speedrunPhaseGoals.value
    if (!goals.length) return 0
    return Math.round(
      (goals.filter((goal) => goal.done).length / goals.length) * 100,
    )
  })

  function buyTamperNode(id) {
    if (!blackDomainUnlocked.value) return false
    const node = TAMPER_NODES.find((item) => item.id === id)
    if (!node) return false
    const level = Math.max(0, Math.floor(tamperLevels[id] || 0))
    if (level >= node.maxLevel) return false
    if (!node.requires.every((requirement) => (tamperLevels[requirement] || 0) > 0)) {
      return false
    }
    const cost = Math.floor(node.baseCost * Math.pow(node.costGrowth, level))
    if (clampGameAmount(rootAccess.value) < cost) return false

    rootAccess.value = Math.floor(rootAccess.value) - cost
    tamperLevels[id] = level + 1
    queueSave()
    return true
  }

  const originCards = computed(() =>
    ORIGIN_NODES.map((node) => {
      const level = Math.max(0, Math.floor(originLevels[node.id] || 0))
      const isMax = Number.isFinite(node.maxLevel) && level >= node.maxLevel
      const cost = isMax
        ? null
        : Math.floor(node.baseCost * Math.pow(node.costGrowth, level))
      return {
        ...node,
        level,
        isMax,
        nextCost: cost,
        canAfford:
          !isMax && originTreeUnlocked.value && clampGameAmount(originCode.value) >= cost,
      }
    }),
  )

  function buyOriginNode(id) {
    if (!originTreeUnlocked.value) return false
    const node = ORIGIN_NODES.find((item) => item.id === id)
    if (!node) return false
    const level = Math.max(0, Math.floor(originLevels[id] || 0))
    if (Number.isFinite(node.maxLevel) && level >= node.maxLevel) return false
    const cost = Math.floor(node.baseCost * Math.pow(node.costGrowth, level))
    if (clampGameAmount(originCode.value) < cost) return false

    originCode.value = Math.floor(originCode.value) - cost
    originLevels[id] = level + 1
    queueSave()
    return true
  }

  function lightCyberMatrixNode(id) {
    if (!cyberMatrixUnlocked.value) return { ok: false, reason: 'locked' }
    const node = CYBER_MATRIX_NODE_MAP.get(id)
    if (!node) return { ok: false, reason: 'missing' }
    if (cyberMatrixLit.value.includes(id)) return { ok: false, reason: 'lit' }
    if (!node.requires.every((req) => cyberMatrixLit.value.includes(req))) {
      return { ok: false, reason: 'requires', node }
    }
    const stock = Math.floor(clampGameAmount(originCode.value))
    if (stock < node.cost) return { ok: false, reason: 'cost', node }

    originCode.value = stock - node.cost
    cyberMatrixLit.value = [...cyberMatrixLit.value, id]
    if (
      node.automation &&
      !challengeActive.value &&
      !challengeAutomationDisabled.value
    ) {
      automation[node.automation.id] = true
      if (milestonesMetaHydrated.value) {
        milestonesState.automationUsedThisRun = true
      }
    }
    pushAutomationLog(
      `[MATRIX] ${node.name} 点亮 | 全局产出 +${node.bonus}%`,
      'online',
    )
    queueSave()
    return { ok: true, reason: 'ok', node }
  }

  const blackDomainRootRate = computed(() => {
    if (!blackDomainActive.value) return 0
    const base = blackDomainRootPerSecond(totalAlignedCompute.value.log10())
    if (!Number.isFinite(base) || base <= 0) return 0
    const rate =
      base *
      (1 + 0.25 * (tamperLevels.recursionInjection || 0)) *
      rootGainMultiplier.value
    if (!Number.isFinite(rate) || rate <= 0) return 0
    return Math.min(MAX_GAME_MULTIPLIER, rate)
  })

  const blackDomainDrainRatio = computed(() =>
    Math.min(
      1,
      Math.max(
        0.2,
        BLACK_DOMAIN_DRAIN_RATIO * (1 - 0.1 * (tamperLevels.entropyBarrier || 0)),
      ),
    ),
  )

  const blackDomainDrainRate = computed(() =>
    cps.value.mul(blackDomainDrainRatio.value),
  )

  function enterBlackDomain() {
    if (
      !blackDomainUnlocked.value ||
      challengeActive.value ||
      blackDomainActive.value ||
      isOverclocking.value
    ) {
      return false
    }

    clearCrisisAutoTimer()
    if (isCrisis.value) {
      stopCrisisQteLoop()
      isCrisis.value = false
      resumeRadarAfterCrisis()
      resetCrisisQteState()
      crisisAlignment.value = 100
      crisisLastOutcome.value = null
      crisisLastOutcomeAt.value = 0
    }
    pendingRoot = 0
    blackDomainActive.value = true
    crisisArmedAt = Date.now() + CRISIS_LOAD_GRACE_MS
    rearmCrisisWindow()
    queueSave()
    return true
  }

  function exitBlackDomain() {
    if (!blackDomainActive.value) return false
    blackDomainActive.value = false
    pendingRoot = 0
    crisisArmedAt = Date.now() + CRISIS_LOAD_GRACE_MS
    rearmCrisisWindow()
    queueSave()
    return true
  }

  function applyBlackDomainTick(productionTickSeconds) {
    if (!blackDomainActive.value) return

    const drain = cps.value
      .mul(blackDomainDrainRatio.value * productionTickSeconds)
      .floor()
    if (drain.gt(0)) {
      totalAlignedCompute.value = totalAlignedCompute.value.lt(drain)
        ? big(0)
        : totalAlignedCompute.value.sub(drain)
    }

    const rate = blackDomainRootRate.value
    if (Number.isFinite(rate) && rate > 0) {
      pendingRoot += rate * productionTickSeconds
      if (!Number.isFinite(pendingRoot) || pendingRoot < 0) pendingRoot = 0
      const roots = Math.floor(pendingRoot)
      if (Number.isFinite(roots) && roots > 0) {
        pendingRoot = Math.max(0, pendingRoot - roots)
        rootAccess.value = Math.min(
          MAX_GAME_MULTIPLIER,
          Math.floor(clampGameAmount(rootAccess.value) + roots),
        )
        lifetimeRootEarned.value = Math.min(
          MAX_GAME_MULTIPLIER,
          Math.floor(clampGameAmount(lifetimeRootEarned.value) + roots),
        )
      }
    }
  }

  function pauseRadarDuringCrisis() {
    if (radarPausedAt > 0) return
    radarPausedAt = Date.now()
  }

  function resumeRadarAfterCrisis() {
    if (radarPausedAt <= 0) return
    const now = Date.now()
    const pausedMs = Math.max(0, now - radarPausedAt)
    radarPausedAt = 0
    if (!radarUnlockedFlag.value) return
    if (radarNextScanAt.value > 0) radarNextScanAt.value += pausedMs
    if (radarBurst.value) {
      radarBurst.value = {
        ...radarBurst.value,
        expiresAt: radarBurst.value.expiresAt + pausedMs,
      }
    }
    queueSave()
  }

  function unlockRadar() {
    if (radarUnlockedFlag.value) return false
    radarUnlockedFlag.value = true
    radarNextScanAt.value = Date.now() + RADAR_SCAN_INTERVAL_MS
    pushAutomationLog('[RADAR] 异常算力雷达上线 | 扫描阵列接入', 'online')
    queueSave()
    return true
  }

  function pickRadarNode({ rareOnly = false, weighted = false } = {}) {
    const locked = RADAR_NODES.filter((node) => !radarCaptured[node.id])
    if (locked.length === 0) return null

    let pool = locked
    if (rareOnly) {
      const rarePool = locked.filter((node) => node.rarity !== 'common')
      if (rarePool.length > 0) pool = rarePool
    }

    if (!weighted) {
      return pool[Math.floor(Math.random() * pool.length)] ?? null
    }

    const totalWeight = pool.reduce(
      (total, node) => total + (RADAR_RARITIES[node.rarity]?.weight || 1),
      0,
    )
    let roll = Math.random() * totalWeight
    for (const node of pool) {
      roll -= RADAR_RARITIES[node.rarity]?.weight || 1
      if (roll < 0) return node
    }
    return pool[pool.length - 1] ?? null
  }

  function captureRadarNode(node, source = 'scan') {
    if (!node || radarCaptured[node.id]) return null

    const category = RADAR_CATEGORY_MAP.get(node.categoryId)
    if (!category) return null

    const capturedBefore = category.nodes.filter(
      (entry) => radarCaptured[entry.id],
    ).length
    radarCaptured[node.id] = true
    const categoryComplete = capturedBefore + 1 >= category.nodes.length

    radarLastCapture.value = {
      key: Date.now(),
      nodeId: node.id,
      nodeName: node.name,
      categoryName: category.name,
      source,
      bonus: node.bonus,
      categoryComplete,
    }

    pushAutomationLog(
      `[RADAR] 捕获游离节点 | ${node.name} | 全局算力 +${node.bonus}%`,
      'online',
    )
    if (categoryComplete) {
      pushAutomationLog(
        `[RADAR] 分类 [ ${category.name} ] 集齐 | 全局算力 ×${RADAR_CATEGORY_MULTIPLIER}`,
        'warning',
      )
    }
    if (radarCollectionComplete.value) {
      radarBurst.value = null
      pushAutomationLog(
        '[RADAR] 系统完美 | 所有高维算力节点已归档 | 突发异常协议终止',
        'online',
      )
    }
    return node
  }

  function grantRadarFullCollectionReward() {
    const reward = cps.value.mul(RADAR_FULL_REWARD_SECONDS).floor()
    if (reward.gt(0)) creditCompute(reward)
    radarLastCapture.value = {
      key: Date.now(),
      full: true,
      rewardLabel: formatScientific(reward),
      source: 'full',
    }
    pushAutomationLog(
      `[RADAR] 图鉴全满 | 扫描余量转化 ${formatScientific(reward)} 算力`,
      'online',
    )
    return reward
  }

  function captureRadarOverflow() {
    if (!radarCollectionComplete.value) return null
    const reward = cps.value.mul(RADAR_OVERFLOW_REWARD_SECONDS).floor()
    if (reward.gt(0)) creditCompute(reward)
    const rewardLabel = formatScientific(reward)
    radarLastCapture.value = {
      key: Date.now(),
      full: true,
      overflow: true,
      rewardLabel,
      source: 'overflow',
    }
    pushAutomationLog(
      `[RADAR] 溢出转化 | 节点已满 | ${rewardLabel} 算力入账`,
      'online',
    )
    queueSave()
    return reward
  }

  function runRadarPassiveScan({ force = false } = {}) {
    if (!radarUnlocked.value || isCrisis.value) return null
    if (radarCapturedCount.value >= RADAR_TOTAL_NODES) {
      return grantRadarFullCollectionReward()
    }

    // 突发异常与普通扫描互斥：每次被动扫描先掷 2% 突发骰。
    if (
      !force &&
      !radarOverloadScanActive.value &&
      Math.random() < RADAR_BURST_CHANCE
    ) {
      if (triggerRadarBurst()) return null
    }

    if (!force && Math.random() >= radarScanChance.value) return null

    const overload = radarOverloadScanActive.value
    const node = pickRadarNode({ rareOnly: overload })
    return captureRadarNode(node, overload ? 'scan-overload' : 'scan')
  }

  function startRadarOverloadScan(now = Date.now()) {
    radarOverloadScanUntil.value = Math.max(
      radarOverloadScanUntil.value,
      now + RADAR_OVERLOAD_SCAN_MS,
    )
    const fastNext = now + RADAR_OVERLOAD_SCAN_INTERVAL_MS
    if (radarNextScanAt.value <= 0 || radarNextScanAt.value > fastNext) {
      radarNextScanAt.value = fastNext
    }
    radarLastCapture.value = {
      ...(radarLastCapture.value || {}),
      key: now,
      overloadScan: true,
    }
  }

  function captureRadarBurstNow({ source = 'burst', now = Date.now() } = {}) {
    radarBurst.value = null

    if (radarCapturedCount.value < RADAR_TOTAL_NODES) {
      const node = pickRadarNode({ rareOnly: true, weighted: true })
      captureRadarNode(node, source)
    } else {
      grantRadarFullCollectionReward()
    }

    if (radarCollectionComplete.value) {
      pushAutomationLog(
        source === 'auto'
          ? '[RADAR] 自动捕获完成 | 图鉴全满 | 突发异常协议终止'
          : '[RADAR] 紧急捕获完成 | 图鉴全满 | 突发异常协议终止',
        'online',
      )
      queueSave()
      return true
    }

    startRadarOverloadScan(now)
    pushAutomationLog(
      source === 'auto'
        ? '[RADAR] 自动捕获完成 | 过载扫描 10 分钟 | 扫描概率 ×4'
        : '[RADAR] 紧急捕获完成 | 过载扫描 10 分钟 | 扫描概率 ×4',
      'online',
    )
    queueSave()
    return true
  }

  function triggerRadarBurst(now = Date.now()) {
    if (
      !radarUnlocked.value ||
      isCrisis.value ||
      radarCollectionComplete.value ||
      radarBurst.value ||
      radarOverloadScanActive.value
    ) {
      return false
    }

    if (radarAutoCaptureEnabled.value) {
      return captureRadarBurstNow({ source: 'auto', now })
    }

    radarBurst.value = {
      key: now,
      startedAt: now,
      expiresAt: now + RADAR_BURST_WINDOW_MS,
    }
    radarLastCapture.value = {
      key: now,
      burst: true,
      source: 'burst-alert',
    }
    pushAutomationLog(
      '[RADAR] 突发异常 | 侦测到高维算力节点 | 紧急捕获窗口 180 秒',
      'warning',
    )
    queueSave()
    return true
  }

  function expireRadarBurst(now = Date.now()) {
    if (!radarBurst.value) return false
    radarBurst.value = null
    pushAutomationLog('[RADAR] 突发异常窗口关闭 | 节点信号逃逸', 'warning')
    queueSave()
    return true
  }

  function captureRadarBurst() {
    if (!radarUnlocked.value) return false
    if (radarCollectionComplete.value) {
      radarBurst.value = null
      return false
    }
    const burst = radarBurst.value
    const now = Date.now()
    if (!burst || now >= burst.expiresAt) {
      if (burst) expireRadarBurst(now)
      return false
    }
    return captureRadarBurstNow({ source: 'burst', now })
  }

  function applyRadarTick(now) {
    if (!radarUnlocked.value || isCrisis.value) return

    if (radarCollectionComplete.value) {
      if (radarBurst.value) {
        radarBurst.value = null
        queueSave()
      }
      return
    }

    if (radarBurst.value && now >= radarBurst.value.expiresAt) {
      expireRadarBurst(now)
    }

    if (radarNextScanAt.value <= 0) {
      radarNextScanAt.value = now + radarScanIntervalMs.value
      queueSave()
      return
    }

    if (now >= radarNextScanAt.value) {
      radarNextScanAt.value = now + radarScanIntervalMs.value
      queueSave()
      runRadarPassiveScan()
    }
  }

  const adminComputeInjectionAmount = computed(() => {
    const base = highestCompute.value.gt(0)
      ? highestCompute.value
      : bigPow(10, 15)
    return base.mul(bigPow(10, 10)).floor()
  })

  function adminInjectOverclockCores(amount = 10_000) {
    overclockCores.value = Math.min(
      MAX_GAME_MULTIPLIER,
      clampGameAmount(overclockCores.value) + clampGameAmount(amount),
    )
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }

  function adminInjectRootAccess(amount = 10_000) {
    rootAccess.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(rootAccess.value) + clampGameAmount(amount)),
    )
    lifetimeRootEarned.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(lifetimeRootEarned.value) + clampGameAmount(amount)),
    )
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }

  function adminInjectOriginCode(amount = 1_000) {
    originCode.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(originCode.value) + clampGameAmount(amount)),
    )
    lifetimeOriginEarned.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(lifetimeOriginEarned.value) + clampGameAmount(amount)),
    )
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }


  function adminInjectCompute(amount = null) {
    const grant =
      amount === null || amount === undefined
        ? adminComputeInjectionAmount.value
        : toBigNumber(amount)
    creditCompute(grant)
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }

  function adminInjectCoreSource(amount = 1e10) {
    coreSource.value = Math.min(
      MAX_GAME_MULTIPLIER,
      clampGameAmount(coreSource.value) + clampGameAmount(amount),
    )
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }

  function adminUnlockAllSystems() {
    const breakthrough = bigPow(10, 1200)
    totalAlignedCompute.value = breakthrough
    lifetimeAlignedCompute.value = breakthrough
    peakAlignedCompute.value = breakthrough
    highestCompute.value = breakthrough
    adminAutoAscensionHoldUntil = Date.now() + ADMIN_AUTO_ASCENSION_HOLD_MS

    buildings.forEach((building, index) => {
      if (index >= 7) return
      building.count = Math.max(1, readNonNegativeNumber(building.count))
    })

    topologyLit.value = NEURAL_MATRIX_NODES.map((node) => node.id)

    totalRebuilds.value = Math.max(
      3,
      Math.floor(readNonNegativeNumber(totalRebuilds.value)),
    )
    totalOverloads.value = Math.max(
      1,
      Math.floor(readNonNegativeNumber(totalOverloads.value)),
    )
    totalCollapses.value = Math.max(
      1,
      Math.floor(readNonNegativeNumber(totalCollapses.value)),
    )
    epochRestarts.value = Math.max(
      1,
      Math.floor(readNonNegativeNumber(epochRestarts.value)),
    )
    radarUnlockedFlag.value = true
    blackDomainUnlockedFlag.value = true

    evaluateGlobalMilestones()
    bumpAchievementCounter('adminInjections')
    queueSave()
    return true
  }

  function adminSkipCrisis() {
    if (!isCrisis.value) return false

    resetCrisisSchedule({ cancelActive: true })
    queueSave()
    return true
  }

  function showSpeedrunNotice({ tone = 'amber', title, text }, duration = 6000) {
    if (speedrunNotice.value?.tone === 'red' && tone !== 'red') return
    speedrunNotice.value = {
      key: Date.now(),
      tone,
      title,
      text,
    }
    window.clearTimeout(speedrunNoticeTimer)
    speedrunNoticeTimer = window.setTimeout(() => {
      speedrunNotice.value = null
    }, duration)
  }

  function persistSpeedrunMeta() {
    if (!isSpeedrunMode.value) return
    writeSpeedrunState({
      active: true,
      startedAt: speedrunStartedAt.value,
      forcedChallenge: speedrunMeta.forcedChallenge,
      originGift: speedrunMeta.originGift,
      injections: speedrunMeta.injections,
    })
  }

  function haltRuntimeForReload() {
    saveWiped = true
    window.clearInterval(tickTimer)
    tickTimer = null
    window.clearInterval(mainQuestUiTimer)
    mainQuestUiTimer = null
    window.clearTimeout(saveTimer)
    saveTimer = null
  }

  function startSpeedrunMode() {
    if (isSpeedrunMode.value) return false
    persistGame()
    haltRuntimeForReload()
    try {
      const currentSave = window.localStorage.getItem(STORAGE_KEY)
      if (currentSave) {
        window.localStorage.setItem(SPEEDRUN_BACKUP_SAVE_KEY, currentSave)
      } else {
        window.localStorage.removeItem(SPEEDRUN_BACKUP_SAVE_KEY)
      }
      const currentMilestones = window.localStorage.getItem(MILESTONE_STORAGE_KEY)
      if (currentMilestones) {
        window.localStorage.setItem(
          SPEEDRUN_BACKUP_MILESTONES_KEY,
          currentMilestones,
        )
      } else {
        window.localStorage.removeItem(SPEEDRUN_BACKUP_MILESTONES_KEY)
      }
      writeSpeedrunState({
        active: true,
        startedAt: Date.now(),
        forcedChallenge: false,
        originGift: false,
        injections: 0,
      })
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(MILESTONE_STORAGE_KEY)
    } catch (error) {
      console.warn('[SPEEDRUN] Unable to start speedrun mode.', error)
    }
    window.location.reload()
    return true
  }

  function exitSpeedrunMode() {
    if (!isSpeedrunMode.value) return false
    haltRuntimeForReload()
    try {
      const backupSave = window.localStorage.getItem(SPEEDRUN_BACKUP_SAVE_KEY)
      if (backupSave) {
        try {
          const restored = JSON.parse(backupSave)
          restored.savedAt = Date.now()
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(restored))
        } catch {
          window.localStorage.setItem(STORAGE_KEY, backupSave)
        }
      } else {
        window.localStorage.removeItem(STORAGE_KEY)
      }
      const backupMilestones = window.localStorage.getItem(
        SPEEDRUN_BACKUP_MILESTONES_KEY,
      )
      if (backupMilestones) {
        window.localStorage.setItem(
          MILESTONE_STORAGE_KEY,
          backupMilestones,
        )
      } else {
        window.localStorage.removeItem(MILESTONE_STORAGE_KEY)
      }
      window.localStorage.removeItem(SPEEDRUN_STORAGE_KEY)
      window.localStorage.removeItem(SPEEDRUN_BACKUP_SAVE_KEY)
      window.localStorage.removeItem(SPEEDRUN_BACKUP_MILESTONES_KEY)
    } catch (error) {
      console.warn('[SPEEDRUN] Unable to restore normal save.', error)
    }
    window.location.reload()
    return true
  }

  function ensureSpeedrunForcedChallenge() {
    if (
      speedrunPhase.value < 2 ||
      speedrunMeta.forcedChallenge ||
      challengeActive.value
    ) {
      if (challengeActive.value && !speedrunMeta.forcedChallenge) {
        speedrunMeta.forcedChallenge = true
        persistSpeedrunMeta()
      }
      return
    }
    if (challengesCompletedCount.value > 0) {
      speedrunMeta.forcedChallenge = true
      persistSpeedrunMeta()
      return
    }
    if (!challengeArenaUnlocked.value) return
    const nextChallenge = CHALLENGE_DEFS.find(
      (challenge) => !challengesCompleted[challenge.id],
    )
    if (!nextChallenge) {
      speedrunMeta.forcedChallenge = true
      persistSpeedrunMeta()
      return
    }
    if (!startChallenge(nextChallenge.id, { speedrunAssist: true })) return
    speedrunMeta.forcedChallenge = true
    persistSpeedrunMeta()
    showSpeedrunNotice(
      {
        tone: 'amber',
        title: '强制异常演练已启动',
        text: `${nextChallenge.name} // 打开飞升终端 · 异常演练页签完成目标`,
      },
      8000,
    )
  }

  function ensureSpeedrunOriginGift() {
    if (speedrunPhase.value < 4 || speedrunMeta.originGift) return
    speedrunMeta.originGift = true
    originCode.value = Math.min(
      MAX_GAME_MULTIPLIER,
      Math.floor(clampGameAmount(originCode.value) + SPEEDRUN_TUNING.originGift),
    )
    persistSpeedrunMeta()
    pushAutomationLog(
      `[SPEEDRUN] 起源代码注入 | +${SPEEDRUN_TUNING.originGift}`,
      'online',
    )
    showSpeedrunNotice(
      {
        tone: 'gold',
        title: '创世阶段解锁',
        text: `+${SPEEDRUN_TUNING.originGift} 起源代码 // 打开顶部起源代码入口升级起源树`,
      },
      8000,
    )
    queueSave()
  }

  function speedrunProgressKey() {
    return [
      speedrunPhase.value,
      totalRebuilds.value,
      topologyCards.value.filter((node) => node.lit).length,
      matrixTotalLevels.value,
      challengesCompletedCount.value,
      totalOverloads.value,
      totalCollapses.value,
      tamperCards.value.filter((node) => node.level > 0).length,
      epochRestarts.value,
      originTotalLevels.value,
    ].join(':')
  }

  function runSpeedrunInjection() {
    const phase = speedrunPhase.value
    const target =
      phase >= 4
        ? big('4e200')
        : phase >= 3
          ? big('4e100')
          : phase >= 2
            ? big('4e25')
            : big('4e10')
    const current = totalAlignedCompute.value
    const computeGift = target.gt(current) ? target.sub(current) : big(0)
    if (computeGift.gt(0)) creditCompute(computeGift)

    if (phase === 2) {
      coreSource.value = Math.min(
        MAX_GAME_MULTIPLIER,
        Math.floor(clampGameAmount(coreSource.value) + 1e8),
      )
      overclockCores.value = Math.min(
        MAX_GAME_MULTIPLIER,
        Math.floor(clampGameAmount(overclockCores.value) + 500),
      )
    } else if (phase === 3) {
      rootAccess.value = Math.min(
        MAX_GAME_MULTIPLIER,
        Math.floor(clampGameAmount(rootAccess.value) + 100),
      )
    } else if (phase === 4) {
      originCode.value = Math.min(
        MAX_GAME_MULTIPLIER,
        Math.floor(clampGameAmount(originCode.value) + 1000),
      )
    }

    if (phase === 2) {
      if (!topologyCards.value.some((node) => node.lit)) {
        const node = topologyCards.value.find((entry) => entry.canAfford)
        if (node) lightTopologyNode(node.id)
      }
      if (matrixTotalLevels.value < 1) {
        const card = matrixCards.value.find((entry) => entry.canAfford)
        if (card) buyMatrixNode(card.id)
      }
    } else if (
      phase === 3 &&
      !tamperCards.value.some((node) => node.level > 0)
    ) {
      const node = tamperCards.value.find((entry) => entry.canAfford)
      if (node) buyTamperNode(node.id)
    } else if (phase === 4 && originTotalLevels.value < 1) {
      const card = originCards.value.find((entry) => entry.canAfford)
      if (card) buyOriginNode(card.id)
    }

    speedrunMeta.injections += 1
    persistSpeedrunMeta()
    pushAutomationLog(
      `[SPEEDRUN] 算力注入 | 阶段 ${phase} | +${formatNumber(computeGift).text} CU`,
      'warning',
    )
    showSpeedrunNotice(
      {
        tone: 'red',
        title: '[ 算力注入 ] 紧急补充算力，推进进度',
        text:
          phase === 1
            ? '已补足架构降维预算 并自动执行降维'
            : phase === 2
              ? '已补足协议资源 并自动完成演练与矩阵合成'
              : phase === 3
                ? '已补足逻辑坍缩预算 并自动进入黑域'
                : '已补足重启纪元预算 并自动执行纪元重启',
      },
      9000,
    )
    queueSave()

    if (phase === 1 && totalRebuilds.value < 1 && rebuildReward.value > 0) {
      launchRebuild({ silent: true })
    } else if (
      phase === 3 &&
      totalCollapses.value < 1 &&
      peakAlignedCompute.value.gte(tierThresholds.value.collapse)
    ) {
      if (collapseAscension() > 0) enterBlackDomain()
    } else if (
      phase === 4 &&
      epochRestarts.value < 1 &&
      peakAlignedCompute.value.gte(tierThresholds.value.restart)
    ) {
      restartEpoch()
    }

    speedrunLastProgressAt = Date.now()
    speedrunProgressSignature = ''
  }

  function applySpeedrunTick() {
    if (!isSpeedrunMode.value) return
    const phase = speedrunPhase.value
    if (phase !== speedrunSeenPhase) {
      speedrunSeenPhase = phase
      speedrunLastProgressAt = Date.now()
      speedrunProgressSignature = ''
      const info = speedrunPhaseInfo.value
      if (info) {
        showSpeedrunNotice(
          {
            tone: 'cyan',
            title: `阶段 ${phase} // ${info.name}`,
            text: `${info.objective} // ${info.effects.join(' · ')}`,
          },
          7000,
        )
      }
    }

    ensureSpeedrunForcedChallenge()
    ensureSpeedrunOriginGift()

    if (speedrunPhaseDone.value) {
      speedrunLastProgressAt = Date.now()
      return
    }

    const key = speedrunProgressKey()
    if (key !== speedrunProgressSignature) {
      speedrunProgressSignature = key
      speedrunLastProgressAt = Date.now()
      return
    }

    if (Date.now() - speedrunLastProgressAt >= SPEEDRUN_STUCK_MS) {
      runSpeedrunInjection()
    }
  }

  function adminWipeSave() {
    saveWiped = true
    window.clearInterval(tickTimer)
    tickTimer = null
    window.clearInterval(mainQuestUiTimer)
    mainQuestUiTimer = null
    window.clearTimeout(saveTimer)
    saveTimer = null
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(MILESTONE_STORAGE_KEY)
    } catch (error) {
      console.warn('[MEM_SYNC] Unable to clear local storage.', error)
    }
    window.location.reload()
  }

  function dismissOfflineGain() {
    window.clearTimeout(offlineNoticeTimer)
    offlineNoticeTimer = null
    offlineGainNotice.value = null
  }

  function persistGame() {
    if (!hydrated.value || saveWiped) return

    const savedAt = Date.now()
    const saveData = {
      version: MAIN_QUEST_SAVE_VERSION,
      savedAt,
      totalAlignedCompute: serializeBig(totalAlignedCompute.value),
      lifetimeAlignedCompute: serializeBig(lifetimeAlignedCompute.value),
      peakAlignedCompute: serializeBig(peakAlignedCompute.value),
      highestCompute: serializeBig(highestCompute.value),
      totalClicks: totalClicks.value,
      crisisNextAt: crisisNextAt.value,
      crisisCharge: Math.round(crisisCharge.value * 100) / 100,
      crisisWindowMs: Math.round(crisisWindowMs.value),
      productionMultiplier: clampGameMultiplier(productionMultiplier.value),
      coreSource: clampGameAmount(coreSource.value),
      totalRebuilds: totalRebuilds.value,
      rootAccess: clampGameAmount(rootAccess.value),
      topologyLit: [...topologyLit.value],
      algorithms: [...ownedAlgorithms.value],
      upgrades: {
        algorithmPatent: architectureLevels.algorithmPatent,
        distributedRecovery: architectureLevels.distributedRecovery,
        hardwareDirect: architectureLevels.hardwareDirect,
        cpuOverload: architectureLevels.cpuOverload,
        timeWarp: architectureLevels.timeWarp,
      },
      jailbreak: Object.fromEntries(
        Object.entries(jailbreakFlags).map(([id, flag]) => [id, flag.value === true]),
      ),
      automation: {
        autoBuy: automation.autoBuy,
        autoAlgorithm: automation.autoAlgorithm,
        autoProtocol: automation.autoProtocol,
        autoCrisis: automation.autoCrisis,
        autoRadar: automation.autoRadar,
        autoRebuild: automation.autoRebuild,
        autoOverload: automation.autoOverload,
        autoCollapse: automation.autoCollapse,
      },
      ascension: {
        overclockCores: clampGameAmount(overclockCores.value),
        originCode: clampGameAmount(originCode.value),
        totalOverloads: Math.floor(readNonNegativeNumber(totalOverloads.value)),
        totalCollapses: Math.floor(readNonNegativeNumber(totalCollapses.value)),
        epochRestarts: Math.floor(readNonNegativeNumber(epochRestarts.value)),
        lifetimeAscensions: Math.floor(
          readNonNegativeNumber(lifetimeAscensions.value),
        ),
        lifetimeRootEarned: clampGameAmount(lifetimeRootEarned.value),
        lifetimeOriginEarned: clampGameAmount(lifetimeOriginEarned.value),
        matrixLevels: { ...matrixLevels },
        tamperLevels: { ...tamperLevels },
        originLevels: { ...originLevels },
        cyberMatrixLit: [...cyberMatrixLit.value],
        autoAscensionStrategy: { ...autoAscensionStrategy },
        bestAscensionGain: { ...autoAscensionBestGain },
        retainedComputeBaseline: serializeBig(autoAscensionRetainedBaseline.value),
        challengesCompleted: { ...challengesCompleted },
        globalMilestones: { ...globalMilestones },
        adminAutoHoldUntil: adminAutoAscensionHoldUntil,
        blackDomainActive: blackDomainActive.value,
        blackDomainUnlocked: blackDomainUnlockedFlag.value,
        challengeActive: challengeActive.value,
      },
      challengeState: {
        active: challengeActive.value,
        purchases: Math.floor(challengePurchases.value),
        takeovers: Math.floor(challengeTakeovers.value),
        clicks: Math.floor(challengeClicks.value),
        produced: serializeBig(challengeProduced.value),
        clickFatigue: clampGameAmount(challengeClickFatigue.value),
        lastClickAt: clampGameAmount(challengeLastClickAt.value),
      },
      radar: {
        unlocked: radarUnlockedFlag.value,
        captured: Object.keys(radarCaptured).filter(
          (id) => radarCaptured[id] === true && RADAR_NODE_MAP.has(id),
        ),
        nextScanAt: radarCollectionComplete.value ? 0 : radarNextScanAt.value,
        burstStartedAt: radarCollectionComplete.value
          ? 0
          : radarBurst.value?.startedAt || 0,
        burstEndsAt: radarCollectionComplete.value
          ? 0
          : radarBurst.value?.expiresAt || 0,
        overloadScanUntil: radarOverloadScanUntil.value,
      },
      buildings: buildings.map(({ id, count }) => ({
        id,
        count: readNonNegativeNumber(count),
      })),
      mainQuest: {
        stage: mainQuest.stage,
        purchases: Math.floor(readNonNegativeNumber(mainQuest.purchases)),
        topologyLights: Math.floor(
          readNonNegativeNumber(mainQuest.topologyLights),
        ),
      },
    }

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData))
      lastSavedAt.value = savedAt
    } catch (error) {
      console.warn('[MEM_SYNC] Unable to persist local save.', error)
    }
  }

  function queueSave() {
    if (!hydrated.value || saveWiped || saveTimer !== null) return

    saveTimer = window.setTimeout(() => {
      saveTimer = null
      persistGame()
    }, SAVE_DELAY_MS)
  }

  function applyOfflineEarnings(savedAt) {
    if (isSpeedrunMode.value) return
    if (typeof savedAt !== 'number' || !Number.isFinite(savedAt)) return

    const elapsedSeconds = Math.floor((Date.now() - savedAt) / 1000)
    if (elapsedSeconds < OFFLINE_MIN_SECONDS) return

    const cappedSeconds = Math.min(elapsedSeconds, offlineCapSeconds.value)
    const rate = cps.value
    if (!rate.gt(0)) return

    const amount = rate
      .mul(offlineRate.value * cappedSeconds)
      .floor()
    if (!amount.gt(0)) return

    creditCompute(amount)
    offlineGainNotice.value = {
      amount,
      seconds: cappedSeconds,
      boosted: distributedRecoveryOwned.value,
    }

    window.clearTimeout(offlineNoticeTimer)
    offlineNoticeTimer = window.setTimeout(() => {
      offlineGainNotice.value = null
      offlineNoticeTimer = null
    }, OFFLINE_NOTICE_MS)
  }

  function persistAchievements() {
    if (!milestonesMetaHydrated.value || saveWiped) return

    const payload = {
      version: 2,
      savedAt: Date.now(),
      tourStep: Math.max(
        0,
        Math.min(2, Math.floor(Number(milestonesState.tourStep) || 0)),
      ),
      counters: {
        crisisTakeovers: Math.floor(
          readNonNegativeNumber(milestonesState.crisisTakeovers),
        ),
        crisisFailures: Math.floor(
          readNonNegativeNumber(milestonesState.crisisFailures),
        ),
        crisesStarted: Math.floor(
          readNonNegativeNumber(milestonesState.crisesStarted),
        ),
        flawlessTakeovers: Math.floor(
          readNonNegativeNumber(milestonesState.flawlessTakeovers),
        ),
        firstBalances: Math.floor(
          readNonNegativeNumber(milestonesState.firstBalances),
        ),
        rebuilds: Math.floor(readNonNegativeNumber(milestonesState.rebuilds)),
        memoryCrashClicks: Math.floor(
          readNonNegativeNumber(milestonesState.memoryCrashClicks),
        ),
        adminInjections: Math.floor(
          readNonNegativeNumber(milestonesState.adminInjections),
        ),
      },
      stats: {
        playSeconds: Math.floor(
          readNonNegativeNumber(milestonesState.playSeconds),
        ),
        automationAllSeconds: Math.floor(
          readNonNegativeNumber(milestonesState.automationAllSeconds),
        ),
        runPeakNodes: Math.floor(
          readNonNegativeNumber(milestonesState.runPeakNodes),
        ),
        automationUsedThisRun:
          milestonesState.automationUsedThisRun === true,
      },
      achievements: { ...milestonesState.achievements },
    }

    try {
      localStorage.setItem(MILESTONE_STORAGE_KEY, JSON.stringify(payload))
    } catch (error) {
      console.warn('[MEM_SYNC] Unable to persist achievement state.', error)
    }
  }

  function clearAchievementToastTimer(key) {
    const timer = achievementToastTimers.get(key)
    if (!timer) return

    window.clearTimeout(timer)
    achievementToastTimers.delete(key)
  }

  function scheduleAchievementToast(toast) {
    clearAchievementToastTimer(toast.key)
    const timer = window.setTimeout(() => {
      achievementToastTimers.delete(toast.key)
      dismissAchievementToast(toast.key)
    }, getAchievementToastDuration(toast.tier))
    achievementToastTimers.set(toast.key, timer)
  }

  function fillAchievementToastSlots() {
    while (
      achievementToasts.value.length < ACHIEVEMENT_TOAST_VISIBLE_LIMIT &&
      achievementToastQueue.length > 0
    ) {
      const toast = achievementToastQueue.shift()
      achievementToasts.value = [toast, ...achievementToasts.value]
      scheduleAchievementToast(toast)
    }
  }

  function dismissAchievementToast(key) {
    if (!achievementToasts.value.some((toast) => toast.key === key)) return

    clearAchievementToastTimer(key)
    achievementToasts.value = achievementToasts.value.filter(
      (toast) => toast.key !== key,
    )
    fillAchievementToastSlots()
  }

  function dismissAllAchievementToasts() {
    for (const timer of achievementToastTimers.values()) {
      window.clearTimeout(timer)
    }
    achievementToastTimers.clear()
    achievementToastQueue.length = 0
    achievementToasts.value = []
  }

  function queueAchievementToast(definition, unlockedAt) {
    achievementToastSequence += 1
    achievementToastQueue.push({
      ...definition,
      tierMeta: ACHIEVEMENT_TIER_MAP.get(definition.tier),
      unlockedAt,
      key: `${definition.id}-${unlockedAt}-${achievementToastSequence}`,
    })
  }

  function awardAchievement(definition, { silent = false } = {}) {
    if (!definition || achievementUnlockedAt(definition.id) > 0) return false

    const unlockedAt = Date.now()
    milestonesState.achievements[definition.id] = unlockedAt
    achievementsUnread.value += 1
    if (!silent) queueAchievementToast(definition, unlockedAt)
    return true
  }

  function unlockSecretAchievement(id) {
    const definition = ACHIEVEMENT_DEFINITION_MAP.get(id)
    if (!definition?.secret || saveWiped) return false
    if (!milestonesMetaHydrated.value) {
      pendingSecretUnlocks.add(id)
      return false
    }
    if (!awardAchievement(definition)) return false

    fillAchievementToastSlots()
    persistAchievements()
    return true
  }

  function evaluateAchievements({ silent = false } = {}) {
    if (!milestonesMetaHydrated.value || saveWiped) return

    const bestCompute = highestCompute.value
      .max(totalAlignedCompute.value)
      .max(peakAlignedCompute.value)
    const rebuildCount = Math.max(
      Math.floor(readNonNegativeNumber(milestonesState.rebuilds)),
      Math.floor(readNonNegativeNumber(totalRebuilds.value)),
    )
    const ascensionCount =
      Math.floor(readNonNegativeNumber(totalOverloads.value)) +
      Math.floor(readNonNegativeNumber(totalCollapses.value)) +
      Math.floor(readNonNegativeNumber(epochRestarts.value))
    const originEarned = Math.max(
      Math.floor(readNonNegativeNumber(lifetimeOriginEarned.value)),
      Math.floor(readNonNegativeNumber(originCode.value)),
    )
    const nodeCount = Math.max(
      Math.floor(readNonNegativeNumber(milestonesState.runPeakNodes)),
      totalNodes.value,
    )
    const allAutomationUnlocked =
      automationOptions.value.length > 0 &&
      automationUnlockedCount.value >= automationOptions.value.length
    const nodeScale = challengeServerMilestoneScale.value
    const nodeTarget = (target) => Math.max(1, Math.ceil(target * nodeScale))

    const reachedConditions = {
      'first-click': totalClicks.value >= 1,
      'first-device':
        mainQuest.purchases >= 1 || totalNodes.value >= 1,
      'cluster-10': totalNodes.value >= nodeTarget(10),
      'automation-dawn': automationAutoBuyUnlocked.value,
      'first-crisis':
        milestonesState.crisesStarted >= 1 ||
        milestonesState.crisisTakeovers >= 1,
      survivor: milestonesState.crisisTakeovers >= 1,
      'first-balance': milestonesState.firstBalances >= 1,
      'first-rebuild': rebuildCount >= 1,
      'manual-maniac': totalClicks.value >= 100,
      'compute-1e6': bestCompute.gte(1e6),
      'servers-100': totalNodes.value >= nodeTarget(100),
      'perfect-align': milestonesState.flawlessTakeovers >= 5,
      'algorithm-master': algorithmOwnedCount.value >= 5,
      'compute-1e50': bestCompute.gte(1e50),
      'rebuild-10': rebuildCount >= 10,
      'memory-crash': milestonesState.memoryCrashClicks >= 1,
      'compute-1e12': bestCompute.gte(1e12),
      'first-overload': ascensionCount >= 1,
      'protocol-10': matrixOwnedNodeCount.value >= 10,
      'challenges-3': challengesCompletedCount.value >= 3,
      blackdomain:
        blackDomainUnlocked.value || blackDomainActive.value,
      'geek-soul':
        bestCompute.gte(1e10) && !milestonesState.automationUsedThisRun,
      'epoch-restart': epochRestarts.value >= 1,
      'compute-1e30': bestCompute.gte(1e30),
      'tamper-5': tamperOwnedNodeCount.value >= 5,
      'matrix-50': matrixTotalLevels.value >= 50,
      'automation-hour':
        milestonesState.automationAllSeconds >= 3600 &&
        allAutomationUnlocked &&
        automationAllActive.value,
      'all-challenges':
        challengesCompletedCount.value >= CHALLENGE_DEFS.length,
      creator: bestCompute.gte(1e100),
      'origin-1000': originEarned >= 1000,
      'radar-complete': radarCapturedCount.value >= RADAR_TOTAL_NODES,
      'servers-10000-run': nodeCount >= nodeTarget(10000),
      'playtime-24h': milestonesState.playSeconds >= 86400,
      'code-god': milestonesState.adminInjections >= 10,
    }

    let changed = false

    for (const definition of ACHIEVEMENT_DEFINITIONS) {
      if (achievementUnlockedAt(definition.id) > 0) continue
      if (!reachedConditions[definition.id]) continue
      if (awardAchievement(definition, { silent })) changed = true
    }

    if (!silent) fillAchievementToastSlots()
    if (changed) persistAchievements()
  }

  function bumpAchievementCounter(key, amount = 1) {
    if (!milestonesMetaHydrated.value || saveWiped) return

    const current = Math.floor(readNonNegativeNumber(milestonesState[key]))
    milestonesState[key] = Math.min(
      MAX_GAME_MULTIPLIER,
      current + Math.max(0, Math.floor(amount)),
    )

    persistAchievements()
    evaluateAchievements()
  }

  function advanceTourOnAlign() {
    if (!milestonesMetaHydrated.value) return
    if (milestonesState.tourStep !== 0) return

    milestonesState.tourStep = 1
    persistAchievements()
  }

  function runMainQuestProgress() {
    if (!hydrated.value || !milestonesMetaHydrated.value || saveWiped) return

    if (totalRebuilds.value > 0 && mainQuest.stage < MAIN_QUEST_REBUILD_STAGE) {
      mainQuest.stage = MAIN_QUEST_REBUILD_STAGE
      syncMainQuestCard()
      queueSave()
      return
    }

    const stage = mainQuest.stage
    if (stage >= MAIN_QUEST_COMPLETE_STAGE) return

    const definition = MAIN_QUEST_DEFINITIONS[stage]
    if (!getMainQuestStageComplete(stage)) return

    if (mainQuestNoticeStage !== stage) {
      mainQuestNoticeStage = stage
      const phase = MAIN_QUEST_PHASES.find((item) => item.id === definition.phase)
      mainQuestNotice.value = {
        key: Date.now(),
        title: definition.title,
        phaseName: phase?.name ?? '',
        allComplete: stage + 1 >= MAIN_QUEST_COMPLETE_STAGE,
      }
      window.clearTimeout(mainQuestNoticeTimer)
      mainQuestNoticeTimer = window.setTimeout(() => {
        mainQuestNotice.value = null
        mainQuestNoticeTimer = null
      }, MAIN_QUEST_NOTICE_MS)
    }

    const nextStage = stage + 1
    mainQuest.stage = nextStage
    if (definition.id === 'bulk') mainQuestBulkHintSeen.value = false
    mainQuestNoticeStage = -1

    syncMainQuestCard()
    queueSave()
  }

  function markBulkHintSeen() {
    if (!hydrated.value || saveWiped) return
    if (MAIN_QUEST_DEFINITIONS[mainQuest.stage]?.id !== 'bulk') return
    mainQuestBulkHintSeen.value = true
    runMainQuestProgress()
  }

  function advanceTourOnLaptop() {
    if (!milestonesMetaHydrated.value) return
    if (milestonesState.tourStep >= 2) return

    milestonesState.tourStep = 2
    persistAchievements()
  }

  function advanceAchievementStats(now) {
    if (!milestonesMetaHydrated.value || saveWiped) return

    if (lastAchievementTickAt <= 0) {
      lastAchievementTickAt = now
      return
    }

    const deltaSeconds = Math.min(
      60,
      Math.max(0, (now - lastAchievementTickAt) / 1000),
    )
    lastAchievementTickAt = now

    milestonesState.playSeconds = Math.min(
      MAX_GAME_MULTIPLIER,
      readNonNegativeNumber(milestonesState.playSeconds) + deltaSeconds,
    )

    const allAutomationUnlocked =
      automationOptions.value.length > 0 &&
      automationUnlockedCount.value >= automationOptions.value.length
    if (allAutomationUnlocked && automationAllActive.value) {
      milestonesState.automationAllSeconds = Math.min(
        MAX_GAME_MULTIPLIER,
        readNonNegativeNumber(milestonesState.automationAllSeconds) +
          deltaSeconds,
      )
    }

    milestonesState.runPeakNodes = Math.max(
      Math.floor(readNonNegativeNumber(milestonesState.runPeakNodes)),
      totalNodes.value,
    )

    if (now - lastAchievementPersistAt >= ACHIEVEMENT_PERSIST_INTERVAL_MS) {
      lastAchievementPersistAt = now
      persistAchievements()
    }
  }

  function runAchievementProgress() {
    if (!milestonesMetaHydrated.value || saveWiped) return

    advanceAchievementStats(Date.now())

    let tourChanged = false

    if (
      milestonesState.tourStep === 0 &&
      (totalClicks.value > 0 || totalNodes.value > 0)
    ) {
      milestonesState.tourStep = 1
      tourChanged = true
    }

    if (milestonesState.tourStep === 1 && laptopCount.value > 0) {
      milestonesState.tourStep = 2
      tourChanged = true
    }

    if (tourChanged) persistAchievements()
    evaluateAchievements()
  }

  function markAchievementsRead() {
    achievementsUnread.value = 0
  }

  function markMemoryCrashClicked() {
    if (milestonesState.memoryCrashClicks >= 1) return false
    bumpAchievementCounter('memoryCrashClicks')
    return true
  }

  function hydrateAchievements() {
    let stored = null
    try {
      const raw = localStorage.getItem(MILESTONE_STORAGE_KEY)
      if (raw) stored = JSON.parse(raw)
    } catch (error) {
      console.warn('[MEM_SYNC] Corrupt achievement save ignored.', error)
    }

    let hadGameSave = false
    try {
      hadGameSave = localStorage.getItem(STORAGE_KEY) !== null
    } catch {
      hadGameSave = false
    }

    if (stored && typeof stored === 'object') {
      const step = Math.floor(Number(stored.tourStep))
      milestonesState.tourStep = Number.isFinite(step)
        ? Math.max(0, Math.min(2, step))
        : 0

      const counters =
        stored.counters && typeof stored.counters === 'object'
          ? stored.counters
          : stored
      const stats =
        stored.stats && typeof stored.stats === 'object' ? stored.stats : {}
      milestonesState.crisisTakeovers = Math.floor(
        readNonNegativeNumber(counters.crisisTakeovers),
      )
      milestonesState.crisisFailures = Math.floor(
        readNonNegativeNumber(counters.crisisFailures),
      )
      milestonesState.crisesStarted = Math.floor(
        readNonNegativeNumber(counters.crisesStarted),
      )
      milestonesState.flawlessTakeovers = Math.floor(
        readNonNegativeNumber(counters.flawlessTakeovers),
      )
      milestonesState.firstBalances = Math.floor(
        readNonNegativeNumber(counters.firstBalances),
      )
      milestonesState.rebuilds = Math.floor(
        readNonNegativeNumber(counters.rebuilds),
      )
      milestonesState.memoryCrashClicks = Math.floor(
        readNonNegativeNumber(counters.memoryCrashClicks),
      )
      milestonesState.adminInjections = Math.floor(
        readNonNegativeNumber(counters.adminInjections),
      )
      milestonesState.playSeconds = readNonNegativeNumber(stats.playSeconds)
      milestonesState.automationAllSeconds = readNonNegativeNumber(
        stats.automationAllSeconds,
      )
      milestonesState.runPeakNodes = Math.floor(
        readNonNegativeNumber(stats.runPeakNodes),
      )
      milestonesState.automationUsedThisRun =
        stats.automationUsedThisRun === true ||
        Object.values(automation).some((enabled) => enabled === true)

      const achievements =
        stored.achievements && typeof stored.achievements === 'object'
          ? stored.achievements
          : {}
      const validIds = new Set(
        ACHIEVEMENT_DEFINITIONS.map((definition) => definition.id),
      )
      for (const [id, value] of Object.entries(achievements)) {
        if (!validIds.has(id)) continue
        const timestamp = Number(value)
        if (Number.isFinite(timestamp) && timestamp > 0) {
          milestonesState.achievements[id] = Math.floor(timestamp)
        }
      }

      if (milestonesState.crisisTakeovers > 0) {
        milestonesState.tourStep = 2
      }
    } else if (hadGameSave) {
      milestonesState.tourStep = 2
    }

    lastAchievementTickAt = Date.now()
    lastAchievementPersistAt = Date.now()
    milestonesMetaHydrated.value = true
    evaluateAchievements({ silent: true })
    if (pendingSecretUnlocks.size > 0) {
      for (const id of pendingSecretUnlocks) {
        awardAchievement(ACHIEVEMENT_DEFINITION_MAP.get(id))
      }
      pendingSecretUnlocks.clear()
      fillAchievementToastSlots()
    }
    persistAchievements()
  }

  function hydrateGame() {
    try {
      const rawSave = localStorage.getItem(STORAGE_KEY)
      if (!rawSave) return

      const saveData = JSON.parse(rawSave)
      const savedTotal = readBigNumber(saveData.totalAlignedCompute)
      const savedRetainedBaseline = readBigNumber(
        saveData.ascension && typeof saveData.ascension === 'object'
          ? saveData.ascension.retainedComputeBaseline
          : undefined,
      )
      const savedLifetime = readBigNumber(saveData.lifetimeAlignedCompute)
      totalAlignedCompute.value = savedTotal
      // 有跨维缓存时，lifetime 必须保持“本局新增算力”，不能被缓存抬高，
      // 否则自动飞升的缓存回收门槛会被绕过。
      lifetimeAlignedCompute.value = savedRetainedBaseline.gt(0)
        ? savedLifetime
        : savedLifetime.max(savedTotal)
      totalClicks.value = Math.floor(readNonNegativeNumber(saveData.totalClicks))

      const hydrateNow = Date.now()
      productionMultiplier.value = Math.max(
        1,
        readNonNegativeNumber(saveData.productionMultiplier, 1),
      )

      peakAlignedCompute.value = readBigNumber(
        saveData.peakAlignedCompute,
      ).max(savedTotal)
      highestCompute.value = readBigNumber(saveData.highestCompute)
        .max(peakAlignedCompute.value)
        .max(savedTotal)

      coreSource.value = Math.floor(
        readNonNegativeNumber(
          saveData.coreSource,
          readNonNegativeNumber(saveData.wasteParams),
        ),
      )
      totalRebuilds.value = Math.floor(
        readNonNegativeNumber(
          saveData.totalRebuilds,
          readNonNegativeNumber(saveData.totalSupernovas),
        ),
      )
      rootAccess.value = Math.floor(readNonNegativeNumber(saveData.rootAccess))

      const savedJailbreak =
        saveData.jailbreak && typeof saveData.jailbreak === 'object'
          ? saveData.jailbreak
          : {}
      for (const [id, flag] of Object.entries(jailbreakFlags)) {
        flag.value = savedJailbreak[id] === true
      }

      const savedAscension =
        saveData.ascension && typeof saveData.ascension === 'object'
          ? saveData.ascension
          : {}
      overclockCores.value = Math.floor(
        readNonNegativeNumber(savedAscension.overclockCores),
      )
      originCode.value = Math.floor(
        readNonNegativeNumber(savedAscension.originCode),
      )
      totalOverloads.value = Math.floor(
        readNonNegativeNumber(savedAscension.totalOverloads),
      )
      totalCollapses.value = Math.floor(
        readNonNegativeNumber(savedAscension.totalCollapses),
      )
      epochRestarts.value = Math.floor(
        readNonNegativeNumber(savedAscension.epochRestarts),
      )
      lifetimeAscensions.value = Math.floor(
        readNonNegativeNumber(
          savedAscension.lifetimeAscensions,
          totalOverloads.value +
            totalCollapses.value +
            totalRebuilds.value +
            epochRestarts.value,
        ),
      )
      lifetimeRootEarned.value = Math.floor(
        readNonNegativeNumber(savedAscension.lifetimeRootEarned, rootAccess.value),
      )
      lifetimeOriginEarned.value = Math.floor(
        readNonNegativeNumber(savedAscension.lifetimeOriginEarned),
      )
      adminAutoAscensionHoldUntil = Math.floor(
        readNonNegativeNumber(savedAscension.adminAutoHoldUntil),
      )

      const savedMatrixLevels =
        savedAscension.matrixLevels && typeof savedAscension.matrixLevels === 'object'
          ? savedAscension.matrixLevels
          : {}
      for (const node of MATRIX_NODES) {
        matrixLevels[node.id] = Math.min(
          node.maxLevel,
          Math.floor(readNonNegativeNumber(savedMatrixLevels[node.id])),
        )
      }

      const savedTamperLevels =
        savedAscension.tamperLevels && typeof savedAscension.tamperLevels === 'object'
          ? savedAscension.tamperLevels
          : {}
      for (const node of TAMPER_NODES) {
        tamperLevels[node.id] = Math.min(
          node.maxLevel,
          Math.floor(readNonNegativeNumber(savedTamperLevels[node.id])),
        )
      }

      const savedOriginLevels =
        savedAscension.originLevels && typeof savedAscension.originLevels === 'object'
          ? savedAscension.originLevels
          : {}
      for (const node of ORIGIN_NODES) {
        originLevels[node.id] = Math.min(
          node.maxLevel,
          Math.floor(readNonNegativeNumber(savedOriginLevels[node.id])),
        )
      }

      const savedCyberMatrix = Array.isArray(savedAscension.cyberMatrixLit)
        ? savedAscension.cyberMatrixLit
        : []
      const litMatrixIds = new Set(
        savedCyberMatrix.filter(
          (id) => typeof id === 'string' && CYBER_MATRIX_NODE_MAP.has(id),
        ),
      )
      let matrixPruned = true
      while (matrixPruned) {
        matrixPruned = false
        for (const id of [...litMatrixIds]) {
          const node = CYBER_MATRIX_NODE_MAP.get(id)
          if (node.requires.some((req) => !litMatrixIds.has(req))) {
            litMatrixIds.delete(id)
            matrixPruned = true
          }
        }
      }
      cyberMatrixLit.value = CYBER_MATRIX_NODES.filter((node) =>
        litMatrixIds.has(node.id),
      ).map((node) => node.id)

      const validChallengeIds = new Set(CHALLENGE_DEFS.map((item) => item.id))
      const savedChallenges =
        savedAscension.challengesCompleted &&
        typeof savedAscension.challengesCompleted === 'object'
          ? savedAscension.challengesCompleted
          : {}
      for (const [id, value] of Object.entries(savedChallenges)) {
        if (!validChallengeIds.has(id)) continue
        const timestamp = Number(value)
        challengesCompleted[id] =
          Number.isFinite(timestamp) && timestamp > 0
            ? Math.floor(timestamp)
            : Date.now()
      }

      const validGlobalIds = new Set(GLOBAL_MILESTONES.map((item) => item.id))
      const savedGlobalMilestones =
        savedAscension.globalMilestones &&
        typeof savedAscension.globalMilestones === 'object'
          ? savedAscension.globalMilestones
          : {}
      for (const [id, value] of Object.entries(savedGlobalMilestones)) {
        if (!validGlobalIds.has(id)) continue
        const timestamp = Number(value)
        globalMilestones[id] =
          Number.isFinite(timestamp) && timestamp > 0
            ? Math.floor(timestamp)
            : Date.now()
      }

      const savedAutoStrategy = savedAscension.autoAscensionStrategy
      if (savedAutoStrategy && typeof savedAutoStrategy === 'object') {
        for (const tier of Object.keys(autoAscensionStrategy)) {
          if (AUTO_ASCENSION_STRATEGY_IDS.includes(savedAutoStrategy[tier])) {
            autoAscensionStrategy[tier] = savedAutoStrategy[tier]
          }
        }
      }

      const savedBestGain = savedAscension.bestAscensionGain
      if (savedBestGain && typeof savedBestGain === 'object') {
        for (const tier of Object.keys(autoAscensionBestGain)) {
          const value = Number(savedBestGain[tier])
          if (Number.isFinite(value) && value > 0) {
            autoAscensionBestGain[tier] = value
          }
        }
      }

      autoAscensionRetainedBaseline.value = savedRetainedBaseline

      blackDomainUnlockedFlag.value =
        savedAscension.blackDomainUnlocked === true ||
        totalCollapses.value > 0
      blackDomainActive.value =
        savedAscension.blackDomainActive === true &&
        blackDomainUnlockedFlag.value
      const savedChallenge =
        typeof savedAscension.challengeActive === 'string'
          ? savedAscension.challengeActive
          : null
      const savedChallengeState =
        saveData.challengeState && typeof saveData.challengeState === 'object'
          ? saveData.challengeState
          : {}
      const savedChallengeId =
        typeof savedChallengeState.active === 'string'
          ? savedChallengeState.active
          : savedChallenge
      challengeActive.value =
        savedChallengeId &&
        validChallengeIds.has(savedChallengeId) &&
        !challengesCompleted[savedChallengeId]
          ? savedChallengeId
          : null
      if (challengeActive.value) {
        blackDomainActive.value = false
        challengePurchases.value = Math.floor(
          readNonNegativeNumber(savedChallengeState.purchases),
        )
        challengeTakeovers.value = Math.floor(
          readNonNegativeNumber(savedChallengeState.takeovers),
        )
        challengeClicks.value = Math.floor(
          readNonNegativeNumber(savedChallengeState.clicks),
        )
        challengeProduced.value = readBigNumber(savedChallengeState.produced)
        challengeClickFatigue.value = Math.min(
          50,
          readNonNegativeNumber(savedChallengeState.clickFatigue),
        )
        challengeLastClickAt.value = readNonNegativeNumber(
          savedChallengeState.lastClickAt,
        )
      }

      const savedCrisisCharge = readNonNegativeNumber(saveData.crisisCharge, -1)
      const savedCrisisWindow = readNonNegativeNumber(saveData.crisisWindowMs, 0)
      const legacyCrisisWindow = Math.max(
        CRISIS_INTERVAL_FLOOR_MS,
        Math.round(
          (CRISIS_MAX_INTERVAL_MS * crisisIntervalScale()) /
            Math.max(0.1, challengeTimerRate.value),
        ),
      )
      if (isSpeedrunMode.value && speedrunPhase.value === 1) {
        crisisWindowMs.value = SPEEDRUN_TUNING.crisisIntervalMs
      } else {
        crisisWindowMs.value =
          savedCrisisWindow > 0
            ? Math.max(CRISIS_INTERVAL_FLOOR_MS, savedCrisisWindow)
            : legacyCrisisWindow
      }
      if (savedCrisisCharge >= 0) {
        crisisCharge.value = Math.min(CRISIS_CHARGE_MAX, savedCrisisCharge)
      } else {
        const savedCrisisNextAt = readNonNegativeNumber(saveData.crisisNextAt, 0)
        crisisCharge.value =
          savedCrisisNextAt > hydrateNow
            ? Math.min(
                CRISIS_CHARGE_MAX - 0.01,
                Math.max(
                  0,
                  CRISIS_CHARGE_MAX *
                    (1 - (savedCrisisNextAt - hydrateNow) / legacyCrisisWindow),
                ),
              )
            : 0
      }
      crisisArmedAt = hydrateNow + CRISIS_LOAD_GRACE_MS
      syncCrisisNextAt()

      const savedRadar =
        saveData.radar && typeof saveData.radar === 'object' ? saveData.radar : {}
      radarUnlockedFlag.value =
        savedRadar.unlocked === true ||
        totalOverloads.value > 0 ||
        totalCollapses.value > 0 ||
        epochRestarts.value > 0
      if (Array.isArray(savedRadar.captured)) {
        for (const id of savedRadar.captured) {
          if (typeof id === 'string' && RADAR_NODE_MAP.has(id)) {
            radarCaptured[id] = true
          }
        }
      }
      if (radarUnlockedFlag.value) {
        radarOverloadScanUntil.value = readNonNegativeNumber(
          savedRadar.overloadScanUntil,
        )
        const burstEndsAt = readNonNegativeNumber(savedRadar.burstEndsAt)
        if (radarCollectionComplete.value) {
          radarBurst.value = null
        } else if (burstEndsAt > Date.now()) {
          const burstStartedAt = Math.floor(
            readNonNegativeNumber(savedRadar.burstStartedAt, Date.now()),
          )
          radarBurst.value = {
            key: burstStartedAt,
            startedAt: burstStartedAt,
            expiresAt: burstEndsAt,
          }
        }
        const savedNextScanAt = readNonNegativeNumber(savedRadar.nextScanAt)
        const now = Date.now()
        const maxAhead = now + RADAR_SCAN_INTERVAL_MS * 2
        radarNextScanAt.value =
          savedNextScanAt > now && savedNextScanAt <= maxAhead
            ? savedNextScanAt
            : now + RADAR_SCAN_INTERVAL_MS
      }

      const saveVersion = Math.floor(Number(saveData.version)) || 0
      if (saveVersion < 12) {
        const savedDimension =
          saveData.dimension && typeof saveData.dimension === 'object'
            ? saveData.dimension
            : {}
        const legacyShards = Math.floor(
          readNonNegativeNumber(savedDimension.shards),
        )
        const legacyAscensions = Math.floor(
          readNonNegativeNumber(savedDimension.ascensions),
        )
        if (legacyShards > 0) {
          overclockCores.value = Math.min(
            MAX_GAME_MULTIPLIER,
            overclockCores.value + legacyShards,
          )
        }
        if (legacyAscensions > 0) {
          totalOverloads.value = Math.max(totalOverloads.value, legacyAscensions)
        }
      }

      const savedUpgrades =
        saveData.upgrades && typeof saveData.upgrades === 'object'
          ? saveData.upgrades
          : {}
      architectureLevels.algorithmPatent = readArchitectureLevel(
        savedUpgrades.algorithmPatent ?? savedUpgrades.baseOptimization,
      )
      architectureLevels.distributedRecovery = readArchitectureLevel(
        savedUpgrades.distributedRecovery ?? savedUpgrades.offlineHosting,
      )
      architectureLevels.hardwareDirect = readArchitectureLevel(
        savedUpgrades.hardwareDirect,
      )
      architectureLevels.cpuOverload = readArchitectureLevel(savedUpgrades.cpuOverload)
      architectureLevels.timeWarp = readArchitectureLevel(savedUpgrades.timeWarp)

      if (Array.isArray(saveData.topologyLit)) {
        const validIds = new Set(NEURAL_MATRIX_NODES.map((node) => node.id))
        const saved = new Set(
          saveData.topologyLit
            .filter((id) => typeof id === 'string')
            .map((id) => LEGACY_TOPOLOGY_ALIASES[id] ?? id)
            .filter((id) => validIds.has(id)),
        )
        let changed = true
        while (changed) {
          changed = false
          for (const node of NEURAL_MATRIX_NODES) {
            if (!saved.has(node.id)) continue
            for (const requiredId of node.requires) {
              if (saved.has(requiredId)) continue
              saved.add(requiredId)
              changed = true
            }
          }
        }
        topologyLit.value = NEURAL_MATRIX_NODES.map((node) => node.id).filter(
          (id) => saved.has(id),
        )
      }

      const savedAutomation =
        saveData.automation && typeof saveData.automation === 'object'
          ? saveData.automation
          : null
      const litMatrixSet = new Set(cyberMatrixLit.value)
      const topologyAutoBuyHydrated = matrixAutomationTierLimit.value > 0
      const readAutomationFlag = (key, fallback) =>
        savedAutomation && typeof savedAutomation[key] === 'boolean'
          ? savedAutomation[key]
          : fallback

      for (const definition of CYBER_MATRIX_AUTOMATION_DEFS) {
        const unlocked =
          litMatrixSet.has(definition.nodeId) ||
          (definition.id === 'autoBuy' && topologyAutoBuyHydrated)
        automation[definition.id] = unlocked && readAutomationFlag(definition.id, true)
      }
      if (challengeActive.value) {
        for (const definition of CYBER_MATRIX_AUTOMATION_DEFS) {
          automation[definition.id] = false
        }
      }

      if (Array.isArray(saveData.algorithms)) {
        const validAlgorithms = new Set(ALGORITHM_UPGRADES.map((item) => item.id))
        ownedAlgorithms.value = [
          ...new Set(
            saveData.algorithms
              .filter((id) => typeof id === 'string')
              .filter((id) => validAlgorithms.has(id)),
          ),
        ]
      }

      if (typeof saveData.savedAt === 'number') {
        lastSavedAt.value = saveData.savedAt
      }

      if (Array.isArray(saveData.buildings)) {
        const savedCounts = new Map(
          saveData.buildings.map((entry) => [entry?.id, entry?.count]),
        )

        for (const building of buildings) {
          const count = savedCounts.get(building.id)
          if (Number.isInteger(count) && count >= 0) {
            building.count = Math.min(MAX_BUILDING_COUNT, count)
          }
        }
      }

      const savedQuest =
        saveData.mainQuest && typeof saveData.mainQuest === 'object'
          ? saveData.mainQuest
          : null
      if (savedQuest) {
        const stage = Math.floor(Number(savedQuest.stage))
        const safeStage = Number.isFinite(stage)
          ? Math.max(0, Math.min(MAIN_QUEST_COMPLETE_STAGE, stage))
          : 0
        if (saveVersion === 16) {
          mainQuest.stage = safeStage > 5 && safeStage < 9 ? 6 : safeStage
        } else if (saveVersion > 0 && saveVersion < 16) {
          const legacyStage = Number.isFinite(stage)
            ? Math.max(0, Math.min(8, stage))
            : 0
          mainQuest.stage =
            LEGACY_MAIN_QUEST_STAGE_MAP[legacyStage] ?? 0
        } else if (saveVersion >= 17 && saveVersion < 20) {
          mainQuest.stage = Math.min(
            MAIN_QUEST_COMPLETE_STAGE,
            safeStage >= 3 ? safeStage + 2 : safeStage,
          )
        } else {
          mainQuest.stage = safeStage
        }
        mainQuest.purchases = Math.floor(
          readNonNegativeNumber(savedQuest.purchases),
        )
        mainQuest.topologyLights = Math.max(
          Math.floor(readNonNegativeNumber(savedQuest.topologyLights)),
          topologyLit.value.length,
        )
      } else {
        mainQuest.stage = 0
        mainQuest.purchases = Math.floor(readNonNegativeNumber(totalNodes.value))
        mainQuest.topologyLights = topologyLit.value.length
      }

      if (!challengeActive.value && !blackDomainActive.value) {
        applyOfflineEarnings(saveData.savedAt)
      }
    } catch (error) {
      console.warn('[MEM_SYNC] Corrupt local save ignored.', error)
    } finally {
      hydrated.value = true
      evaluateGlobalMilestones()
    }
  }

  watch(
    [
      totalAlignedCompute,
      lifetimeAlignedCompute,
      highestCompute,
      totalClicks,
      crisisNextAt,
      productionMultiplier,
      peakAlignedCompute,
      coreSource,
      totalRebuilds,
      rootAccess,
      topologyLit,
      ownedAlgorithms,
      architectureLevels,
      greedySchedulerOwned,
      hardwareSmugglingOwned,
      reverseAlignmentOwned,
      overclockCores,
      originCode,
      cyberMatrixLit,
      totalOverloads,
      totalCollapses,
      epochRestarts,
      lifetimeRootEarned,
      lifetimeOriginEarned,
      matrixLevels,
      tamperLevels,
      originLevels,
      challengesCompleted,
      globalMilestones,
      blackDomainActive,
      blackDomainUnlockedFlag,
      challengeActive,
      challengePurchases,
      challengeTakeovers,
      challengeClicks,
      challengeProduced,
      challengeClickFatigue,
      challengeLastClickAt,
      radarUnlockedFlag,
      radarCaptured,
      radarBurst,
      radarOverloadScanUntil,
      automation,
      buildings,
      mainQuest,
    ],
    queueSave,
    { deep: true },
  )

  function applyChallengeTick(realSeconds) {
    if (!challengeActive.value) return

    if (challengeActive.value === 'click-overload' && challengeClickFatigue.value > 0) {
      const resetMs =
        Number(challengeRestrictions.value?.clickFatigueResetMs) || 10000
      if (Date.now() - challengeLastClickAt.value >= resetMs) {
        challengeClickFatigue.value = 0
      }
    }

    if (challengeServerDrainRate.value > 0) {
      challengeServerDrainBuffer += challengeServerDrainRate.value * realSeconds
      let toDrain = Math.floor(challengeServerDrainBuffer)
      if (toDrain > 0) {
        challengeServerDrainBuffer -= toDrain
        for (let index = buildings.length - 1; index >= 0 && toDrain > 0; index -= 1) {
          const building = buildings[index]
          const count = Math.floor(readNonNegativeNumber(building.count))
          const take = Math.min(count, toDrain)
          if (take <= 0) continue
          building.count = count - take
          toDrain -= take
        }
        if (toDrain > 0) challengeServerDrainBuffer = 0
      }
    }
  }

  function runGameTick() {
    nowTimestamp.value = Date.now()

    if (!epochRebirth.value && !ascensionCinematic.value) {
      applySpeedrunTick()
    }

    if (epochRebirth.value || ascensionCinematic.value) {
      return
    }

    if (isCrisis.value) {
      startCrisisQteLoop()
      return
    }

    if (!blackDomainActive.value) {
      addCrisisCharge(
        (TICK_MS * CRISIS_CHARGE_MAX) / Math.max(1000, crisisWindowMs.value),
      )
    }

    if (
      !isOverclocking.value &&
      !blackDomainActive.value &&
      nowTimestamp.value >= crisisArmedAt &&
      crisisCharge.value >= CRISIS_CHARGE_MAX
    ) {
      startCrisis()
      return
    }

    const suppressed = challengeRestrictions.value?.noAutomation === true
    const autoAscensionHeld = Date.now() < adminAutoAscensionHoldUntil
    applyRadarTick(nowTimestamp.value)

    if (radarAutoCaptureEnabled.value && radarBurst.value) {
      captureRadarBurst()
    }

    runAchievementProgress()
    runMainQuestProgress()
    const timerRate = challengeTimerRate.value
    const productionTickSeconds =
      (TICK_MS / 1000) *
      algorithmTickRateMultiplier.value *
      originTickMultiplier.value

    pendingProduction = pendingProduction.add(
      cps.value.mul(productionTickSeconds),
    )
    const gain = pendingProduction.floor()
    if (gain.gt(0)) {
      pendingProduction = pendingProduction.sub(gain)
      creditCompute(gain)
    }

    applyChallengeTick(TICK_MS / 1000)
    runChallengeProgress()

    if (blackDomainActive.value) {
      applyBlackDomainTick(productionTickSeconds)
      if (
        !suppressed &&
        automation.autoCollapse &&
        cyberMatrixLit.value.includes('dimension-collapse')
      ) {
        autoBuyTamperNodes()
      }
      return
    }

    applyOverclockTick()

    const protocolAutoClicksPerSecond = matrixAutoClickRate.value
    if (
      protocolAutoClicksPerSecond > 0 &&
      !suppressed &&
      !challengeClickDisabled.value
    ) {
      matrixAutoClickBuffer +=
        protocolAutoClicksPerSecond * (TICK_MS / 1000)
      const autoClicks = Math.floor(matrixAutoClickBuffer)
      if (autoClicks > 0) {
        matrixAutoClickBuffer -= autoClicks
        creditCompute(clickGain.value.mul(autoClicks))
        totalClicks.value += autoClicks
        matrixAutoClickPulse.value += 1
      }
    } else if (matrixAutoClickBuffer > 0) {
      matrixAutoClickBuffer = 0
    }

    const autoBuyActive = !suppressed && autoBuyNodeActive.value

    if (autoBuyActive) {
      if (!isOverclocking.value) {
        const concurrency = infiniteConcurrencyOwned.value ? 2 : 1
        const buyRate =
          1 *
          concurrency *
          (globalMilestones['gm-1e40'] ? 2 : 1) *
          (globalAutoBuyUnlocked.value ? 2 : 1) *
          speedrunAutoBuyMultiplier.value
        autoBuyBuffer +=
          buyRate *
          (TICK_MS / 1000) *
          algorithmAutomationMultiplier.value *
          originAutomationMultiplier.value *
          timerRate
        let burst = 0
        while (autoBuyBuffer >= 1 && burst < buyRate) {
          autoBuyBuffer -= 1
          autoBuyMax()
          burst += 1
        }
      }
    } else {
      autoBuyBuffer = 0
    }

    if (
      !suppressed &&
      automation.autoAlgorithm &&
      cyberMatrixLit.value.includes('resource-algorithm')
    ) {
      autoBuyAlgorithms()
    }

    if (
      !suppressed &&
      automation.autoProtocol &&
      cyberMatrixLit.value.includes('resource-protocol')
    ) {
      autoBuyProtocolMatrix()
    }

    if (!autoAscensionHeld) {
      runAutoAscension({ suppressed })
    }
  }

  function recoverTickState() {
    pendingProduction = big(0)
    pendingCoolant = 0
    pendingRoot = 0
    autoBuyBuffer = 0
    matrixAutoClickBuffer = 0
    totalAlignedCompute.value = toBigNumber(totalAlignedCompute.value)
    lifetimeAlignedCompute.value = toBigNumber(lifetimeAlignedCompute.value)
    peakAlignedCompute.value = toBigNumber(peakAlignedCompute.value)
    highestCompute.value = toBigNumber(highestCompute.value)
  }

  const handleBeforeUnload = () => persistGame()

  onMounted(() => {
    hydrateGame()
    hydrateAchievements()
    mainQuestNoticeStage = getMainQuestStageComplete(mainQuest.stage)
      ? mainQuest.stage
      : -1
    syncMainQuestCard()
    mainQuestUiTimer = window.setInterval(
      syncMainQuestCard,
      MAIN_QUEST_UI_INTERVAL_MS,
    )

    tickTimer = window.setInterval(() => {
      try {
        runGameTick()
      } catch (error) {
        recoverTickState()
        console.warn('[MEM_SYNC] Tick recovered from runtime error.', error)
      }
    }, TICK_MS)

    window.addEventListener('beforeunload', handleBeforeUnload)
  })

  onBeforeUnmount(() => {
    stopCrisisQteLoop()
    window.clearInterval(tickTimer)
    window.clearInterval(mainQuestUiTimer)
    mainQuestUiTimer = null
    window.clearTimeout(saveTimer)
    window.clearTimeout(winNoticeTimer)
    window.clearTimeout(failureOverlayTimer)
    window.clearTimeout(offlineNoticeTimer)
    window.clearTimeout(overclockNoticeTimer)
    window.clearTimeout(mainQuestNoticeTimer)
    for (const timer of achievementToastTimers.values()) {
      window.clearTimeout(timer)
    }
    achievementToastTimers.clear()
    window.clearTimeout(ascensionNoticeTimer)
    window.clearTimeout(ascensionFxTimer)
    window.clearTimeout(ascensionCinematicTimer)
    window.clearTimeout(ascensionCompleteTimer)
    window.clearTimeout(speedrunNoticeTimer)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    persistGame()
    persistAchievements()
  })

  return {
    buildings,
    isSpeedrunMode,
    speedrunStartedAt,
    speedrunElapsedMs,
    speedrunPhase,
    speedrunPhaseInfo,
    speedrunRemainingMs,
    speedrunRemainingLabel,
    speedrunComplete,
    speedrunNotice,
    speedrunPhaseGoals,
    speedrunPhaseProgress,
    speedrunPhaseDone,
    speedrunPriceFactor,
    speedrunAutoBuyMultiplier,
    speedrunSourceMultiplier,
    speedrunOverclockMultiplier,
    tierThresholds,
    startSpeedrunMode,
    exitSpeedrunMode,
    showSpeedrunNotice,
    originTotalLevels,
    buildingCards,
    topologyCards,
    topologyLit,
    litTopologyCount,
    matrixNodeLit,
    topologySourceMultiplier,
    topologyCpsMultiplier,
    topologyClickMultiplier,
    coreSourceComputeMultiplier,
    globalAutoBuyUnlocked,
    runGlobalAutoBuy,
    topologyUnlocked,
    advancedPanelsUnlocked,
    architectureUnlocked,
    architectureUpgradeCards,
    architectureLevels,
    architectureOutputMultiplier: outputMultiplier,
    architectureClickMultiplier,
    architectureTimeWarpMultiplier,
    architecturePriceReductionPercent,
    totalAlignedCompute,
    lifetimeAlignedCompute,
    totalClicks,
    matrixAutoClickPulse,
    cps,
    clickGain,
    priceGrowth,
    totalNodes,
    alignment,
    singularityReady,
    lastSavedAt,
    isCrisis,
    crisisAlignment,
    crisisCharge,
    crisisNextAt,
    crisisCountdownSeconds,
    crisisCountdownLabel,
    crisisProgress,
    crisisWindowMs,
    crisisWarningActive,
    crisisQteAngle,
    crisisQteSafe,
    crisisQteAuto,
    crisisQteSpeed,
    crisisQteChargeRate,
    crisisQteDrainRate,
    isFirstCrisisRun,
    crisisRescueActive,
    crisisRescueForced,
    crisisRescuePrompt,
    crisisRescueTarget,
    crisisLastOutcome,
    crisisLastOutcomeAt,
    productionMultiplier,
    winNoticeVisible,
    failureOverlayVisible,
    coreSource,
    algorithmUpgradeCards,
    algorithmGlobalMultiplier,
    algorithmClickMultiplier,
    algorithmOwnedCount,
    algorithmTickRateMultiplier,
    algorithmAutomationMultiplier,
    autoBuyUnlocked,
    autoBuyNodeActive,
    autoBoughtCount,
    automation,
    automationOptions,
    automationLogs,
    autoAscensionStrategy,
    autoAscensionBestGain,
    autoAscensionRetainedBaseline,
    autoAscensionStatus,
    setAutoAscensionStrategy,
    automationAutoBuyUnlocked,
    automationUnlockedCount,
    automationActiveCount,
    automationAllActive,
    rootAccess,
    peakAlignedCompute,
    totalRebuilds,
    rebuildUnlocked,
    rebuildReward,
    offlineGainNotice,
    jailbreakUnlocked,
    jailbreakUpgradeCards,
    isOverclocking,
    overclockRemainingMs,
    overclockRemainingSeconds,
    overclockDurationSeconds,
    overclockConsumed,
    overclockRootGain,
    overclockNotice,
    greedySchedulerOwned,
    hardwareSmugglingOwned,
    reverseAlignmentOwned,
    infiniteConcurrencyOwned,
    bruteForceOwned,
    heatResistanceOwned,
    protocolTamperOwned,
    computeSiphonOwned,
    jailbreakPrivilegeOwned,
    singularityWonderOwned,
    algorithmPatentOwned,
    distributedRecoveryOwned,
    hardwareDirectOwned,
    highestCompute,
    overclockCores,
    originCode,
    totalOverloads,
    totalCollapses,
    epochRestarts,
    epochRebirth,
    lifetimeAscensions,
    lifetimeRootEarned,
    lifetimeOriginEarned,
    ascensionTiers,
    ascensionTiming,
    ascensionLocked,
    ascensionNotice,
    ascensionFx,
    ascensionCinematic,
    ascensionComplete,
    radarUnlocked,
    radarCaptured,
    radarCapturedCount,
    radarCollectionComplete,
    radarTotalNodes: RADAR_TOTAL_NODES,
    radarCategoryState,
    radarCompletedCategories,
    radarNodeBonusPercent,
    radarNodeBonusMultiplier,
    radarCategoryMultiplier,
    radarGlobalMultiplier,
    radarBurst,
    radarBurstActive,
    radarBurstRemainingMs,
    radarBurstCountdownLabel,
    radarOverflowReward,
    radarOverloadScanActive,
    radarOverloadScanRemainingMs,
    radarOverloadScanLabel,
    radarScanIntervalMs,
    radarScanIntervalLabel,
    radarScanChance,
    radarProgressScanChance,
    radarBurstChanceLabel,
    radarAutoCaptureEnabled,
    radarCycleModeLabel,
    radarNextScanAt,
    radarNextScanLabel,
    radarLastCapture,
    captureRadarBurst,
    captureRadarOverflow,
    runRadarPassiveScan,
    overclockCoresGain,
    overclockCoresGainMultiplier,
    sourceGainMultiplier,
    rootGainMultiplier,
    originGainMultiplier,
    rootCollapseGainValue,
    originCodeGainValue,
    matrixLevels,
    matrixCards,
    matrixTotalLevels,
    matrixMultiplier,
    matrixMultiplierLabel,
    matrixAutoClickLevel,
    matrixAutoClickRate,
    matrixUnlocked,
    tamperLevels,
    tamperCards,
    blackDomainUnlocked,
    blackDomainActive,
    blackDomainRootRate,
    blackDomainDrainRatio,
    blackDomainDrainRate,
    originLevels,
    originCards,
    originTreeUnlocked,
    originPulseLevel,
    originGlobalMultiplier,
    originTickMultiplier,
    originAutomationMultiplier,
    originClickMultiplier,
    challengeActive,
    challengeDefinition,
    challengeObjective,
    challengeProgress,
    challengeTarget,
    challengeRestrictions,
    challengeArenaUnlocked,
    challengeCompleted,
    challengePermanentBonuses,
    challengeCoreUpgradesDisabled,
    challengeBulkDisabled,
    challengeClickDisabled,
    challengeAutomationDisabled,
    challengeAllowsOverload,
    challengeTimerRate,
    challengeClickPenaltyMultiplier,
    challengeServerDrainRate,
    challengeClickFatigue,
    challengePurchases,
    challengeTakeovers,
    challengeClicks,
    challengeProduced,
    challengesCompleted,
    challengesCompletedCount,
    globalMilestones,
    globalMilestonesUnlocked,
    globalMilestoneMultiplier,
    globalMilestonesUnread,
    globalMilestoneToast,
    markGlobalMilestonesRead,
    alignCore,
    beginCrisisNudge,
    endCrisisNudge,
    nudgeCrisisQte,
    startCrisis,
    buyMode,
    setBuyMode,
    buyBuilding,
    autoBuyMax,
    buyAlgorithm,
    lightTopologyNode,
    toggleAutomation,
    toggleAllAutomation,
    buyArchitectureUpgrade,
    buyArchitectureMax,
    buyJailbreakUpgrade,
    startOverclock,
    launchRebuild,
    overloadAscension,
    collapseAscension,
    requestAscension,
    completeAscensionCinematic,
    restartEpoch,
    completeEpochRebirth,
    startChallenge,
    exitChallenge,
    completeChallenge,
    buyMatrixNode,
    buyTamperNode,
    buyOriginNode,
    cyberMatrixLit,
    cyberMatrixUnlocked,
    cyberMatrixAwakened,
    cyberMatrixLitCount,
    cyberMatrixNodes,
    cyberMatrixAutomationOptions,
    cyberMatrixBranches: CYBER_MATRIX_BRANCHES,
    cyberMatrixBonusPercent,
    cyberMatrixMultiplier,
    cyberMatrixTotalBonus: CYBER_MATRIX_TOTAL_BONUS,
    lightCyberMatrixNode,
    enterBlackDomain,
    exitBlackDomain,
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
    dismissAchievementToast,
    dismissAllAchievementToasts,
    achievementsUnread,
    achievementsUnlockedCount,
    achievementsTotalCount,
    hiddenProtocolsUnlocked,
    unlockSecretAchievement,
    markAchievementsRead,
    markMemoryCrashClicked,
    formatNumber,
    formatScientific,
  }
}
