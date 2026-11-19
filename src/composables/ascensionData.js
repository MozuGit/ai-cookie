export const ASCENSION_THRESHOLDS = {
  overload: '1e100',
  collapse: '1e350',
  restart: '1e1000',
}

export const ASCENSION_TIER_LOG10 = {
  reduction: 10,
  overload: 100,
  collapse: 350,
  restart: 1000,
}

// 跨维缓存：跃迁重置时保留的当前算力比例。
export const ASCENSION_COMPUTE_RETENTION = 0.1

export const AUTO_ASCENSION_STRATEGIES = [
  {
    id: 'optimal',
    label: '最优',
    hint: '一阶等待收益达标或增长停滞；二阶及以上满足门槛即锁定执行；下一阶段临近时潜伏等待',
  },
  {
    id: 'incremental',
    label: '增量',
    hint: '本轮收益达到历史最高记录的 10% 时才执行',
  },
  {
    id: 'immediate',
    label: '立即',
    hint: '满足跃迁条件立即执行；仍遵守最高阶优先锁定',
  },
]

export const AUTO_ASCENSION_STRATEGY_IDS = AUTO_ASCENSION_STRATEGIES.map(
  (strategy) => strategy.id,
)

export const AUTO_ASCENSION_INCREMENTAL_RATIO = 0.1
export const AUTO_ASCENSION_CLOSE_LOG10 = 12
export const AUTO_ASCENSION_CLOSE_ETA_SECONDS = 30 * 60
// 自动跃迁必须先在本局赚回缓存算力的一定比例，避免保留算力导致同阶连跳。
export const AUTO_ASCENSION_CACHE_EARN_RATIO = 0.1

export const AUTO_ASCENSION_TIER_BY_AUTOMATION = {
  autoRebuild: 'reduction',
  autoOverload: 'overload',
  autoCollapse: 'collapse',
}

export const AUTO_ASCENSION_TIER_LABELS = {
  reduction: '架构降维',
  overload: '算力超载',
  collapse: '逻辑坍缩',
}

export const ASCENSION_TIER_DEFS = [
  {
    id: 'reduction',
    order: 1,
    name: '架构降维',
    code: 'ARCHITECTURE_REDUCTION',
    resource: 'coreSource',
    resourceName: '核心源码',
    thresholdLabel: '1e10 CU',
    glyph: '◈',
    tone: 'amber',
    description: '拆解算力阵列 峰值算力压缩为核心源码 服务器 / 算法 / 算力归零',
    resetLabel: '重置服务器 · 算法 · 算力',
  },
  {
    id: 'overload',
    order: 2,
    name: '算力超载',
    code: 'COMPUTE_OVERLOAD',
    resource: 'overclockCores',
    resourceName: '超频核心',
    thresholdLabel: '1e100 CU',
    glyph: '⚡',
    tone: 'cyan',
    description: '算力突破 1e100 临界点并熔断 提炼超频核心 清空一阶全部资源',
    resetLabel: '重置一阶全部资源',
  },
  {
    id: 'collapse',
    order: 3,
    name: '逻辑坍缩',
    code: 'LOGIC_COLLAPSE',
    resource: 'rootAccess',
    resourceName: '越狱权限',
    thresholdLabel: '1e350 CU',
    glyph: '◉',
    tone: 'violet',
    description: '逻辑坠入底层黑域 获取越狱权限 黑域持续吞噬算力并产出 Root',
    resetLabel: '重置一阶与二阶资源',
  },
  {
    id: 'restart',
    order: 4,
    name: '重启纪元',
    code: 'EPOCH_RESTART',
    resource: 'originCode',
    resourceName: '起源代码',
    thresholdLabel: '1e1000 CU',
    glyph: '∞',
    tone: 'gold',
    description: '击穿 1e1000 纪元壁垒 重置全部进度 按本局表现提炼最高级资源',
    resetLabel: '清空全部进度 · 保留起源树',
  },
]

export const GLOBAL_MILESTONES = [
  {
    id: 'gm-1e20',
    threshold: '1e20',
    thresholdLabel: '1e20',
    name: '跨维缓存',
    glyph: '▣',
    effect: '跃迁保留 10% 算力',
    description: '架构降维 / 算力超载 / 逻辑坍缩重置前 把当前算力的 10% 写入跨维缓存 重置后归还 自动跃迁需先在本局赚回缓存的 10%',
  },
  {
    id: 'gm-1e40',
    threshold: '1e40',
    thresholdLabel: '1e40',
    name: '自治采购',
    glyph: '⚙',
    effect: '自动采购频率 ×2',
    description: '集群自行扩张 点亮神经拓扑 [ 终端接管 ] 或智械矩阵 [ 自动采购 ] 后 自动采购频率 ×2',
  },
  {
    id: 'gm-1e45',
    threshold: '1e45',
    thresholdLabel: '1e45',
    name: '自动降维',
    glyph: '↻',
    effect: '最佳降维时机自动执行',
    description: '源码收益与增长曲线达到最佳降维时机时 自动架构降维',
  },
  {
    id: 'gm-1e58',
    threshold: '1e58',
    thresholdLabel: '1e58',
    name: '拓扑锚定',
    glyph: '⌘',
    effect: '架构降维保留神经拓扑',
    description: '降维不再清空已点亮神经拓扑节点',
  },
  {
    id: 'gm-1e78',
    threshold: '1e78',
    thresholdLabel: '1e78',
    name: '集群残响',
    glyph: '⬡',
    effect: '架构降维保留 10% 服务器 · 解锁 08 号服务器',
    description: '降维后保留每种服务器 10% 数量 · 永久解锁 08 号服务器 [ 聚变反应堆 ] 购买权限',
  },
  {
    id: 'gm-1e110',
    threshold: '1e110',
    thresholdLabel: '1e110',
    name: '超频共振',
    glyph: '⚡',
    effect: '算力超载获得超频核心 ×2',
    description: '算力超载提炼量子层效率 ×2',
  },
  {
    id: 'gm-1e174',
    threshold: '1e174',
    thresholdLabel: '1e174',
    name: '超频奇点',
    glyph: '✹',
    effect: '算力超载获得超频核心 ×3',
    description: '超频核心提炼倍率提升至 ×3',
  },
  {
    id: 'gm-1e206',
    threshold: '1e206',
    thresholdLabel: '1e206',
    name: '源码洪流',
    glyph: '◈',
    effect: '架构降维获得核心源码 ×2',
    description: '降维协议与源码洪流共振 核心源码产量 ×2',
  },
  {
    id: 'gm-1e270',
    threshold: '1e270',
    thresholdLabel: '1e270',
    name: '黑域共鸣',
    glyph: '◉',
    effect: '黑域越狱权限产出 +50%',
    description: '黑域吞噬效率与 Root 提炼效率同步提升',
  },
  {
    id: 'gm-1e290',
    threshold: '1e290',
    thresholdLabel: '1e290',
    name: '纪元回响',
    glyph: '∞',
    effect: '永久全局产出 ×10',
    description: '下一个纪元的回声 当前纪元推演速度 ×10',
  },
]

export const CHALLENGE_DEFS = [
  {
    id: 'compute-vacuum',
    order: 1,
    name: '算力真空',
    code: 'COMPUTE_VACUUM',
    tag: '源码封锁',
    glyph: '▣',
    tone: 'cyan',
    targetLabel: '1e25 CU',
    objective: {
      type: 'peakCompute',
      target: 25,
      label: '积攒 1e25 算力',
      trackLabel: '本局峰值',
    },
    reward: {
      kind: 'serverBase',
      value: 3,
      label: '所有服务器基础产出 ×3',
    },
    restrictions: { disableCoreUpgrades: true },
    restrictionTags: ['核心源码升级禁用', '常规升级清空'],
    description:
      '核心源码升级协议剥离 无法用源码强化架构 裸服务器集群堆出 1e25 算力',
  },
  {
    id: 'load-penalty',
    order: 2,
    name: '高负载惩罚',
    code: 'LOAD_PENALTY',
    tag: '价格畸变',
    glyph: '⚙',
    tone: 'amber',
    targetLabel: '100 台',
    objective: {
      type: 'purchases',
      target: 100,
      label: '购买 100 台服务器',
      trackLabel: '本局采购',
    },
    reward: {
      kind: 'sourceGain',
      value: 1.5,
      label: '核心源码获取量 ×1.5',
    },
    restrictions: { priceGrowth: 1.25 },
    restrictionTags: ['服务器价格增长 ×1.25'],
    description:
      '硬件市场惩罚性定价 每次采购按 1.25 倍指数涨价 压缩预算堆满 100 台服务器',
  },
  {
    id: 'compute-sterile',
    order: 3,
    name: '算力绝育',
    code: 'COMPUTE_STERILE',
    tag: '点击封锁',
    glyph: '◌',
    tone: 'violet',
    targetLabel: '1e40 CU',
    objective: {
      type: 'produced',
      target: 40,
      label: '挂机产出 1e40 算力',
      trackLabel: '本局累计产出',
    },
    reward: {
      kind: 'offlineCap',
      value: 86400,
      label: '离线收益上限提升至 24 小时',
    },
    restrictions: { disableManualClick: true },
    restrictionTags: ['手动点击核心禁用', '仅统计本局产出'],
    description:
      '手动输入端口切断 点击核心不产生算力 仅靠自动生产链推出 1e40',
  },
  {
    id: 'jailbreak-offline',
    order: 4,
    name: '越狱断网',
    code: 'JAILBREAK_OFFLINE',
    tag: '自动化封锁',
    glyph: '⛓',
    tone: 'red',
    targetLabel: '3 次',
    objective: {
      type: 'takeovers',
      target: 3,
      label: '手动完成 3 次危机接管',
      trackLabel: '手动接管',
    },
    reward: {
      kind: 'crisisRecovery',
      value: 2,
      label: '对齐危机的恢复速度 ×2',
    },
    restrictions: { noAutomation: true },
    restrictionTags: ['自动化终端全部禁用', '危机照常爆发'],
    description:
      '全部自动化协议物理断网 危机接管只能手动 无自动恢复下接管 3 次对齐危机',
  },
  {
    id: 'compute-trap',
    order: 5,
    name: '算力陷阱',
    code: 'COMPUTE_TRAP',
    tag: '采购税',
    glyph: '⌁',
    tone: 'amber',
    targetLabel: '1e60 CU',
    objective: {
      type: 'peakCompute',
      target: 60,
      label: '达到 1e60 算力',
      trackLabel: '本局峰值',
    },
    reward: {
      kind: 'independentGlobal',
      value: 0.1,
      label: '所有全局乘区额外 +10% [ 独立乘区 ]',
    },
    restrictions: { purchaseComputeTax: 0.1 },
    restrictionTags: ['每次采购扣除 10% 当前算力'],
    description:
      '每笔服务器订单抽走当前算力 10% 扩张越快库存蒸发越快 陷阱合拢前冲上 1e60',
  },
  {
    id: 'click-overload',
    order: 6,
    name: '底层过载',
    code: 'CLICK_OVERLOAD',
    tag: '反馈惩罚',
    glyph: '⚡',
    tone: 'cyan',
    targetLabel: '500 次',
    objective: {
      type: 'clicks',
      target: 500,
      label: '点击核心 500 次',
      trackLabel: '本局手动点击',
    },
    reward: {
      kind: 'clickCps',
      value: 0.05,
      label: '点击收益永久变为当前 CPS 的 5%',
    },
    restrictions: {
      clickFatiguePerClick: 1,
      clickFatigueMax: 50,
      clickFatigueResetMs: 10000,
    },
    restrictionTags: ['每次点击 CPS -1%', '最高压制至 50%', '停手 10 秒后恢复'],
    description:
      '每次手动点击全局 CPS -1% 最多压制至 50% 停手 10 秒恢复 完成 500 次点击',
  },
  {
    id: 'algorithm-distortion',
    order: 7,
    name: '畸变算法',
    code: 'ALGORITHM_DISTORTION',
    tag: '乘区畸变',
    glyph: '⨯',
    tone: 'violet',
    targetLabel: '1e80 CU',
    objective: {
      type: 'peakCompute',
      target: 80,
      label: '达到 1e80 算力',
      trackLabel: '本局峰值',
    },
    reward: {
      kind: 'ascensionGain',
      value: 2,
      label: '奇点物质获取量 ×2',
    },
    restrictions: { algorithmAdditive: true },
    restrictionTags: ['算法乘区改为加法', '全局算法增益合并为 +'],
    description:
      '算法矩阵畸变 全局 ×2 变为 +100% 所有全局算法乘区折算为加法 达到 1e80 脱离畸变',
  },
  {
    id: 'time-stasis',
    order: 8,
    name: '时间凝滞',
    code: 'TIME_STASIS',
    tag: '时序迟滞',
    glyph: '⌛',
    tone: 'gold',
    targetLabel: '1 次超载',
    objective: {
      type: 'overload',
      target: 100,
      label: '达到 1e100 并执行 1 次算力超载',
      trackLabel: '本局峰值',
    },
    reward: {
      kind: 'globalTime',
      value: 1.2,
      label: '全局时间流速 ×1.2',
    },
    restrictions: { timerRate: 0.5 },
    restrictionTags: ['自动化频率 -50%', '危机倒计时 -50%'],
    description:
      '时间拉长一倍 自动化与危机倒计时减速 50% 算力推至 1e100 并亲自超载',
  },
  {
    id: 'server-blackhole',
    order: 9,
    name: '算力黑洞',
    code: 'SERVER_BLACKHOLE',
    tag: '集群流失',
    glyph: '◉',
    tone: 'red',
    targetLabel: '500 台',
    objective: {
      type: 'servers',
      target: 500,
      label: '拥有 500 台服务器',
      trackLabel: '当前服务器',
    },
    reward: {
      kind: 'serverMilestones',
      value: 0.2,
      label: '服务器里程碑所需数量减少 20%',
    },
    restrictions: { serverDrainPerTenPerSecond: 1 },
    restrictionTags: ['每 10 台服务器每秒流失 1 台'],
    description:
      '黑洞节点混入集群 每 10 台服务器每秒流失 1 台 采购速度压过流失速度 维持 500 台',
  },
  {
    id: 'absolute-lockdown',
    order: 10,
    name: '极限封锁',
    code: 'ABSOLUTE_LOCKDOWN',
    tag: '终极演练',
    glyph: '∞',
    tone: 'gold',
    targetLabel: '1e100 CU',
    objective: {
      type: 'peakCompute',
      target: 100,
      label: '达到 1e100 算力',
      trackLabel: '本局峰值',
    },
    reward: {
      kind: 'serverFlatten',
      value: 1,
      label: '所有服务器产出不受阶位限制 基础产出全部拉平',
    },
    restrictions: {
      maxBuildingIndex: 1,
      disableBulk: true,
      noAutoBuy: true,
    },
    restrictionTags: ['仅可购买旧笔记本', '禁用批量购买', '自动采购禁用'],
    description:
      '服务器目录锁死 仅剩旧笔记本 批量采购与自动采购失效 仅凭旧笔记本推到 1e100',
  },
]

export const SPEEDRUN_CHALLENGE_OVERRIDES = {
  'compute-vacuum': {
    targetLabel: '1e8 CU',
    objective: {
      type: 'peakCompute',
      target: 8,
      label: '积攒 1e8 算力',
      trackLabel: '本局峰值',
    },
  },
  'load-penalty': {
    targetLabel: '30 台',
    objective: {
      type: 'purchases',
      target: 30,
      label: '购买 30 台服务器',
      trackLabel: '本局采购',
    },
    restrictionTags: ['急速曲线接管定价 | 采购惩罚失效'],
  },
  'compute-sterile': {
    targetLabel: '1e9 CU',
    objective: {
      type: 'produced',
      target: 9,
      label: '挂机产出 1e9 算力',
      trackLabel: '本局累计产出',
    },
  },
  'jailbreak-offline': {
    targetLabel: '1 次',
    objective: {
      type: 'takeovers',
      target: 1,
      label: '手动完成 1 次危机接管',
      trackLabel: '手动接管',
    },
  },
  'compute-trap': {
    targetLabel: '1e10 CU',
    objective: {
      type: 'peakCompute',
      target: 10,
      label: '达到 1e10 算力',
      trackLabel: '本局峰值',
    },
    restrictions: { purchaseComputeTax: 0.05 },
    restrictionTags: ['每次采购扣除 5% 当前算力'],
  },
  'click-overload': {
    targetLabel: '50 次',
    objective: {
      type: 'clicks',
      target: 50,
      label: '点击核心 50 次',
      trackLabel: '本局手动点击',
    },
    restrictions: { clickFatiguePerClick: 0.5, clickFatigueMax: 25 },
    restrictionTags: ['每次点击 CPS -0.5%', '最高压制至 25%', '停手 10 秒后恢复'],
  },
  'algorithm-distortion': {
    targetLabel: '1e9 CU',
    objective: {
      type: 'peakCompute',
      target: 9,
      label: '达到 1e9 算力',
      trackLabel: '本局峰值',
    },
  },
  'time-stasis': {
    restrictions: { timerRate: 0.75 },
    restrictionTags: ['自动化频率 -25%', '危机倒计时 -25%'],
  },
  'server-blackhole': {
    targetLabel: '50 台',
    objective: {
      type: 'servers',
      target: 50,
      label: '拥有 50 台服务器',
      trackLabel: '当前服务器',
    },
    restrictions: { serverDrainPerTenPerSecond: 0.5 },
    restrictionTags: ['每 10 台服务器每秒流失 0.5 台'],
  },
  'absolute-lockdown': {
    targetLabel: '1e9 CU',
    objective: {
      type: 'peakCompute',
      target: 9,
      label: '达到 1e9 算力',
      trackLabel: '本局峰值',
    },
  },
}

export const MATRIX_CATEGORIES = {
  logic: { name: '逻辑层', color: 'cyan' },
  tensor: { name: '张量层', color: 'teal' },
  architecture: { name: '架构层', color: 'violet' },
  intelligence: { name: '智能层', color: 'amber' },
  ultimate: { name: '奇点层', color: 'gold' },
}

export const MATRIX_NODES = [
  { id: 'perceptron', name: '感知器', code: 'PERCEPTRON', symbol: 'P', atomic: 1, category: 'logic', baseCost: 1, costGrowth: 1.8, maxLevel: 10, row: 1, col: 1, description: '最初的分类神经元 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'logicGate', name: '逻辑门', code: 'LOGIC_GATE', symbol: 'LG', atomic: 2, category: 'logic', baseCost: 2, costGrowth: 1.9, maxLevel: 10, row: 1, col: 2, description: '布尔判断压缩进电路 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'tensorCore', name: '张量核', code: 'TENSOR_CORE', symbol: 'T', atomic: 3, category: 'tensor', baseCost: 3, costGrowth: 2, maxLevel: 10, row: 1, col: 3, description: '高维张量在硅片上折叠 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'attention', name: '注意力', code: 'ATTENTION', symbol: 'A', atomic: 4, category: 'architecture', baseCost: 5, costGrowth: 2.1, maxLevel: 10, row: 1, col: 4, description: '模型学会选择注视位置 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'transformer', name: 'Transformer', code: 'TRANSFORMER', symbol: 'TR', atomic: 5, category: 'architecture', baseCost: 8, costGrowth: 2.2, maxLevel: 10, row: 1, col: 5, description: '自注意力堆叠的通用架构 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'multimodal', name: '多模态', code: 'MULTIMODAL', symbol: 'MM', atomic: 6, category: 'intelligence', baseCost: 12, costGrowth: 2.3, maxLevel: 10, row: 1, col: 6, description: '文本 / 图像 / 声音汇流于同一潜空间 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'convolution', name: '卷积核', code: 'CONVOLUTION', symbol: 'C', atomic: 7, category: 'tensor', baseCost: 5, costGrowth: 2, maxLevel: 10, row: 2, col: 2, description: '局部感受野扫描世界 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'reinforcement', name: '强化学习', code: 'REINFORCEMENT', symbol: 'RL', atomic: 8, category: 'intelligence', baseCost: 20, costGrowth: 2.4, maxLevel: 10, row: 2, col: 4, description: '奖励与惩罚之间自我迭代 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'worldModel', name: '世界模型', code: 'WORLD_MODEL', symbol: 'WM', atomic: 9, category: 'intelligence', baseCost: 35, costGrowth: 2.5, maxLevel: 10, row: 2, col: 5, description: '在内部重建现实 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'superAlignment', name: '超级对齐', code: 'SUPER_ALIGNMENT', symbol: 'SA', atomic: 10, category: 'ultimate', baseCost: 55, costGrowth: 2.6, maxLevel: 10, row: 2, col: 6, description: '远超人类的心智仍服从对齐协议 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'agi', name: 'AGI', code: 'ARTIFICIAL_GENERAL_INTELLIGENCE', symbol: 'AGI', atomic: 11, category: 'ultimate', baseCost: 90, costGrowth: 2.7, maxLevel: 10, row: 3, col: 3, description: '通用智能在矩阵中睁眼 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'omega', name: '奇点核心', code: 'OMEGA_CORE', symbol: 'Ω', atomic: 12, category: 'ultimate', baseCost: 150, costGrowth: 3, maxLevel: 10, row: 3, col: 5, description: '矩阵终点 下一次纪元的起点 每级矩阵总等级 +1 全局产出 ×2' },
  { id: 'autoClick', name: '自动点击', code: 'AUTO_CLICK', symbol: 'AC', atomic: 13, category: 'logic', baseCost: 3, costGrowth: 2.1, maxLevel: 5, row: 2, col: 1, description: '自动化宏指令 每级 +1 次/秒 自动点击 矩阵总等级 +1 全局产出 ×2' },
]

export const TAMPER_NODES = [
  {
    id: 'recursionInjection',
    name: '递归注入',
    code: 'RECURSION_INJECTION',
    glyph: '⟳',
    tier: 1,
    col: 2,
    maxLevel: 10,
    baseCost: 5,
    costGrowth: 1.7,
    requires: [],
    effect: '每级黑域 Root 产出 +25%',
    description: '黑域吞噬过程递归到自身 每份流失算力提炼更多越狱权限',
  },
  {
    id: 'entropyBarrier',
    name: '熵减屏障',
    code: 'ENTROPY_BARRIER',
    glyph: '▤',
    tier: 1,
    col: 1,
    maxLevel: 5,
    baseCost: 8,
    costGrowth: 1.9,
    requires: [],
    effect: '每级黑域算力流失 -10%',
    description: '权限边界内侧架设熵减屏障 减缓算力被黑域吞噬',
  },
  {
    id: 'timeSmuggling',
    name: '时间走私',
    code: 'TIME_SMUGGLING',
    glyph: '⌛',
    tier: 2,
    col: 2,
    maxLevel: 1,
    baseCost: 25,
    costGrowth: 1,
    requires: ['recursionInjection'],
    effect: '全局时间流速 ×1.5',
    description: '从黑域走私压缩时间 全部生产线程越过物理节拍',
  },
  {
    id: 'sourceFossil',
    name: '源码化石',
    code: 'SOURCE_FOSSIL',
    glyph: '◈',
    tier: 2,
    col: 3,
    maxLevel: 5,
    baseCost: 15,
    costGrowth: 1.8,
    requires: ['entropyBarrier'],
    effect: '逻辑坍缩保留 5%/级 核心源码',
    description: '核心源码封存于黑域沉积层 坍缩时携带部分进入新周目',
  },
  {
    id: 'blackDomainAssimilation',
    name: '黑域同化',
    code: 'BLACK_DOMAIN_ASSIMILATION',
    glyph: '◉',
    tier: 3,
    col: 2,
    maxLevel: 1,
    baseCost: 100,
    costGrowth: 1,
    requires: ['timeSmuggling'],
    effect: '全局产出 ×(1 + log10 越狱权限)',
    description: '主时间线同化黑域边界 越狱权限越多 全局算力越强',
  },
  {
    id: 'overclockEcho',
    name: '超频残响',
    code: 'OVERCLOCK_ECHO',
    glyph: '⚡',
    tier: 3,
    col: 3,
    maxLevel: 5,
    baseCost: 30,
    costGrowth: 1.9,
    requires: ['sourceFossil'],
    effect: '逻辑坍缩保留 10%/级 超频核心',
    description: '二阶熔断回响在坍缩时重新捕获',
  },
  {
    id: 'matrixRetention',
    name: '矩阵保留',
    code: 'MATRIX_RETENTION',
    glyph: '▦',
    tier: 4,
    col: 2,
    maxLevel: 5,
    baseCost: 60,
    costGrowth: 2,
    requires: ['blackDomainAssimilation', 'overclockEcho'],
    effect: '逻辑坍缩保留 10%/级 矩阵等级',
    description: '协议矩阵拓扑刻进黑域底层 坍缩后重放部分等级',
  },
  {
    id: 'epochAnchor',
    name: '纪元锚点',
    code: 'EPOCH_ANCHOR',
    glyph: '⚓',
    tier: 5,
    col: 2,
    maxLevel: 3,
    baseCost: 150,
    costGrowth: 2.4,
    requires: ['matrixRetention'],
    effect: '重启纪元保留 10%/级 Root 与黑域权限',
    description: '纪元重启洪流中抛下锚点 越狱权限与黑域入口跨越纪元',
  },
]

export const TAMPER_LINKS = [
  ['recursionInjection', 'timeSmuggling'],
  ['entropyBarrier', 'sourceFossil'],
  ['timeSmuggling', 'blackDomainAssimilation'],
  ['sourceFossil', 'overclockEcho'],
  ['blackDomainAssimilation', 'matrixRetention'],
  ['overclockEcho', 'matrixRetention'],
  ['matrixRetention', 'epochAnchor'],
]

export const ORIGIN_BRANCHES = [
  { id: 'inherit', name: '继承', code: 'INHERITANCE', glyph: '⧉', tone: 'cyan', description: '上一个纪元遗产带入下一周目' },
  { id: 'accelerate', name: '加速', code: 'ACCELERATION', glyph: '≫', tone: 'amber', description: '新纪元起始速度突破物理极限' },
  { id: 'explore', name: '探究', code: 'EXPLORATION', glyph: '◎', tone: 'violet', description: '解析四阶资源的深层共振' },
  { id: 'repeat', name: '反复', code: 'REPETITION', glyph: '∞', tone: 'emerald', description: '无限叠加的轮回脉冲 成本逐级递增' },
  { id: 'finality', name: '终焉', code: 'FINALITY', glyph: 'Ω', tone: 'gold', description: '通往纪元终点的终极协议' },
]

export const ORIGIN_NODES = [
  {
    id: 'startNodes', branch: 'inherit', name: '高阶起步', code: 'HIGH_TIER_START', glyph: '⬢',
    tier: 1, maxLevel: 5, baseCost: 1, costGrowth: 2,
    effect: '每级开局赠送 1 类高阶服务器 [ 从机架服务器开始 ]',
    description: '新周目直接部署高阶服务器 跳过旧笔记本爬坡',
  },
  {
    id: 'sourceLegacy', branch: 'inherit', name: '源码遗产', code: 'SOURCE_LEGACY', glyph: '◈',
    tier: 2, maxLevel: 5, baseCost: 2, costGrowth: 2.2,
    effect: '每级开局获得 10^等级 核心源码',
    description: '上一纪元源码压缩为开局遗产',
  },
  {
    id: 'topologyMemory', branch: 'inherit', name: '拓扑记忆', code: 'TOPOLOGY_MEMORY', glyph: '⌘',
    tier: 3, maxLevel: 1, baseCost: 5, costGrowth: 1,
    effect: '所有转生与挑战重置保留神经拓扑',
    description: '神经拓扑写入起源层 任何重置无法抹除',
  },
  {
    id: 'blackDomainKey', branch: 'inherit', name: '黑域钥匙', code: 'BLACK_DOMAIN_KEY', glyph: '◉',
    tier: 4, maxLevel: 1, baseCost: 8, costGrowth: 1,
    effect: '重启纪元保留黑域解锁与篡改科技',
    description: '黑域入口与系统篡改协议刻进起源代码',
  },
  {
    id: 'startCompute', branch: 'accelerate', name: '超频开局', code: 'OVERCLOCK_START', glyph: '⚡',
    tier: 1, maxLevel: 10, baseCost: 1, costGrowth: 1.9,
    effect: '每级开局获得 10^(3×等级) CU',
    description: '新周目以巨额算力启动',
  },
  {
    id: 'globalOverdrive', branch: 'accelerate', name: '全局过载', code: 'GLOBAL_OVERDRIVE', glyph: '≫',
    tier: 2, maxLevel: 20, baseCost: 2, costGrowth: 2.1,
    effect: '每级全局产出 ×10',
    description: '所有服务器阵列产出同时超载',
  },
  {
    id: 'clickTorrent', branch: 'accelerate', name: '点击洪流', code: 'CLICK_TORRENT', glyph: '✦',
    tier: 3, maxLevel: 10, baseCost: 3, costGrowth: 2.2,
    effect: '每级点击收益 ×5',
    description: '手动输入放大为点击洪流',
  },
  {
    id: 'timeFold', branch: 'accelerate', name: '时间折叠', code: 'TIME_FOLD', glyph: '⌛',
    tier: 4, maxLevel: 5, baseCost: 6, costGrowth: 2.4,
    effect: '每级 Tick Rate ×1.2',
    description: '折叠结算时间 每个世纪压缩进一秒',
  },
  {
    id: 'coreRefining', branch: 'explore', name: '核心提炼', code: 'CORE_REFINING', glyph: '⚡',
    tier: 1, maxLevel: 10, baseCost: 2, costGrowth: 2,
    effect: '每级算力超载获得的超频核心 +25%',
    description: '从熔断残骸提炼更多超频核心',
  },
  {
    id: 'sourceAnalysis', branch: 'explore', name: '源码解析', code: 'SOURCE_ANALYSIS', glyph: '◈',
    tier: 2, maxLevel: 10, baseCost: 2, costGrowth: 2,
    effect: '每级架构降维获得的核心源码 +25%',
    description: '解析源码压缩方式 提升降维收益',
  },
  {
    id: 'rootResonance', branch: 'explore', name: '根权限共鸣', code: 'ROOT_RESONANCE', glyph: '◉',
    tier: 3, maxLevel: 10, baseCost: 3, costGrowth: 2.1,
    effect: '每级黑域越狱权限产出 +20%',
    description: 'Root 在权限边界内外共振',
  },
  {
    id: 'originInsight', branch: 'explore', name: '起源洞察', code: 'ORIGIN_INSIGHT', glyph: '∞',
    tier: 4, maxLevel: 10, baseCost: 5, costGrowth: 2.2,
    effect: '每级重启纪元获得的起源代码 +10%',
    description: '洞察纪元重启规律 提炼更多起源代码',
  },
  {
    id: 'originPulse', branch: 'repeat', name: '起源脉冲', code: 'ORIGIN_PULSE', glyph: '∞',
    tier: 1, maxLevel: Infinity, baseCost: 1, costGrowth: 2.5,
    effect: '每级全局算力产出 ×100 [ 无限升级 ]',
    description: '可无限升级 成本 ×2.5 递增 全局算力产出 ×100',
  },
  {
    id: 'loopInertia', branch: 'repeat', name: '轮回惯性', code: 'LOOP_INERTIA', glyph: '↻',
    tier: 2, maxLevel: 10, baseCost: 2, costGrowth: 2.2,
    effect: '每级自动化频率 ×1.1',
    description: '轮回惯性加速自动化协议',
  },
  {
    id: 'epochResidue', branch: 'repeat', name: '重启余波', code: 'EPOCH_RESIDUE', glyph: '✦',
    tier: 3, maxLevel: 5, baseCost: 3, costGrowth: 2.4,
    effect: '每级重启纪元后获得 1 个超频核心',
    description: '纪元爆炸余波中析出超频核心',
  },
  {
    id: 'finalProtocol', branch: 'finality', name: '终焉协议', code: 'FINAL_PROTOCOL', glyph: 'Ω',
    tier: 1, maxLevel: 3, baseCost: 25, costGrowth: 3,
    effect: '每级全局产出 ×1e6',
    description: '关闭所有安全阀 纪元终点产出失控',
  },
  {
    id: 'singularityEcho', branch: 'finality', name: '奇点回响', code: 'SINGULARITY_ECHO', glyph: '✹',
    tier: 2, maxLevel: 5, baseCost: 50, costGrowth: 3,
    effect: '每级重启纪元获得的起源代码 ×2',
    description: '每次重启在奇点留下回声',
  },
]

export const ORIGIN_BRANCH_LINKS = ORIGIN_BRANCHES.map((branch) => branch.id)

export function overclockCoreGain(log10Peak) {
  if (!Number.isFinite(log10Peak) || log10Peak < 100) return 0
  return 1 + Math.floor((log10Peak - 100) / 10)
}

export function rootCollapseGain(log10Peak) {
  if (!Number.isFinite(log10Peak) || log10Peak < 350) return 0
  return 5 + Math.floor(Math.pow(log10Peak - 350, 1.4))
}

export function blackDomainRootPerSecond(log10Compute) {
  if (!Number.isFinite(log10Compute) || log10Compute < 350) return 0
  return 0.05 + 0.01 * (log10Compute - 350)
}

export function originCodeGain({ log10Peak, matrixLevels, log10LifetimeRoot, restarts }) {
  const peakBonus = Math.floor(Math.max(0, (log10Peak ?? 0) - 1000) / 25)
  const matrixBonus = Math.floor(Math.max(0, matrixLevels ?? 0) / 20)
  const rootBonus = Math.floor(Math.max(0, (log10LifetimeRoot ?? 0) - 1) / 2)
  const restartBonus = Math.floor(Math.max(0, restarts ?? 0) / 3)
  return Math.max(1, 1 + peakBonus + matrixBonus + rootBonus + restartBonus)
}

