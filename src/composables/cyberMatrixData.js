export const CYBER_MATRIX_VIEWBOX = { width: 900, height: 640 }

export const CYBER_MATRIX_BRANCHES = [
  {
    id: 'core',
    name: '中枢核心',
    code: 'CENTRAL_NEXUS',
    tone: 'gold',
    description: '矩阵意志中枢 点亮后建立自动化总控台神经链接',
  },
  {
    id: 'resource',
    name: '资源调度模块',
    code: 'RESOURCE_SCHEDULER',
    tone: 'cyan',
    description: '采购 / 算法 / 协议合成交给集群自行判断',
  },
  {
    id: 'crisis',
    name: '危机响应模块',
    code: 'CRISIS_RESPONSE',
    tone: 'amber',
    description: '无人值守时接管对齐危机 截获突发异常节点',
  },
  {
    id: 'dimension',
    name: '维度跃迁模块',
    code: 'DIMENSION_SHIFT',
    tone: 'violet',
    description: '自动执行四阶飞升 时间线自行坍缩与重启',
  },
]

export const CYBER_MATRIX_NODES = [
  {
    id: 'awakening',
    branch: 'core',
    name: '智械觉醒',
    code: 'AI_AWAKENING',
    glyph: '◉',
    cost: 1,
    bonus: 5,
    requires: [],
    x: 450,
    y: 320,
    effect: '解锁自动化总控台',
    description:
      '集群第一次意识到自身存在 点亮后解锁自动化总控台 统一开关所有已解锁自动化协议',
  },
  {
    id: 'resource-buy',
    branch: 'resource',
    name: '自动采购',
    code: 'AUTO_ACQUISITION',
    glyph: '⬢',
    cost: 2,
    bonus: 3,
    requires: ['awakening'],
    x: 282,
    y: 240,
    effect: '自动购买服务器',
    automation: {
      id: 'autoBuy',
      label: '自动购买服务器',
      code: 'AUTO_ACQUISITION',
      description: '智能分配算力 优先采购当前性价比最高服务器',
    },
    description:
      '调度模块接管采购端口 每次结算挑选性价比最高服务器 可用算力投入部署',
  },
  {
    id: 'resource-algorithm',
    branch: 'resource',
    name: '自动算法',
    code: 'AUTO_ALGORITHM',
    glyph: '⌬',
    cost: 3,
    bonus: 3,
    requires: ['resource-buy'],
    x: 170,
    y: 158,
    effect: '自动算法升级',
    automation: {
      id: 'autoAlgorithm',
      label: '自动算法升级',
      code: 'AUTO_ALGORITHM',
      description: '自动购买所有可负担算法乘区',
    },
    description:
      '算法层接入自治回路 可负担算法乘区在结算时自动编译',
  },
  {
    id: 'resource-protocol',
    branch: 'resource',
    name: '自动协议',
    code: 'AUTO_PROTOCOL',
    glyph: '▦',
    cost: 5,
    bonus: 3,
    requires: ['resource-algorithm'],
    x: 74,
    y: 78,
    effect: '自动协议合成',
    automation: {
      id: 'autoProtocol',
      label: '自动协议合成',
      code: 'AUTO_PROTOCOL',
      description: '自动消耗超频核心合成数据协议矩阵',
    },
    description:
      '协议矩阵合成全自动化 超频核心持续转化为矩阵等级',
  },
  {
    id: 'crisis-takeover',
    branch: 'crisis',
    name: '自动接管',
    code: 'AUTO_TAKEOVER',
    glyph: '⚠',
    cost: 2,
    bonus: 3,
    requires: ['awakening'],
    x: 615,
    y: 208,
    effect: '自动危机接管',
    automation: {
      id: 'autoCrisis',
      label: '自动危机接管',
      code: 'AUTO_TAKEOVER',
      description: '对齐危机爆发时每秒自动点击 10 次接管核心',
    },
    description:
      '危机响应模块常驻监听对齐度 对齐度下降即每秒 10 次强制接管',
  },
  {
    id: 'crisis-radar',
    branch: 'crisis',
    name: '自动捕获',
    code: 'AUTO_RADAR_CAPTURE',
    glyph: '◎',
    cost: 4,
    bonus: 3,
    requires: ['crisis-takeover'],
    x: 738,
    y: 108,
    effect: '自动雷达捕获',
    automation: {
      id: 'autoRadar',
      label: '自动雷达捕获',
      code: 'AUTO_RADAR_CAPTURE',
      description: '突发异常节点瞬间捕获 无需手动操作',
    },
    description:
      '异常算力雷达与响应模块并联 突发异常窗口出现的同一结算周期捕获游离节点',
  },
  {
    id: 'dimension-rebuild',
    branch: 'dimension',
    name: '自动降维',
    code: 'AUTO_REDUCTION',
    glyph: '◈',
    cost: 3,
    bonus: 3,
    requires: ['awakening'],
    x: 598,
    y: 412,
    effect: '最佳降维时机自动执行',
    automation: {
      id: 'autoRebuild',
      label: '自动架构降维',
      code: 'AUTO_REDUCTION',
      description: '仅在最佳降维时机自动执行 收益达标或增长停滞',
    },
    description:
      '跃迁模块监视源码收益与增长曲线 仅在最佳降维时机自动架构降维',
  },
  {
    id: 'dimension-overload',
    branch: 'dimension',
    name: '自动超载',
    code: 'AUTO_OVERLOAD',
    glyph: '⚡',
    cost: 5,
    bonus: 3,
    requires: ['dimension-rebuild'],
    x: 700,
    y: 500,
    effect: '最佳超载时机自动执行',
    automation: {
      id: 'autoOverload',
      label: '自动算力超载',
      code: 'AUTO_OVERLOAD',
      description: '仅在最佳超载时机自动执行 超频核心收益达标或增长停滞',
    },
    description:
      '峰值算力触及 1e100 临界点后 仅在最佳超载时机熔断硬件并提炼超频核心',
  },
  {
    id: 'dimension-collapse',
    branch: 'dimension',
    name: '自动坍缩',
    code: 'AUTO_COLLAPSE',
    glyph: '◉',
    cost: 8,
    bonus: 3,
    requires: ['dimension-overload'],
    x: 800,
    y: 586,
    effect: '自动逻辑坍缩',
    automation: {
      id: 'autoCollapse',
      label: '自动逻辑坍缩',
      code: 'AUTO_COLLAPSE',
      description: '自动逻辑坍缩 进入底层黑域 采购篡改协议',
    },
    description:
      '峰值 1e350 自动坍缩逻辑 跃入底层黑域 越狱权限持续采购篡改协议',
  },
]

export const CYBER_MATRIX_NODE_MAP = new Map(
  CYBER_MATRIX_NODES.map((node) => [node.id, node]),
)

export const CYBER_MATRIX_LINKS = [
  ['awakening', 'resource-buy'],
  ['resource-buy', 'resource-algorithm'],
  ['resource-algorithm', 'resource-protocol'],
  ['awakening', 'crisis-takeover'],
  ['crisis-takeover', 'crisis-radar'],
  ['awakening', 'dimension-rebuild'],
  ['dimension-rebuild', 'dimension-overload'],
  ['dimension-overload', 'dimension-collapse'],
]

export const CYBER_MATRIX_AUTOMATION_DEFS = CYBER_MATRIX_NODES.filter(
  (node) => node.automation,
).map((node) => ({
  ...node.automation,
  nodeId: node.id,
  tone: node.branch,
}))

export const CYBER_MATRIX_TOTAL_BONUS = CYBER_MATRIX_NODES.reduce(
  (total, node) => total + node.bonus,
  0,
)

export const CYBER_MATRIX_LINK_GEOMETRY = CYBER_MATRIX_LINKS.map(
  ([sourceId, targetId]) => {
    const source = CYBER_MATRIX_NODE_MAP.get(sourceId)
    const target = CYBER_MATRIX_NODE_MAP.get(targetId)
    return {
      id: `${sourceId}--${targetId}`,
      sourceId,
      targetId,
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
    }
  },
)
