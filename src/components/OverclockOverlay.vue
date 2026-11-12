<script setup>
import { computed } from 'vue'
import { formatNumber } from '../composables/useGameState'

const props = defineProps({
  remainingSeconds: { type: Number, default: 30 },
  consumed: { type: Number, default: 0 },
  rootGain: { type: Number, default: 0 },
  durationSeconds: { type: Number, default: 30 },
})

const bladeAngles = [0, 40, 80, 120, 160, 200, 240, 280, 320]

const streams = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  x: 3 + ((index * 37) % 94),
  delay: -((index * 13) % 21) / 10,
  duration: 0.55 + ((index * 7) % 9) / 10,
  width: index % 4 === 0 ? 2 : 1,
}))

const embers = Array.from({ length: 20 }, (_, index) => ({
  id: index,
  x: 6 + ((index * 53) % 88),
  delay: -((index * 17) % 27) / 10,
  duration: 1.4 + ((index * 11) % 13) / 10,
  size: 1 + (index % 3),
}))

const progress = computed(() =>
  Math.max(
    0,
    Math.min(1, props.remainingSeconds / Math.max(1, props.durationSeconds)),
  ),
)
</script>

<template>
  <div class="overclock-overlay" aria-hidden="true">
    <div class="overclock-overlay__heat"></div>

    <div class="overclock-streams">
      <span
        v-for="stream in streams"
        :key="`stream-${stream.id}`"
        class="overclock-stream"
        :style="{
          left: `${stream.x}%`,
          width: `${stream.width}px`,
          animationDelay: `${stream.delay}s`,
          animationDuration: `${stream.duration}s`,
        }"
      ></span>
    </div>

    <span
      v-for="ember in embers"
      :key="`ember-${ember.id}`"
      class="overclock-ember"
      :style="{
        left: `${ember.x}%`,
        width: `${ember.size}px`,
        height: `${ember.size}px`,
        animationDelay: `${ember.delay}s`,
        animationDuration: `${ember.duration}s`,
      }"
    ></span>

    <div class="overclock-fan-wrap">
      <span class="overclock-fan-wrap__halo" aria-hidden="true"></span>
      <svg class="overclock-fan" viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r="97" class="overclock-fan__rim" />
        <circle cx="100" cy="100" r="88" class="overclock-fan__rim-inner" />
        <g class="overclock-fan__blades">
          <path
            v-for="angle in bladeAngles"
            :key="angle"
            :transform="`rotate(${angle} 100 100)`"
            class="overclock-fan__blade"
            d="M100 100 C 84 82 82 56 96 30 C 112 58 114 82 100 100 Z"
          />
        </g>
        <circle cx="100" cy="100" r="19" class="overclock-fan__hub" />
        <circle cx="100" cy="100" r="4" class="overclock-fan__bolt" />
      </svg>
    </div>

    <div class="overclock-overlay__hud">
      <span class="overclock-overlay__tag">散热超频</span>
      <span class="overclock-overlay__timer">
        {{ String(Math.max(0, remainingSeconds)).padStart(2, '0') }}<span>秒</span>
      </span>
      <span class="overclock-overlay__sub">
        散热消耗 {{ formatNumber(consumed).text }} CU // 预计越狱权限 +{{ formatNumber(rootGain).text }}
      </span>
      <span class="overclock-overlay__meter">
        <span :style="{ width: `${progress * 100}%` }"></span>
      </span>
    </div>
  </div>
</template>
