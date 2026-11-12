<script setup>
import { computed, ref, watch } from 'vue'
import GameIcon from './GameIcon.vue'
import { formatTextNumbers } from '../composables/useGameState'

const props = defineProps({
  open: { type: Boolean, default: false },
  tiers: { type: Array, required: true },
  unlockedCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
})

defineEmits(['close'])

const activeTier = ref(1)

const progressPercent = computed(() => {
  if (props.totalCount <= 0) return 0
  return Math.min(100, (props.unlockedCount / props.totalCount) * 100)
})

const activeTierData = computed(
  () => props.tiers.find((tier) => tier.id === activeTier.value) ?? props.tiers[0],
)

const activeItems = computed(() => activeTierData.value?.items ?? [])

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    const focused = props.tiers.find(
      (tier) => tier.unlocked > 0 && tier.unlocked < tier.total,
    )
    activeTier.value = focused?.id ?? 1
  },
)

function formatUnlockTime(timestamp) {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return '达成时间未知'
  const pad = (part) => String(part).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}
</script>

<template>
  <Teleport to="body">
    <Transition name="achievement-panel">
      <div
        v-if="open"
        class="achievement-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="achievement-panel-title"
        :data-active-tier="activeTier"
      >
        <button
          type="button"
          class="achievement-panel__scrim"
          aria-label="关闭成就档案馆"
          @click="$emit('close')"
        ></button>

        <section class="achievement-panel__shell">
          <span class="achievement-panel__aura" aria-hidden="true"></span>

          <header class="achievement-panel__header">
            <span class="achievement-panel__glyph" aria-hidden="true">
              <GameIcon name="achievement" :size="24" />
            </span>
            <div class="achievement-panel__heading">
              <p class="achievement-panel__eyebrow">ACHIEVEMENT_ARCHIVE // 永久记录</p>
              <h2 id="achievement-panel-title" class="achievement-panel__title">
                成就档案馆
              </h2>
            </div>
            <span class="achievement-panel__score">
              <strong>{{ unlockedCount }}</strong> / {{ totalCount }}
            </span>
            <button
              type="button"
              class="achievement-panel__close"
              aria-label="关闭成就档案馆"
              @click="$emit('close')"
            >
              ×
            </button>
          </header>

          <div class="achievement-panel__progress" aria-hidden="true">
            <span :style="{ width: `${progressPercent}%` }"></span>
          </div>

          <nav class="achievement-tabs" aria-label="成就分类">
            <button
              v-for="tier in tiers"
              :key="tier.id"
              type="button"
              class="achievement-tab"
              :class="{
                'is-active': tier.id === activeTier,
                'achievement-tab--secret': tier.secret,
              }"
              :data-tier="tier.id"
              :data-secret="tier.secret ? 'true' : 'false'"
              :aria-pressed="tier.id === activeTier"
              @click="activeTier = tier.id"
            >
              <span class="achievement-tab__roman">{{ tier.roman }}</span>
              <span class="achievement-tab__body">
                <span class="achievement-tab__title">{{ tier.title }}</span>
                <span class="achievement-tab__count">
                  {{ tier.unlocked }} / {{ tier.total }}
                </span>
              </span>
            </button>
          </nav>

          <div class="achievement-panel__scroll">
            <header class="achievement-tier-header" :data-tier="activeTierData.id">
              <span class="achievement-tier-header__code">
                {{ activeTierData.code }}
              </span>
              <h3>
                {{ activeTierData.label }} · {{ activeTierData.title }}
              </h3>
              <p>{{ activeTierData.description }}</p>
              <span class="achievement-tier-header__progress">
                {{ activeTierData.unlocked }} / {{ activeTierData.total }}
              </span>
            </header>

            <ul class="achievement-grid">
              <li
                v-for="item in activeItems"
                :key="item.id"
                class="achievement-card"
                :class="{
                  'is-unlocked': item.unlocked,
                  'achievement-card--secret': item.secret,
                }"
                :data-achievement-id="item.id"
                :data-tier="item.tier"
                :data-unlocked="item.unlocked ? 'true' : 'false'"
                :data-hidden="item.hidden ? 'true' : 'false'"
                :data-secret="item.secret ? 'true' : 'false'"
              >
                <span class="achievement-card__badge" aria-hidden="true">
                  <template v-if="item.unlocked">{{ item.glyph }}</template>
                  <svg
                    v-else
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    class="achievement-card__lock"
                  >
                    <rect x="4.6" y="8.6" width="10.8" height="8" rx="1.2" stroke-width="1.2" />
                    <path d="M7.2 8.6V6.8a2.8 2.8 0 0 1 5.6 0v1.8" stroke-width="1.2" />
                    <path d="M10 11.6v2.2" stroke-width="1.2" />
                  </svg>
                </span>

                <div class="achievement-card__body">
                  <p class="achievement-card__name">
                    {{ item.unlocked ? item.name : '???' }}
                  </p>
                  <p class="achievement-card__condition">
                    <template v-if="item.unlocked">{{ formatTextNumbers(item.condition) }}</template>
                    <template v-else-if="item.secret">{{ item.hint }}</template>
                    <template v-else-if="item.hidden">
                      隐藏协议 // 条件未知
                    </template>
                    <template v-else>{{ formatTextNumbers(item.condition) }}</template>
                  </p>
                  <p class="achievement-card__code">
                    {{
                      (item.hidden || item.secret) && !item.unlocked
                        ? 'CLASSIFIED'
                        : item.code
                    }}
                  </p>
                  <p v-if="item.unlocked" class="achievement-card__time">
                    达成于 {{ formatUnlockTime(item.unlockedAt) }}
                  </p>
                </div>

                <span
                  v-if="item.unlocked"
                  class="achievement-card__check"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span
                  v-else-if="item.hidden || item.secret"
                  class="achievement-card__hidden-tag"
                  aria-hidden="true"
                >
                  HIDDEN
                </span>
              </li>
            </ul>
          </div>

          <footer class="achievement-panel__footer">
            <span>ARCHIVE_SYNC // 永久写入本地存档</span>
            <span>
              {{
                unlockedCount === totalCount
                  ? '全部成就已解锁 · 你就是系统本身'
                  : `尚有 ${totalCount - unlockedCount} 项协议等待点亮`
              }}
            </span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>
