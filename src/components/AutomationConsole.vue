<script setup>
import { computed, ref } from 'vue'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  options: { type: Array, required: true },
  logs: { type: Array, required: true },
  unlockedCount: { type: Number, default: 0 },
  activeCount: { type: Number, default: 0 },
  allActive: { type: Boolean, default: false },
  matrixUnlocked: { type: Boolean, default: false },
  awakened: { type: Boolean, default: false },
  suppressed: { type: Boolean, default: false },
  suppressHint: { type: String, default: '' },
  embedded: { type: Boolean, default: false },
})

defineEmits(['toggle', 'toggle-all', 'open-matrix', 'strategy'])

const collapsed = ref(false)

const unlockedOptions = computed(() =>
  props.options.filter((option) => option.unlocked),
)
const latestLog = computed(() => props.logs[props.logs.length - 1] || null)
</script>

<template>
  <div
    class="automation-console"
    :class="{
      'automation-console--awake': awakened,
      'automation-console--suppressed': suppressed,
      'automation-console--embedded': embedded,
    }"
  >
    <button
      v-if="!awakened"
      type="button"
      class="automation-console__launcher"
      :class="{ 'automation-console__launcher--open': matrixUnlocked }"
      data-guide="cyber-matrix-launcher"
      @click="$emit('open-matrix')"
    >
      <span class="automation-console__launcher-glyph" aria-hidden="true">
        <GameIcon name="hub" :size="15" />
      </span>
      <span class="automation-console__launcher-copy">
        <span class="automation-console__launcher-label">智械矩阵</span>
        <span class="automation-console__launcher-meta">
          {{
            matrixUnlocked
              ? '已开放 · 点亮 [ 智械觉醒 ]'
              : '未开放 · 需完成重启纪元'
          }}
        </span>
      </span>
      <span class="automation-console__launcher-badge">
        {{ matrixUnlocked ? 'OPEN' : 'LOCK' }}
      </span>
    </button>

    <section
      v-if="awakened"
      class="automation-console__panel"
      :class="{ 'is-collapsed': collapsed }"
      aria-label="自动化总控台"
    >
      <header class="automation-console__head">
        <span class="automation-console__sigil" aria-hidden="true">
          <GameIcon name="automation" :size="20" />
        </span>
        <div class="automation-console__head-copy">
          <p class="automation-console__eyebrow">
            AUTOMATION CONSOLE // 智械总控
          </p>
          <p class="automation-console__title">
            自动化总控台
            <span>
              {{ suppressed ? '0' : activeCount }}/{{ unlockedCount }} 在线
            </span>
          </p>
        </div>
        <button
          type="button"
          class="automation-console__power"
          :class="{ 'is-on': allActive && !suppressed }"
          :disabled="unlockedCount === 0 || suppressed"
          :aria-label="allActive ? '一键全关' : '一键全开'"
          :title="suppressed ? '断网封锁' : allActive ? '一键全关' : '一键全开'"
          @click="$emit('toggle-all')"
        >
          ⏻
        </button>
        <button
          v-if="!embedded"
          type="button"
          class="automation-console__collapse"
          :aria-label="collapsed ? '展开总控台' : '收起总控台'"
          :aria-expanded="collapsed ? 'false' : 'true'"
          @click="collapsed = !collapsed"
        >
          {{ collapsed ? '⌃' : '⌄' }}
        </button>
      </header>

      <div v-if="!collapsed" class="automation-console__body">
        <div v-if="suppressed" class="automation-console__suppressed" role="status">
          <span aria-hidden="true">⛓</span>
          <span>{{ suppressHint }}</span>
        </div>

        <p v-if="unlockedOptions.length === 0" class="automation-console__empty">
          中枢已觉醒 尚未点亮任何分支模块
          <button type="button" @click="$emit('open-matrix')">前往矩阵</button>
        </p>

        <ul v-else class="automation-console__list">
          <li
            v-for="option in unlockedOptions"
            :key="option.id"
            class="automation-option"
            :class="{
              'is-on': option.active && !suppressed,
              'is-suppressed': suppressed,
            }"
          >
            <span class="automation-option__dot" aria-hidden="true"></span>
            <div class="automation-option__copy">
              <p class="automation-option__name">{{ option.label }}</p>
              <p class="automation-option__desc">{{ option.description }}</p>
              <div
                v-if="option.strategyTier"
                class="automation-strategy"
                role="group"
                :aria-label="`${option.label}跃迁策略`"
              >
                <span class="automation-strategy__label">策略</span>
                <button
                  v-for="strategy in option.strategyOptions"
                  :key="strategy.id"
                  type="button"
                  class="automation-strategy__btn"
                  :class="{ 'is-active': option.strategy === strategy.id }"
                  :title="strategy.hint"
                  :aria-pressed="option.strategy === strategy.id ? 'true' : 'false'"
                  @click.stop="$emit('strategy', option.strategyTier, strategy.id)"
                >
                  {{ strategy.label }}
                </button>
              </div>
            </div>
            <button
              type="button"
              class="console-switch"
              :class="{ 'is-on': option.active && !suppressed }"
              role="switch"
              :aria-checked="option.active && !suppressed ? 'true' : 'false'"
              :aria-label="`${option.label}开关`"
              :disabled="suppressed"
              @click="$emit('toggle', option.id)"
            >
              <span class="console-switch__track">
                <span class="console-switch__knob"></span>
              </span>
              <span class="console-switch__state">
                {{ suppressed ? 'VOID' : option.active ? 'ON' : 'OFF' }}
              </span>
            </button>
          </li>
        </ul>

        <div class="automation-console__log" aria-live="polite">
          <span class="automation-console__log-tag">SYS</span>
          <template v-if="latestLog">
            <span class="automation-console__log-time">{{ latestLog.time }}</span>
            <span class="automation-console__log-text">{{ latestLog.message }}</span>
          </template>
          <span v-else class="automation-console__log-text">
            [系统] 自动化总线待命...
          </span>
        </div>

        <footer class="automation-console__foot">
          <button
            type="button"
            class="automation-console__matrix-btn"
            @click="$emit('open-matrix')"
          >
            ◉ 智械矩阵
          </button>
          <button
            type="button"
            class="automation-console__master"
            :class="{ 'is-on': allActive && !suppressed }"
            :disabled="unlockedCount === 0 || suppressed"
            @click="$emit('toggle-all')"
          >
            {{ suppressed ? '断网封锁' : allActive ? '一键全关' : '一键全开' }}
          </button>
        </footer>
      </div>
    </section>
  </div>
</template>
