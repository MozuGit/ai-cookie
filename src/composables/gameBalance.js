export const GAME_BALANCE = Object.freeze({
  server: Object.freeze({
    priceGrowth: 1.15,
    priceCap: 1e308,
    tiers: Object.freeze([
      { id: 'laptop', basePrice: 20, baseCps: 1 },
      { id: 'desktop', basePrice: 150, baseCps: 8 },
      { id: 'rack', basePrice: 900, baseCps: 64 },
      { id: 'farm', basePrice: 5_000, baseCps: 512 },
      { id: 'liquid', basePrice: 30_000, baseCps: 4_096 },
      { id: 'supercomputer', basePrice: 200_000, baseCps: 32_768 },
      { id: 'reactor', basePrice: 1_200_000, baseCps: 262_144 },
      { id: 'dyson', basePrice: 8_000_000, baseCps: 2_000_000 },
    ]),
  }),
  algorithmCosts: Object.freeze({
    multithread: 100,
    routing: 3_000,
    quantumCache: 100_000,
    geekRush: 1_000_000,
    classLeap: 10_000_000,
    neuralPreload: 100_000_000,
    overclockCore: 1_000_000_000,
    foundationBoost: 10_000_000_000,
    logSingularity: 100_000_000_000,
    dimensionSurge: 500_000_000_000,
  }),
  matrix: Object.freeze({
    costGrowth: 2.5,
  }),
  purchase: Object.freeze({
    maxSearchQuantity: 1000,
  }),
})

const DEFAULT_GROWTH = GAME_BALANCE.server.priceGrowth
const PRICE_CAP = GAME_BALANCE.server.priceCap

function normalizeCount(value) {
  const count = Number(value)
  if (Number.isNaN(count) || count <= 0) return 0
  if (!Number.isFinite(count)) return Number.MAX_SAFE_INTEGER
  return Math.floor(count)
}

function normalizeMultiplier(value) {
  const multiplier = Number(value)
  if (!Number.isFinite(multiplier) || multiplier <= 0) return 1
  return multiplier
}

function normalizeGrowth(value) {
  const growth = Number(value)
  if (!Number.isFinite(growth) || growth <= 1) return DEFAULT_GROWTH
  return growth
}

export function calculatePrice(
  basePrice,
  count,
  buyAmount,
  priceMultiplier = 1,
  priceGrowth = DEFAULT_GROWTH,
) {
  const base = Number(basePrice)
  if (!Number.isFinite(base) || base <= 0) return 0

  const amount = normalizeCount(buyAmount)
  if (amount <= 0) return 0

  const owned = normalizeCount(count)
  const multiplier = normalizeMultiplier(priceMultiplier)
  const growth = normalizeGrowth(priceGrowth)
  const logGrowth = Math.log10(growth)

  if (Math.log10(base * multiplier) + owned * logGrowth >= Math.log10(PRICE_CAP)) {
    return Infinity
  }

  const firstUnit = base * multiplier * Math.pow(growth, owned)
  if (!Number.isFinite(firstUnit) || firstUnit <= 0) return Infinity

  const series = Math.expm1(amount * Math.log(growth)) / Math.expm1(Math.log(growth))
  const rawTotal = firstUnit * series
  if (!Number.isFinite(rawTotal) || rawTotal >= PRICE_CAP) return Infinity

  const rounded = Math.round(rawTotal)
  const tolerance = Math.max(1, Math.abs(rawTotal)) * Number.EPSILON * 8
  const total = Math.abs(rawTotal - rounded) <= tolerance ? rounded : rawTotal
  return Math.max(1, Math.floor(total))
}