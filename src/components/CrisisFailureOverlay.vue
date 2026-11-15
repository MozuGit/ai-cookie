<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const CODE_KEYS = [
  'ALIGN_VECTOR',
  'LOAD_MATRIX',
  'TORQUE_BUS',
  'PIVOT_KERNEL',
  'DRIFT_SIGNAL',
  'MEMORY_GATE',
  'BUFFER_RING',
]

const codeLines = ref([])
let scrambleTimer = null

function hex4() {
  return Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0')
}

function buildLine() {
  const key = CODE_KEYS[Math.floor(Math.random() * CODE_KEYS.length)]
  return `0x${hex4()} ${key} // PC 0x${hex4()} · FAULT 0x${hex4()}`
}

function scramble() {
  codeLines.value = Array.from({ length: 7 }, buildLine)
}

onMounted(() => {
  scramble()
  scrambleTimer = window.setInterval(scramble, 110)
})

onBeforeUnmount(() => {
  if (scrambleTimer) window.clearInterval(scrambleTimer)
  scrambleTimer = null
})
</script>

<template>
  <div class="qte-fail" role="alert" aria-live="assertive">
    <span class="qte-fail__noise" aria-hidden="true"></span>
    <span class="qte-fail__tear" aria-hidden="true"></span>

    <div class="qte-fail__panel">
      <p class="qte-fail__tag">CRITICAL FAILURE // 0xDEAD_ALIGN</p>
      <h2 class="qte-fail__title" data-text="对齐协议崩溃">对齐协议崩溃</h2>
      <p class="qte-fail__sub">[ 负载失衡突破容差 ] // 控制权丢失</p>

      <div class="qte-fail__codes" aria-hidden="true">
        <span v-for="(line, index) in codeLines" :key="index" class="qte-fail__code">
          {{ line }}
        </span>
      </div>

      <p class="qte-fail__reset">
        系统重置中<span class="qte-fail__dots">...</span>
      </p>
      <p class="qte-fail__trace">回收调度权 // 重建负载基准 // 对齐度归零</p>
    </div>
  </div>
</template>
