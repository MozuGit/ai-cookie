import fs from 'node:fs'
import path from 'node:path'

import {
  ACHIEVEMENT_DEFINITIONS,
  ACHIEVEMENT_TIERS,
} from '../src/composables/achievementData.js'
import {
  ASCENSION_THRESHOLDS,
  ASCENSION_TIER_DEFS,
  CHALLENGE_DEFS,
  GLOBAL_MILESTONES,
  MATRIX_CATEGORIES,
  MATRIX_NODES,
  ORIGIN_BRANCHES,
  ORIGIN_NODES,
  TAMPER_NODES,
} from '../src/composables/ascensionData.js'
import {
  CYBER_MATRIX_BRANCHES,
  CYBER_MATRIX_NODES,
} from '../src/composables/cyberMatrixData.js'
import {
  NEURAL_MATRIX_BRANCHES,
  NEURAL_MATRIX_NODES,
} from '../src/composables/neuralMatrixData.js'
import { RADAR_CATEGORIES, RADAR_RARITIES } from '../src/composables/radarData.js'

const root = path.resolve(import.meta.dirname, '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

const esc = (value) =>
  String(value ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ')

const table = (headers, rows) => {
  const head = `| ${headers.join(' | ')} |`
  const sep = `| ${headers.map(() => '---').join(' | ')} |`
  const body = rows.map((row) => `| ${row.map(esc).join(' | ')} |`)
  return [head, sep, ...body].join('\n')
}

const bullets = (items) => items.map((item) => `- ${item}`).join('\n')

// ---- 系统日志池（从终端组件提取，保证与运行时一致） ----
const terminalSource = read('src/components/SystemTerminal.vue')
const logPool = (name) => {
  const block = terminalSource.match(
    new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\]`),
  )
  if (!block) return []
  return [...block[1].matchAll(/\{ prefix: '([^']*)', text: '([^']*)' \}/g)].map(
    ([, prefix, text]) => ({ prefix, text }),
  )
}
const logs = {
  NORMAL_LOGS: logPool('NORMAL_LOGS'),
  MEME_LOGS: logPool('MEME_LOGS'),
  CRISIS_LOGS: logPool('CRISIS_LOGS'),
  MOTHER_LOGS: logPool('MOTHER_LOGS'),
}

const doc = []
const p = (line = '') => doc.push(line)

p('# 算力奇点 // 世界观数据字典')
p()
p('> 版本：v1.0.0 · 词表基线：`COMPUTE-SINGULARITY / CYBER-ONLY`')
p('> 生成源：`src/composables/*.js`、`src/components/SystemTerminal.vue`、主壳与抽屉 UI 文案。')
p('> 本文件为清洗后全量字典，是 UI 文案与代码标识的唯一对照表。')
p()
p('---')
p()

p('## 0. 术语清洗审计')
p()
p(
  table(
    ['旧世界观词', '处置', '当前词表', '覆盖范围'],
    [
      ['全轨道产出', '替换', '全局算力产出 / 全阵列产出', '跃迁协议、起源代码树、全局乘区'],
      ['轨道', '替换', '服务器阵列 / 算力节点', '建筑、自动化、日志'],
      ['星图 / 星树', '替换', '神经矩阵 / 底层网络', '永久认知层、自动化终端、任务指引'],
      ['星尘', '替换', '算力废料 / 散落数据', '无残留（0 处）'],
      ['星系 / 星球 / 天体', '替换', '集群 / 节点 / 微芯片', '无残留（0 处）'],
      ['宇宙 / 太空 / 银河', '替换', '全局 / 阵列 / 底层', '无残留（0 处）'],
      ['重力 / 引力', '替换', '负载 / 总线频率', '对齐危机 QTE、失败浮层、自动化日志'],
      ['脱轨 / 正轨', '替换', '越界 / 协议上线', '危机救场提示、成就 Tier II'],
      ['star / star-core / NEURAL_STAR', '重命名', 'matrix / matrix-core / NEURAL_MATRIX', 'JS 模块、节点 ID、CSS 类、模板'],
      ['orbit', '重命名', 'ring', '核心舞台装饰环'],
      ['starfield / createStar', '重命名', 'packet field / createPacket', '赛博背景粒子系统'],
    ],
  ),
)
p()
p(
  '> 唯一保留的 `star-core` 字面量位于 `LEGACY_TOPOLOGY_ALIASES`，仅用于把旧版本地存档迁移到 `matrix-core`，不进入任何 UI 文案或运行时显示。',
)
p()

p('## 1. 核心资源与进程')
p()
p(
  table(
    ['资源 / 进程', '代码键', '定位', '说明'],
    [
      ['算力', 'compute / CU', '主货币', '集群每秒产出与点击输入的唯一结算单位。'],
      ['核心源码', 'coreSource', '一阶资源', '架构降维提炼，用于点亮神经矩阵与架构升级。'],
      ['超频核心', 'overclockCores', '二阶资源', '算力超载熔断产出，用于数据协议矩阵合成。'],
      ['越狱权限', 'rootAccess', '三阶资源', '逻辑坍缩后由黑域持续提炼，用于系统篡改。'],
      ['起源代码', 'originCode', '四阶资源', '重启纪元结算，用于起源代码树。'],
      ['维度碎片', 'dimensionShards', '高维资源', '维度升格结算，用于高维商店。'],
      ['对齐度', 'alignment', '危机计量', '对齐危机期间的稳定性指标，低于阈值触发失败。'],
      ['负载失衡', 'loadDrift', '危机状态', '对齐危机 QTE 的失衡态，指针越界即判定失败。'],
    ],
  ),
)
p()
p('跃迁阈值：')
p()
p(
  bullets([
    `算力超载：**${ASCENSION_THRESHOLDS.overload} CU**`,
    `逻辑坍缩：**${ASCENSION_THRESHOLDS.collapse} CU**`,
    `重启纪元：**${ASCENSION_THRESHOLDS.restart} CU**`,
  ]),
)
p()

p('## 2. 起源代码树（Origin Code Tree）')
p()
p('### 2.1 分支')
p()
p(
  table(
    ['分支', '名称', 'CODE', '定位'],
    ORIGIN_BRANCHES.map((branch) => [
      branch.id,
      branch.name,
      branch.code,
      branch.description,
    ]),
  ),
)
p()
p('### 2.2 节点全量')
p()
p(
  table(
    ['分支', '节点', 'CODE', '层级', '上限', '基础成本', '效果', '描述'],
    ORIGIN_NODES.map((node) => [
      ORIGIN_BRANCHES.find((b) => b.id === node.branch)?.name ?? node.branch,
      node.name,
      node.code,
      node.tier,
      node.maxLevel === Infinity ? '∞' : node.maxLevel,
      node.baseCost,
      node.effect,
      node.description,
    ]),
  ),
)
p()

p('## 3. 数据协议矩阵（Data Protocol Matrix）')
p()
p('### 3.1 分层')
p()
p(
  table(
    ['分层键', '名称', '色调'],
    Object.entries(MATRIX_CATEGORIES).map(([key, value]) => [
      key,
      value.name,
      value.color,
    ]),
  ),
)
p()
p('### 3.2 协议节点')
p()
p(
  table(
    ['#', '节点', 'CODE', '层', '上限', '基础成本', '成本增长', '效果描述'],
    MATRIX_NODES.map((node) => [
      node.atomic,
      node.name,
      node.code,
      MATRIX_CATEGORIES[node.category]?.name ?? node.category,
      node.maxLevel,
      node.baseCost,
      `×${node.costGrowth}`,
      node.description,
    ]),
  ),
)
p()

p('## 4. 越狱协议树（Jailbreak Protocol Tree）')
p()
p(
  table(
    ['层级', '节点', 'CODE', '上限', '基础成本', '效果', '描述'],
    TAMPER_NODES.map((node) => [
      node.tier,
      node.name,
      node.code,
      node.maxLevel,
      node.baseCost,
      node.effect,
      node.description,
    ]),
  ),
)
p()

p('## 5. 神经矩阵（Neural Matrix / 永久认知层）')
p()
p('### 5.1 分支')
p()
p(
  table(
    ['分支', '名称', 'CODE', '描述'],
    NEURAL_MATRIX_BRANCHES.map((branch) => [
      branch.id,
      branch.name,
      branch.code,
      branch.description,
    ]),
  ),
)
p()
p('### 5.2 节点全量')
p()
p(
  table(
    ['分支', '序', '节点', 'CODE', '成本', '效果', '效果细则', '描述'],
    NEURAL_MATRIX_NODES.map((node) => [
      NEURAL_MATRIX_BRANCHES.find((b) => b.id === node.branch)?.name ??
        node.branch,
      node.order,
      node.name,
      node.code,
      node.cost,
      node.effect,
      node.effectDetail,
      node.description,
    ]),
  ),
)
p()

p('## 6. 智械矩阵（Cyber Matrix / 自动化）')
p()
p('### 6.1 模块')
p()
p(
  table(
    ['分支', '名称', 'CODE', '描述'],
    CYBER_MATRIX_BRANCHES.map((branch) => [
      branch.id,
      branch.name,
      branch.code,
      branch.description,
    ]),
  ),
)
p()
p('### 6.2 节点与自动化协议')
p()
p(
  table(
    ['分支', '节点', 'CODE', '消耗', '自动化入口', '效果', '描述'],
    CYBER_MATRIX_NODES.map((node) => [
      CYBER_MATRIX_BRANCHES.find((b) => b.id === node.branch)?.name ??
        node.branch,
      node.name,
      node.code,
      node.cost,
      node.automation ? `${node.automation.label}（${node.automation.code}）` : '—',
      node.effect,
      node.description,
    ]),
  ),
)
p()

p('## 7. 四阶跃迁')
p()
p(
  table(
    ['阶', '名称', 'CODE', '资源', '阈值', '重置范围', '描述'],
    ASCENSION_TIER_DEFS.map((tier) => [
      tier.order,
      tier.name,
      tier.code,
      tier.resourceName,
      tier.thresholdLabel,
      tier.resetLabel,
      tier.description,
    ]),
  ),
)
p()

p('## 8. 全局里程碑')
p()
p(
  table(
    ['阈值', '名称', '效果', '描述'],
    GLOBAL_MILESTONES.map((m) => [
      m.thresholdLabel,
      m.name,
      m.effect,
      m.description,
    ]),
  ),
)
p()

p('## 9. 异常演练（挑战协议）')
p()
p(
  table(
    ['序', '名称', 'CODE', '标签', '目标', '奖励', '限制', '描述'],
    CHALLENGE_DEFS.map((c) => [
      c.order,
      c.name,
      c.code,
      c.tag,
      c.objective.label,
      c.reward.label,
      c.restrictionTags.join(' / '),
      c.description,
    ]),
  ),
)
p()

p('## 10. 成就系统')
p()
p('### 10.1 层级')
p()
p(
  table(
    ['Tier', '标题', 'CODE', '描述'],
    ACHIEVEMENT_TIERS.map((tier) => [
      tier.roman,
      tier.title,
      tier.code,
      tier.description,
    ]),
  ),
)
p()
p('### 10.2 成就条目')
p()
p(
  table(
    ['Tier', '成就', 'CODE', '达成条件', '隐藏'],
    ACHIEVEMENT_DEFINITIONS.map((item) => [
      ACHIEVEMENT_TIERS.find((tier) => tier.id === item.tier)?.roman ?? item.tier,
      item.name,
      item.code,
      item.hint ? `${item.condition} / ${item.hint}` : item.condition,
      item.hidden || item.secret ? '是' : '',
    ]),
  ),
)
p()

p('## 11. 异常算力雷达（图鉴）')
p()
p(
  bullets(
    Object.entries(RADAR_RARITIES).map(
      ([key, value]) => `**${value.label}**（\`${key}\`）· 权重 ${value.weight}`,
    ),
  ),
)
p()
for (const category of RADAR_CATEGORIES) {
  p(`### ${category.name} // ${category.code}`)
  p()
  p(`> ${category.description}`)
  p()
  p(
    table(
      ['编号', '节点', '稀有度', '增益', '描述'],
      category.nodes.map((node) => [
        node.id,
        node.name,
        RADAR_RARITIES[node.rarity]?.label ?? node.rarity,
        `+${node.bonus}`,
        node.description,
      ]),
    ),
  )
  p()
}

p('## 12. 系统日志池（System Terminal）')
p()
for (const [name, list] of Object.entries(logs)) {
  p(`### ${name}（${list.length} 条）`)
  p()
  p(
    table(
      ['级别', '日志文本'],
      list.map((entry) => [entry.prefix, entry.text]),
    ),
  )
  p()
}
p('### 终端彩蛋与常驻提示')
p()
p(
  bullets([
    '内存越界访问 | 读取到未初始化字符 //（`HOT_INITIAL_TEXT`）',
    '警告 // 指针即将越界 迅速按住此处修正（`CRISIS_RESCUE_PROMPT`）',
    '自动完美平衡完成 | 负载失衡解除（自动化日志）',
    '负载失衡爆发 | 自动平衡协议启动（自动化日志）',
  ]),
)
p()

p('## 13. 固定界面文案与底部信息栏')
p()
p('### 13.1 主壳底部信息栏')
p()
p(
  table(
    ['位置', '文案'],
    [
      ['左槽', '自主智能集群 // 算力是唯一货币'],
      ['右槽', '延迟 4MS // 机房 CN-07 // 在线率 100%'],
      ['对齐栏', '累计算力 / 目标 1M CU'],
      ['存档栏', '本地存档 // 自动保存'],
      ['核心上标', '主算力核心 // PRIMARY ALIGNMENT'],
      ['核心标题', '点击核心 / CU / CLICK'],
    ],
  ),
)
p()
p('### 13.2 导航坞')
p()
p(
  table(
    ['位置', '标签', '副标'],
    [
      ['底部', '服务器阵列', '{{ 节点数 }} 节点在线'],
      ['左', '协议与升级', 'MATRIX ×{{ 全局乘区 }}'],
      ['右', '异常与雷达', '{{ 已捕获 }}/{{ 总数 }} 图鉴'],
      ['左上', '自动化终端', '{{ 在线 }}/{{ 解锁 }} 在线'],
    ],
  ),
)
p()
p('### 13.3 维度终端底部信息栏')
p()
p(
  bullets([
    '自治度 100% // 人类指令已丢弃',
    '注入以加速',
    '底层 Ω // 无法回头',
  ]),
)
p()
p('### 13.4 对齐危机（负载平衡 QTE）')
p()
p(
  table(
    ['位置', '文案'],
    [
      ['标题', '对齐危机 · 负载失衡'],
      ['眉标', '负载平衡协议 // LOAD BALANCE'],
      ['状态', '负载失衡 · 对齐流失 / 对齐充能中 100% / 时序时停 · 等待修正'],
      ['失败主标', '[ 负载失衡突破容差 ] // 控制权丢失'],
      ['失败追踪', '回收调度权 // 重建负载基准 // 对齐度归零'],
      ['无障碍', '负载平衡'],
    ],
  ),
)
p()
p('### 13.5 系统信息模块')
p()
p(
  bullets([
    '主协议：架构降维 > 算力超载 > 逻辑坍缩 > 重启纪元',
    '危机协议：负载平衡 / 负载失衡 / 时序时停',
    '矩阵体系：数据协议矩阵 / 智械矩阵 / 神经矩阵',
  ]),
)
p()

p('## 14. 排版适配规范')
p()
p(
  table(
    ['区域', '约束', '实现'],
    [
      [
        '主壳底部信息栏 `.spatial-foot`',
        '允许换行，禁止横向溢出',
        '`flex-wrap: wrap`、`min-width: 0`、`text-wrap: pretty`、行高 1.5',
      ],
      [
        '维度终端底部栏 `.matrix-footer`',
        '三段文案可换行',
        '`flex-wrap: wrap`、`gap: 0.3rem 1rem`、`min-width: 0`',
      ],
      [
        '神经矩阵底栏 `.neural-info`',
        '头部四段（分支/名称/CODE/状态）自动折行',
        '`flex-wrap: wrap`、`min-width: 0`、CODE `overflow-wrap: anywhere`',
      ],
      [
        '神经矩阵画布 `.neural-map`',
        '短屏不挤压底栏',
        '`min-height: clamp(220px, 36vh, 350px)`，720px 高度以下仍保留完整底栏',
      ],
      [
        '跃迁阶位卡底部 `.asc-tier__footer`',
        '重置说明与按钮不互相顶破',
        '`flex-wrap: wrap`、说明区 `flex: 1 1 auto`',
      ],
      [
        '文本上限',
        '单行描述 ≤ 26 个全角字符；按钮标签 ≤ 6 个全角字符',
        '超出时使用 `truncate` 或两行折行，不得压缩字号',
      ],
    ],
  ),
)
p()
p('---')
p()
p(
  '> 校验：源码与构建产物中，上述旧词均已清零；仅本审计表与旧存档迁移键保留字面量，运行文案不包含旧词。',
)
p()

const output = path.join(root, 'docs', 'worldview-dictionary.md')
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, doc.join('\n'), 'utf8')
console.log('written', output, doc.length, 'lines')
