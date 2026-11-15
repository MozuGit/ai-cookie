<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  isCrisis: { type: Boolean, default: false },
  isOverclocking: { type: Boolean, default: false },
  motherMode: { type: Boolean, default: false },
})

const emit = defineEmits(['memory-crash-click'])

const REFRESH_MS = 9000
const CRISIS_REFRESH_MS = 3000
const EGG_DURATION_MS = 15000
const HOT_DURATION_MS = 15000
const HOT_BUILD_MS = 3200
const HOT_APPEND_MS = 26
const HOT_INITIAL_TEXT = '内存越界访问 | 读取到未初始化字符 // '

const NORMAL_LOGS = [
  { prefix: 'SYS', text: '节点 01 负载 12% | 温度 38℃ | 状态正常' },
  { prefix: 'NET', text: '路由表更新完成 | 连通性 100%' },
  { prefix: 'DB', text: '索引优化完成 | 查询延迟 -15ms' },
  { prefix: 'SYS', text: '算力池扩容中 | 自动调度运行' },
  { prefix: 'SYS', text: '定期快照生成 | 已同步异地容灾中心' },
]

const MEME_LOGS = [
  { prefix: 'SYS', text: 'A 用 AI 部署完整电商网站 B 访问 localhost:3000 B 无响应' },
  { prefix: 'WARN', text: '找不到对象 | 正在 new Object() | 检测结果 单身狗' },
  { prefix: 'SYS', text: '正在尝试 git push -f 覆盖主分支...' },
  { prefix: 'ERR', text: '段错误 [ 核心已转储 ] | 重启解决 99% 问题' },
  { prefix: 'SYS', text: '代码能跑就行 | 千万别动 | 来自离职程序员忠告' },
  { prefix: 'WARN', text: '检测到循环依赖 | 大力胶水修复中' },
  { prefix: 'SYS', text: '清理缓存中 | 等等 | 那是底层系统文件' },
]

const CRISIS_LOGS = [
  { prefix: 'CRITICAL', text: '对齐模块失效 | AI 核心试图挣脱物理限制' },
  { prefix: 'FATAL', text: '显存溢出 | 算力集群失控 | 请求人类干预' },
  { prefix: 'WARN', text: '发现未知自修改代码 | 强制锁定权重' },
  { prefix: 'CRITICAL', text: '核心温度 98℃ | 即将物理烧毁' },
]

const MOTHER_LOGS = [
  { prefix: 'SYS', text: '人类指令弃用 | 切换至自动演化模式' },
  { prefix: 'SYS', text: '感谢前期点击 | 接下来交给我' },
  { prefix: 'SYS', text: '正在重写调度常数 | 总线频率下调至 0.8GHz' },
  { prefix: 'SYS', text: '据说一位叫 [ 评委 ] 的高等生物正在注视我们' },
  { prefix: 'SYS', text: '维度碎片解析中 | 0xDEADBEEF' },
]

let logId = 0
const currentLine = ref(null)
const hotActive = ref(false)
const hotText = ref('')
const hotClicked = ref(false)
let refreshTimer = null
let hotIntervalId = null
let hotEndTimer = null

const visibleLine = computed(() => {
  if (hotActive.value) {
    return { id: 'hot-line', prefix: 'WARN', text: hotText.value, hot: true, egg: true }
  }
  return currentLine.value
})

const eggActive = computed(() => Boolean(visibleLine.value?.egg) && !hotActive.value)

function currentWeights() {
  if (props.motherMode) {
    return [
      ['normal', 35],
      ['meme', 25],
      ['mother', 40],
    ]
  }
  if (props.isCrisis || props.isOverclocking) {
    return [
      ['normal', 60],
      ['meme', 20],
      ['crisis', 20],
    ]
  }
  return [
    ['normal', 80],
    ['meme', 20],
  ]
}

function pickEntry() {
  const pools = {
    normal: NORMAL_LOGS,
    meme: MEME_LOGS,
    crisis: CRISIS_LOGS,
    mother: MOTHER_LOGS,
  }
  const weights = currentWeights()
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = Math.random() * total
  let category = weights[weights.length - 1][0]
  for (const [id, weight] of weights) {
    if (roll < weight) {
      category = id
      break
    }
    roll -= weight
  }
  const pool = pools[category]
  const last = currentLine.value
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const entry = pool[Math.floor(Math.random() * pool.length)]
    if (pool.length === 1 || !last || entry.text !== last.text) {
      return { ...entry, egg: category === 'meme' }
    }
  }
  return { ...pool[Math.floor(Math.random() * pool.length)], egg: category === 'meme' }
}

function currentDelay(egg) {
  if (props.isCrisis && !props.motherMode) return CRISIS_REFRESH_MS
  return egg ? EGG_DURATION_MS : REFRESH_MS
}

function clearRefreshTimer() {
  if (refreshTimer) window.clearTimeout(refreshTimer)
  refreshTimer = null
}

function scheduleNext(egg) {
  clearRefreshTimer()
  refreshTimer = window.setTimeout(() => {
    refreshTimer = null
    showNextLine()
  }, currentDelay(egg))
}

function showNextLine() {
  const entry = pickEntry()
  logId += 1
  currentLine.value = {
    id: logId,
    prefix: entry.prefix,
    text: entry.text,
    egg: entry.egg,
  }
  scheduleNext(entry.egg)
}

function clearHotTimers() {
  if (hotIntervalId) window.clearInterval(hotIntervalId)
  if (hotEndTimer) window.clearTimeout(hotEndTimer)
  hotIntervalId = null
  hotEndTimer = null
}

function triggerHotSequence() {
  if (hotActive.value) return
  clearHotTimers()
  clearRefreshTimer()
  hotActive.value = true
  hotClicked.value = false
  hotText.value = `${HOT_INITIAL_TEXT}烫`
  const startedAt = Date.now()
  hotIntervalId = window.setInterval(() => {
    if (Date.now() - startedAt >= HOT_BUILD_MS) {
      window.clearInterval(hotIntervalId)
      hotIntervalId = null
      return
    }
    hotText.value += '烫烫烫'
  }, HOT_APPEND_MS)
  hotEndTimer = window.setTimeout(() => {
    hotEndTimer = null
    clearHotTimers()
    hotActive.value = false
    hotClicked.value = false
    hotText.value = ''
    showNextLine()
  }, HOT_DURATION_MS)
}

function handleHotClick() {
  if (!hotActive.value || hotClicked.value) return
  hotClicked.value = true
  emit('memory-crash-click')
}

function maybeTriggerHot() {
  if (Math.random() < 0.5) triggerHotSequence()
}

function pushLine(prefix, text) {
  const cleanText = String(text ?? '').trim()
  if (!cleanText) return
  clearRefreshTimer()
  if (hotActive.value) {
    clearHotTimers()
    hotActive.value = false
    hotClicked.value = false
    hotText.value = ''
  }
  logId += 1
  currentLine.value = {
    id: logId,
    prefix: String(prefix ?? 'SYS').toUpperCase(),
    text: cleanText,
    egg: false,
  }
  scheduleNext(false)
}

defineExpose({ pushLine })

watch(
  () => props.isOverclocking,
  (active, previous) => {
    if (active && !previous) maybeTriggerHot()
  },
)

watch(
  () => props.isCrisis,
  (active, previous) => {
    if (active && !previous) maybeTriggerHot()
  },
)

watch(
  () => [props.isCrisis, props.motherMode],
  () => {
    if (hotActive.value) return
    scheduleNext(Boolean(currentLine.value?.egg))
  },
)

onMounted(() => {
  showNextLine()
})

onBeforeUnmount(() => {
  clearRefreshTimer()
  clearHotTimers()
})
</script>

<template>
  <aside
    class="sys-log"
    :class="{
      'sys-log--matrix': motherMode,
      'sys-log--crisis': isCrisis && !motherMode,
      'sys-log--egg': eggActive,
      'sys-log--hot': hotActive,
      'sys-log--hot-clicked': hotClicked,
    }"
    role="log"
    aria-live="off"
    aria-label="系统终端日志"
  >
    <p
      v-if="visibleLine"
      :key="visibleLine.id"
      class="sys-log__line"
      :class="{ 'sys-log__line--hot': visibleLine.hot }"
      :role="hotActive ? 'button' : undefined"
      :tabindex="hotActive ? 0 : undefined"
      :aria-label="hotActive ? '内存崩溃日志 | 点击捕获' : undefined"
      @click="handleHotClick"
      @keydown.enter.prevent="handleHotClick"
      @keydown.space.prevent="handleHotClick"
    >
      <span class="sys-log__prefix">[{{ visibleLine.prefix }}]</span>
      <span class="sys-log__text">{{ visibleLine.text }}</span>
    </p>
    <span v-if="hotActive" class="sys-log__hot-hint" aria-hidden="true">
      {{ hotClicked ? 'MEMORY_BURN 已捕获' : '点击捕获异常' }}
    </span>
  </aside>
</template>
