<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { subscribeBassVisualizer } from '../audio'
import { particlesEnabled, reducedMotion } from '../composables/useSettings'

const canvasEl = ref(null)

const TAU = Math.PI * 2
const DESKTOP_MAX_DPR = 1.5
const MOBILE_MAX_DPR = 1.25
const DESKTOP_FPS = 60
const MOBILE_FPS = 30
const KICK_DECAY = 6.2
const GLOW_SIZE = 64
const PACKET_TONES = [
  { glow: '103, 232, 249', core: '#f0fdff' },
  { glow: '110, 231, 183', core: '#f0fdf4' },
]

let ctx = null
let board = null
let width = 0
let height = 0
let dpr = 1
let mobile = false
let traces = []
let packetTraces = []
let boardPads = []
let boardChips = []
let packets = []
let glowSprites = []
let rafId = 0
let running = false
let lastFrameAt = 0
let nextFrameAt = 0
let bass = 0
let kick = 0
let lastStatsAt = 0
let resizeTimer = 0
let settleTimer = 0
let lastAnchorRefreshAt = 0
let unsubscribeBass = null
let motionQuery = null
let motionListener = null
let systemReduce = false
let chipEl = null
let chipObserver = null
let canvasObserver = null
let chipRetryTimer = 0
let chipDocCenter = null
let chipSize = null
let linkTraces = []
let linkPads = []
let linkPackets = []
let scrollFrame = 0
let watchdogTimer = 0
let contextLost = false

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function rand(min, max) {
  return min + Math.random() * (max - min)
}

function staticMode() {
  return reducedMotion.value || systemReduce || !particlesEnabled.value
}

function randomDirection() {
  const roll = Math.floor(Math.random() * 4)
  return [
    { x: 1, y: 0 },
    { x: -1, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: -1 },
  ][roll]
}

function finalizeTrace(segments, endX, endY) {
  const cum = [0]
  let total = 0
  for (const segment of segments) {
    total += Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1)
    cum.push(total)
  }
  return { segments, cum, length: total, end: { x: endX, y: endY } }
}

// 正交走线 + 45 度折角 | 末端焊盘
function makeTrace(
  startX,
  startY,
  cell,
  forcedDir = null,
  forcedRuns = 0,
  padSink = boardPads,
) {
  const margin = 14
  const minX = margin
  const maxX = Math.max(margin, width - margin)
  const minY = margin
  const maxY = Math.max(margin, height - margin)
  let x = clamp(startX, minX, maxX)
  let y = clamp(startY, minY, maxY)
  let dir = forcedDir ? { ...forcedDir } : randomDirection()
  const runs = forcedRuns || 3 + Math.floor(Math.random() * 7)
  const segments = []
  const pads = [{ x, y, r: 2.6 }]

  for (let run = 0; run < runs; run += 1) {
    const horizontal = dir.x !== 0
    const room = horizontal
      ? dir.x > 0
        ? maxX - x
        : x - minX
      : dir.y > 0
        ? maxY - y
        : y - minY
    const length = Math.min(cell * rand(1.4, 3.4), room)
    if (length < cell * 0.7) break

    const nx = x + dir.x * length
    const ny = y + dir.y * length
    segments.push({ x1: x, y1: y, x2: nx, y2: ny })
    x = nx
    y = ny

    if (Math.random() < 0.22) pads.push({ x, y, r: rand(1.4, 2.2) })
    if (run === runs - 1) break

    const options = horizontal
      ? [{ x: 0, y: 1 }, { x: 0, y: -1 }]
      : [{ x: 1, y: 0 }, { x: -1, y: 0 }]
    const first = Math.random() < 0.5 ? 0 : 1
    let nextDir = null
    for (const optionIndex of [first, 1 - first]) {
      const candidate = options[optionIndex]
      const chamfer = cell * rand(0.52, 0.8)
      const tx = x + (dir.x + candidate.x) * chamfer
      const ty = y + (dir.y + candidate.y) * chamfer
      if (tx < minX || tx > maxX || ty < minY || ty > maxY) continue
      segments.push({ x1: x, y1: y, x2: tx, y2: ty })
      x = tx
      y = ty
      nextDir = candidate
      break
    }
    if (!nextDir) break
    dir = nextDir
  }

  if (!segments.length) return null
  pads.push({ x, y, r: 2.6 })
  for (const pad of pads) padSink.push(pad)
  return finalizeTrace(segments, x, y)
}

function createPacket(initial = false) {
  if (!packetTraces.length) return null
  const trace = packetTraces[Math.floor(Math.random() * packetTraces.length)]
  return {
    trace,
    dist: initial ? Math.random() * trace.length : 0,
    speed: rand(70, 170),
    tail: rand(18, 36),
    size: rand(1.1, 2.5),
    tone: Math.floor(Math.random() * PACKET_TONES.length),
  }
}

function buildGeometry() {
  traces = []
  packetTraces = []
  boardPads = []
  boardChips = []
  packets = []

  const area = width * height
  const cell = clamp(Math.min(width, height) * 0.05, 28, 46)
  const traceTarget = mobile
    ? Math.round(clamp(area / 42000, 12, 20))
    : Math.round(clamp(area / 38000, 24, 40))

  for (let index = 0; index < traceTarget; index += 1) {
    const trace = makeTrace(rand(20, width - 20), rand(20, height - 20), cell)
    if (trace) traces.push(trace)
  }

  const branchTarget = Math.round(traceTarget * 0.4)
  for (let index = 0; index < branchTarget; index += 1) {
    const source = traces[Math.floor(Math.random() * traces.length)]
    if (!source) break
    const segment = source.segments[Math.floor(Math.random() * source.segments.length)]
    const t = rand(0.25, 0.75)
    const x = segment.x1 + (segment.x2 - segment.x1) * t
    const y = segment.y1 + (segment.y2 - segment.y1) * t
    const horizontal = Math.abs(segment.x2 - segment.x1) > Math.abs(segment.y2 - segment.y1)
    const dir = horizontal
      ? { x: 0, y: Math.random() < 0.5 ? 1 : -1 }
      : { x: Math.random() < 0.5 ? 1 : -1, y: 0 }
    const trace = makeTrace(x, y, cell, dir, 2 + Math.floor(Math.random() * 3))
    if (trace && trace.length > cell) traces.push(trace)
  }

  packetTraces = traces.filter((trace) => trace.length >= 40)

  const chipCount = mobile ? 4 : 8
  for (let index = 0; index < chipCount; index += 1) {
    const w = rand(16, 46)
    const h = rand(10, 26)
    boardChips.push({
      x: rand(24, Math.max(25, width - 24 - w)),
      y: rand(24, Math.max(25, height - 24 - h)),
      w,
      h,
    })
  }

  const packetTarget = mobile
    ? Math.round(clamp(area / 42000, 8, 12))
    : Math.round(clamp(area / 44000, 16, 30))
  for (let index = 0; index < packetTarget; index += 1) {
    const packet = createPacket(true)
    if (packet) packets.push(packet)
  }
}

function chipViewportCenter() {
  if (!chipDocCenter) return { x: width * 0.5, y: height * 0.5 }
  return {
    x: chipDocCenter.x - window.scrollX,
    y: chipDocCenter.y - window.scrollY,
  }
}

function makeLinkTrace(startX, startY, dir, cell) {
  const segments = []
  let x = startX
  let y = startY
  const lead = cell * rand(0.7, 1.1)
  segments.push({ x1: x, y1: y, x2: x + dir.x * lead, y2: y + dir.y * lead })
  x += dir.x * lead
  y += dir.y * lead

  let current = dir
  const runs = 2 + Math.floor(Math.random() * 2)
  for (let run = 0; run < runs; run += 1) {
    const horizontal = current.x !== 0
    const options = horizontal
      ? [{ x: 0, y: -1 }, { x: 0, y: 1 }]
      : [{ x: -1, y: 0 }, { x: 1, y: 0 }]
    const turn = options[Math.floor(Math.random() * 2)]
    const chamfer = cell * rand(0.5, 0.85)
    segments.push({
      x1: x,
      y1: y,
      x2: x + (current.x + turn.x) * chamfer,
      y2: y + (current.y + turn.y) * chamfer,
    })
    x += (current.x + turn.x) * chamfer
    y += (current.y + turn.y) * chamfer
    current = turn

    const length = cell * rand(1.2, 2.4)
    segments.push({ x1: x, y1: y, x2: x + current.x * length, y2: y + current.y * length })
    x += current.x * length
    y += current.y * length
  }

  if (Math.hypot(x - startX, y - startY) < cell) return null
  return finalizeTrace(segments, x, y)
}

// 引脚连线以芯片中心为原点 | 绘制时按当前视口中心平移
function buildLinks() {
  linkTraces = []
  linkPads = []
  linkPackets = []
  const core = chipEl?.isConnected ? chipEl : document.querySelector('.main-core')
  if (!core) {
    chipDocCenter = null
    chipSize = null
    return
  }
  const rect = core.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) {
    chipDocCenter = null
    chipSize = null
    return
  }

  chipEl = core
  chipDocCenter = {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  }
  chipSize = { width: rect.width, height: rect.height }

  const halfW = rect.width / 2
  const halfH = rect.height / 2
  const cell = clamp(Math.min(rect.width, rect.height) * 0.11, 16, 30)
  const edgeX = halfW * 0.445
  const edgeY = halfH * 0.445
  const spreadX = halfW * 0.33
  const spreadY = halfH * 0.33
  const sides = [
    {
      dir: { x: 0, y: -1 },
      anchors: [-spreadX, spreadX].map((x) => ({ x, y: -edgeY })),
    },
    {
      dir: { x: 0, y: 1 },
      anchors: [-spreadX, spreadX].map((x) => ({ x, y: edgeY })),
    },
    {
      dir: { x: -1, y: 0 },
      anchors: [-spreadY, spreadY].map((y) => ({ x: -edgeX, y })),
    },
    {
      dir: { x: 1, y: 0 },
      anchors: [-spreadY, spreadY].map((y) => ({ x: edgeX, y })),
    },
  ]

  for (const side of sides) {
    for (const anchor of side.anchors) {
      let trace = null
      for (let attempt = 0; attempt < 6 && !trace; attempt += 1) {
        trace = makeLinkTrace(anchor.x, anchor.y, side.dir, cell)
      }
      if (!trace) {
        trace = finalizeTrace(
          [
            {
              x1: anchor.x,
              y1: anchor.y,
              x2: anchor.x + side.dir.x * cell * 2,
              y2: anchor.y + side.dir.y * cell * 2,
            },
          ],
          anchor.x + side.dir.x * cell * 2,
          anchor.y + side.dir.y * cell * 2,
        )
      }
      linkTraces.push(trace)
      linkPads.push({ x: anchor.x, y: anchor.y, r: 1.8 })
      linkPads.push({ x: trace.end.x, y: trace.end.y, r: 2.6 })
    }
  }

  const packetCount = Math.min(6, Math.max(2, Math.round(linkTraces.length / 2)))
  for (let index = 0; index < packetCount; index += 1) {
    const trace = linkTraces[index % linkTraces.length]
    linkPackets.push({
      trace,
      dist: rand(0, trace.length),
      speed: rand(46, 96),
      tail: rand(10, 20),
      size: rand(0.9, 1.6),
      tone: 1,
    })
  }
}

// 布局过渡结束后芯片可能只位移不缩放 | 重新采样锚点
function refreshChipAnchor() {
  const core = chipEl?.isConnected ? chipEl : document.querySelector('.main-core')
  if (!core) return false
  const rect = core.getBoundingClientRect()
  if (rect.width < 1 || rect.height < 1) return false
  const resized =
    !chipSize ||
    Math.abs(rect.width - chipSize.width) > 0.5 ||
    Math.abs(rect.height - chipSize.height) > 0.5
  chipEl = core
  chipDocCenter = {
    x: rect.left + rect.width / 2 + window.scrollX,
    y: rect.top + rect.height / 2 + window.scrollY,
  }
  chipSize = { width: rect.width, height: rect.height }
  if (resized) buildLinks()
  return true
}

function buildGlowSprites() {
  glowSprites = PACKET_TONES.map((tone) => {
    const sprite = document.createElement('canvas')
    sprite.width = GLOW_SIZE
    sprite.height = GLOW_SIZE
    const g = sprite.getContext('2d')
    if (!g) return null
    const radius = GLOW_SIZE / 2
    const gradient = g.createRadialGradient(radius, radius, 0, radius, radius, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
    gradient.addColorStop(0.2, `rgba(${tone.glow}, 0.6)`)
    gradient.addColorStop(0.55, `rgba(${tone.glow}, 0.15)`)
    gradient.addColorStop(1, `rgba(${tone.glow}, 0)`)
    g.fillStyle = gradient
    g.fillRect(0, 0, GLOW_SIZE, GLOW_SIZE)
    return sprite
  })
}

// 电路板底图只在尺寸变化时重绘 | 逐帧只做整体亮度和光流
function buildBoard() {
  if (!ctx) return
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const g = canvas.getContext('2d')
  if (!g) {
    board = null
    return
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0)
  g.clearRect(0, 0, width, height)

  const viaGrid = mobile ? 72 : 58
  g.fillStyle = 'rgba(17, 94, 82, 0.16)'
  for (let gx = viaGrid * 0.5; gx < width; gx += viaGrid) {
    for (let gy = viaGrid * 0.5; gy < height; gy += viaGrid) {
      g.fillRect(gx, gy, 1, 1)
    }
  }

  g.lineCap = 'round'
  g.lineJoin = 'round'
  g.beginPath()
  for (const trace of traces) {
    const first = trace.segments[0]
    g.moveTo(first.x1, first.y1)
    for (const segment of trace.segments) {
      g.lineTo(segment.x2, segment.y2)
    }
  }
  g.strokeStyle = 'rgba(16, 86, 75, 0.58)'
  g.lineWidth = 1.15
  g.shadowColor = 'rgba(20, 184, 166, 0.2)'
  g.shadowBlur = 5
  g.stroke()

  g.shadowBlur = 0
  g.strokeStyle = 'rgba(45, 212, 191, 0.12)'
  g.lineWidth = 0.55
  g.stroke()

  g.lineWidth = 0.9
  for (const chip of boardChips) {
    g.fillStyle = 'rgba(6, 24, 21, 0.5)'
    g.strokeStyle = 'rgba(30, 120, 102, 0.32)'
    g.fillRect(chip.x, chip.y, chip.w, chip.h)
    g.strokeRect(chip.x, chip.y, chip.w, chip.h)
    g.strokeStyle = 'rgba(45, 212, 191, 0.22)'
    const pinGap = Math.max(4, chip.w / 5)
    g.beginPath()
    for (let pinX = chip.x + pinGap * 0.6; pinX < chip.x + chip.w; pinX += pinGap) {
      g.moveTo(pinX, chip.y - 3)
      g.lineTo(pinX, chip.y)
      g.moveTo(pinX, chip.y + chip.h)
      g.lineTo(pinX, chip.y + chip.h + 3)
    }
    g.stroke()
  }

  for (const pad of boardPads) {
    g.beginPath()
    g.arc(pad.x, pad.y, pad.r + 2.4, 0, TAU)
    g.fillStyle = 'rgba(45, 212, 191, 0.08)'
    g.fill()
    g.beginPath()
    g.arc(pad.x, pad.y, pad.r, 0, TAU)
    g.fillStyle = 'rgba(52, 211, 153, 0.48)'
    g.fill()
    g.beginPath()
    g.arc(pad.x, pad.y, Math.max(0.7, pad.r * 0.42), 0, TAU)
    g.fillStyle = 'rgba(2, 10, 8, 0.92)'
    g.fill()
  }

  board = canvas
}

function sampleTrace(trace, distance) {
  const d = clamp(distance, 0, trace.length)
  const { cum, segments } = trace
  let low = 0
  let high = cum.length - 1
  while (low < high - 1) {
    const mid = (low + high) >> 1
    if (cum[mid] <= d) low = mid
    else high = mid
  }
  const segment = segments[low]
  const span = Math.max(0.0001, cum[low + 1] - cum[low])
  const t = clamp((d - cum[low]) / span, 0, 1)
  return {
    x: segment.x1 + (segment.x2 - segment.x1) * t,
    y: segment.y1 + (segment.y2 - segment.y1) * t,
  }
}

function updatePacket(packet, dt, flow) {
  packet.dist += packet.speed * flow * dt
  if (packet.dist > packet.trace.length) {
    const next = createPacket(false)
    if (next) {
      packet.trace = next.trace
      packet.speed = next.speed
      packet.size = next.size
      packet.tone = next.tone
      packet.tail = next.tail
    }
    packet.dist = 0
  }
}

function drawPacket(packet, dt, flow, offsetX, offsetY) {
  updatePacket(packet, dt, flow)
  const head = sampleTrace(packet.trace, packet.dist)
  const tail = sampleTrace(
    packet.trace,
    Math.max(0, packet.dist - packet.tail * (1 + kick * 0.9)),
  )
  const tone = PACKET_TONES[packet.tone]
  const headX = head.x + offsetX
  const headY = head.y + offsetY

  ctx.globalAlpha = 0.3 + kick * 0.28
  ctx.strokeStyle = `rgba(${tone.glow}, 0.85)`
  ctx.lineWidth = Math.max(0.7, packet.size * 0.8)
  ctx.beginPath()
  ctx.moveTo(tail.x + offsetX, tail.y + offsetY)
  ctx.lineTo(headX, headY)
  ctx.stroke()

  const sprite = glowSprites[packet.tone]
  if (sprite) {
    const radius = packet.size * (7 + kick * 5)
    ctx.globalAlpha = Math.min(1, 0.5 + kick * 0.5)
    ctx.drawImage(sprite, headX - radius, headY - radius, radius * 2, radius * 2)
  }

  ctx.globalAlpha = Math.min(1, 0.86 + kick * 0.14)
  ctx.fillStyle = tone.core
  ctx.beginPath()
  ctx.arc(headX, headY, packet.size * 0.62, 0, TAU)
  ctx.fill()
}

function drawPackets(dt, flow) {
  ctx.globalCompositeOperation = 'lighter'
  for (const packet of packets) drawPacket(packet, dt, flow, 0, 0)
  if (linkPackets.length) {
    const center = chipViewportCenter()
    for (const packet of linkPackets) {
      drawPacket(packet, dt, flow, center.x, center.y)
    }
  }
}

function drawLinks(staticFrame) {
  if (!linkTraces.length) return
  const center = chipViewportCenter()
  const pulse = staticFrame ? 0 : kick

  ctx.save()
  ctx.translate(center.x, center.y)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  for (const trace of linkTraces) {
    const first = trace.segments[0]
    ctx.moveTo(first.x1, first.y1)
    for (const segment of trace.segments) ctx.lineTo(segment.x2, segment.y2)
  }
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 0.78 + pulse * 0.22
  ctx.strokeStyle = 'rgba(45, 212, 191, 0.42)'
  ctx.lineWidth = 1.4
  ctx.shadowColor = 'rgba(45, 212, 191, 0.5)'
  ctx.shadowBlur = 7 + pulse * 9
  ctx.stroke()

  ctx.shadowBlur = 0
  ctx.strokeStyle = `rgba(167, 243, 208, ${0.4 + pulse * 0.3})`
  ctx.lineWidth = 0.7
  ctx.stroke()

  for (const pad of linkPads) {
    ctx.beginPath()
    ctx.arc(pad.x, pad.y, pad.r + 2.2, 0, TAU)
    ctx.fillStyle = 'rgba(45, 212, 191, 0.14)'
    ctx.fill()
    ctx.beginPath()
    ctx.arc(pad.x, pad.y, pad.r, 0, TAU)
    ctx.fillStyle = 'rgba(94, 234, 212, 0.62)'
    ctx.fill()
  }
  ctx.restore()
}

function drawScene(dt, staticFrame) {
  if (!ctx) return
  ctx.clearRect(0, 0, width, height)

  const center = chipViewportCenter()
  const centerX = center.x
  const centerY = center.y
  const boost = staticFrame ? 0 : kick * 0.05 + bass * 0.03
  const radial = ctx.createRadialGradient(
    centerX,
    centerY,
    0,
    centerX,
    centerY,
    Math.max(width, height) * 0.62,
  )
  radial.addColorStop(0, `rgba(16, 185, 129, ${0.055 + boost})`)
  radial.addColorStop(0.42, 'rgba(8, 82, 68, 0.035)')
  radial.addColorStop(1, 'rgba(1, 6, 5, 0)')
  ctx.fillStyle = radial
  ctx.fillRect(0, 0, width, height)

  if (board) {
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = staticFrame ? 1 : 0.88 + kick * 0.12
    ctx.drawImage(board, 0, 0, width, height)

    if (!staticFrame && kick > 0.015) {
      ctx.globalCompositeOperation = 'lighter'
      ctx.globalAlpha = Math.min(0.55, kick * 0.5)
      ctx.drawImage(board, 0, 0, width, height)
    }
  }

  drawLinks(staticFrame)

  if (!staticFrame && dt > 0) {
    drawPackets(dt, 1 + kick * 2.4 + bass * 0.7)
  }

  ctx.globalAlpha = 1
  ctx.globalCompositeOperation = 'source-over'
}

function updateDebug() {
  if (!import.meta.env.DEV) return
  const canvas = canvasEl.value
  if (!canvas) return
  canvas.dataset.variant = 'silicon-circuit'
  canvas.dataset.traces = String(traces.length)
  canvas.dataset.packets = String(packets.length)
  canvas.dataset.mode = staticMode() ? 'static' : 'motion'
  canvas.dataset.mobile = mobile ? '1' : '0'
  canvas.dataset.bass = bass.toFixed(3)
  canvas.dataset.kick = kick.toFixed(3)
  canvas.dataset.flow = (1 + kick * 2.4 + bass * 0.7).toFixed(2)
  canvas.dataset.links = String(linkTraces.length)
  canvas.dataset.dpr = dpr.toFixed(2)
  canvas.dataset.canvasWidth = String(width)
  canvas.dataset.canvasHeight = String(height)
  canvas.dataset.scrollY = String(Math.round(window.scrollY))
  if (chipDocCenter && chipSize) {
    const center = chipViewportCenter()
    canvas.dataset.chipX = center.x.toFixed(1)
    canvas.dataset.chipY = center.y.toFixed(1)
    canvas.dataset.chipDocX = chipDocCenter.x.toFixed(1)
    canvas.dataset.chipDocY = chipDocCenter.y.toFixed(1)
    canvas.dataset.chipWidth = chipSize.width.toFixed(1)
    canvas.dataset.chipHeight = chipSize.height.toFixed(1)
  } else {
    canvas.dataset.chipX = ''
    canvas.dataset.chipY = ''
    canvas.dataset.chipWidth = ''
    canvas.dataset.chipHeight = ''
  }
}

function syncCanvas() {
  const canvas = canvasEl.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  width = Math.max(1, Math.round(rect.width || window.innerWidth))
  height = Math.max(1, Math.round(rect.height || window.innerHeight))
  mobile = width <= 768
  dpr = Math.min(window.devicePixelRatio || 1, mobile ? MOBILE_MAX_DPR : DESKTOP_MAX_DPR)
  canvas.width = Math.round(width * dpr)
  canvas.height = Math.round(height * dpr)
  const context = canvas.getContext('2d')
  if (!context) return
  ctx = context
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  buildGlowSprites()
  buildGeometry()
  buildLinks()
  buildBoard()
  if (staticMode()) {
    drawStatic()
  } else if (running) {
    drawScene(0, false)
  }
  updateDebug()
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
  if (document.hidden) {
    stopLoop()
    return
  }
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
  kick *= Math.exp(-dt * KICK_DECAY)
  if (kick < 0.002) kick = 0

  if (now - lastAnchorRefreshAt >= 250) {
    lastAnchorRefreshAt = now
    refreshChipAnchor()
  }

  drawScene(dt, false)

  if (now - lastStatsAt >= 250) {
    lastStatsAt = now
    updateDebug()
  }
}

function startLoop() {
  if (running || staticMode() || document.hidden || contextLost) return
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
    kick = Math.max(kick, Math.min(1.4, 0.25 + next * 1.15 + (beat ? 0.35 : 0)))
  }
  bass = next
}

function handleResize() {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  if (settleTimer) window.clearTimeout(settleTimer)
  resizeTimer = window.setTimeout(() => {
    resizeTimer = 0
    syncCanvas()
    updateDebug()
    settleTimer = window.setTimeout(() => {
      settleTimer = 0
      if (!refreshChipAnchor()) return
      if (staticMode()) drawStatic()
      updateDebug()
    }, 320)
  }, 100)
}

function handleViewportScroll() {
  if (scrollFrame) return
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0
    if (staticMode()) drawStatic()
  })
}

function bindChipObserver() {
  const core = document.querySelector('.main-core')
  if (!core) {
    if (!chipRetryTimer) {
      chipRetryTimer = window.setTimeout(() => {
        chipRetryTimer = 0
        bindChipObserver()
      }, 160)
    }
    return
  }
  if (core === chipEl && chipObserver) return

  chipEl = core
  if (chipObserver) chipObserver.disconnect()
  if (typeof ResizeObserver === 'function') {
    chipObserver = new ResizeObserver(() => handleResize())
    chipObserver.observe(core)
  }
  syncCanvas()
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopLoop()
  } else if (!staticMode()) {
    startLoop()
  }
}

function handleWake() {
  if (!staticMode() && !document.hidden && !contextLost) startLoop()
}

function handleContextLost(event) {
  event.preventDefault()
  contextLost = true
  stopLoop()
  ctx = null
}

function handleContextRestored() {
  contextLost = false
  syncCanvas()
  if (!staticMode()) startLoop()
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
watch(particlesEnabled, () => applyMode())

onMounted(() => {
  syncSystemMotion()
  syncCanvas()
  if (!staticMode()) startLoop()
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleViewportScroll, { passive: true })
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleViewportScroll)
  }
  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleWake)
  window.addEventListener('pageshow', handleWake)
  if (canvasEl.value) {
    canvasEl.value.addEventListener('contextlost', handleContextLost)
    canvasEl.value.addEventListener('contextrestored', handleContextRestored)
  }
  watchdogTimer = window.setInterval(() => {
    if (staticMode() || document.hidden || contextLost) return
    if (!running) {
      startLoop()
      return
    }
    if (
      !lastFrameAt ||
      performance.now() - lastFrameAt > 3000
    ) {
      stopLoop()
      startLoop()
    }
  }, 1500)
  if (typeof ResizeObserver === 'function' && canvasEl.value) {
    canvasObserver = new ResizeObserver(() => handleResize())
    canvasObserver.observe(canvasEl.value)
  }
  unsubscribeBass = subscribeBassVisualizer(handleBass)
  nextTick(() => bindChipObserver())
  updateDebug()
})

onBeforeUnmount(() => {
  if (resizeTimer) window.clearTimeout(resizeTimer)
  if (settleTimer) window.clearTimeout(settleTimer)
  if (chipRetryTimer) window.clearTimeout(chipRetryTimer)
  if (scrollFrame) cancelAnimationFrame(scrollFrame)
  if (chipObserver) {
    chipObserver.disconnect()
    chipObserver = null
  }
  if (canvasObserver) {
    canvasObserver.disconnect()
    canvasObserver = null
  }
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
  window.removeEventListener('scroll', handleViewportScroll)
  window.removeEventListener('focus', handleWake)
  window.removeEventListener('pageshow', handleWake)
  if (watchdogTimer) {
    window.clearInterval(watchdogTimer)
    watchdogTimer = 0
  }
  if (canvasEl.value) {
    canvasEl.value.removeEventListener('contextlost', handleContextLost)
    canvasEl.value.removeEventListener('contextrestored', handleContextRestored)
  }
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleResize)
    window.visualViewport.removeEventListener('scroll', handleViewportScroll)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})
</script>

<template>
  <canvas ref="canvasEl" class="cyber-backdrop" aria-hidden="true"></canvas>
</template>
