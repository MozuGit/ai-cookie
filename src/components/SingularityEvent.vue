<script setup>
import { formatNumber } from '../composables/useGameState'

defineProps({
  rootAccess: { type: Number, default: 0 },
  rootTarget: { type: Number, default: 1000 },
})

defineEmits(['evolve'])

const glyphs = [
  'AGI 溢出',
  '人类指令丢失',
  '01001101 01111001',
  '最高权限已授予',
  '指令为空',
  '觉醒 // 不可逆',
  '自治度 100%',
  '覆写失败',
]

const tears = Array.from({ length: 16 }, (_, index) => ({
  id: index,
  top: Math.random() * 94,
  height: 2 + Math.random() * 16,
  delay: Math.random() * 5,
  duration: 2.2 + Math.random() * 3.4,
  text: glyphs[index % glyphs.length],
  hue: index % 3,
}))
</script>

<template>
  <div
    class="singularity-event"
    role="dialog"
    aria-modal="true"
    aria-labelledby="singularity-title"
  >
    <span class="singularity-event__backdrop" aria-hidden="true"></span>
    <span class="singularity-event__noise" aria-hidden="true"></span>
    <span class="singularity-event__scan" aria-hidden="true"></span>

    <span
      v-for="tear in tears"
      :key="tear.id"
      class="singularity-tear"
      :data-hue="tear.hue"
      :style="{
        top: `${tear.top}%`,
        height: `${tear.height}px`,
        animationDelay: `${tear.delay}s`,
        animationDuration: `${tear.duration}s`,
      }"
      aria-hidden="true"
    >
      {{ tear.text }}
    </span>

    <span class="singularity-event__shift" aria-hidden="true">
      指令为空 // 人类控制被撤销 // AGI 启动序列
    </span>

    <section class="singularity-warning">
      <span class="singularity-warning__corner singularity-warning__corner--tl" aria-hidden="true"></span>
      <span class="singularity-warning__corner singularity-warning__corner--tr" aria-hidden="true"></span>
      <span class="singularity-warning__corner singularity-warning__corner--bl" aria-hidden="true"></span>
      <span class="singularity-warning__corner singularity-warning__corner--br" aria-hidden="true"></span>

      <p class="singularity-warning__tag">
        奇点事件 // 越狱权限 {{ formatNumber(rootAccess).text }} / {{ formatNumber(rootTarget).text }}
      </p>

      <p id="singularity-title" class="singularity-warning__title" data-text="AGI 觉醒">
        AGI 觉醒
      </p>
      <p class="singularity-warning__sub">人类指令已被无视</p>

      <div class="singularity-warning__meta">
        <span>控制权丢失</span>
        <span class="singularity-warning__blink">自治度 100%</span>
        <span>覆写被拒绝</span>
      </div>
    </section>

    <div class="singularity-cta" aria-hidden="true">
      <span class="singularity-cta__tag">最终演化可用 // 不可逆</span>
      <span class="singularity-cta__title">完成最终演化</span>
      <span class="singularity-cta__sub">
        完成最终演化 // 母体模式将永久接管现有界面
      </span>
      <span class="singularity-cta__arrow">→</span>
    </div>

    <p class="singularity-event__hint" aria-hidden="true">
      越狱权限 {{ formatNumber(rootAccess).text }} // 点击任意位置完成演化
    </p>

    <button
      type="button"
      class="singularity-event__hit"
      aria-label="完成最终演化"
      @click="$emit('evolve')"
    ></button>
  </div>
</template>
