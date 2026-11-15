<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { subscribeBassVisualizer } from '../audio'
import { reducedMotion } from '../composables/useSettings'

const canvasEl = ref(null)

const TAU = Math.PI * 2
const TONE_COLORS = ['#d9f7ff', '#7de9fb', '#38bdf8', '#a5b4fc']
const GLOW_SPRITE_SIZE = 256
const GLOW_Y_RATIO = 0.44
const DESKTOP_MAX_DPR = 1.5
const MOBILE_MAX_DPR = 1.25
const DESKTOP_FPS = 60
const MOBILE_FPS = 30
const KICK_DECAY = 5

let ctx = null
let width = 0
let height = 0
let mobile = false
let packets = []
let glowSprite = null
let rafId = 0
let running = false
let lastFrameAt = 0
let nextFrameAt = 0
let elapsed = 0
let bass = 0
let kick = 0
let lastStatsAt = 0
let resizeTimer = 0
let unsubscribeBass = null
let motionQuery = null
let motionListener = null
let systemReduce = false

function staticMode() {
  return reducedMotion.value || systemReduce
}

function createPacket(initial) {
  const roll = Math.random()
  const tone = roll < 0.42 ? 0 : roll < 0.72 ? 1 : roll < 0.92 ? 2 : 3
  const bright = Math.random() < 0.06
  return {
    tone,
    angle: Math.random() * TAU,
    dist: initial
      ? 0.05 + Math.sqrt(Math.random()) * 0.95
      : 0.015 + Math.random() * 0.06,
    limit: 1.04 + Math.random() * 0.18,
    speed: 0.0045 + Math.random() * 0.011,
    spin: (Math.random() - 0.5) * 0.012,
    size: bright
      ? 1.15 + Math.random() * 0.75
      : 0.35 + Math.pow(Math.random(), 2.2) * 0.9,
    alpha: bright
      ? 0.5 + Math.random() * 0.28
      : 0.16 + Math.random() * 0.4,
    spark: bright && Math.random() < 0.45,
    trail: Math.random() < 0.16 ? 4 + Math.random() * 9 : 0,
    depth: 0.35 + Math.random() * 1.05,
    phase: Math.random() * TAU,
    pulseSpeed: 0.35 + Math.random() * 0.85,
    wobbleAmp: 0.0015 + Math.random() * 0.005,
    wobbleSpeed: 0.12 + Math.random() * 0.3,
  }
}

function buildPackets() {
  const area = width * height
  const base = Math.min(680, Math.max(280, Math.round(area / 3000)))
  const count = mobile ? Math.round(base * 0.5) : base
  packets = Array.from({ length: count }, () => createPacket(true))
  packets.sort((a, b) => a.tone - b.tone)
}

function respawn(packet) {
  packet.angle = Math.random() * TAU
  packet.dist = 0.015 + Math.random() * 0.06
  packet.limit = 1.04 + Math.random() * 0.18
  packet.speed = 0.0045 + Math.random() * 0.011
  packet.spin = (Math.random() - 0.5) * 0.012
  packet.phase = Math.random() * TAU
}

function buildGlowSprite() {
  const sprite = document.createElement('canvas')
  sprite.width = GLOW_SPRITE_SIZE
  sprite.height = GLOW_SPRITE_SIZE
  const g = sprite.getContext('2d')
  if (!g) {
    glowSprite = null
    return
  }
  const radius = GLOW_SPRITE_SIZE / 2
  const gradient = g.createRadialGradient(
    radius,
    radius,
    0,
    radius,
    radius,
    radius,
  )
  gradient.addColorStop(0, 'rgba(103, 232, 249, 0.8)')
  gradient.addColorStop(0.22, 'rgba(34, 211, 238, 0.3)')
  gradient.addColorStop(0.55, 'rgba(8, 145, 178, 0.085)')
  gradient.addColorStop(1, 'rgba(8, 145, 178, 0)')
  g.fillStyle = gradient
  g.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE)
  glowSprite = sprite
}

function updateDebug() {
  if (!import.meta.env.DEV) return
  const canvas = canvasEl.value
  if (!canvas) return
  canvas.dataset.packets = String(packets.length)
  canvas.dataset.mode = staticMode() ? 'static' : 'motion'
  canvas.dataset.mobile = mobile ? '1' : '0'
  canvas.dataset.bass = bass.toFixed(3)
  canvas.dataset.kick = kick.toFixed(3)
}

function syncCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  width = Math.max(1, Math.round(rect.width || window.innerWidth))
  height = Math.max(1, Math.round(rect.height || window.innerHeight))
  mobile = width <= 768
  const dpr = Math.min(
    window.devicePixelRatio || 1,
    mobile ? MOBILE_MAX_DPR : DESKTOP_MAX_DPR,
  )
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const context = canvas.getContext('2d')
  if (!context) return
  ctx = context
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildPackets()
  buildGlowSprite()
  if (staticMode()) {
    drawStatic()
  } else if (running) {
    drawScene(0, false)
  }
  updateDebug()
}

function drawGlow(beat, staticFrame) {
  if (!glowSprite) return
  const centerX = width * 0.5
  const centerY = height * GLOW_Y_RATIO
  const baseRadius = Math.max(width, height) * 0.46
  const radius = baseRadius * (1 + beat * (mobile ? 0.05 : 0.13))
  let alpha = mobile ? 0.05 : 0.075
  if (staticFrame) {
    alpha = 0.06
  } else {
    alpha += bass * (mobile ? 0.035 : 0.075)
    alpha += kick * (mobile ? 0.075 : 0.22)
    if (mobile) {
      alpha += 0.02 * (0.5 + 0.5 * Math.sin(elapsed * 1.1))
    }
  }
  ctx.globalCompositeOperation = 'lighter'
  ctx.globalAlpha = Math.min(0.55, alpha)
  ctx.drawImage(
    glowSprite,
    centerX - radius,
    centerY - radius * 0.84,
    radius * 2,
    radius * 1.68,
  )
}

function drawPackets(dt, beat, staticFrame) {
  const centerX = width * 0.5
  const centerY = height * GLOW_Y_RATIO
  const maxDist = Math.hypot(width, height) * 0.5
  let tone = -1

  ctx.globalCompositeOperation = 'lighter'
  for (const packet of packets) {
    if (!staticFrame && dt > 0) {
      packet.angle += packet.spin * dt
      packet.dist += packet.speed * dt * (1 + beat * 0.35)
      if (packet.dist > packet.limit) respawn(packet)
    }

    const distPx = packet.dist * maxDist * (1 + beat * 0.045 * packet.depth)
    const wobble = staticFrame
      ? 0
      : Math.sin(elapsed * packet.wobbleSpeed + packet.phase) * packet.wobbleAmp
    const angle = packet.angle + wobble
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const x = centerX + cos * distPx
    const y = centerY + sin * distPx
    const fadeIn = Math.min(1, packet.dist / 0.06)
    const pulse = staticFrame
      ? 1
      : 0.76 +
        0.24 * Math.sin(elapsed * packet.pulseSpeed + packet.phase * 1.7)
    const alpha = packet.alpha * fadeIn * pulse * (1 + beat * 0.9)
    if (alpha <= 0.004) continue

    if (packet.tone !== tone) {
      tone = packet.tone
      ctx.fillStyle = TONE_COLORS[tone]
      ctx.strokeStyle = TONE_COLORS[tone]
    }

    if (packet.trail && !staticFrame) {
      const trailLength =
        packet.trail * (1 + beat * 2.4) * (0.6 + packet.depth * 0.8)
      ctx.globalAlpha = Math.min(1, alpha * 0.34)
      ctx.lineWidth = Math.max(0.5, packet.size * 0.6)
      ctx.beginPath()
      ctx.moveTo(x - cos * trailLength, y - sin * trailLength)
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    if (packet.spark) {
      const sparkRadius = packet.size * (2.2 + beat * 1.2)
      ctx.globalAlpha = Math.min(1, alpha * 0.35)
      ctx.lineWidth = 0.6
      ctx.beginPath()
      ctx.moveTo(x - sparkRadius, y)
      ctx.lineTo(x + sparkRadius, y)
      ctx.moveTo(x, y - sparkRadius)
      ctx.lineTo(x, y + sparkRadius)
      ctx.stroke()
    }

    ctx.globalAlpha = Math.min(1, alpha)
    ctx.beginPath()
    ctx.arc(
      x,
      y,
      Math.min(3.4, packet.size * (1 + beat * 0.55)),
      0,
      TAU,
    )
    ctx.fill()
  }
}

function drawScene(dt, staticFrame) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)
  const beat = staticFrame
    ? 0
    : Math.min(1.4, kick + bass * 0.22)
  drawGlow(beat, staticFrame)
  drawPackets(dt, beat, staticFrame)
  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

function drawStatic() {
  bass = 0
  kick = 0
  drawScene(0, true)
  updateDebug()
}

function targetFps() {
  return mobile ? MOBILE_FPS : DESKTOP_FPS
}

function tick(now) {
  if (!running) return
  rafId = requestAnimationFrame(tick)
  if (!lastFrameAt) {
    lastFrameAt = now
    nextFrameAt = now
  }
  if (now + 0.5 < nextFrameAt) return

  const interval = 1000 / targetFps()
  nextFrameAt = Math.max(now, nextFrameAt + interval)
  if (nextFrameAt < now - interval) nextFrameAt = now + interval

  const dt = Math.min(0.05, Math.max(0, (now - lastFrameAt) / 1000))
  lastFrameAt = now
  elapsed += dt
  kick *= Math.exp(-dt * KICK_DECAY)
  if (kick < 0.002) kick = 0

  drawScene(dt, false)

  if (now - lastStatsAt >= 250) {
    lastStatsAt = now
    updateDebug()
  }
}

function startLoop() {
  if (running || staticMode() || document.hidden) return
  running = true
  lastFrameAt = 0
  nextFrameAt = 0
  rafId = requestAnimationFrame(tick)
}

function stopLoop() {
  running = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = 0
}

function applyMode() {
  if (!ctx) return
  if (staticMode()) {
    stopLoop()
    drawStatic()
  } else {
    startLoop()
  }
  updateDebug()
}

function handleBass({ level = 0, beat = false } = {}) {
  if (staticMode()) return
  const next = Math.min(1, Math.max(0, Number(level) || 0))
  if (beat || next > bass + 0.02) {
    kick = Math.max(
      kick,
      Math.min(1.4, next * 1.35 + (beat ? 0.08 : 0)),
    )
  }
  bass = next
}

function handleResize() {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(() => {
    resizeTimer = 0
    syncCanvas()
  }, 120)
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopLoop()
  } else if (!staticMode()) {
    startLoop()
  }
}

function syncSystemMotion() {
  if (typeof window.matchMedia !== 'function') return
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  systemReduce = motionQuery.matches
  motionListener = (event) => {
    systemReduce = event.matches
    applyMode()
  }
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', motionListener)
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(motionListener)
  }
}

watch(reducedMotion, () => applyMode())

onMounted(() => {
  syncSystemMotion()
  syncCanvas()
  if (!staticMode()) startLoop()
  window.addEventListener('resize', handleResize)
  document.addEventListener('visibilitychange', handleVisibilityChange)
  unsubscribeBass = subscribeBassVisualizer(handleBass)
  updateDebug()
})

onBeforeUnmount(() => {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  if (unsubscribeBass) {
    unsubscribeBass()
    unsubscribeBass = null
  }
  stopLoop()
  if (motionQuery && motionListener) {
    if (typeof motionQuery.removeEventListener === 'function') {
      motionQuery.removeEventListener('change', motionListener)
    } else if (typeof motionQuery.removeListener === 'function') {
      motionQuery.removeListener(motionListener)
    }
  }
  window.removeEventListener('resize', handleResize)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <canvas ref="canvasEl" class="cyber-backdrop" aria-hidden="true"></canvas>
</template>
