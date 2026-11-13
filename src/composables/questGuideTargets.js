// 24 个主线任务兜底指向 | 情境引导缺失时保持箭头落点
import { formatTextNumbers } from './useGameState'

export const QUEST_GUIDE_TARGETS = {
  awaken: {
    target: 'core',
    title: '点击对齐核心',
    hint: '点击中央大圆盘 获取第一批算力',
  },
  laptop: {
    target: 'deploy-first',
    title: '购买第 1 台旧笔记本',
    hint: '请点击这里打开服务器阵列',
  },
  algorithm: {
    target: 'first-algorithm',
    title: '购买第 1 个算法升级',
    hint: '请点击上方 [ 算法升级 ] 页签 购买 1 个多线程并发',
  },
  homepc: {
    target: 'deploy-home',
    title: '部署第 2 台服务器 [ 家用主机 ]',
    hint: '打开 [ 服务器阵列 ] 部署 1 台家用主机',
  },
  servers: {
    target: 'deploy-first',
    title: '部署至 10 台服务器',
    hint: '在 [ 服务器阵列 ] 悬浮舱继续部署 扩充节点',
  },
  compute10k: {
    target: 'core',
    title: '突破 10,000 算力',
    hint: '点击核心并扩充服务器',
  },
  takeover: {
    target: 'core',
    title: '接管一次对齐危机',
    hint: '危机爆发时点击对齐核心',
  },
  rebuild1: {
    target: 'open-reduction',
    title: '执行第 1 次架构降维',
    hint: '点击右侧 [ 四阶飞升 ] 面板的 [ 架构降维 ]',
  },
  topology: {
    target: 'topology-node',
    title: '点亮 1 个神经星树节点',
    hint: '打开 [ 自动化终端 ] 点击节点查看详情 再次点击点亮',
  },
  compute1m: {
    target: 'core',
    title: '突破百万算力',
    hint: '扩张服务器与算法',
  },
  architecture3: {
    target: 'architecture-upgrade',
    title: '购买 3 级永久升级',
    hint: '打开 [ 协议与升级 ] 架构升级站 购买永久升级',
  },
  compute1e10: {
    target: 'core',
    title: '突破 1e10 算力',
    hint: '继续扩张集群',
  },
  rebuild3: {
    target: 'open-reduction',
    title: '完成第 3 次架构降维',
    hint: '点击右侧 [ 四阶飞升 ] 面板的 [ 架构降维 ]',
  },
  compute1e50: {
    target: 'core',
    title: '突破 1e50 算力',
    hint: '利用永久增益继续扩张',
  },
  challenge1: {
    target: 'challenge-start',
    title: '完成一次异常演练',
    hint: '打开 [ 异常与雷达 ] 异常演练 启动挑战',
  },
  overload1: {
    target: 'open-ascension',
    title: '执行第 1 次算力超载',
    hint: '本局峰值达 1e100 后进入飞升终端',
  },
  matrix1: {
    target: 'matrix-node',
    title: '合成 1 个矩阵节点',
    hint: '打开 [ 协议与升级 ] 数据协议矩阵 完成合成',
  },
  compute1e100: {
    target: 'core',
    title: '突破 1e100 算力',
    hint: '继续扩张算力阵列',
  },
  blackdomain: {
    target: 'open-ascension',
    title: '撕开底层黑域',
    hint: '进入飞升终端执行逻辑坍缩',
  },
  tamper1: {
    target: 'open-ascension',
    title: '解锁 1 个篡改节点',
    hint: '进入飞升终端 · 底层黑域',
  },
  compute1e350: {
    target: 'core',
    title: '突破 1e350 算力',
    hint: '继续扩张算力阵列',
  },
  collapse1: {
    target: 'open-ascension',
    title: '执行第 1 次逻辑坍缩',
    hint: '本局峰值达 1e350 后进入飞升终端',
  },
  restart1: {
    target: 'open-ascension',
    title: '重启纪元',
    hint: '击穿 1e1000 后进入飞升终端',
  },
}

function questBadge(quest) {
  if (!quest) return '主线 // 进行中'
  return `阶段${quest.phaseCn} · ${quest.phaseName} // 主线 ${String(quest.index).padStart(2, '0')}/${quest.total}`
}

function makeGuide(id, target, quest, title, text, hint) {
  return {
    id,
    target: `[data-guide="${target}"]`,
    tone: 'gold',
    badge: questBadge(quest),
    title,
    text,
    hint,
    variant: 'pointer',
  }
}

export function buildQuestFallbackGuide(quest) {
  if (!quest) return null
  const entry = QUEST_GUIDE_TARGETS[quest.id]
  if (!entry) return null
  return makeGuide(
    `quest-target-${quest.id}`,
    entry.target,
    quest,
    formatTextNumbers(entry.title),
    formatTextNumbers(entry.hint),
    `${quest.objective ?? entry.title} · ${quest.targetLabel ?? ''}`.trim(),
  )
}
