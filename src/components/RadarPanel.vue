<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue'
import { formatMultiplier } from '../composables/useGameState'
import {
  RADAR_CATEGORIES,
  RADAR_RARITIES,
  RADAR_TEST_MODE,
  RADAR_TOTAL_NODES,
  radarNodeSignal,
} from '../composables/radarData'
import GameIcon from './GameIcon.vue'

const emit = defineEmits(['close'])
const game = inject('game')

const {
  radarCapturedCount,
  radarCategoryState,
  radarCompletedCategories,
  radarNodeBonusPercent,
  radarCategoryMultiplier,
  radarGlobalMultiplier,
  radarBurstActive,
  radarBurstCountdownLabel,
  radarBurstNextLabel,
  radarOverloadScanActive,
  radarOverloadScanLabel,
  radarScanChance,
  radarNextScanSeconds,
  captureRadarBurst,
} = game

const RARITY_GLYPHS = {
  common: '◇',
  rare: '◈',
  mythic: '✦',
}

const selectedCategoryId = ref(RADAR_CATEGORIES[0].id)
const selectedNodeId = ref(RADAR_CATEGORIES[0].nodes[0].id)
const capturePulse = ref(false)
let captureTimer = null

const selectedCategory = computed(
  () =>
    radarCategoryState.value.find(
      (category) => category.id === selectedCategoryId.value,
    ) ?? radarCategoryState.value[0],
)

const selectedNode = computed(
  () =>
    selectedCategory.value.nodes.find(
      (node) => node.id === selectedNodeId.value,
    ) ?? selectedCategory.value.nodes[0],
)

const selectedNodeCaptured = computed(() => selectedNode.value?.captured === true)
const selectedSignal = computed(() =>
  selectedNode.value ? radarNodeSignal(selectedNode.value.id) : 0,
)
const totalProgress = computed(
  () => (radarCapturedCount.value / RADAR_TOTAL_NODES) * 100,
)
const scanChanceLabel = computed(
  () => `${Math.round(radarScanChance.value * 100)}%`,
)
const overloadChanceLabel = computed(() =>
  radarOverloadScanActive.value ? '×4 锁定稀有' : '标准协议',
)

function rarityMeta(node) {
  return RADAR_RARITIES[node?.rarity] ?? RADAR_RARITIES.common
}

function rarityGlyph(node) {
  return RARITY_GLYPHS[node?.rarity] ?? RARITY_GLYPHS.common
}

function selectCategory(category) {
  selectedCategoryId.value = category.id
  const firstLocked = category.nodes.find((node) => !node.captured)
  selectedNodeId.value = firstLocked?.id ?? category.nodes[0]?.id ?? ''
}

function selectNode(node) {
  selectedNodeId.value = node.id
}

function handleEmergencyCapture() {
  if (!captureRadarBurst()) return
  capturePulse.value = true
  window.clearTimeout(captureTimer)
  captureTimer = window.setTimeout(() => {
    capturePulse.value = false
    captureTimer = null
  }, 2800)
}

function closeOnEscape(event) {
  if (event.key !== 'Escape') return
  emit('close')
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => {
  window.clearTimeout(captureTimer)
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div class="radar-panel" role="dialog" aria-modal="true" aria-label="异常算力雷达">
    <div class="radar-panel__backdrop" @click="emit('close')"></div>

    <div class="radar-panel__frame" :class="{ 'radar-panel__frame--captured': capturePulse }">
      <header class="radar-panel__header">
        <div class="radar-panel__brand">
          <span class="radar-panel__sigil" aria-hidden="true">
            <GameIcon name="radar" :size="30" />
          </span>
          <div class="min-w-0">
            <p class="radar-panel__eyebrow">
              ANOMALY COMPUTE RADAR // 游离节点追踪阵列
            </p>
            <h2 class="radar-panel__title">异常算力雷达</h2>
          </div>
        </div>

        <div class="radar-panel__stats">
          <span class="radar-stat">
            <small>图鉴总进度</small>
            <strong>
              {{ radarCapturedCount }}
              <i>/ {{ RADAR_TOTAL_NODES }}</i>
            </strong>
          </span>
          <span class="radar-stat">
            <small>节点永久增益</small>
            <strong>+{{ radarNodeBonusPercent }}%</strong>
          </span>
          <span class="radar-stat" :class="{ 'radar-stat--live': radarOverloadScanActive }">
            <small>过载扫描</small>
            <strong>
              {{ radarOverloadScanActive ? radarOverloadScanLabel : '待机' }}
            </strong>
          </span>
        </div>

        <button
          type="button"
          class="radar-panel__close"
          aria-label="关闭异常算力雷达"
          @click="emit('close')"
        >
          ✕
        </button>
      </header>

      <div class="radar-panel__topline">
        <span class="radar-panel__topline-label">ARCHIVE SYNC</span>
        <span class="radar-panel__topline-meter">
          <i :style="{ width: `${totalProgress}%` }"></i>
        </span>
        <span class="radar-panel__topline-value">
          {{ radarCapturedCount }} / {{ RADAR_TOTAL_NODES }}
        </span>
        <span class="radar-panel__topline-mode">
          {{ RADAR_TEST_MODE ? 'TEST CYCLE 30S' : 'STABLE CYCLE' }}
        </span>
      </div>

      <div v-if="radarBurstActive" class="radar-burst-banner">
        <span class="radar-burst-banner__pulse" aria-hidden="true"></span>
        <div class="radar-burst-banner__copy">
          <p class="radar-burst-banner__title">
            ⚠ 突发异常 // 高维算力节点正在逃逸
          </p>
          <p class="radar-burst-banner__meta">
            紧急捕获窗口剩余 {{ radarBurstCountdownLabel }} // 成功捕获将启动 10 分钟过载扫描
          </p>
        </div>
        <button
          type="button"
          class="radar-emergency-btn"
          @click="handleEmergencyCapture"
        >
          紧急捕获
        </button>
      </div>

      <div class="radar-panel__body">
        <aside class="radar-panel__categories">
          <p class="radar-section-label">
            数据图鉴
            <span>05 CATEGORIES</span>
          </p>

          <button
            v-for="(category, index) in radarCategoryState"
            :key="category.id"
            type="button"
            class="radar-category"
            :class="[
              `radar-tone-${category.tone}`,
              {
                'radar-category--active': category.id === selectedCategoryId,
                'radar-category--complete': category.complete,
              },
            ]"
            @click="selectCategory(category)"
          >
            <span class="radar-category__index">0{{ index + 1 }}</span>
            <span class="radar-category__body">
              <span class="radar-category__code">{{ category.code }}</span>
              <span class="radar-category__name">{{ category.name }}</span>
              <span class="radar-category__bar">
                <i :style="{ width: `${category.progress}%` }"></i>
              </span>
            </span>
            <span class="radar-category__meta">
              <strong>{{ category.captured }}<i>/{{ category.total }}</i></strong>
              <span
                class="radar-category__seal"
                :class="{ 'radar-category__seal--idle': !category.complete }"
              >
                {{ category.complete ? '终极 ×2' : '×2 未解锁' }}
              </span>
            </span>
          </button>

          <div class="radar-scan-card">
            <span class="radar-scan-card__label">被动扫描 // PASSIVE</span>
            <div class="radar-scan-card__row">
              <span>判定间隔</span>
              <strong>10 秒</strong>
            </div>
            <div class="radar-scan-card__row">
              <span>成功概率</span>
              <strong :class="{ 'text-amber-300': radarOverloadScanActive }">
                {{ scanChanceLabel }}
              </strong>
            </div>
            <div class="radar-scan-card__row">
              <span>下次判定</span>
              <strong>{{ radarNextScanSeconds }}s</strong>
            </div>
            <div class="radar-scan-card__row">
              <span>稀有锁定</span>
              <strong :class="{ 'text-amber-300': radarOverloadScanActive }">
                {{ overloadChanceLabel }}
              </strong>
            </div>
            <p class="radar-scan-card__note">
              扫描成功解析一个未捕获节点 | 图鉴全满后每次判定把扫描余量转化为算力
            </p>
          </div>
        </aside>

        <section class="radar-panel__grid">
          <div class="radar-grid-head">
            <div class="min-w-0">
              <p class="radar-grid-head__title">
                {{ selectedCategory.name }}
                <span>{{ selectedCategory.code }}</span>
              </p>
              <p class="radar-grid-head__desc">{{ selectedCategory.description }}</p>
            </div>
            <span
              class="radar-category-complete"
              :class="{ 'radar-category-complete--active': selectedCategory.complete }"
            >
              {{
                selectedCategory.complete
                  ? '分类终极已激活 // 全局 ×2'
                  : '集齐 8 节点解锁 ×2'
              }}
            </span>
          </div>

          <div class="radar-grid">
            <button
              v-for="(node, index) in selectedCategory.nodes"
              :key="node.id"
              type="button"
              class="radar-cell"
              :class="[
                node.captured ? `radar-cell--captured radar-rarity-${node.rarity}` : 'radar-cell--locked',
                { 'radar-cell--selected': node.id === selectedNodeId },
              ]"
              @click="selectNode(node)"
            >
              <span class="radar-cell__index">
                N-{{ String(index + 1).padStart(2, '0') }}
              </span>
              <span class="radar-cell__glyph" aria-hidden="true">
                {{ node.captured ? rarityGlyph(node) : '?' }}
              </span>
              <span class="radar-cell__name">
                {{ node.captured ? node.name : '???' }}
              </span>
              <span class="radar-cell__rarity">
                {{ node.captured ? rarityMeta(node).label : 'SIGNAL LOST' }}
              </span>
              <span class="radar-cell__foot">
                <span v-if="node.captured">+{{ node.bonus }}%</span>
                <span v-else>{{ radarNodeSignal(node.id) }}% SIGNAL</span>
              </span>
            </button>
          </div>

          <div class="radar-grid-foot">
            <span>已解析 {{ selectedCategory.captured }} / {{ selectedCategory.total }}</span>
            <span>
              分类终极
              <strong :class="{ 'text-amber-300': selectedCategory.complete }">
                {{ selectedCategory.complete ? '×2 ACTIVE' : 'LOCKED' }}
              </strong>
            </span>
            <span>节点永久增益 +{{ radarNodeBonusPercent }}%</span>
          </div>
        </section>

        <aside class="radar-panel__detail">
          <p class="radar-section-label">
            节点解析
            <span>NODE DETAIL</span>
          </p>

          <div class="radar-detail__head">
            <p class="radar-detail__code">{{ selectedNode.id.toUpperCase() }}</p>
            <h3
              class="radar-detail__name"
              :class="{ 'radar-detail__name--locked': !selectedNodeCaptured }"
            >
              {{ selectedNodeCaptured ? selectedNode.name : '???' }}
            </h3>
            <div class="radar-detail__tags">
              <span
                class="radar-tag"
                :class="`radar-rarity-${selectedNode.rarity}`"
              >
                {{ rarityMeta(selectedNode).label }}
              </span>
              <span class="radar-tag">{{ selectedCategory.name }}</span>
              <span
                class="radar-tag"
                :class="{ 'radar-tag--live': selectedNodeCaptured }"
              >
                {{ selectedNodeCaptured ? '已捕获' : '未捕获' }}
              </span>
            </div>
          </div>

          <p
            class="radar-detail__desc"
            :class="{ 'radar-detail__desc--locked': !selectedNodeCaptured }"
          >
            {{
              selectedNodeCaptured
                ? selectedNode.description
                : `信号强度 ${selectedSignal}% · 该节点仍被噪声遮蔽 | 保持被动扫描 | 等待突发异常窗口开启`
            }}
          </p>

          <div class="radar-detail__bonus">
            <span>永久全局增益</span>
            <strong v-if="selectedNodeCaptured">
              全局算力产出 +{{ selectedNode.bonus }}%
            </strong>
            <strong v-else class="radar-detail__bonus--locked">
              未解析 // ???
            </strong>
          </div>

          <div class="radar-detail__progress">
            <div class="radar-detail__progress-head">
              <span>分类收集进度</span>
              <strong>{{ selectedCategory.captured }} / {{ selectedCategory.total }}</strong>
            </div>
            <div class="radar-meter">
              <i :style="{ width: `${selectedCategory.progress}%` }"></i>
            </div>
            <p>集齐该分类全部 8 个节点 | 永久获得全局算力 ×2</p>
          </div>

          <div class="radar-detail__progress">
            <div class="radar-detail__progress-head">
              <span>总收集进度</span>
              <strong>{{ radarCapturedCount }} / {{ RADAR_TOTAL_NODES }}</strong>
            </div>
            <div class="radar-meter radar-meter--gold">
              <i :style="{ width: `${totalProgress}%` }"></i>
            </div>
            <p>
              {{ radarCompletedCategories }} / 5 分类终极已激活 // 分类倍率
              ×{{ formatMultiplier(radarCategoryMultiplier) }}
            </p>
          </div>

          <div v-if="radarOverloadScanActive" class="radar-buff">
            <div class="radar-buff__head">
              <span class="radar-buff__dot" aria-hidden="true"></span>
              过载扫描 // OVERLOAD SCAN
            </div>
            <div class="radar-buff__timer">{{ radarOverloadScanLabel }}</div>
            <p>被动扫描概率 ×4 | 成功时必定锁定未捕获的稀有或终焉节点</p>
          </div>

          <div class="radar-detail__telemetry">
            <div>
              <span>扫描概率</span>
              <strong>{{ scanChanceLabel }}</strong>
            </div>
            <div>
              <span>下次判定</span>
              <strong>{{ radarNextScanSeconds }} 秒</strong>
            </div>
            <div>
              <span>下次异常</span>
              <strong :class="{ 'text-red-300': radarBurstActive }">
                {{ radarBurstActive ? '窗口开启' : radarBurstNextLabel }}
              </strong>
            </div>
            <div>
              <span>全局产出倍率</span>
              <strong>×{{ formatMultiplier(radarGlobalMultiplier) }}</strong>
            </div>
          </div>

          <button
            v-if="radarBurstActive"
            type="button"
            class="radar-emergency-btn radar-emergency-btn--wide"
            @click="handleEmergencyCapture"
          >
            紧急捕获 // 剩余 {{ radarBurstCountdownLabel }}
          </button>
          <p v-else class="radar-detail__hint">
            突发异常窗口开启后此处出现紧急捕获入口 | 捕获成功获得 10 分钟过载扫描
          </p>
        </aside>
      </div>

      <footer class="radar-panel__footer">
        <span>NODE ARCHIVE // {{ radarCapturedCount }} / {{ RADAR_TOTAL_NODES }}</span>
        <span>节点增益 +{{ radarNodeBonusPercent }}% · 分类终极 ×{{ formatMultiplier(radarCategoryMultiplier) }}</span>
        <span>GLOBAL OUTPUT ×{{ formatMultiplier(radarGlobalMultiplier) }}</span>
        <span class="radar-panel__footer-mode">
          {{ RADAR_TEST_MODE ? 'TEST MODE // 30S BURST' : 'STABLE MODE // 90MIN AVG' }}
        </span>
      </footer>
    </div>
  </div>
</template>
