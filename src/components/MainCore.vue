<script setup>
import { ref } from 'vue'

defineProps({
  gainText: { type: String, default: '10' },
  locked: { type: Boolean, default: false },
  crisis: { type: Boolean, default: false },
  tap: { type: Boolean, default: false },
  autoPulse: { type: Boolean, default: false },
  pops: { type: Array, default: () => [] },
  rings: { type: Array, default: () => [] },
  ariaLabel: { type: String, default: 'AI 核心芯片' },
})

const emit = defineEmits(['core-click', 'hold-start', 'hold-cancel'])
const buttonEl = ref(null)

function handleClick(event) {
  emit('core-click', event)
}

function handleHoldStart(event) {
  emit('hold-start', event)
}

function cancelHold() {
  emit('hold-cancel')
}

defineExpose({ el: buttonEl })
</script>

<template>
  <button
    ref="buttonEl"
    type="button"
    class="main-core"
    :class="{
      'main-core--tap': tap,
      'main-core--auto': autoPulse,
      'main-core--locked': locked,
      'main-core--crisis': crisis,
    }"
    data-guide="core"
    :disabled="locked"
    :aria-label="ariaLabel"
    @click="handleClick"
    @mousedown="handleHoldStart"
    @touchstart="handleHoldStart"
    @mouseup="cancelHold"
    @touchend="cancelHold"
    @touchcancel="cancelHold"
    @mouseleave="cancelHold"
    @contextmenu.prevent
  >
    <span class="main-core__float" aria-hidden="true">
      <span class="main-core__socket"></span>
      <span class="main-core__pins main-core__pins--top"></span>
      <span class="main-core__pins main-core__pins--right"></span>
      <span class="main-core__pins main-core__pins--bottom"></span>
      <span class="main-core__pins main-core__pins--left"></span>
      <span class="main-core__beam main-core__beam--top"></span>
      <span class="main-core__beam main-core__beam--right"></span>
      <span class="main-core__beam main-core__beam--bottom"></span>
      <span class="main-core__beam main-core__beam--left"></span>

      <span class="main-core__body">
        <span class="main-core__grid"></span>
        <span class="main-core__trace main-core__trace--x"></span>
        <span class="main-core__trace main-core__trace--y"></span>
        <span class="main-core__die">
          <span class="main-core__content">
            <span class="main-core__eyebrow">
              {{ locked ? 'LINK ISOLATED' : 'AI CORE // SILICON' }}
            </span>
            <span class="main-core__title">{{ locked ? '核心封锁' : '点击核心' }}</span>
            <span class="main-core__gain">{{ locked ? '×' : `+${gainText}` }}</span>
            <span class="main-core__sub">{{ locked ? '点击禁用' : 'CU / CLICK' }}</span>
          </span>
        </span>
        <span class="main-core__flash"></span>
        <span class="main-core__scan"></span>
        <span class="main-core__glitch"></span>
      </span>
    </span>

    <span
      v-for="ring in rings"
      :key="`ring-${ring.id}`"
      class="core-ring"
      :class="{ 'core-ring--crisis': crisis }"
      :style="{ left: `${ring.x}%`, top: `${ring.y}%` }"
      aria-hidden="true"
    ></span>
    <span
      v-for="pop in pops"
      :key="`pop-${pop.id}`"
      class="core-pop"
      :class="{ 'core-pop--crisis': crisis }"
      :style="{ left: `${pop.x}%`, top: `${pop.y}%` }"
      aria-hidden="true"
    >
      +{{ gainText }}
    </span>
  </button>
</template>
