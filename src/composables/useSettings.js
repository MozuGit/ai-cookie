import { computed, ref } from 'vue'

const SETTINGS_STORAGE_KEY = 'ai-cookie.settings.v1'
const LEGACY_AUDIO_KEY = 'ai-cookie.audio.v1'

const NUMBER_FORMATS = ['scientific', 'compact', 'chinese']
const MOBILE_QUERY = '(max-width: 768px)'

function isMobileViewport() {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia(MOBILE_QUERY).matches
    )
  } catch {
    return false
  }
}

const DEFAULTS = {
  version: 2,
  numberFormat: 'compact',
  muted: false,
  reducedMotion: isMobileViewport(),
  showConfirm: true,
  guides: true,
}

function readLegacyMuted() {
  try {
    const raw = localStorage.getItem(LEGACY_AUDIO_KEY)
    if (!raw) return false
    return Boolean(JSON.parse(raw)?.muted)
  } catch {
    return false
  }
}

function readSettings() {
  const fallback = { ...DEFAULTS, muted: readLegacyMuted() }
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw)
    return {
      version: 2,
      numberFormat: NUMBER_FORMATS.includes(parsed?.numberFormat)
        ? parsed.numberFormat
        : fallback.numberFormat,
      muted: typeof parsed?.muted === 'boolean' ? parsed.muted : fallback.muted,
      reducedMotion:
        typeof parsed?.reducedMotion === 'boolean'
          ? parsed.reducedMotion
          : fallback.reducedMotion,
      showConfirm:
        typeof parsed?.showConfirm === 'boolean'
          ? parsed.showConfirm
          : fallback.showConfirm,
      guides: typeof parsed?.guides === 'boolean' ? parsed.guides : fallback.guides,
    }
  } catch {
    return fallback
  }
}

export const settings = ref(readSettings())

export const numberFormatMode = computed(() => settings.value.numberFormat)
export const muted = computed(() => settings.value.muted)
export const reducedMotion = computed(() => settings.value.reducedMotion)
export const showConfirm = computed(() => settings.value.showConfirm)
export const guidesEnabled = computed(() => settings.value.guides)

function persist() {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings.value))
  } catch {
    /* noop */
  }
}

export function setNumberFormat(mode) {
  const next = NUMBER_FORMATS.includes(mode) ? mode : DEFAULTS.numberFormat
  if (settings.value.numberFormat === next) return
  settings.value = { ...settings.value, numberFormat: next }
  persist()
}

export function setMuted(muted) {
  const next = Boolean(muted)
  if (settings.value.muted === next) return
  settings.value = { ...settings.value, muted: next }
  persist()
}

export function setReducedMotion(reduced) {
  const next = Boolean(reduced)
  if (settings.value.reducedMotion === next) return
  settings.value = { ...settings.value, reducedMotion: next }
  persist()
}

export function setShowConfirm(confirm) {
  const next = Boolean(confirm)
  if (settings.value.showConfirm === next) return
  settings.value = { ...settings.value, showConfirm: next }
  persist()
}

export function setGuidesEnabled(enabled) {
  const next = Boolean(enabled)
  if (settings.value.guides === next) return
  settings.value = { ...settings.value, guides: next }
  persist()
}

persist()

export const SETTINGS_KEY = SETTINGS_STORAGE_KEY
