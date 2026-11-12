<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { formatNumber } from '../composables/useGameState'
import {
  NEURAL_STAR_BRANCH_MAP,
  NEURAL_STAR_LINKS,
} from '../composables/neuralStarData'
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

const selectedNode = computed(() =>
  selectedId.value ? nodeMap.value.get(selectedId.value) ?? null : null,
)

const selectedBranch = computed(() => {
  if (!selectedNode.value) return null
  return NEURAL_STAR_BRANCH_MAP.get(selectedNode.value.branch) ?? null
})

const selectedState = computed(() => {
  const node = selectedNode.value
  if (!node) return 'idle'
  return nodeState(node)
})

const branchChips = computed(() =>
  [...NEURAL_STAR_BRANCH_MAP.values()]
    .filter((branch) => branch.id !== 'core')
    .map((branch) => {
      const branchNodes = props.nodes.filter((node) => node.branch === branch.id)
      return {
        ...branch,
        lit: branchNodes.filter((node) => node.lit).length,
        total: branchNodes.length,
      }
    }),
)

const links = computed(() =>
  NEURAL_STAR_LINKS.map((link) => {
    const source = nodeMap.value.get(link.sourceId)
    const target = nodeMap.value.get(link.targetId)
    if (!source || !target) return null
    return {
      ...link,
      tone: NEURAL_STAR_BRANCH_MAP.get(target.branch)?.tone ?? 'core',
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      lit: source.lit && target.lit,
      near: source.lit || target.lit,
    }
  }).filter(Boolean),
)

const guideNodeId = computed(() => {
  if (!props.unlocked) return null
  return (
    props.nodes.find((node) => !node.lit && node.canAfford)?.id ??
    props.nodes.find((node) => node.id === 'star-core')?.id ??
    null
  )
})

const balanceLabel = computed(() => formatNumber(props.sourceBalance).text)

function nodeTone(node) {
  return NEURAL_STAR_BRANCH_MAP.get(node.branch)?.tone ?? 'core'
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

function nodeAriaLabel(node) {
  if (node.lit) return `${node.name} 已点亮 | ${node.effect}`
  if (!node.requiresMet) {
    return `${node.name} 未解锁 | 需先点亮 ${node.missingRequirementName}`
  }
  return `${node.name} | ${node.effect} | 消耗 ${formatNumber(node.cost).text} 核心源码`
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
      :aria-label="expanded ? '神经星树' : undefined"
      @click.self="expanded = false"
    >
      <div
        :class="
          expanded
            ? 'topology-modal__panel star-panel'
            : 'topology-inline__panel star-panel'
        "
      >
        <div v-if="expanded" class="topology-modal__head">
          <div class="flex min-w-0 items-center gap-2.5">
            <span class="cyber-icon-frame cyber-icon-frame--sm" aria-hidden="true">
              <GameIcon name="neural" :size="17" />
            </span>
            <div class="min-w-0">
              <p class="topology-modal__eyebrow">永久认知层 // NEURAL STAR TREE</p>
              <h2 class="topology-modal__title">神经星树</h2>
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-3">
            <span class="topology-modal__progress">
              已点亮 {{ litCount }} / {{ nodes.length }}
            </span>
            <button
              type="button"
              class="topology-expand-btn"
              aria-label="关闭神经星树大图"
              @click="expanded = false"
            >
              关闭
            </button>
          </div>
        </div>

        <div class="star-status-row">
          <span class="flex items-center gap-2 font-semibold text-cyan-200">
            <span class="status-dot"></span>
            神经星树在线
          </span>
          <span class="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span class="tabular-nums text-slate-300">
              {{ litCount }} / {{ nodes.length }} 节点
            </span>
            <span class="star-balance" title="核心源码余额">
              <span class="star-balance__gem" aria-hidden="true">◆</span>
              <span class="tabular-nums">{{ balanceLabel }}</span>
              <span class="text-slate-500">核心源码</span>
            </span>
            <button
              v-if="globalAutoUnlocked"
              type="button"
              class="star-global__btn"
              title="GLOBAL_CONTROL // 一键自动购买所有已授权服务器"
              @click="$emit('global-buy')"
            >
              一键采购
            </button>
            <button
              v-if="!expanded && showExpand"
              type="button"
              class="topology-expand-btn"
              aria-label="展开神经星树大图"
              @click="expanded = true"
            >
              展开大图
            </button>
          </span>
        </div>

        <div class="star-legend" aria-label="星树分支">
          <span class="star-legend__core">STAR_CORE</span>
          <span
            v-for="branch in branchChips"
            :key="branch.id"
            class="star-legend__item"
            :data-tone="branch.tone"
          >
            <span class="star-legend__dot" aria-hidden="true"></span>
            {{ branch.name }}
            <span class="star-legend__count">{{ branch.lit }}/{{ branch.total }}</span>
          </span>
        </div>

        <div class="star-map" :class="{ 'star-map--expanded': expanded }">
          <span class="star-map__nebula" aria-hidden="true"></span>
          <span class="star-map__nebula star-map__nebula--gold" aria-hidden="true"></span>
          <span class="star-map__nebula star-map__nebula--violet" aria-hidden="true"></span>

          <svg
            class="star-links"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <filter id="star-line-glow" x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="0.9" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <line
              v-for="link in links"
              :key="link.id"
              class="star-link"
              :class="{ 'is-lit': link.lit, 'is-near': !link.lit && link.near }"
              :data-tone="link.tone"
              :x1="link.x1"
              :y1="link.y1"
              :x2="link.x2"
              :y2="link.y2"
              vector-effect="non-scaling-stroke"
            />
          </svg>

          <button
            v-for="node in nodes"
            :key="node.id"
            type="button"
            class="star-node"
            :class="{
              'is-selected': selectedId === node.id,
              'is-core': node.branch === 'core',
              'is-denied': deniedId === node.id,
            }"
            :data-tone="nodeTone(node)"
            :data-state="nodeState(node)"
            :data-branch="node.branch"
            :data-edge="node.x < 20 ? 'left' : node.x > 80 ? 'right' : null"
            :data-guide="node.id === guideNodeId ? 'topology-node' : null"
            :style="{ left: `${node.x}%`, top: `${node.y}%` }"
            :aria-label="nodeAriaLabel(node)"
            :aria-pressed="selectedId === node.id ? 'true' : 'false'"
            @click="handleNodeClick(node)"
          >
            <span class="star-node__halo" aria-hidden="true"></span>
            <span class="star-node__orb">
              <span
                v-if="node.branch === 'core'"
                class="star-node__core"
                aria-hidden="true"
              ></span>
              <span v-else class="star-node__index" aria-hidden="true">
                {{ node.order }}
              </span>
            </span>
            <span
              class="star-node__label"
              :class="{ 'star-node__label--above': node.labelPosition === 'above' }"
            >
              <span class="star-node__name">{{ node.name }}</span>
              <span class="star-node__cost">
                {{ node.lit ? 'LIT' : formatNumber(node.cost).text }}
              </span>
            </span>
          </button>

          <div v-if="!unlocked" class="topology-lock">
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
              神经星树尚未解密
            </p>
            <p class="text-[10px] tracking-[0.06em] text-slate-400">
              需完成首次飞升以解密
            </p>
          </div>
        </div>

        <section class="star-info" aria-live="polite">
          <template v-if="selectedNode">
            <header class="star-info__head">
              <span
                class="star-info__branch"
                :data-tone="selectedBranch?.tone ?? 'core'"
              >
                {{ selectedBranch?.name ?? '星核' }}
              </span>
              <span class="star-info__name">{{ selectedNode.name }}</span>
              <span class="star-info__code">{{ selectedNode.code }}</span>
              <span
                class="star-info__state"
                :data-state="selectedState"
                :class="{ 'is-denied': deniedId === selectedNode.id }"
              >
                {{ deniedId === selectedNode.id ? '无法点亮' : stateLabel(selectedNode) }}
              </span>
            </header>

            <div class="star-info__body">
              <div class="star-info__effect">
                <p class="star-info__effect-title">{{ selectedNode.effect }}</p>
                <p class="star-info__effect-detail">{{ selectedNode.effectDetail }}</p>
                <p class="star-info__desc">{{ selectedNode.description }}</p>
              </div>
              <div class="star-info__cost">
                <span class="star-info__cost-label">消耗</span>
                <span class="star-info__cost-value">
                  <span class="star-info__gem" aria-hidden="true">◆</span>
                  {{ formatNumber(selectedNode.cost).text }}
                </span>
                <span class="star-info__cost-unit">核心源码</span>
                <span class="star-info__hint" :data-state="selectedState">
                  {{
                    selectedNode.lit
                      ? '永久生效 | 不随重置回退'
                      : selectedState === 'ready'
                        ? '再次点击节点确认点亮'
                        : selectedState === 'sealed'
                          ? `需先点亮 [ ${selectedNode.missingRequirementName || '前置节点'} ]`
                          : selectedState === 'poor'
                            ? '核心源码不足 | 继续架构降维'
                            : '星树未解锁'
                  }}
                </span>
              </div>
            </div>
          </template>

          <div v-else class="star-info__idle">
            <span class="star-info__idle-title">NEURAL STAR TREE // 待命</span>
            <span class="star-info__idle-text">
              第一次点击节点查看效果与消耗 | 再次点击同一节点完成点亮
            </span>
          </div>

        </section>
      </div>
    </div>
  </Teleport>
</template>
