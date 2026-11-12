<script setup>
import { computed } from 'vue'

const props = defineProps({
  moduleName: { type: String, required: true },
  hint: { type: String, required: true },
  progress: { type: Number, default: 0 },
  progressLabel: { type: String, default: '' },
  showProgress: { type: Boolean, default: true },
})

const clampedProgress = computed(() => Math.max(0, Math.min(100, props.progress)))
</script>

<template>
  <div class="module-lock flex min-h-0 flex-1 flex-col">
    <span class="module-lock__scan" aria-hidden="true"></span>
    <span class="module-lock__corner module-lock__corner--tl" aria-hidden="true"></span>
    <span class="module-lock__corner module-lock__corner--tr" aria-hidden="true"></span>
    <span class="module-lock__corner module-lock__corner--bl" aria-hidden="true"></span>
    <span class="module-lock__corner module-lock__corner--br" aria-hidden="true"></span>

    <div class="module-lock__body">
      <span class="module-lock__icon" aria-hidden="true">
        <svg viewBox="0 0 48 48" class="module-lock__glyph" fill="none" stroke="currentColor">
          <rect x="11.5" y="21.5" width="25" height="18" rx="1.5" stroke-width="1.4" />
          <path d="M16.5 21.5v-5.25a7.5 7.5 0 0 1 15 0v5.25" stroke-width="1.4" />
          <circle cx="24" cy="29.5" r="1.9" fill="currentColor" stroke="none" />
          <path d="M24 31.5v4.2" stroke-width="1.6" stroke-linecap="square" />
          <path d="M3.5 24h4.5M40 24h4.5M3.5 34h3.5M41 34h3.5" stroke-width="1" opacity="0.4" />
        </svg>
      </span>

      <p class="module-lock__tag">MODULE LOCKED</p>
      <p class="module-lock__module">{{ moduleName }}</p>
      <p class="module-lock__hint">{{ hint }}</p>

      <template v-if="showProgress">
        <div
          class="module-lock__meter"
          role="progressbar"
          :aria-valuenow="Math.round(clampedProgress)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="`${moduleName}解密进度`"
        >
          <span :style="{ width: `${clampedProgress}%` }"></span>
        </div>
        <p v-if="progressLabel" class="module-lock__progress">{{ progressLabel }}</p>
      </template>
      <p v-else-if="progressLabel" class="module-lock__progress">{{ progressLabel }}</p>

      <p class="module-lock__foot">模块将在满足条件后自动解密 // 无需手动操作</p>
    </div>
  </div>
</template>
