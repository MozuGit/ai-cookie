<script setup>
import { computed } from 'vue'
import GameIcon from './GameIcon.vue'

const props = defineProps({
  index: { type: String, default: '00' },
  label: { type: String, default: 'SYSTEM_PANEL' },
  title: { type: String, default: '' },
  tone: { type: String, default: 'cyan' },
  icon: { type: String, default: '' },
})

const tones = {
  cyan: {
    panel: 'hud-panel--cyan',
    header: 'border-cyan-600/55',
    accent: 'text-cyan-300 neon-text-cyan',
    index: 'text-cyan-500',
    corner: 'text-cyan-300',
    title: 'text-cyan-50',
  },
  amber: {
    panel: 'hud-panel--amber',
    header: 'border-amber-600/45',
    accent: 'text-amber-300 neon-text-amber',
    index: 'text-amber-500',
    corner: 'text-amber-300',
    title: 'text-amber-50',
  },
  violet: {
    panel: 'hud-panel--violet',
    header: 'border-violet-600/50',
    accent: 'text-violet-300 neon-text-violet',
    index: 'text-violet-400',
    corner: 'text-violet-300',
    title: 'text-violet-50',
  },
}

const theme = computed(() => tones[props.tone] || tones.cyan)
</script>

<template>
  <section
    class="hud-panel relative flex min-h-0 flex-col border backdrop-blur-[3px]"
    :class="theme.panel"
  >
    <span class="hud-corner hud-corner--tl" :class="theme.corner" aria-hidden="true"></span>
    <span class="hud-corner hud-corner--tr" :class="theme.corner" aria-hidden="true"></span>
    <span class="hud-corner hud-corner--bl" :class="theme.corner" aria-hidden="true"></span>
    <span class="hud-corner hud-corner--br" :class="theme.corner" aria-hidden="true"></span>

    <header
      class="relative z-10 flex items-center justify-between gap-3 border-b bg-[#071120]/55 px-4 py-3"
      :class="theme.header"
    >
      <div class="flex min-w-0 items-center gap-3">
        <span v-if="icon" class="cyber-icon-frame hud-panel__icon" aria-hidden="true">
          <GameIcon :name="icon" :size="19" />
        </span>
        <span class="text-[11px] font-semibold tracking-[0.08em]" :class="theme.index">
          {{ index }}
        </span>
        <span class="h-8 w-px" :class="theme.header"></span>
        <div class="min-w-0">
          <p
            class="truncate text-[10px] font-medium leading-none tracking-[0.2em]"
            :class="theme.accent"
          >
            {{ label }}
          </p>
          <h2
            class="mt-2 truncate text-[18px] font-bold tracking-[0.1em]"
            :class="theme.title"
          >
            {{ title }}
          </h2>
          <span
            class="hud-title-rule"
            :class="`hud-title-rule--${tone}`"
            aria-hidden="true"
          ></span>
        </div>
      </div>
      <slot name="status"></slot>
    </header>

    <div class="relative z-10 flex min-h-0 flex-1 flex-col p-4 sm:p-5">
      <slot></slot>
    </div>
  </section>
</template>
