<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatNumber } from '../composables/useGameState'
import { NEURAL_MATRIX_BRANCH_MAP } from '../composables/neuralMatrixData'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  nodes: { type: Array, required: true },
  unlocked: { type: Boolean, default: false },
  litCount: { type: Number, default: 0 },
  sourceBalance: { type: Number, default: 0 },
  globalAutoUnlocked: { type: Boolean, default: false },
  showExpand: { type: Boolean, default: true },
})

const emit = defineEmits(['light', 'global-buy'])

const expanded = ref(false)
const selectedId = ref(null)
const deniedId = ref(null)
let deniedTimer = null

const nodeMap = computed(
  () => new Map(props.nodes.map((node) => [node.id, node])),
)

const coreNode = computed(
  () => props.nodes.find((node) => node.branch === 'core') ?? null,
)

const coreLit = computed(() => Boolean(coreNode.value?.lit))

const selectedNode = computed(() =>
  selectedId.value ? nodeMap.value.get(selectedId.value) ?? null : null,
)

const selectedBranch = computed(() => {
  if (!selectedNode.value) return null
  return NEURAL_MATRIX_BRANCH_MAP.get(selectedNode.value.branch) ?? null
})

const selectedState = computed(() => {
  const node = selectedNode.value
  if (!node) return 'idle'
  return nodeState(node)
})

const forkDrops = [
  { tone: 'cyan', d: 'M16.667 46 V100' },
  { tone: 'gold', d: 'M50 46 V100' },
  { tone: 'violet', d: 'M83.333 46 V100' },
]

const columns = computed(() =>
  [...NEURAL_MATRIX_BRANCH_MAP.values()]
    .filter((branch) => branch.id !== 'core')
    .map((branch) => {
      const branchNodes = props.nodes
        .filter((node) => node.branch === branch.id)
        .sort((a, b) => a.order - b.order)
      const steps = branchNodes.map((node, index) => ({
        node,
        wireLit: Boolean(
          index === 0 ? coreNode.value?.lit : branchNodes[index - 1]?.lit,
        ),
      }))
      return {
        ...branch,
        nodes: branchNodes,
        steps,
        lit: branchNodes.filter((node) => node.lit).length,
        tailLit: Boolean(branchNodes[branchNodes.length - 1]?.lit),
      }
    }),
)

const guideNodeId = computed(() => {
  if (!props.unlocked) return null
  return (
    props.nodes.find((node) => !node.lit && node.canAfford)?.id ??
    props.nodes.find((node) => node.id === 'matrix-core')?.id ??
    null
  )
})

const balanceLabel = computed(() => formatNumber(props.sourceBalance).text)

function nodeTone(node) {
  return NEURAL_MATRIX_BRANCH_MAP.get(node.branch)?.tone ?? 'core'
}

function nodeState(node) {
  if (node.lit) return 'lit'
  if (!node.requiresMet) return 'sealed'
  if (!props.unlocked) return 'dim'
  return node.canAfford ? 'ready' : 'poor'
}

function stateLabel(node) {
  const state = nodeState(node)
  if (state === 'lit') return '已点亮'
  if (state === 'sealed') return `需先点亮 [ ${node.missingRequirementName || '前置节点'} ]`
  if (state === 'poor') return '核心源码不足'
  return '可点亮'
}

function stateShort(node) {
  const state = nodeState(node)
  if (state === 'lit') return 'LIT'
  if (state === 'sealed') return 'LOCK'
  if (state === 'poor') return '不足'
  if (state === 'dim') return '封印'
  return '可点亮'
}

function nodeAriaLabel(node) {
  if (node.lit) return `${node.name} 已点亮 ${node.effect}`
  if (!node.requiresMet) {
    return `${node.name} 未解锁 需先点亮 ${node.missingRequirementName}`
  }
  return `${node.name} ${node.effect} 消耗 ${formatNumber(node.cost).text} 核心源码`
}

function handleNodeClick(node) {
  if (!props.unlocked) {
    selectedId.value = node.id
    return
  }

  if (selectedId.value === node.id && !node.lit) {
    if (!node.requiresMet || !node.canAfford) {
      flashDenied(node.id)
      return
    }
    emit('light', node.id)
    return
  }

  selectedId.value = node.id
}

function flashDenied(id) {
  deniedId.value = id
  if (deniedTimer) window.clearTimeout(deniedTimer)
  deniedTimer = window.setTimeout(() => {
    deniedId.value = null
    deniedTimer = null
  }, 1600)
}

function handleKeydown(event) {
  if (event.key === 'Escape' && expanded.value) {
    expanded.value = false
  }
}

watch(expanded, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

watch(
  () => props.nodes,
  (nodes) => {
    if (!selectedId.value) return
    if (!nodes.some((node) => node.id === selectedId.value)) {
      selectedId.value = null
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (deniedTimer) window.clearTimeout(deniedTimer)
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body" :disabled="!expanded">
    <div
      class="topology-inline"
      :class="{ 'topology-modal': expanded }"
      :role="expanded ? 'dialog' : undefined"
      :aria-modal="expanded ? 'true' : undefined"
      :aria-label="expanded ? '神经矩阵' : undefined"
      @click.self="expanded = false"
    >
      <div
        :class="
          expanded
            ? 'topology-modal__panel neural-panel'
            : 'topology-inline__panel neural-panel'
        "
      >
        <div v-if="expanded" class="topology-modal__head">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="cyber-icon-frame cyber-icon-frame--sm" aria-hidden="true">
              <GameIcon name="neural" :size="17" />
            </span>
            <div class="min-w-0">
              <p class="topology-modal__eyebrow">永久认知层 // NEURAL MATRIX</p>
              <h2 class="topology-modal__title">神经矩阵</h2>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="topology-modal__progress">
              已点亮 {{ litCount }} / {{ nodes.length }}
            </span>
            <button
              type="button"
              class="topology-expand-btn"
              aria-label="关闭神经矩阵大图"
              @click="expanded = false"
            >
              关闭
            </button>
          </div>
        </div>

        <div class="neural-status-row">
          <span class="flex items-center gap-2 font-semibold text-cyan-200">
            <span class="status-dot"></span>
            神经矩阵在线
          </span>
          <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="tabular-nums text-slate-300">
              {{ litCount }} / {{ nodes.length }} 节点
            </span>
            <span class="neural-balance" title="核心源码余额">
              <span class="neural-balance__gem" aria-hidden="true">◆</span>
              <span class="tabular-nums">{{ balanceLabel }}</span>
              <span class="text-slate-500">核心源码</span>
            </span>
            <button
              v-if="globalAutoUnlocked"
              type="button"
              class="neural-global__btn"
              title="GLOBAL_CONTROL // 一键自动购买所有已授权服务器 与 算法升级"
              @click="$emit('global-buy')"
            >
              一键采购
            </button>
            <button
              v-if="!expanded && showExpand"
              type="button"
              class="topology-expand-btn"
              aria-label="展开神经矩阵大图"
              @click="expanded = true"
            >
              展开大图
            </button>
          </span>
        </div>

        <div class="neural-map" :class="{ 'neural-map--expanded': expanded }">
          <div v-if="unlocked" class="neural-tree">
            <div class="neural-core-stage">
              <p class="neural-core-stage__tag">NEURAL CORE // 永久认知层</p>

              <button
                v-if="coreNode"
                type="button"
                class="neural-core"
                :class="{
                  'is-selected': selectedId === coreNode.id,
                  'is-denied': deniedId === coreNode.id,
                }"
                :data-state="nodeState(coreNode)"
                :data-guide="coreNode.id === guideNodeId ? 'topology-node' : null"
                :aria-label="nodeAriaLabel(coreNode)"
                :aria-pressed="selectedId === coreNode.id ? 'true' : 'false'"
                @click="handleNodeClick(coreNode)"
              >
                <span class="neural-core__hex">
                  <span class="neural-core__halo" aria-hidden="true"></span>
                  <svg
                    class="neural-core__frame"
                    viewBox="0 0 120 136"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polygon
                      class="neural-core__hex-outer"
                      points="60,3 114,33 114,103 60,133 6,103 6,33"
                    />
                    <polygon
                      class="neural-core__hex-inner"
                      points="60,13 105,38 105,98 60,123 15,98 15,38"
                    />
                  </svg>
                  <svg
                    class="neural-core__die"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <rect
                      class="neural-core__die-glow"
                      x="12"
                      y="12"
                      width="24"
                      height="24"
                      rx="2.5"
                    />
                    <rect
                      class="neural-core__die-core"
                      x="12"
                      y="12"
                      width="24"
                      height="24"
                      rx="2.5"
                    />
                    <path
                      class="neural-core__die-trace"
                      d="M19 19h6v6h-6z M25 25h4v4h-4z"
                    />
                    <path
                      class="neural-core__die-pins"
                      d="M18 12V6 M24 12V6 M30 12V6 M18 36v6 M24 36v6 M30 36v6 M12 18H6 M12 24H6 M12 30H6 M36 18h6 M36 24h6 M36 30h6"
                    />
                  </svg>
                  <span class="neural-core__scan" aria-hidden="true"></span>
                </span>

                <span class="neural-core__caption">
                  <span class="neural-core__name">内核</span>
                  <span class="neural-core__code">NEURAL_CORE</span>
                  <span class="neural-core__cost">
                    <template v-if="coreLit">已点亮 永久保留</template>
                    <template v-else>
                      ◆ {{ formatNumber(coreNode.cost).text }} 核心源码
                    </template>
                  </span>
                </span>
              </button>
            </div>

            <svg
              class="neural-fork"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                class="neural-fork__trunk"
                :class="{ 'is-lit': coreLit }"
                d="M50 0 V46"
                vector-effect="non-scaling-stroke"
              />
              <path
                class="neural-fork__bus"
                :class="{ 'is-lit': coreLit }"
                d="M16.667 46 H83.333"
                vector-effect="non-scaling-stroke"
              />
              <path
                v-for="drop in forkDrops"
                :key="drop.tone"
                class="neural-fork__drop"
                :class="{ 'is-lit': coreLit }"
                :data-tone="drop.tone"
                :d="drop.d"
                vector-effect="non-scaling-stroke"
              />
            </svg>

            <div class="neural-columns">
              <section
                v-for="column in columns"
                :key="column.id"
                class="neural-column"
                :data-tone="column.tone"
              >
                <header
                  class="neural-column__head"
                  :class="{ 'is-lit': coreLit }"
                >
                  <span class="neural-column__dot" aria-hidden="true"></span>
                  <span class="neural-column__name">{{ column.name }}</span>
                  <span class="neural-column__count">
                    {{ column.lit }}/{{ column.nodes.length }}
                  </span>
                </header>

                <div class="neural-column__track">
                  <div
                    v-for="step in column.steps"
                    :key="step.node.id"
                    class="neural-step"
                  >
                    <svg
                      class="neural-link"
                      :class="{ 'is-lit': step.wireLit }"
                      :data-tone="column.tone"
                      viewBox="0 0 2 24"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <line
                        x1="1"
                        y1="0"
                        x2="1"
                        y2="24"
                        vector-effect="non-scaling-stroke"
                      />
                    </svg>

                    <button
                      type="button"
                      class="neural-node"
                      :class="{
                        'is-selected': selectedId === step.node.id,
                        'is-denied': deniedId === step.node.id,
                      }"
                      :data-tone="nodeTone(step.node)"
                      :data-state="nodeState(step.node)"
                      :data-branch="step.node.branch"
                      :data-guide="
                        step.node.id === guideNodeId ? 'topology-node' : null
                      "
                      :aria-label="nodeAriaLabel(step.node)"
                      :aria-pressed="
                        selectedId === step.node.id ? 'true' : 'false'
                      "
                      @click="handleNodeClick(step.node)"
                    >
                      <span class="neural-node__top">
                        <span class="neural-node__order">
                          {{ String(step.node.order).padStart(2, '0') }}
                        </span>
                        <span class="neural-node__name">{{ step.node.name }}</span>
                      </span>
                      <span class="neural-node__bottom">
                        <span class="neural-node__flag">
                          {{ stateShort(step.node) }}
                        </span>
                        <span class="neural-node__cost">
                          <i aria-hidden="true">◆</i>
                          {{ formatNumber(step.node.cost).text }}
                        </span>
                      </span>
                    </button>
                  </div>

                  <svg
                    class="neural-link neural-link--tail"
                    :class="{ 'is-lit': column.tailLit }"
                    :data-tone="column.tone"
                    viewBox="0 0 2 18"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <line
                      x1="1"
                      y1="0"
                      x2="1"
                      y2="18"
                      vector-effect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              </section>
            </div>
          </div>

          <div v-else class="topology-lock">
            <svg
              viewBox="0 0 24 24"
              class="h-7 w-7 text-cyan-400/80"
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <rect x="5" y="10.5" width="14" height="9.5" stroke-width="1.2" />
              <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke-width="1.2" />
              <circle cx="12" cy="15.5" r="1.1" fill="currentColor" stroke="none" />
            </svg>
            <p class="text-[11px] font-semibold tracking-[0.18em] text-cyan-200">
              神经矩阵尚未解密
            </p>
            <p class="text-[10px] tracking-[0.06em] text-slate-400">
              需完成首次跃迁以解密
            </p>
          </div>
        </div>

        <section class="neural-info" aria-live="polite">
          <template v-if="selectedNode">
            <header class="neural-info__head">
              <span
                class="neural-info__branch"
                :data-tone="selectedBranch?.tone ?? 'core'"
              >
                {{ selectedBranch?.name ?? '内核' }}
              </span>
              <span class="neural-info__name">{{ selectedNode.name }}</span>
              <span class="neural-info__code">{{ selectedNode.code }}</span>
              <span
                class="neural-info__state"
                :data-state="selectedState"
                :class="{ 'is-denied': deniedId === selectedNode.id }"
              >
                {{ deniedId === selectedNode.id ? '无法点亮' : stateLabel(selectedNode) }}
              </span>
            </header>

            <div class="neural-info__body">
              <div class="neural-info__effect">
                <p class="neural-info__effect-title">{{ selectedNode.effect }}</p>
                <p class="neural-info__effect-detail">{{ selectedNode.effectDetail }}</p>
                <p class="neural-info__desc">{{ selectedNode.description }}</p>
              </div>
              <div class="neural-info__cost">
                <span class="neural-info__cost-label">消耗</span>
                <span class="neural-info__cost-value">
                  <span class="neural-info__gem" aria-hidden="true">◆</span>
                  {{ formatNumber(selectedNode.cost).text }}
                </span>
                <span class="neural-info__cost-unit">核心源码</span>
                <span class="neural-info__hint" :data-state="selectedState">
                  {{
                    selectedNode.lit
                      ? '永久生效 不随重置回退'
                      : selectedState === 'ready'
                        ? '再次点击节点确认点亮'
                        : selectedState === 'sealed'
                          ? `需先点亮 [ ${selectedNode.missingRequirementName || '前置节点'} ]`
                          : selectedState === 'poor'
                            ? '核心源码不足 继续架构降维'
                            : '矩阵未解锁'
                  }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="neural-info__idle">
            <span class="neural-info__idle-title">NEURAL MATRIX // 待命</span>
            <span class="neural-info__idle-text">
              第一次点击节点查看效果与消耗 再次点击同一节点完成点亮
            </span>
          </div>

        </section>
      </div>
    </div>
  </Teleport>
</template>
