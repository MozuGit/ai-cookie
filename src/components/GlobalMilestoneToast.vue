<script setup>
defineProps({
  toast: { type: Object, default: null },
})
</script>

<template>
  <div v-if="toast" class="global-milestone-toast" role="status" aria-live="polite">
    <span class="global-milestone-toast__glyph" aria-hidden="true">
      {{ toast.glyph || '★' }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="global-milestone-toast__tag">GLOBAL MILESTONE // 全局里程碑解锁</p>
      <p class="global-milestone-toast__title">{{ toast.name }}</p>
      <p class="global-milestone-toast__effect">{{ toast.effect }}</p>
    </div>
    <span class="global-milestone-toast__threshold">{{ toast.thresholdLabel }}</span>
  </div>
</template>
