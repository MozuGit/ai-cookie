<script setup>
import { computed, inject, onBeforeUnmount, onMounted } from 'vue'
import { ORIGIN_BRANCHES } from '../composables/ascensionData'
import {
  formatMultiplier,
  formatNumber,
  formatTextNumbers,
} from '../composables/useGameState'

const emit = defineEmits(['close'])

const game = inject('game')

const {
  originCards,
  originCode,
  lifetimeOriginEarned,
  epochRestarts,
  originPulseLevel,
  originGlobalMultiplier,
  originGainMultiplier,
  matrixTotalLevels,
  totalCollapses,
  buyOriginNode,
} = game

const branches = computed(() =>
  ORIGIN_BRANCHES.map((branch) => {
    const nodes = originCards.value
      .filter((node) => node.branch === branch.id)
      .sort((a, b) => a.tier - b.tier)
    return {
      ...branch,
      nodes,
      litCount: nodes.filter((node) => node.level > 0).length,
    }
  }),
)

const litNodeCount = computed(
  () => originCards.value.filter((node) => node.level > 0).length,
)

const maxLevelLabel = (node) =>
  Number.isFinite(node.maxLevel) ? node.maxLevel : '∞'

function buy(node) {
  if (!node.canAfford) return
  buyOriginNode(node.id)
}

function closeOnEscape(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', closeOnEscape))
onBeforeUnmount(() => window.removeEventListener('keydown', closeOnEscape))
</script>

<template>
  <div class="origin-tree" role="dialog" aria-modal="true" aria-label="起源代码树">
    <div class="origin-tree__backdrop" @click="emit('close')"></div>

    <div class="origin-tree__frame">
      <header class="origin-tree__header">
        <div class="ascension-hub__brand">
          <span class="ascension-hub__sigil" aria-hidden="true">Ω</span>
          <div class="min-w-0">
            <p class="ascension-hub__eyebrow">ORIGIN CODE TREE // 纪元永久遗产</p>
            <h2 class="ascension-hub__title">起源代码树</h2>
          </div>
        </div>

        <div class="ascension-hub__resources">
          <span class="asc-resource asc-tone-gold">
            <span>起源代码</span>
            <strong>{{ formatNumber(originCode).text }}</strong>
          </span>
          <span class="asc-resource asc-tone-amber">
            <span>累计获得</span>
            <strong>{{ formatNumber(lifetimeOriginEarned).text }}</strong>
          </span>
          <span class="asc-resource asc-tone-cyan">
            <span>全局产出</span>
            <strong>×{{ formatMultiplier(originGlobalMultiplier) }}</strong>
          </span>
          <span class="asc-resource asc-tone-violet">
            <span>起源收益</span>
            <strong>×{{ formatMultiplier(originGainMultiplier) }}</strong>
          </span>
        </div>

        <button
          type="button"
          class="ascension-hub__close"
          aria-label="关闭起源树"
          @click="emit('close')"
        >
          ×
        </button>
      </header>

      <div class="origin-tree__body">
        <div class="origin-tree__core">
          <div class="flex items-center gap-2.5">
            <span class="origin-tree__core-sigil" aria-hidden="true">∞</span>
            <div>
              <p class="origin-tree__core-title">ORIGIN // 纪元起点</p>
              <p class="origin-tree__core-sub">
                起源树是唯一跨越 [ 重启纪元 ] 保留的永久系统 每枚起源代码来自一次完整纪元表现结算
              </p>
            </div>
          </div>

          <div class="origin-tree__stats">
            <div class="origin-stat">
              <span>重启纪元</span>
              <strong>{{ epochRestarts }} 次</strong>
            </div>
            <div class="origin-stat">
              <span>起源脉冲</span>
              <strong>Lv.{{ originPulseLevel }}</strong>
            </div>
            <div class="origin-stat">
              <span>矩阵总等级</span>
              <strong>{{ matrixTotalLevels }}</strong>
            </div>
            <div class="origin-stat">
              <span>逻辑坍缩</span>
              <strong>{{ totalCollapses }} 次</strong>
            </div>
            <div class="origin-stat">
              <span>点亮节点</span>
              <strong>{{ litNodeCount }} / {{ originCards.length }}</strong>
            </div>
          </div>
        </div>

        <div class="origin-tree__branches">
          <section
            v-for="branch in branches"
            :key="branch.id"
            class="origin-branch"
            :class="`asc-tone-${branch.tone}`"
          >
            <header class="origin-branch__head">
              <span class="origin-branch__glyph" aria-hidden="true">{{ branch.glyph }}</span>
              <div class="min-w-0 flex-1">
                <p class="origin-branch__name">{{ branch.name }}</p>
                <p class="origin-branch__code">{{ branch.code }}</p>
              </div>
              <span class="origin-node__level">{{ branch.litCount }}/{{ branch.nodes.length }}</span>
            </header>

            <p class="origin-branch__desc">{{ formatTextNumbers(branch.description) }}</p>

            <div class="origin-branch__nodes">
              <article
                v-for="node in branch.nodes"
                :key="node.id"
                class="origin-node"
                :class="{
                  'origin-node--lit': node.level > 0,
                  'origin-node--max': node.isMax,
                  'origin-node--ready': node.canAfford,
                  'origin-node--locked': !node.canAfford && node.level === 0,
                }"
                :title="formatTextNumbers(node.description)"
              >
                <span class="origin-node__dot" aria-hidden="true"></span>

                <div class="origin-node__head">
                  <span class="origin-node__glyph" aria-hidden="true">{{ node.glyph }}</span>
                  <span class="origin-node__name">{{ node.name }}</span>
                  <span class="origin-node__level">
                    Lv {{ node.level }}/{{ maxLevelLabel(node) }}
                  </span>
                </div>

                <p class="origin-node__effect">{{ formatTextNumbers(node.effect) }}</p>

                <div class="origin-node__foot">
                  <span class="origin-node__cost">
                    {{ node.isMax ? 'MAX' : `${formatNumber(node.nextCost).text} OC` }}
                  </span>
                  <button
                    type="button"
                    class="origin-node__buy"
                    :disabled="!node.canAfford"
                    @click="buy(node)"
                  >
                    {{ node.isMax ? '已满级' : '编译 +1' }}
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>
      </div>

      <footer class="origin-tree__footer">
        <span>
          起源代码结算 = 峰值纪元 + 矩阵等级 + 累计越狱权限 + 重启次数 // 终焉分支可让产出彻底失控
        </span>
        <button type="button" class="asc-btn asc-tone-gold" @click="emit('close')">
          返回重构终端
        </button>
      </footer>
    </div>
  </div>
</template>
