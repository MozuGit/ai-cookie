import { watch } from 'vue'
import {
  muted as audioMuted,
  reducedMotion,
  setMuted,
  spectrumEnabled,
} from './composables/useSettings'

export { audioMuted }

const MASTER_VOLUME = 0.85
const MAX_VOICES = 32
const SUSPEND_DELAY_MS = 120
const SCHEDULE_LEAD = 0.035

// BGM 文件位于 public/sfx/background.mp3 | 构建后路径 /sfx/background.mp3
const BGM_URL = '/sfx/background.mp3'
const BGM_VOLUME = 0.2

// 危机警报 | 独立 Audio 实例循环播放 | 与短音效 / BGM 解耦 | 危机解除立即停声
const CRISIS_AUDIO_URL = '/sfx/crisis.mp3'
const CRISIS_AUDIO_VOLUME = 0.6
const CRISIS_FALLBACK_INTERVAL_MS = 1600

// 音频可视化 | 只读取低频段 | 30fps 推送 | 避免每帧触发 Vue 渲染
const ANALYSER_FFT_SIZE = 512
const BASS_MIN_HZ = 30
const BASS_MAX_HZ = 220
const BASS_CSS_VAR = '--bass-level'
const BASS_FLOOR = 0.8
const BASS_RANGE = 0.18
const BASS_CURVE = 1
const BASS_ATTACK = 0.38
const BASS_RELEASE = 0.09
const BASS_BEAT_THRESHOLD = 0.45
const BASS_BEAT_FLUX = 0.06
const BASS_BEAT_COOLDOWN_MS = 360
const VISUALIZER_PAINT_INTERVAL = 1000 / 30

// 外部音效 | 文件位于 public/sfx/ | 缺失或解码失败时静默回退内置合成音色
const SFX_SAMPLES_ENABLED = true
const SFX_SAMPLE_URLS = {
  click: '/sfx/click.mp3',
  buy: '/sfx/buy.mp3',
  upgrade: '/sfx/upgrade.mp3',
  crisis: '/sfx/crisis.mp3',
  ascend: '/sfx/ascend.mp3',
}

// 外部样本基础音量 | 高频点击必须克制 | 跃迁作为最强反馈保留更大动态
const SFX_SAMPLE_GAIN = {
  click: 0.3,
  buy: 0.5,
  upgrade: 0.5,
  crisis: 0.6,
  ascend: 0.8,
}

const THROTTLE_MS = {
  click: 22,
  'auto-click': 140,
  buy: 55,
  upgrade: 80,
  crisis: 900,
  ascend: 1200,
  'ascension-best': 4000,
  'qte-nudge': 48,
  'qte-win': 240,
  'qte-fail': 320,
  'achievement-1': 350,
  'achievement-2': 350,
  'achievement-3': 350,
  'achievement-4': 350,
  'achievement-5': 350,
  'achievement-6': 350,
}

let context = null
let masterGain = null
let compressor = null
let noiseBuffer = null
let unlocked = false
let suspendTimer = null
const activeVoices = new Set()
let bgmElement = null
let bgmUnavailable = false
let sampleLoading = false
const sampleBuffers = new Map()
const samplesUnavailable = new Set()
const lastPlayedAt = new Map()

let currentCrisisAudio = null
let crisisAlarmActive = false
let crisisAudioUnavailable = false
let crisisFallbackTimer = null
let epochAudio = null
let ascensionCinematicAudio = null

// 负载平衡 QTE | 持续低鸣随指针速度变化 | 滑出安全区叠加高频警示层
let qteAudio = null
let qteAudioRequested = false
let qteTeardownTimer = null

let audioSource = null
let analyser = null
let bgmGain = null
let frequencyData = null
let bassBinStart = 1
let bassBinEnd = 5
let bassLevel = 0
let bassPrevLevel = 0
let bassLastBeatAt = 0
let visualizerFrame = 0
let visualizerLastPaint = 0
const bassSubscribers = new Set()

let prefersReducedMotion = false
let mobileCalmViewport = false
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  prefersReducedMotion = motionQuery.matches
  const onMotionChange = (event) => {
    prefersReducedMotion = event.matches
    syncVisualizer()
  }
  if (typeof motionQuery.addEventListener === 'function') {
    motionQuery.addEventListener('change', onMotionChange)
  } else if (typeof motionQuery.addListener === 'function') {
    motionQuery.addListener(onMotionChange)
  }

  const mobileQuery = window.matchMedia('(max-width: 768px)')
  mobileCalmViewport = mobileQuery.matches
  const onMobileChange = (event) => {
    mobileCalmViewport = event.matches
    syncVisualizer()
  }
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', onMobileChange)
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(onMobileChange)
  }
}

watch(audioMuted, () => {
  applyMuteState()
})

watch(reducedMotion, () => {
  syncVisualizer()
})

watch(spectrumEnabled, () => {
  syncVisualizer()
})

function handleBgmError() {
  const audio = bgmElement
  if (!audio) return
  bgmUnavailable = true
  try {
    audio.pause()
  } catch {
    /* noop */
  }
  stopVisualizerLoop()
}

function handleBgmPlay() {
  syncVisualizer()
}

function handleBgmPause() {
  stopVisualizerLoop()
}

function ensureBgmElement() {
  if (typeof window === 'undefined' || bgmUnavailable) return null
  if (bgmElement) return bgmElement
  try {
    const audio = new Audio()
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = BGM_VOLUME
    audio.src = BGM_URL
    audio.addEventListener('error', handleBgmError)
    audio.addEventListener('play', handleBgmPlay)
    audio.addEventListener('pause', handleBgmPause)
    bgmElement = audio
    return bgmElement
  } catch {
    bgmUnavailable = true
    return null
  }
}

function visualMotionAllowed() {
  return (
    spectrumEnabled.value &&
    !audioMuted.value &&
    !reducedMotion.value &&
    !prefersReducedMotion &&
    !mobileCalmViewport
  )
}

function writeBassCssLevel(value) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty(
    BASS_CSS_VAR,
    Math.min(1, Math.max(0, value)).toFixed(3),
  )
}

function updateBassBins() {
  if (!analyser || !context || !frequencyData) return
  const binWidth = context.sampleRate / analyser.fftSize
  bassBinStart = Math.max(1, Math.floor(BASS_MIN_HZ / binWidth))
  bassBinEnd = Math.min(
    frequencyData.length - 1,
    Math.max(bassBinStart + 1, Math.ceil(BASS_MAX_HZ / binWidth)),
  )
}

function ensureBgmGraph(audio) {
  if (analyser) return true
  const ctx = ensureContext()
  if (!ctx) return false
  try {
    if (!audioSource) {
      audioSource = ctx.createMediaElementSource(audio)
    }
    const node = ctx.createAnalyser()
    node.fftSize = ANALYSER_FFT_SIZE
    node.smoothingTimeConstant = 0.6
    const gain = ctx.createGain()
    gain.gain.value = BGM_VOLUME
    audioSource.connect(node)
    node.connect(gain)
    gain.connect(ctx.destination)
    analyser = node
    bgmGain = gain
    frequencyData = new Uint8Array(node.frequencyBinCount)
    updateBassBins()
    audio.volume = 1
    return true
  } catch {
    return false
  }
}

function emitBass(beat = false) {
  if (!bassSubscribers.size) return
  const payload = { level: bassLevel, beat }
  for (const listener of bassSubscribers) {
    try {
      listener(payload)
    } catch {
      /* 订阅者异常不得中断音频循环 */
    }
  }
}

function resetBassLevel(notify = true) {
  bassLevel = 0
  bassPrevLevel = 0
  bassLastBeatAt = 0
  visualizerLastPaint = 0
  writeBassCssLevel(0)
  if (notify) emitBass(false)
}

function shouldVisualize() {
  return Boolean(
    analyser &&
      frequencyData &&
      bgmElement &&
      !bgmElement.paused &&
      visualMotionAllowed(),
  )
}

function stopVisualizerLoop(notify = true) {
  if (visualizerFrame) {
    cancelAnimationFrame(visualizerFrame)
    visualizerFrame = 0
  }
  resetBassLevel(notify)
}

function tickVisualizer(now) {
  visualizerFrame = 0
  if (!shouldVisualize()) {
    resetBassLevel()
    return
  }
  if (
    !visualizerLastPaint ||
    now - visualizerLastPaint >= VISUALIZER_PAINT_INTERVAL
  ) {
    visualizerLastPaint = now
    analyser.getByteFrequencyData(frequencyData)

    let total = 0
    let count = 0
    for (let index = bassBinStart; index <= bassBinEnd; index += 1) {
      total += frequencyData[index]
      count += 1
    }

    const normalized = count ? total / count / 255 : 0
    const linear = Math.min(
      1,
      Math.max(0, (normalized - BASS_FLOOR) / BASS_RANGE),
    )
    const target = Math.pow(linear, BASS_CURVE)
    const coefficient = target > bassLevel ? BASS_ATTACK : BASS_RELEASE
    bassLevel += (target - bassLevel) * coefficient
    if (bassLevel < 0.002) bassLevel = 0
    writeBassCssLevel(bassLevel)

    let beat = false
    if (
      bassLevel >= BASS_BEAT_THRESHOLD &&
      bassLevel - bassPrevLevel >= BASS_BEAT_FLUX &&
      now - bassLastBeatAt >= BASS_BEAT_COOLDOWN_MS
    ) {
      beat = true
      bassLastBeatAt = now
    }
    bassPrevLevel = bassLevel
    emitBass(beat)
  }
  visualizerFrame = requestAnimationFrame(tickVisualizer)
}

function startVisualizerLoop() {
  if (typeof window === 'undefined' || visualizerFrame) return
  if (!shouldVisualize()) return
  visualizerFrame = requestAnimationFrame(tickVisualizer)
}

function syncVisualizer() {
  if (!shouldVisualize()) {
    stopVisualizerLoop(true)
    return
  }
  startVisualizerLoop()
}

function startBgm() {
  if (!unlocked || audioMuted.value) return
  const audio = ensureBgmElement()
  if (!audio || bgmUnavailable) return
  ensureBgmGraph(audio)
  if (!audio.paused) {
    syncVisualizer()
    return
  }
  audio.volume = analyser ? 1 : BGM_VOLUME
  const attempt = audio.play()
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      /* 缺失文件或自动播放受限时静默跳过 */
    })
  }
}

function stopBgm() {
  if (!bgmElement) return
  try {
    bgmElement.pause()
  } catch {
    /* noop */
  }
}

function buildEpochDistortionCurve(amount) {
  const samples = 1024
  const curve = new Float32Array(samples)
  const k = Math.max(0.001, amount)
  for (let index = 0; index < samples; index += 1) {
    const x = (index * 2) / (samples - 1) - 1
    curve[index] =
      ((3 + k) * x * 20 * (Math.PI / 180)) /
      (Math.PI + k * Math.abs(x))
  }
  return curve
}

function teardownEpochAudioChain() {
  const state = epochAudio
  epochAudio = null
  if (state?.timer) {
    window.clearInterval(state.timer)
    state.timer = 0
  }
  if (state) {
    try {
      state.filter.disconnect()
    } catch {
      /* noop */
    }
    try {
      state.shaper.disconnect()
    } catch {
      /* noop */
    }
  }
  const audio = bgmElement
  if (audio) {
    try {
      audio.playbackRate = 1
    } catch {
      /* noop */
    }
    try {
      audio.preservesPitch = true
      audio.webkitPreservesPitch = true
    } catch {
      /* noop */
    }
  }
  if (state && context && bgmGain) {
    try {
      bgmGain.connect(context.destination)
    } catch {
      /* noop */
    }
  }
}

function buildEpochAudioChain() {
  if (epochAudio) return epochAudio
  if (!context || !bgmGain) return null
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.value = 16000
  filter.Q.value = 1.1
  const shaper = context.createWaveShaper()
  shaper.curve = buildEpochDistortionCurve(10)
  shaper.oversample = '2x'
  try {
    bgmGain.disconnect()
    bgmGain.connect(filter)
    filter.connect(shaper)
    shaper.connect(context.destination)
  } catch {
    return null
  }
  epochAudio = { filter, shaper, timer: 0 }
  return epochAudio
}

export function startEpochCollapseAudio(durationMs = 24000) {
  if (typeof window === 'undefined' || audioMuted.value) return
  const audio = ensureBgmElement()
  if (!audio || bgmUnavailable) return
  if (!ensureBgmGraph(audio)) return
  if (audio.paused) startBgm()
  const state = buildEpochAudioChain()
  if (!state) return
  if (state.timer) window.clearInterval(state.timer)
  const duration = Math.max(800, durationMs)
  const startedAt = performance.now()
  try {
    audio.preservesPitch = false
    audio.webkitPreservesPitch = false
  } catch {
    /* noop */
  }
  const tick = () => {
    if (epochAudio !== state || !context) return
    const progress = Math.min(1, (performance.now() - startedAt) / duration)
    try {
      audio.playbackRate = Math.max(0.5, 1 - 0.48 * progress)
      state.filter.frequency.setTargetAtTime(
        Math.max(120, 16000 * Math.pow(0.008, progress)),
        context.currentTime,
        0.06,
      )
      state.shaper.curve = buildEpochDistortionCurve(10 + progress * 90)
    } catch {
      /* noop */
    }
    if (progress >= 1 && state.timer) {
      window.clearInterval(state.timer)
      state.timer = 0
    }
  }
  tick()
  state.timer = window.setInterval(tick, 240)
}

export function playEpochShortCircuit() {
  const state = epochAudio
  if (state?.timer) {
    window.clearInterval(state.timer)
    state.timer = 0
  }
  const audio = bgmElement
  if (audio) {
    try {
      audio.playbackRate = 0.5
    } catch {
      /* noop */
    }
  }
  stopBgm()
  stopAllVoices()
  teardownEpochAudioChain()
  if (audioMuted.value) return
  if (!ensureContext() || !masterGain) return
  createTone({
    type: 'sine',
    from: 96,
    to: 24,
    duration: 1.25,
    gain: 0.5,
    kind: 'epoch',
  })
  createTone({
    type: 'sawtooth',
    from: 240,
    to: 38,
    duration: 0.85,
    gain: 0.26,
    filterType: 'lowpass',
    filterFrom: 6400,
    filterTo: 120,
    q: 1.4,
    kind: 'epoch',
  })
  createNoise({
    type: 'bandpass',
    frequency: 3600,
    frequencyTo: 220,
    q: 0.6,
    duration: 0.7,
    gain: 0.34,
    kind: 'epoch',
  })
  createNoise({
    type: 'highpass',
    frequency: 1800,
    duration: 0.22,
    gain: 0.22,
    delay: 0.38,
    kind: 'epoch',
  })
}

export function restoreEpochAudio() {
  teardownEpochAudioChain()
  if (typeof window === 'undefined') return
  if (!audioMuted.value && unlocked) startBgm()
}

/* ---------- 三阶跃迁演出 | 每阶独立声场 | 结束恢复 BGM ---------- */

function scheduleCollapseWhispers(duration, state) {
  if (typeof window === 'undefined') return
  const synth = window.speechSynthesis
  const Utterance = window.SpeechSynthesisUtterance
  const count = 5
  const span = Math.max(900, duration * 680)
  for (let index = 0; index < count; index += 1) {
    const delay = Math.round(280 + (index / count) * span)
    const timer = window.setTimeout(() => {
      if (ascensionCinematicAudio !== state || audioMuted.value) return
      createNoise({
        type: 'bandpass',
        frequency: 1800 + Math.random() * 1600,
        q: 4.5,
        duration: 0.3,
        gain: 0.045,
        kind: 'ascension-cine',
      })
      if (!synth || typeof Utterance !== 'function') return
      try {
        const utterance = new Utterance('Root Access Granted')
        utterance.volume = 0.22
        utterance.rate = 0.68 + (index % 2) * 0.07
        utterance.pitch = 0.1 + (index % 3) * 0.12
        synth.speak(utterance)
      } catch {
        /* noop */
      }
    }, delay)
    state.timers.push(timer)
  }
}

function playReductionCinematicAudio(duration) {
  const singularityAt = duration * 0.72
  const rumbleDuration = duration * 0.84
  createTone({
    type: 'sine',
    from: 54,
    to: 24,
    duration: rumbleDuration,
    gain: 0.34,
    filterType: 'lowpass',
    filterFrom: 170,
    filterTo: 60,
    q: 0.8,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'triangle',
    from: 38,
    to: 18,
    duration: rumbleDuration,
    gain: 0.18,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'lowpass',
    frequency: 820,
    frequencyTo: 110,
    q: 0.7,
    duration: rumbleDuration,
    gain: 0.12,
    kind: 'ascension-cine',
  })
  for (let index = 0; index < 14; index += 1) {
    const at = Math.pow(index / 14, 1.8) * singularityAt
    createNoise({
      type: 'highpass',
      frequency: 1400 + index * 220,
      frequencyTo: 4200 + index * 300,
      q: 0.9,
      duration: 0.08 + index * 0.006,
      gain: 0.05 + index * 0.003,
      delay: at,
      kind: 'ascension-cine',
    })
  }
  createTone({
    type: 'sawtooth',
    from: 180,
    to: 900,
    duration: singularityAt,
    gain: 0.025,
    filterType: 'bandpass',
    filterFrom: 500,
    filterTo: 2600,
    q: 3,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'sine',
    from: 2093,
    to: 2093,
    duration: 0.8,
    gain: 0.2,
    delay: singularityAt,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'sine',
    from: 3136,
    to: 3136,
    duration: 0.55,
    gain: 0.09,
    delay: singularityAt + 0.01,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'highpass',
    frequency: 6000,
    duration: 0.08,
    gain: 0.18,
    delay: singularityAt,
    kind: 'ascension-cine',
  })
}

function playOverloadCinematicAudio(duration) {
  let cursor = 0
  for (let index = 0; index < 10; index += 1) {
    const progress = index / 9
    const step = 0.44 * (1 - progress * 0.62)
    const base = 140 + progress * 120
    createTone({
      type: 'sawtooth',
      from: base,
      to: base * 1.5,
      duration: step * 0.88,
      gain: 0.1 + progress * 0.04,
      delay: cursor,
      filterType: 'lowpass',
      filterFrom: 900,
      filterTo: 380,
      q: 2,
      kind: 'ascension-cine',
    })
    createTone({
      type: 'square',
      from: base * 0.5,
      to: base * 0.5,
      duration: step * 0.88,
      gain: 0.05,
      delay: cursor,
      filterType: 'lowpass',
      filterFrom: 300,
      filterTo: 220,
      q: 1.2,
      kind: 'ascension-cine',
    })
    cursor += step
  }
  for (let index = 0; index < 18; index += 1) {
    createNoise({
      type: 'highpass',
      frequency: 2200 + (index % 4) * 900,
      q: 0.7,
      duration: 0.025 + (index % 3) * 0.012,
      gain: 0.07 + (index % 4) * 0.015,
      delay: 0.1 + ((index * 0.19) % Math.max(0.4, duration - 0.7)),
      kind: 'ascension-cine',
    })
  }
  const flashBase = duration * 0.56
  for (let index = 0; index < 3; index += 1) {
    createNoise({
      type: 'bandpass',
      frequency: 5200,
      q: 4,
      duration: 0.07,
      gain: 0.1,
      delay: flashBase + index * duration * 0.12,
      kind: 'ascension-cine',
    })
  }
  const dropAt = Math.max(0.4, duration - 0.65)
  createTone({
    type: 'sine',
    from: 130,
    to: 22,
    duration: 0.9,
    gain: 0.55,
    delay: dropAt,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'triangle',
    from: 90,
    to: 18,
    duration: 0.8,
    gain: 0.3,
    delay: dropAt,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'lowpass',
    frequency: 620,
    frequencyTo: 80,
    q: 0.8,
    duration: 1.1,
    gain: 0.32,
    delay: dropAt,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'highpass',
    frequency: 3200,
    duration: 0.16,
    gain: 0.2,
    delay: dropAt,
    kind: 'ascension-cine',
  })
}

function playCollapseCinematicAudio(duration, state) {
  createTone({
    type: 'sawtooth',
    from: 55,
    to: 41,
    duration: duration * 0.92,
    gain: 0.16,
    filterType: 'lowpass',
    filterFrom: 520,
    filterTo: 180,
    q: 3.4,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'sawtooth',
    from: 58.6,
    to: 43.4,
    duration: duration * 0.92,
    gain: 0.14,
    filterType: 'lowpass',
    filterFrom: 620,
    filterTo: 140,
    q: 4.2,
    kind: 'ascension-cine',
  })
  createTone({
    type: 'square',
    from: 220,
    to: 176,
    duration: duration * 0.8,
    gain: 0.035,
    filterType: 'bandpass',
    filterFrom: 900,
    filterTo: 300,
    q: 6,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'bandpass',
    frequency: 280,
    frequencyTo: 1200,
    q: 2.5,
    duration: duration * 0.9,
    gain: 0.06,
    kind: 'ascension-cine',
  })
  for (let index = 0; index < 8; index += 1) {
    createTone({
      type: 'square',
      from: 400 + Math.random() * 1200,
      to: 90 + Math.random() * 300,
      duration: 0.07 + Math.random() * 0.08,
      gain: 0.04,
      delay: 0.2 + index * (duration * 0.09),
      kind: 'ascension-cine',
    })
  }
  scheduleCollapseWhispers(duration, state)
  state.timers.push(
    window.setTimeout(() => {
      if (ascensionCinematicAudio !== state) return
      try {
        window.speechSynthesis?.cancel()
      } catch {
        /* noop */
      }
      stopVoicesByKind('ascension-cine')
    }, Math.max(600, duration * 1000 - 420)),
  )
}

function playAscensionReducedCue(tier) {
  const base = tier === 'collapse' ? 150 : tier === 'overload' ? 190 : 250
  createTone({
    type: 'sine',
    from: base,
    to: base * 0.5,
    duration: 0.5,
    gain: 0.18,
    kind: 'ascension-cine',
  })
  createNoise({
    type: 'bandpass',
    frequency: 2400,
    duration: 0.18,
    gain: 0.08,
    kind: 'ascension-cine',
  })
  if (tier === 'reduction') {
    createTone({
      type: 'sine',
      from: 2093,
      to: 2093,
      duration: 0.55,
      gain: 0.14,
      delay: 0.42,
      kind: 'ascension-cine',
    })
  }
}

export function playAscensionCinematicAudio(
  tier,
  durationMs = 3600,
  reduced = false,
) {
  stopAscensionCinematicAudio({ restore: false })
  if (typeof window === 'undefined' || audioMuted.value) return
  const ctx = ensureContext()
  if (!ctx || !masterGain) return
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  stopBgm()
  const duration = Math.max(0.9, durationMs / 1000)
  const state = { tier, timers: [], whisper: tier === 'collapse' }
  ascensionCinematicAudio = state
  if (reduced) {
    playAscensionReducedCue(tier)
    return
  }
  if (tier === 'reduction') playReductionCinematicAudio(duration)
  else if (tier === 'overload') playOverloadCinematicAudio(duration)
  else if (tier === 'collapse') playCollapseCinematicAudio(duration, state)
}

export function stopAscensionCinematicAudio({ restore = true } = {}) {
  const state = ascensionCinematicAudio
  ascensionCinematicAudio = null
  if (state) {
    for (const timer of state.timers) window.clearTimeout(timer)
    state.timers = []
    if (state.whisper) {
      try {
        window.speechSynthesis?.cancel()
      } catch {
        /* noop */
      }
    }
  }
  stopVoicesByKind('ascension-cine')
  if (restore && !audioMuted.value && unlocked) startBgm()
}

function resetCrisisAudioElement() {
  const audio = currentCrisisAudio
  currentCrisisAudio = null
  if (!audio) return
  audio.removeEventListener('error', handleCrisisAudioError)
  try {
    audio.pause()
    audio.currentTime = 0
    audio.removeAttribute('src')
    audio.load()
  } catch {
    /* noop */
  }
}

function handleCrisisAudioError() {
  crisisAudioUnavailable = true
  resetCrisisAudioElement()
  if (crisisAlarmActive && !audioMuted.value) startCrisisFallback()
}

function ensureCrisisAudio() {
  if (typeof window === 'undefined' || typeof Audio !== 'function') return null
  if (currentCrisisAudio) return currentCrisisAudio
  if (crisisAudioUnavailable) return null
  try {
    const audio = new Audio(CRISIS_AUDIO_URL)
    audio.loop = true
    audio.preload = 'auto'
    audio.volume = CRISIS_AUDIO_VOLUME
    audio.addEventListener('error', handleCrisisAudioError)
    currentCrisisAudio = audio
    return audio
  } catch {
    crisisAudioUnavailable = true
    return null
  }
}

function playCrisisFallbackPulse() {
  if (!crisisAlarmActive || audioMuted.value) return
  playCrisisAlarm()
}

function startCrisisFallback() {
  if (typeof window === 'undefined' || crisisFallbackTimer !== null) return
  playCrisisFallbackPulse()
  crisisFallbackTimer = window.setInterval(
    playCrisisFallbackPulse,
    CRISIS_FALLBACK_INTERVAL_MS,
  )
}

function clearCrisisFallbackTimer() {
  if (crisisFallbackTimer === null) return
  window.clearInterval(crisisFallbackTimer)
  crisisFallbackTimer = null
}

function stopCrisisFallbackVoices() {
  clearCrisisFallbackTimer()
  stopVoicesByKind('crisis')
}

function playCrisisAudio() {
  if (!crisisAlarmActive || audioMuted.value) return
  const audio = ensureCrisisAudio()
  if (!audio) {
    startCrisisFallback()
    return
  }
  if (!audio.paused) return
  stopCrisisFallbackVoices()
  const attempt = audio.play()
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(() => {
      if (crisisAlarmActive && !audioMuted.value) startCrisisFallback()
    })
  }
}

function pauseCrisisAlarmPlayback() {
  if (currentCrisisAudio) {
    try {
      currentCrisisAudio.pause()
    } catch {
      /* noop */
    }
  }
  stopCrisisFallbackVoices()
}

export function startCrisisAlarm() {
  crisisAlarmActive = true
  crisisAudioUnavailable = false
  resetCrisisAudioElement()
  stopCrisisFallbackVoices()
  if (audioMuted.value) return
  playCrisisAudio()
}

export function stopCrisisAlarm() {
  crisisAlarmActive = false
  resetCrisisAudioElement()
  stopCrisisFallbackVoices()
}

export function startCrisisQteAudio() {
  qteAudioRequested = true
  if (typeof window === 'undefined' || audioMuted.value || qteAudio) return
  const ctx = ensureContext()
  if (!ctx || !masterGain) return

  try {
    const now = ctx.currentTime
    const humGain = ctx.createGain()
    const humFilter = ctx.createBiquadFilter()
    const humOsc = ctx.createOscillator()
    const humSub = ctx.createOscillator()

    humFilter.type = 'lowpass'
    humFilter.frequency.value = 520
    humFilter.Q.value = 3.4
    humOsc.type = 'sawtooth'
    humOsc.frequency.value = 48
    humSub.type = 'sine'
    humSub.frequency.value = 24
    humGain.gain.setValueAtTime(0.0001, now)
    humGain.gain.exponentialRampToValueAtTime(0.03, now + 0.4)

    humOsc.connect(humFilter)
    humSub.connect(humFilter)
    humFilter.connect(humGain)
    humGain.connect(masterGain)

    const hazardGain = ctx.createGain()
    const hazardFilter = ctx.createBiquadFilter()
    const hazardOsc = ctx.createOscillator()
    const hazardLfo = ctx.createOscillator()
    const hazardLfoGain = ctx.createGain()

    hazardFilter.type = 'bandpass'
    hazardFilter.frequency.value = 1600
    hazardFilter.Q.value = 5.5
    hazardOsc.type = 'square'
    hazardOsc.frequency.value = 760
    hazardGain.gain.value = 0.0001
    hazardLfo.type = 'square'
    hazardLfo.frequency.value = 7
    hazardLfoGain.gain.value = 0.0001

    hazardOsc.connect(hazardFilter)
    hazardFilter.connect(hazardGain)
    hazardGain.connect(masterGain)
    hazardLfo.connect(hazardLfoGain)
    hazardLfoGain.connect(hazardGain.gain)

    humOsc.start(now)
    humSub.start(now)
    hazardOsc.start(now)
    hazardLfo.start(now)

    qteAudio = {
      ctx,
      humOsc,
      humSub,
      humFilter,
      humGain,
      hazardOsc,
      hazardFilter,
      hazardGain,
      hazardLfo,
      hazardLfoGain,
    }
  } catch {
    qteAudio = null
  }
}

export function updateCrisisQteAudio({ safe = true, auto = false, speed = 0 } = {}) {
  const qte = qteAudio
  if (!qte || qte.ctx !== context) return
  const now = qte.ctx.currentTime
  const clamped = Math.max(0, Math.min(180, Number(speed) || 0))

  try {
    qte.humOsc.frequency.setTargetAtTime(48 + (clamped / 180) * 46, now, 0.06)
    qte.humSub.frequency.setTargetAtTime(24 + (clamped / 180) * 23, now, 0.06)
    qte.humFilter.frequency.setTargetAtTime(
      safe ? 480 + clamped * 1.6 : 1500,
      now,
      0.08,
    )
    qte.humGain.gain.setTargetAtTime(
      auto ? 0.016 : safe ? 0.03 + clamped * 0.00004 : 0.04,
      now,
      0.08,
    )
    qte.hazardGain.gain.setTargetAtTime(safe ? 0.0001 : 0.03, now, safe ? 0.08 : 0.02)
    qte.hazardLfoGain.gain.setTargetAtTime(
      safe ? 0.0001 : 0.022,
      now,
      safe ? 0.08 : 0.02,
    )
    qte.hazardLfo.frequency.setTargetAtTime(safe ? 7 : 14, now, 0.08)
    qte.hazardOsc.frequency.setTargetAtTime(safe ? 640 : 980, now, 0.05)
    qte.hazardFilter.frequency.setTargetAtTime(safe ? 1600 : 2400, now, 0.05)
  } catch {
    /* noop */
  }
}

export function stopCrisisQteAudio() {
  qteAudioRequested = false
  const qte = qteAudio
  qteAudio = null
  if (!qte) return

  const now = qte.ctx.currentTime
  try {
    qte.humGain.gain.cancelScheduledValues(now)
    qte.humGain.gain.setTargetAtTime(0.0001, now, 0.04)
    qte.hazardGain.gain.cancelScheduledValues(now)
    qte.hazardGain.gain.setTargetAtTime(0.0001, now, 0.02)
  } catch {
    /* noop */
  }

  qteTeardownTimer = window.setTimeout(() => {
    qteTeardownTimer = null
    for (const node of [
      qte.humOsc,
      qte.humSub,
      qte.hazardOsc,
      qte.hazardLfo,
    ]) {
      try {
        node.stop()
      } catch {
        /* noop */
      }
    }
    for (const node of [
      qte.humOsc,
      qte.humSub,
      qte.humFilter,
      qte.humGain,
      qte.hazardOsc,
      qte.hazardFilter,
      qte.hazardGain,
      qte.hazardLfo,
      qte.hazardLfoGain,
    ]) {
      try {
        node.disconnect()
      } catch {
        /* noop */
      }
    }
  }, 160)
}

export function getBassLevel() {
  return bassLevel
}

export function subscribeBassVisualizer(listener) {
  if (typeof listener !== 'function') return () => {}
  bassSubscribers.add(listener)
  listener({ level: bassLevel, beat: false })
  syncVisualizer()
  return () => {
    bassSubscribers.delete(listener)
  }
}

function loadSfxSamples() {
  if (!SFX_SAMPLES_ENABLED || sampleLoading || !context) return
  sampleLoading = true
  for (const [type, url] of Object.entries(SFX_SAMPLE_URLS)) {
    if (sampleBuffers.has(type) || samplesUnavailable.has(type)) continue
    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error('sample unavailable')
        return response.arrayBuffer()
      })
      .then((data) => context.decodeAudioData(data))
      .then((buffer) => {
        if (buffer && context) sampleBuffers.set(type, buffer)
      })
      .catch(() => {
        samplesUnavailable.add(type)
      })
  }
}

function ensureContext() {
  if (typeof window === 'undefined') return null
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext
  if (!AudioContextCtor) return null

  if (!context) {
    try {
      context = new AudioContextCtor()
      compressor = context.createDynamicsCompressor()
      compressor.threshold.value = -18
      compressor.knee.value = 20
      compressor.ratio.value = 4
      compressor.attack.value = 0.003
      compressor.release.value = 0.24
      masterGain = context.createGain()
      masterGain.gain.value = audioMuted.value ? 0.0001 : MASTER_VOLUME
      masterGain.connect(compressor)
      compressor.connect(context.destination)
    } catch {
      context = null
      masterGain = null
      compressor = null
      return null
    }
  }

  if (!audioMuted.value && context.state === 'suspended') {
    context.resume().catch(() => {})
  } else if (audioMuted.value && context.state === 'running') {
    context.suspend().catch(() => {})
  }
  return context
}

export function unlockAudio() {
  if (typeof window === 'undefined') return
  const firstUnlock = !unlocked
  unlocked = true
  const ctx = ensureContext()
  if (ctx && !audioMuted.value && ctx.state !== 'running') {
    ctx.resume().catch(() => {})
  }
  startBgm()
  if (firstUnlock) loadSfxSamples()
  if (crisisAlarmActive && !audioMuted.value) playCrisisAudio()
  if (qteAudioRequested) startCrisisQteAudio()
}

export function disposeAudio() {
  unlocked = false
  stopAscensionCinematicAudio({ restore: false })
  teardownEpochAudioChain()
  stopCrisisQteAudio()
  stopCrisisAlarm()
  stopAllVoices()
  activeVoices.clear()
  lastPlayedAt.clear()
  noiseBuffer = null
  sampleLoading = false
  sampleBuffers.clear()
  samplesUnavailable.clear()
  stopBgm()
  stopVisualizerLoop()
  analyser = null
  audioSource = null
  bgmGain = null
  frequencyData = null
  const audio = bgmElement
  bgmElement = null
  bgmUnavailable = false
  if (audio) {
    audio.removeEventListener('error', handleBgmError)
    audio.removeEventListener('play', handleBgmPlay)
    audio.removeEventListener('pause', handleBgmPause)
    try {
      audio.pause()
      audio.removeAttribute('src')
      audio.load()
    } catch {
      /* noop */
    }
  }
  if (suspendTimer !== null) {
    clearTimeout(suspendTimer)
    suspendTimer = null
  }
  if (qteTeardownTimer !== null) {
    window.clearTimeout(qteTeardownTimer)
    qteTeardownTimer = null
  }
  if (context) {
    try {
      const closing = context.close()
      if (closing && typeof closing.catch === 'function') closing.catch(() => {})
    } catch {
      /* noop */
    }
  }
  context = null
  masterGain = null
  compressor = null
}

function applyMuteState() {
  if (suspendTimer !== null) {
    clearTimeout(suspendTimer)
    suspendTimer = null
  }
  if (audioMuted.value) {
    stopBgm()
    stopVisualizerLoop()
    pauseCrisisAlarmPlayback()
    if (ascensionCinematicAudio?.whisper) {
      try {
        window.speechSynthesis?.cancel()
      } catch {
        /* noop */
      }
    }
  } else if (unlocked) {
    if (!ascensionCinematicAudio) startBgm()
    if (crisisAlarmActive) playCrisisAudio()
    if (qteAudioRequested) startCrisisQteAudio()
  }
  if (!context || !masterGain) return

  const now = context.currentTime
  try {
    masterGain.gain.cancelScheduledValues(now)
    masterGain.gain.setTargetAtTime(
      audioMuted.value ? 0.0001 : MASTER_VOLUME,
      now,
      0.015,
    )
  } catch {
    masterGain.gain.value = audioMuted.value ? 0.0001 : MASTER_VOLUME
  }

  if (audioMuted.value) {
    suspendTimer = setTimeout(() => {
      suspendTimer = null
      if (!context || !audioMuted.value) return
      if (context.state === 'running') {
        context.suspend().catch(() => {})
      }
    }, SUSPEND_DELAY_MS)
  } else if (context.state === 'suspended') {
    context.resume().catch(() => {})
  }

  if (!audioMuted.value && bgmElement && !bgmElement.paused) {
    syncVisualizer()
  }
}

export function setAudioMuted(muted) {
  setMuted(Boolean(muted))
  applyMuteState()
}

export function toggleAudioMute() {
  const nextMuted = !audioMuted.value
  setMuted(nextMuted)
  if (!nextMuted) {
    unlocked = true
    const ctx = ensureContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    applyMuteState()
    loadSfxSamples()
    playSound('click')
  } else {
    applyMuteState()
  }
  return nextMuted
}

function trackVoice(sourceNode, nodes, kind = 'sfx') {
  const voice = {
    sourceNode,
    nodes,
    kind,
    released: false,
    stop() {
      try {
        sourceNode.stop()
      } catch {
        /* noop */
      }
      release()
    },
  }
  activeVoices.add(voice)
  const release = () => {
    if (voice.released) return
    voice.released = true
    activeVoices.delete(voice)
    for (const node of nodes) {
      try {
        node.disconnect()
      } catch {
        /* noop */
      }
    }
  }
  sourceNode.addEventListener('ended', release, { once: true })
  return voice
}

function stopVoicesByKind(kind) {
  for (const voice of [...activeVoices]) {
    if (voice.kind === kind) voice.stop()
  }
}

function stopAllVoices() {
  for (const voice of [...activeVoices]) voice.stop()
}

function createTone({
  type = 'sine',
  from = 440,
  to = from,
  duration = 0.14,
  gain = 0.1,
  delay = 0,
  ramp = 'exponential',
  filterType = 'lowpass',
  filterFrom,
  filterTo,
  q = 1,
  kind = 'sfx',
}) {
  if (!context || !masterGain) return
  const startAt = context.currentTime + SCHEDULE_LEAD + delay
  const fromFreq = Math.max(20, from)
  const toFreq = Math.max(20, to)
  const attack = Math.min(0.018, duration * 0.3)

  const oscillator = context.createOscillator()
  const envelope = context.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(fromFreq, startAt)
  if (toFreq !== fromFreq) {
    if (ramp === 'linear') {
      oscillator.frequency.linearRampToValueAtTime(toFreq, startAt + duration)
    } else {
      oscillator.frequency.exponentialRampToValueAtTime(toFreq, startAt + duration)
    }
  }

  envelope.gain.setValueAtTime(0.0001, startAt)
  envelope.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, gain),
    startAt + attack,
  )
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  let tail = oscillator
  let filter = null
  if (filterFrom && filterTo) {
    filter = context.createBiquadFilter()
    filter.type = filterType
    filter.Q.value = q
    filter.frequency.setValueAtTime(Math.max(40, filterFrom), startAt)
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, filterTo),
      startAt + duration,
    )
    oscillator.connect(filter)
    tail = filter
  }

  tail.connect(envelope)
  envelope.connect(masterGain)
  oscillator.start(startAt)
  oscillator.stop(startAt + duration + 0.05)
  trackVoice(
    oscillator,
    filter ? [oscillator, filter, envelope] : [oscillator, envelope],
    kind,
  )
}

function getNoiseBuffer() {
  if (!context) return null
  if (noiseBuffer && noiseBuffer.sampleRate === context.sampleRate) {
    return noiseBuffer
  }
  const length = Math.floor(context.sampleRate * 4)
  noiseBuffer = context.createBuffer(1, length, context.sampleRate)
  const data = noiseBuffer.getChannelData(0)
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1
  }
  return noiseBuffer
}

function createNoise({
  type = 'bandpass',
  frequency = 1200,
  frequencyTo,
  q = 1,
  duration = 0.06,
  gain = 0.1,
  delay = 0,
  kind = 'sfx',
}) {
  if (!context || !masterGain) return
  const buffer = getNoiseBuffer()
  if (!buffer) return

  const startAt = context.currentTime + SCHEDULE_LEAD + delay
  const attack = Math.min(0.012, duration * 0.4)
  const source = context.createBufferSource()
  source.buffer = buffer

  const filter = context.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(Math.max(40, frequency), startAt)
  if (frequencyTo) {
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(40, frequencyTo),
      startAt + duration,
    )
  }

  const envelope = context.createGain()
  envelope.gain.setValueAtTime(0.0001, startAt)
  envelope.gain.exponentialRampToValueAtTime(
    Math.max(0.0002, gain),
    startAt + attack,
  )
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  source.connect(filter)
  filter.connect(envelope)
  envelope.connect(masterGain)

  const offset = Math.random() * Math.max(0, buffer.duration - duration - 0.1)
  source.start(startAt, offset)
  source.stop(startAt + duration + 0.02)
  trackVoice(source, [source, filter, envelope], kind)
}

function playClickTick() {
  const base = 480 + Math.random() * 80
  createTone({
    type: 'sine',
    from: base,
    to: base * 0.66,
    duration: 0.05,
    gain: 0.15,
    filterType: 'lowpass',
    filterFrom: 1200,
    filterTo: 480,
    q: 0.7,
  })
  createTone({
    type: 'triangle',
    from: 760,
    to: 520,
    duration: 0.018,
    gain: 0.04,
  })
  createNoise({
    type: 'lowpass',
    frequency: 1100,
    frequencyTo: 420,
    q: 0.8,
    duration: 0.028,
    gain: 0.045,
  })
}

function playAutoClickTick() {
  const base = 540 + Math.random() * 60
  createTone({
    type: 'sine',
    from: base,
    to: base * 0.72,
    duration: 0.042,
    gain: 0.055,
    filterType: 'lowpass',
    filterFrom: 1080,
    filterTo: 420,
    q: 0.7,
  })
  createTone({
    type: 'triangle',
    from: 820,
    to: 560,
    duration: 0.016,
    gain: 0.016,
  })
}

function playBuyThock() {
  createNoise({
    type: 'bandpass',
    frequency: 1500,
    frequencyTo: 900,
    q: 1,
    duration: 0.045,
    gain: 0.1,
  })
  createTone({
    type: 'triangle',
    from: 300,
    to: 170,
    duration: 0.085,
    gain: 0.17,
    filterType: 'lowpass',
    filterFrom: 820,
    filterTo: 320,
    q: 0.8,
  })
  createTone({
    type: 'sine',
    from: 120,
    to: 82,
    duration: 0.1,
    gain: 0.14,
  })
}

function playUpgradeChime() {
  createNoise({
    type: 'lowpass',
    frequency: 900,
    frequencyTo: 600,
    duration: 0.03,
    gain: 0.03,
  })
  createTone({
    type: 'sine',
    from: 523.25,
    to: 523.25,
    duration: 0.26,
    gain: 0.09,
  })
  createTone({
    type: 'sine',
    from: 659.25,
    to: 659.25,
    duration: 0.32,
    gain: 0.075,
    delay: 0.085,
  })
  createTone({
    type: 'triangle',
    from: 392,
    to: 392,
    duration: 0.22,
    gain: 0.05,
  })
}

function playAscensionBestCue() {
  createTone({
    type: 'sine',
    from: 1318.5,
    to: 1318.5,
    duration: 0.2,
    gain: 0.075,
  })
  createTone({
    type: 'sine',
    from: 1760,
    to: 1760,
    duration: 0.3,
    gain: 0.055,
    delay: 0.07,
  })
  createTone({
    type: 'triangle',
    from: 2637,
    to: 2637,
    duration: 0.16,
    gain: 0.032,
    delay: 0.13,
  })
  createNoise({
    type: 'highpass',
    frequency: 4200,
    frequencyTo: 6200,
    duration: 0.08,
    gain: 0.016,
  })
}

function playCrisisAlarm() {
  if (!context || !masterGain) return
  const startAt = context.currentTime + SCHEDULE_LEAD
  const duration = 1.5

  const oscillator = context.createOscillator()
  const filter = context.createBiquadFilter()
  const envelope = context.createGain()
  const tremolo = context.createGain()
  const lfo = context.createOscillator()
  const lfoGain = context.createGain()

  oscillator.type = 'sawtooth'
  oscillator.frequency.setValueAtTime(56, startAt)
  oscillator.frequency.exponentialRampToValueAtTime(44, startAt + duration)
  filter.type = 'lowpass'
  filter.Q.value = 6
  filter.frequency.setValueAtTime(520, startAt)
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(5.4, startAt)
  lfoGain.gain.setValueAtTime(0.18, startAt)
  tremolo.gain.setValueAtTime(0.8, startAt)

  envelope.gain.setValueAtTime(0.0001, startAt)
  envelope.gain.exponentialRampToValueAtTime(0.26, startAt + 0.06)
  envelope.gain.setValueAtTime(0.26, startAt + duration - 0.18)
  envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)

  oscillator.connect(filter)
  filter.connect(envelope)
  envelope.connect(tremolo)
  tremolo.connect(masterGain)
  lfo.connect(lfoGain)
  lfoGain.connect(tremolo.gain)

  oscillator.start(startAt)
  lfo.start(startAt)
  oscillator.stop(startAt + duration + 0.05)
  lfo.stop(startAt + duration + 0.05)
  trackVoice(
    oscillator,
    [oscillator, filter, envelope, tremolo, lfo, lfoGain],
    'crisis',
  )

  createTone({
    type: 'sine',
    from: 112,
    to: 96,
    duration: 1.3,
    gain: 0.12,
    kind: 'crisis',
  })
  createTone({
    type: 'sine',
    from: 38,
    to: 29,
    duration: 1.35,
    gain: 0.18,
    kind: 'crisis',
  })
}

function playLowRumble() {
  if (!context || !masterGain) return
  const startAt = context.currentTime + SCHEDULE_LEAD
  const duration = 2

  const sub = context.createOscillator()
  const subGain = context.createGain()
  sub.type = 'sine'
  sub.frequency.setValueAtTime(52, startAt)
  sub.frequency.exponentialRampToValueAtTime(28, startAt + duration)
  subGain.gain.setValueAtTime(0.0001, startAt)
  subGain.gain.exponentialRampToValueAtTime(0.34, startAt + 0.16)
  subGain.gain.setValueAtTime(0.34, startAt + 1.3)
  subGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  sub.connect(subGain)
  subGain.connect(masterGain)
  sub.start(startAt)
  sub.stop(startAt + duration + 0.05)
  trackVoice(sub, [sub, subGain])

  createTone({
    type: 'triangle',
    from: 96,
    to: 44,
    duration: 1.95,
    gain: 0.13,
    filterType: 'lowpass',
    filterFrom: 300,
    filterTo: 110,
    q: 0.8,
  })

  const buffer = getNoiseBuffer()
  if (!buffer) return
  const noise = context.createBufferSource()
  noise.buffer = buffer
  const filter = context.createBiquadFilter()
  filter.type = 'lowpass'
  filter.frequency.setValueAtTime(560, startAt)
  filter.frequency.exponentialRampToValueAtTime(130, startAt + duration)
  filter.Q.value = 0.7
  const noiseGain = context.createGain()
  noiseGain.gain.setValueAtTime(0.0001, startAt)
  noiseGain.gain.exponentialRampToValueAtTime(0.11, startAt + 0.32)
  noiseGain.gain.setValueAtTime(0.11, startAt + 1.4)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration)
  noise.connect(filter)
  filter.connect(noiseGain)
  noiseGain.connect(masterGain)
  const offset = Math.random() * Math.max(0, buffer.duration - duration - 0.1)
  noise.start(startAt, offset)
  noise.stop(startAt + duration + 0.02)
  trackVoice(noise, [noise, filter, noiseGain])
}

function playQteNudge() {
  createTone({
    type: 'triangle',
    from: 220,
    to: 150,
    duration: 0.065,
    gain: 0.1,
    filterType: 'bandpass',
    filterFrom: 520,
    filterTo: 300,
    q: 2.2,
    kind: 'qte',
  })
  createNoise({
    type: 'bandpass',
    frequency: 2100,
    frequencyTo: 1000,
    q: 2.4,
    duration: 0.035,
    gain: 0.045,
    kind: 'qte',
  })
}

function playQteWin() {
  createTone({
    type: 'sine',
    from: 1046.5,
    to: 1046.5,
    duration: 0.5,
    gain: 0.12,
    kind: 'qte',
  })
  createTone({
    type: 'sine',
    from: 1318.5,
    to: 1318.5,
    duration: 0.55,
    gain: 0.08,
    delay: 0.06,
    kind: 'qte',
  })
  createTone({
    type: 'sine',
    from: 1568,
    to: 1568,
    duration: 0.75,
    gain: 0.075,
    delay: 0.12,
    kind: 'qte',
  })
  createTone({
    type: 'triangle',
    from: 2093,
    to: 2093,
    duration: 0.55,
    gain: 0.035,
    delay: 0.2,
    kind: 'qte',
  })
  createNoise({
    type: 'highpass',
    frequency: 3200,
    duration: 0.06,
    gain: 0.025,
    delay: 0.02,
    kind: 'qte',
  })
}

function playQteFail() {
  createNoise({
    type: 'lowpass',
    frequency: 2400,
    frequencyTo: 180,
    q: 0.8,
    duration: 0.7,
    gain: 0.16,
    kind: 'qte',
  })
  createTone({
    type: 'sawtooth',
    from: 240,
    to: 38,
    duration: 1.1,
    gain: 0.2,
    filterType: 'lowpass',
    filterFrom: 1600,
    filterTo: 140,
    q: 5,
    kind: 'qte',
  })
  createTone({
    type: 'sine',
    from: 70,
    to: 34,
    duration: 1,
    gain: 0.18,
    kind: 'qte',
  })
  for (let index = 0; index < 5; index += 1) {
    createNoise({
      type: 'highpass',
      frequency: 800 + index * 500,
      frequencyTo: 300,
      q: 1.6,
      duration: 0.05,
      gain: 0.06,
      delay: 0.08 + index * 0.075,
      kind: 'qte',
    })
  }
}

function playAchievementFanfare(tier) {
  if (!context || !masterGain) return

  if (tier >= 5) {
    createTone({ type: 'sine', from: 168, to: 28, duration: 2.8, gain: 0.3 })
    createTone({
      type: 'sawtooth',
      from: 58,
      to: 2400,
      duration: 2.3,
      gain: 0.09,
      filterFrom: 160,
      filterTo: 8600,
    })
    const fanfare = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98, 2093]
    fanfare.forEach((freq, index) => {
      createTone({
        type: 'triangle',
        from: freq,
        to: freq,
        duration: 1.5,
        gain: 0.07,
        delay: 0.2 + index * 0.13,
      })
    })
    ;[392, 587.33, 783.99, 1174.66].forEach((freq) => {
      createTone({
        type: 'sine',
        from: freq,
        to: freq,
        duration: 2.6,
        gain: 0.048,
        delay: 0.12,
      })
    })
    for (let index = 0; index < 9; index += 1) {
      const sparkle = 2400 + Math.random() * 1600
      createTone({
        type: 'sine',
        from: sparkle,
        to: sparkle * 1.35,
        duration: 0.22,
        gain: 0.016,
        delay: 0.5 + index * 0.2,
      })
    }
    return
  }

  const sequences = {
    1: [523.25, 659.25],
    2: [523.25, 659.25, 783.99],
    3: [523.25, 659.25, 783.99, 1046.5],
    4: [392, 523.25, 659.25, 783.99, 1046.5],
  }
  const notes = sequences[tier] ?? sequences[1]
  const step = tier >= 4 ? 0.14 : 0.11

  notes.forEach((freq, index) => {
    createTone({
      type: tier >= 3 ? 'triangle' : 'sine',
      from: freq,
      to: freq,
      duration: tier >= 4 ? 0.95 : 0.34,
      gain: 0.06 + tier * 0.009,
      delay: index * step,
    })
  })

  if (tier >= 3) {
    createTone({
      type: 'sine',
      from: notes[notes.length - 1] * 2,
      to: notes[notes.length - 1] * 2,
      duration: 0.55,
      gain: 0.028,
      delay: notes.length * step,
    })
  }

  if (tier >= 4) {
    createTone({ type: 'sine', from: 86, to: 42, duration: 1.5, gain: 0.18 })
    createTone({
      type: 'sawtooth',
      from: 110,
      to: 1300,
      duration: 1.15,
      gain: 0.055,
      filterFrom: 240,
      filterTo: 6400,
      delay: 0.08,
    })
  }
}

function playSample(type) {
  if (!SFX_SAMPLES_ENABLED) return false
  const buffer = sampleBuffers.get(type)
  if (!buffer || !context || !masterGain) return false
  try {
    const source = context.createBufferSource()
    const gain = context.createGain()
    source.buffer = buffer
    gain.gain.value = SFX_SAMPLE_GAIN[type] ?? 0.6
    source.connect(gain)
    gain.connect(masterGain)
    source.start(context.currentTime + SCHEDULE_LEAD)
    trackVoice(source, [source, gain], type)
    return true
  } catch {
    return false
  }
}

function playSoundType(type) {
  try {
    if (playSample(type)) return
    switch (type) {
      case 'click': {
        playClickTick()
        break
      }
      case 'auto-click': {
        playAutoClickTick()
        break
      }
      case 'buy': {
        playBuyThock()
        break
      }
      case 'upgrade': {
        playUpgradeChime()
        break
      }
      case 'crisis': {
        if (!crisisAlarmActive) playCrisisAlarm()
        break
      }
      case 'ascend': {
        playLowRumble()
        break
      }
      case 'ascension-best': {
        playAscensionBestCue()
        break
      }
      case 'qte-nudge': {
        playQteNudge()
        break
      }
      case 'qte-win': {
        playQteWin()
        break
      }
      case 'qte-fail': {
        playQteFail()
        break
      }
      case 'achievement-1':
      case 'achievement-2':
      case 'achievement-3':
      case 'achievement-4':
      case 'achievement-5':
      case 'achievement-6': {
        playAchievementFanfare(Number(type.slice(-1)))
        break
      }
      default:
        break
    }
  } catch {
    /* audio failures must never break the game loop */
  }
}

export function playSound(type) {
  if (audioMuted.value || typeof window === 'undefined') return
  if (type === 'crisis' && crisisAlarmActive) return

  let ctx = context
  if (!ctx) {
    if (!unlocked) return
    ctx = ensureContext()
    if (!ctx) return
  }
  if (!unlocked && ctx.state !== 'running') return
  if (activeVoices.size >= MAX_VOICES) return

  const now = performance.now()
  const last = lastPlayedAt.get(type) ?? -Infinity
  if (now - last < (THROTTLE_MS[type] ?? 40)) return
  lastPlayedAt.set(type, now)

  if (ctx.state === 'running') {
    playSoundType(type)
    return
  }

  ctx.resume()
    .then(() => {
      if (audioMuted.value || activeVoices.size >= MAX_VOICES) return
      playSoundType(type)
    })
    .catch(() => {})
}
