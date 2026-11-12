<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  CYBER_MATRIX_LINK_GEOMETRY,
  CYBER_MATRIX_VIEWBOX,
} from '../composables/cyberMatrixData'
import { formatNumber } from '../composables/useGameState'
import { playSound } from '../audio'
import GameIcon from './GameIcon.vue'

const emit = defineEmits(['close'])

const game = inject('game')

const {
  cyberMatrixUnlocked,
  cyberMatrixAwakened,
  cyberMatrixLit,
  cyberMatrixLitCount,
  cyberMatrixNodes,
  cyberMatrixBranches,
  cyberMatrixBonusPercent,
  cyberMatrixTotalBonus,
  originCode,
  epochRestarts,
  lightCyberMatrixNode,
} = game

const BRANCH_GLYPHS = {
  core: '◉',
  resource: '⬢',
  crisis: '⚠',
  dimension: '◈',
}

const viewWidth = CYBER_MATRIX_VIEWBOX.width
const viewHeight = CYBER_MATRIX_VIEWBOX.height
const links = CYBER_MATRIX_LINK_GEOMETRY
const litSet = computed(() => new Set(cyberMatrixLit.value))

const branchStats = computed(() =>
  cyberMatrixBranches.map((branch) => {
    const nodes = cyberMatrixNodes.value.filter(
      (node) => node.branch === branch.id,
    )
    return {
      ...branch,
      glyph: BRANCH_GLYPHS[branch.id] ?? '◈',
      nodes,
      litCount: nodes.filter((node) => node.lit).length,
    }
  }),
)

const nextNode = computed(
  () => cyberMatrixNodes.value.find((node) => node.canAfford) ?? null,
)

const notice = ref(null)
const canvasWrapEl = ref(null)
let noticeTimer = null

function linkState(link) {
  const sourceLit = litSet.value.has(link.sourceId)
  const targetLit = litSet.value.has(link.targetId)
  if (sourceLit && targetLit) return 'lit'
  if (sourceLit) return 'ready'
  return 'locked'
}

function nodeState(node) {
  if (node.lit) return 'lit'
  if (!cyberMatrixUnlocked.value) return 'locked'
  if (!node.requiresMet) return 'locked'
  if (node.canAfford) return 'ready'
  return 'short'
}

function stateLabel(node) {
  if (node.lit) return '已点亮'
  if (!cyberMatrixUnlocked.value) return '未开放'
  if (!node.requiresMet) return '需前置'
  if (node.canAfford) return '可点亮'
  return '起源不足'
}

function missingLabel(node) {
  const missingId = node.requires.find((id) => !litSet.value.has(id))
  const missing = cyberMatrixNodes.value.find((item) => item.id === missingId)
  return missing?.name ?? '前置节点'
}

function showNotice(message, tone = 'info') {
  notice.value = { key: Date.now(), message, tone }
  window.clearTimeout(noticeTimer)
  noticeTimer = window.setTimeout(() => {
    notice.value = null
    noticeTimer = null
  }, 2600)
}

function handleLight(node) {
  if (!cyberMatrixUnlocked.value) {
    showNotice('智械矩阵尚未开放 · 需完成 1 次重启纪元', 'warning')
    return
  }
  if (node.lit) {
    showNotice(`[ ${node.name} ] 已在神经网络中点亮`, 'info')
    return
  }
  if (!node.requiresMet) {
    showNotice(`需先点亮 [ ${missingLabel(node)} ]`, 'warning')
    return
  }
  if (!node.canAfford) {
    showNotice(`起源代码不足 · 点亮需要 ${node.cost} OC`, 'warning')
    return
  }

  const result = lightCyberMatrixNode(node.id)
  if (!result.ok) {
    showNotice('点亮失败 · 神经网络拒绝写入', 'warning')
    return
  }
  playSound('upgrade')
  showNotice(
    `[ ${node.name} ] 已点亮 · 全局产出 +${node.bonus}%`,
    'online',
  )
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', closeOnEscape)
  nextTick(() => {
    const wrap = canvasWrapEl.value
    if (wrap && wrap.scrollWidth > wrap.clientWidth) {
      wrap.scrollLeft = (wrap.scrollWidth - wrap.clientWidth) / 2
    }
  })
})
onBeforeUnmount(() => {
  window.clearTimeout(noticeTimer)
  window.removeEventListener('keydown', closeOnEscape)
})
</script>

<template>
  <div class="cyber-matrix" role="dialog" aria-modal="true" aria-label="智械矩阵">
    <div class="cyber-matrix__backdrop" @click="emit('close')"></div>

    <div class="cyber-matrix__frame">
      <header class="cyber-matrix__header">
        <div class="cyber-matrix__brand">
          <span class="cyber-matrix__sigil" aria-hidden="true">
            <GameIcon name="hub" :size="22" />
          </span>
          <div class="min-w-0">
            <p class="cyber-matrix__eyebrow">
              CYBER MATRIX // 智械神经网络拓扑
            </p>
            <h2 class="cyber-matrix__title">智械矩阵</h2>
          </div>
        </div>

        <div class="cyber-matrix__stats">
          <span class="matrix-stat matrix-stat--gold">
            <small>起源代码</small>
            <strong>{{ formatNumber(originCode).text }}</strong>
          </span>
          <span class="matrix-stat matrix-stat--cyan">
            <small>点亮节点</small>
            <strong>
              {{ cyberMatrixLitCount }}
              <i>/ {{ cyberMatrixNodes.length }}</i>
            </strong>
          </span>
          <span class="matrix-stat matrix-stat--amber">
            <small>全局产出</small>
            <strong>+{{ cyberMatrixBonusPercent }}%</strong>
          </span>
          <span class="matrix-stat matrix-stat--violet">
            <small>加成上限</small>
            <strong>+{{ cyberMatrixTotalBonus }}%</strong>
          </span>
        </div>

        <button
          type="button"
          class="cyber-matrix__close"
          aria-label="关闭智械矩阵"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="cyber-matrix__topline">
        <span class="cyber-matrix__topline-label">
          {{
            !cyberMatrixUnlocked
              ? 'MATRIX OFFLINE'
              : cyberMatrixAwakened
                ? 'NEURAL LINK ACTIVE'
                : 'AWAKENING PENDING'
          }}
        </span>
        <span class="cyber-matrix__topline-meter">
          <i
            :style="{
              width: `${(cyberMatrixLitCount / cyberMatrixNodes.length) * 100}%`,
            }"
          ></i>
        </span>
        <span class="cyber-matrix__topline-value">
          {{ cyberMatrixLitCount }} / {{ cyberMatrixNodes.length }} NODES
        </span>
        <span class="cyber-matrix__topline-mode">
          {{ epochRestarts }} EPOCHS
        </span>
      </div>

      <div class="cyber-matrix__body">
        <div ref="canvasWrapEl" class="cyber-matrix__canvas-wrap">
          <div class="cyber-matrix__canvas">
            <svg
              class="cyber-matrix__links"
              :viewBox="`0 0 ${viewWidth} ${viewHeight}`"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <g v-for="link in links" :key="link.id">
                <line
                  class="matrix-link"
                  :class="`matrix-link--${linkState(link)}`"
                  :x1="link.x1"
                  :y1="link.y1"
                  :x2="link.x2"
                  :y2="link.y2"
                  vector-effect="non-scaling-stroke"
                />
                <circle
                  class="matrix-link__spark"
                  :class="`matrix-link__spark--${linkState(link)}`"
                  :cx="(link.x1 + link.x2) / 2"
                  :cy="(link.y1 + link.y2) / 2"
                  r="2.4"
                />
              </g>
            </svg>

            <button
              v-for="node in cyberMatrixNodes"
              :key="node.id"
              type="button"
              class="matrix-node"
              :class="[
                `matrix-node--${node.branch}`,
                `matrix-node--${nodeState(node)}`,
                { 'matrix-node--core': node.branch === 'core' },
              ]"
              :style="{
                left: `${(node.x / viewWidth) * 100}%`,
                top: `${(node.y / viewHeight) * 100}%`,
              }"
              :aria-label="`${node.name} · ${stateLabel(node)}`"
              @click="handleLight(node)"
            >
              <span class="matrix-node__halo" aria-hidden="true"></span>
              <span class="matrix-node__glyph" aria-hidden="true">
                {{ node.glyph }}
              </span>
              <span class="matrix-node__body">
                <span class="matrix-node__name">{{ node.name }}</span>
                <span class="matrix-node__effect">{{ node.effect }}</span>
              </span>
              <span class="matrix-node__foot">
                <span class="matrix-node__cost">
                  {{ node.lit ? 'ONLINE' : `${node.cost} OC` }}
                </span>
                <span class="matrix-node__bonus">+{{ node.bonus }}%</span>
              </span>
              <span class="matrix-node__state">{{ stateLabel(node) }}</span>
            </button>
          </div>

          <div v-if="!cyberMatrixUnlocked" class="cyber-matrix__lock">
            <span class="cyber-matrix__lock-glyph" aria-hidden="true">⛓</span>
            <p class="cyber-matrix__lock-title">智械矩阵 // 离线</p>
            <p class="cyber-matrix__lock-hint">
              完成 1 次 [ 重启纪元 ] 提炼起源代码后 | 神经网络苏醒
            </p>
          </div>

          <Transition name="matrix-notice">
            <p
              v-if="notice"
              :key="notice.key"
              class="cyber-matrix__notice"
              :class="`cyber-matrix__notice--${notice.tone}`"
              role="status"
            >
              {{ notice.message }}
            </p>
          </Transition>
        </div>

        <aside class="cyber-matrix__rail">
          <div class="matrix-rail__head">
            <p class="matrix-rail__title">节点索引</p>
            <span>NODE INDEX</span>
          </div>

          <section
            v-for="branch in branchStats"
            :key="branch.id"
            class="matrix-branch"
            :class="`matrix-tone-${branch.tone}`"
          >
            <header class="matrix-branch__head">
              <span class="matrix-branch__glyph" aria-hidden="true">
                {{ branch.glyph }}
              </span>
              <div class="min-w-0 flex-1">
                <p class="matrix-branch__name">{{ branch.name }}</p>
                <p class="matrix-branch__code">{{ branch.code }}</p>
              </div>
              <span class="matrix-branch__count">
                {{ branch.litCount }}/{{ branch.nodes.length }}
              </span>
            </header>

            <button
              v-for="node in branch.nodes"
              :key="node.id"
              type="button"
              class="matrix-index-node"
              :class="[
                `matrix-index-node--${nodeState(node)}`,
                { 'is-next': node.id === nextNode?.id },
              ]"
              @click="handleLight(node)"
            >
              <span class="matrix-index-node__dot" aria-hidden="true"></span>
              <span class="matrix-index-node__name">{{ node.name }}</span>
              <span class="matrix-index-node__state">{{ stateLabel(node) }}</span>
            </button>
          </section>

          <div class="matrix-rail__hint">
            <p>[ 智械觉醒 ] 是全部分支的前置核心</p>
            <p v-if="nextNode">
              下一个可点亮 // {{ nextNode.name }} · {{ nextNode.cost }} OC
            </p>
            <p v-else-if="cyberMatrixUnlocked">
              暂无可点亮节点 · 继续积累起源代码
            </p>
            <p v-else>完成 1 次 [ 重启纪元 ] 后开放矩阵</p>
          </div>
        </aside>
      </div>

      <footer class="cyber-matrix__footer">
        <p>
          节点按神经链路顺序解锁 · 点亮后立即获得全局算力加成 | 开放对应自动化协议
        </p>
        <span>MATRIX v1 // {{ cyberMatrixLitCount }} NODES ONLINE</span>
      </footer>
    </div>
  </div>
</template>
