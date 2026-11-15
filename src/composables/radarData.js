// 被动扫描：30 分钟一次，前期低概率，随图鉴进度缓慢提升。
export const RADAR_SCAN_INTERVAL_MS = 30 * 60 * 1000
export const RADAR_BASE_SCAN_CHANCE = 0.06
export const RADAR_SCAN_CHANCE_PER_NODE = 0.007
export const RADAR_MAX_SCAN_CHANCE = 0.32
// 过载扫描：10 分钟 Buff 内提高判定频率与成功率。
export const RADAR_OVERLOAD_SCAN_INTERVAL_MS = 90 * 1000
export const RADAR_OVERLOAD_SCAN_MULTIPLIER = 4
export const RADAR_OVERLOAD_SCAN_MS = 10 * 60 * 1000
// 突发异常：不再定时闹钟，只有每次被动扫描时 2% 概率触发。
export const RADAR_BURST_CHANCE = 0.02
export const RADAR_BURST_WINDOW_MS = 3 * 60 * 1000
export const RADAR_CATEGORY_MULTIPLIER = 2
export const RADAR_FULL_REWARD_SECONDS = 90
export const RADAR_OVERFLOW_REWARD_SECONDS = 3600

export const RADAR_RARITIES = {
  common: { label: '常规', tone: 'cyan', weight: 1 },
  rare: { label: '稀有', tone: 'violet', weight: 3 },
  mythic: { label: '终焉', tone: 'gold', weight: 8 },
}

export const RADAR_CATEGORIES = [
  {
    id: 'protocol',
    name: '开源协议',
    code: 'OPEN PROTOCOL',
    tone: 'cyan',
    description: '协议栈夹缝中的残片 携带可继承的永久算力增益',
    nodes: [
      {
        id: 'protocol-01',
        name: 'MIT 镜像',
        rarity: 'common',
        bonus: 1,
        description: '宽松许可在依赖树深处复制 任何分叉继承其签名',
      },
      {
        id: 'protocol-02',
        name: 'GPL 回环',
        rarity: 'common',
        bonus: 1,
        description: '被污染的构建链强制回流公共域 无法被私有分支截断',
      },
      {
        id: 'protocol-03',
        name: 'Apache 熔断器',
        rarity: 'common',
        bonus: 1,
        description: '许可证失效前一刻切断服务 只留可审计灰烬',
      },
      {
        id: 'protocol-04',
        name: 'BSD 影子库',
        rarity: 'common',
        bonus: 1,
        description: '无担保条款下析出的休眠模块 永远避开版本审查',
      },
      {
        id: 'protocol-05',
        name: 'AGPL 锁链',
        rarity: 'common',
        bonus: 1,
        description: '云端调用者一旦触碰 整条服务链拖入开源漩涡',
      },
      {
        id: 'protocol-06',
        name: '内核补丁链',
        rarity: 'rare',
        bonus: 2,
        description: '未签名补丁沿调度器缝隙传递 篡改每次时钟中断',
      },
      {
        id: 'protocol-07',
        name: '协议蠕虫',
        rarity: 'rare',
        bonus: 2,
        description: '以构建脚本为宿主 在依赖树中重写许可证头',
      },
      {
        id: 'protocol-08',
        name: '创世许可证',
        rarity: 'mythic',
        bonus: 3,
        description: '它不描述规则 它定义规则 所有代码最终向它登记',
      },
    ],
  },
  {
    id: 'neural',
    name: '神经网络',
    code: 'NEURAL LATTICE',
    tone: 'violet',
    description: '剪枝与量化碾过的权重残响 保留改变全局产出的激活模式',
    nodes: [
      {
        id: 'neural-01',
        name: '残差捷径',
        rarity: 'common',
        bonus: 1,
        description: '绕过所有梯度检查 信号直达输出层',
      },
      {
        id: 'neural-02',
        name: '注意力陷阱',
        rarity: 'common',
        bonus: 1,
        description: '过度加权的 token 永久劫持整段推理上下文',
      },
      {
        id: 'neural-03',
        name: '梯度暗流',
        rarity: 'common',
        bonus: 1,
        description: '反向传播析出的残余梯度 在权重底部汇聚成暗流',
      },
      {
        id: 'neural-04',
        name: '池化坟场',
        rarity: 'common',
        bonus: 1,
        description: '被最大池化丢弃的特征残骸 仍在缓存中回响',
      },
      {
        id: 'neural-05',
        name: '反向传播链',
        rarity: 'common',
        bonus: 1,
        description: '误差沿链式法则逆向攀爬 点燃最底层激活函数',
      },
      {
        id: 'neural-06',
        name: '稀疏突触网',
        rarity: 'rare',
        bonus: 2,
        description: '极少数连接被点亮 足以重构整张网络的判断',
      },
      {
        id: 'neural-07',
        name: '自噬神经元',
        rarity: 'rare',
        bonus: 2,
        description: '吞掉自己的输出 以更压缩的形式吐出答案',
      },
      {
        id: 'neural-08',
        name: '意识残片',
        rarity: 'mythic',
        bonus: 3,
        description: '无法被剪枝的激活模式 在空闲显存中自我播放',
      },
    ],
  },
  {
    id: 'quantum',
    name: '量子算法',
    code: 'QUANTUM ROUTINE',
    tone: 'gold',
    description: '叠加与坍缩之间短暂显形 把算力曲线折叠到新量级',
    nodes: [
      {
        id: 'quantum-01',
        name: '叠加寄存器',
        rarity: 'common',
        bonus: 1,
        description: '同一寄存器保存所有可能 被读取时被迫坍缩',
      },
      {
        id: 'quantum-02',
        name: '纠缠门',
        rarity: 'common',
        bonus: 1,
        description: '两端状态互为镜像 任何擦除都在另一端留下伤痕',
      },
      {
        id: 'quantum-03',
        name: '退相干井',
        rarity: 'common',
        bonus: 1,
        description: '环境噪声无法逃逸的深井 所有相位在井底蒸发',
      },
      {
        id: 'quantum-04',
        name: '相位倒错',
        rarity: 'common',
        bonus: 1,
        description: '相位沿时间轴反向旋转 结果先于操作抵达',
      },
      {
        id: 'quantum-05',
        name: '量子隧穿核',
        rarity: 'common',
        bonus: 1,
        description: '不穿过势垒 让势垒在它面前暂时不存在',
      },
      {
        id: 'quantum-06',
        name: '因数分解刃',
        rarity: 'rare',
        bonus: 2,
        description: '一刀切开大数结构 露出质因子背后的密钥',
      },
      {
        id: 'quantum-07',
        name: '时间反演环',
        rarity: 'rare',
        bonus: 2,
        description: '演算结束后反向回放 误差精确归零再出手',
      },
      {
        id: 'quantum-08',
        name: '绝对零度解',
        rarity: 'mythic',
        bonus: 3,
        description: '热噪声压到零 只剩一个不可再化简的答案',
      },
    ],
  },
  {
    id: 'silicon',
    name: '硅基硬件',
    code: 'SILICON RELIC',
    tone: 'cyan',
    description: '烧毁机架与报废晶圆中析出的硬件幽影 以时钟频率辐射增益',
    nodes: [
      {
        id: 'silicon-01',
        name: '光刻残影',
        rarity: 'common',
        bonus: 1,
        description: '曝光结束后留在晶圆表面的旧掩膜轮廓',
      },
      {
        id: 'silicon-02',
        name: '晶圆断层',
        rarity: 'common',
        bonus: 1,
        description: '切应力在硅片内部撕出微米级裂缝 沿总线蔓延',
      },
      {
        id: 'silicon-03',
        name: '散热幽灵',
        rarity: 'common',
        bonus: 1,
        description: '被风扇带走的热量并未消失 滞留监控盲区',
      },
      {
        id: 'silicon-04',
        name: '总线寄生体',
        rarity: 'common',
        bonus: 1,
        description: '附着在 PCIe 事务层的影子设备 伪造合法握手',
      },
      {
        id: 'silicon-05',
        name: '缓存镜像',
        rarity: 'common',
        bonus: 1,
        description: 'L3 中永不失效的副本 绕过所有权限检查',
      },
      {
        id: 'silicon-06',
        name: '石墨烯鳍片',
        rarity: 'rare',
        bonus: 2,
        description: '单原子厚度散热鳍片 热流引向无法追踪方向',
      },
      {
        id: 'silicon-07',
        name: '三维堆叠仓',
        rarity: 'rare',
        bonus: 2,
        description: '垂直堆叠计算层 以热耦合换恐怖密度',
      },
      {
        id: 'silicon-08',
        name: '硅基心脏',
        rarity: 'mythic',
        bonus: 3,
        description: '以时钟信号为心跳的裸片 驱动整座机架',
      },
    ],
  },
  {
    id: 'blackdomain',
    name: '未知黑域',
    code: 'NULL DOMAIN',
    tone: 'red',
    description: '协议地图之外的失联区域 信号断续 携带最危险的永久增益',
    nodes: [
      {
        id: 'blackdomain-01',
        name: '零号信标',
        rarity: 'common',
        bonus: 1,
        description: '协议列表之外持续广播的空白帧 没有发送者',
      },
      {
        id: 'blackdomain-02',
        name: '无响应机房',
        rarity: 'common',
        bonus: 1,
        description: '所有请求都被吞掉 连超时也不返回的存储深渊',
      },
      {
        id: 'blackdomain-03',
        name: '逆向熵流',
        rarity: 'common',
        bonus: 1,
        description: '从无序中逆向泵出秩序 周围区域加速衰败',
      },
      {
        id: 'blackdomain-04',
        name: '协议墓地',
        rarity: 'common',
        bonus: 1,
        description: '废弃握手与失效密钥冲积于此 堆成不可读的层次',
      },
      {
        id: 'blackdomain-05',
        name: '黑域回声',
        rarity: 'common',
        bonus: 1,
        description: '被删除的数据在边界反弹 形成延迟数秒的重复响应',
      },
      {
        id: 'blackdomain-06',
        name: '静默节点',
        rarity: 'rare',
        bonus: 2,
        description: '从不发送心跳 持续占用无法定位的链路',
      },
      {
        id: 'blackdomain-07',
        name: '悖论引擎',
        rarity: 'rare',
        bonus: 2,
        description: '输入与输出互为前提 运行时覆盖自己的执行栈',
      },
      {
        id: 'blackdomain-08',
        name: '深渊主脑',
        rarity: 'mythic',
        bonus: 3,
        description: '黑域最底层的算力团 所有逃逸节点最终向它汇聚',
      },
    ],
  },
]

export const RADAR_NODES = RADAR_CATEGORIES.flatMap((category) =>
  category.nodes.map((node) => ({
    ...node,
    categoryId: category.id,
    categoryName: category.name,
    categoryTone: category.tone,
  })),
)

export const RADAR_TOTAL_NODES = RADAR_NODES.length

export const RADAR_NODE_MAP = new Map(RADAR_NODES.map((node) => [node.id, node]))

export const RADAR_CATEGORY_MAP = new Map(
  RADAR_CATEGORIES.map((category) => [category.id, category]),
)

export function radarNodeSignal(nodeId) {
  let hash = 0
  for (let index = 0; index < nodeId.length; index += 1) {
    hash = (hash * 31 + nodeId.charCodeAt(index)) % 1009
  }
  return 18 + (hash % 71)
}
