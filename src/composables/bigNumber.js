const MAX_EXPONENT = 10_000
const MIN_EXPONENT = -400
const MAX_MANTISSA = 10

function normalize(mantissa, exponent) {
  let m = Number(mantissa)
  let e = Number(exponent)

  if (Number.isNaN(m) || Number.isNaN(e)) return { m: 0, e: 0 }
  if (m <= 0) return { m: 0, e: 0 }
  if (!Number.isFinite(m)) {
    return { m: 1, e: MAX_EXPONENT }
  }
  if (!Number.isFinite(e)) {
    return { m: 1, e: e > 0 ? MAX_EXPONENT : MIN_EXPONENT }
  }

  const shift = Math.floor(Math.log10(m))
  m /= 10 ** shift
  e += shift

  if (m >= MAX_MANTISSA) {
    m /= 10
    e += 1
  } else if (m < 1) {
    m *= 10
    e -= 1
  }

  if (e > MAX_EXPONENT) return { m: 1, e: MAX_EXPONENT }
  if (e < MIN_EXPONENT) return { m: 0, e: 0 }
  if (m <= 0) return { m: 0, e: 0 }

  return { m, e }
}

export class BigNum {
  constructor(mantissa = 0, exponent = 0) {
    const normalized = normalize(mantissa, exponent)
    this.m = normalized.m
    this.e = normalized.e
  }

  static zero() {
    return new BigNum(0, 0)
  }

  static one() {
    return new BigNum(1, 0)
  }

  static from(value) {
    if (value instanceof BigNum) return value
    if (value === null || value === undefined) return BigNum.zero()

    if (typeof value === 'number') {
      if (Number.isNaN(value)) return BigNum.zero()
      if (!Number.isFinite(value)) {
        return value > 0 ? new BigNum(1, MAX_EXPONENT) : BigNum.zero()
      }
      if (value === 0) return BigNum.zero()
      if (value < 0) return BigNum.zero()
      return new BigNum(value, 0)
    }

    if (typeof value === 'string') {
      const trimmed = value.trim()
      const match = trimmed.match(/^([\d.]+)(?:e([+-]?\d+))?$/i)
      if (!match) {
        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? BigNum.from(parsed) : BigNum.zero()
      }
      const mantissa = Number.parseFloat(match[1])
      const exponent = match[2] ? Number.parseInt(match[2], 10) : 0
      return new BigNum(mantissa, exponent)
    }

    if (typeof value === 'object') {
      if (Number.isFinite(Number(value.m)) && Number.isFinite(Number(value.e))) {
        return new BigNum(Number(value.m), Number(value.e))
      }
      if (
        Number.isFinite(Number(value.mantissa)) &&
        Number.isFinite(Number(value.exponent))
      ) {
        return new BigNum(Number(value.mantissa), Number(value.exponent))
      }
    }

    return BigNum.zero()
  }

  clone() {
    return new BigNum(this.m, this.e)
  }

  isZero() {
    return this.m === 0
  }

  isFinite() {
    return this.e < MAX_EXPONENT
  }

  add(value) {
    const other = BigNum.from(value)
    if (other.isZero()) return this.clone()
    if (this.isZero()) return other.clone()

    const diff = this.e - other.e
    if (diff > 16) return this.clone()
    if (diff < -16) return other.clone()

    if (diff >= 0) {
      return new BigNum(this.m + other.m / 10 ** diff, this.e)
    }
    return new BigNum(other.m + this.m / 10 ** -diff, other.e)
  }

  sub(value) {
    const other = BigNum.from(value)
    if (other.isZero()) return this.clone()
    if (this.isZero()) return BigNum.zero()

    const diff = this.e - other.e
    if (diff > 16) return this.clone()
    if (diff < -16) return BigNum.zero()

    if (diff >= 0) {
      const mantissa = this.m - other.m / 10 ** diff
      if (mantissa <= 0) return BigNum.zero()
      return new BigNum(mantissa, this.e)
    }

    return BigNum.zero()
  }

  mul(value) {
    const other = BigNum.from(value)
    if (this.isZero() || other.isZero()) return BigNum.zero()
    return new BigNum(this.m * other.m, this.e + other.e)
  }

  div(value) {
    const other = BigNum.from(value)
    if (other.isZero() || this.isZero()) return BigNum.zero()
    return new BigNum(this.m / other.m, this.e - other.e)
  }

  pow(power) {
    const exponent = BigNum.from(power).toNumber()
    if (this.isZero()) return BigNum.zero()
    if (!Number.isFinite(exponent)) {
      return exponent > 0 ? new BigNum(1, MAX_EXPONENT) : BigNum.one()
    }
    const log = this.log10() * exponent
    return BigNum.fromLog10(log)
  }

  sqrt() {
    return this.pow(0.5)
  }

  log10() {
    if (this.isZero()) return 0
    return this.e + Math.log10(this.m)
  }

  floor() {
    if (this.isZero()) return BigNum.zero()
    if (this.e > 15) return this.clone()
    return BigNum.from(Math.floor(this.toNumber()))
  }

  toNumber() {
    if (this.isZero()) return 0
    if (this.e > 308) return Infinity
    if (this.e < -320) return 0
    const value = this.m * 10 ** this.e
    if (this.e >= 0) {
      const rounded = Math.round(value)
      const tolerance = Math.max(1, Math.abs(value)) * Number.EPSILON * 8
      if (Math.abs(value - rounded) <= tolerance) return rounded
    }
    return value
  }

  cmp(value) {
    const other = BigNum.from(value)
    if (this.isZero() && other.isZero()) return 0
    if (this.isZero()) return -1
    if (other.isZero()) return 1
    if (this.e !== other.e) return this.e > other.e ? 1 : -1
    if (this.m === other.m) return 0
    return this.m > other.m ? 1 : -1
  }

  gt(value) {
    return this.cmp(value) > 0
  }

  gte(value) {
    return this.cmp(value) >= 0
  }

  lt(value) {
    return this.cmp(value) < 0
  }

  lte(value) {
    return this.cmp(value) <= 0
  }

  eq(value) {
    return this.cmp(value) === 0
  }

  min(value) {
    return this.lte(value) ? this.clone() : BigNum.from(value)
  }

  max(value) {
    return this.gte(value) ? this.clone() : BigNum.from(value)
  }

  static fromLog10(log) {
    if (!Number.isFinite(log) || log < -320) return BigNum.zero()
    if (log >= MAX_EXPONENT) return new BigNum(1, MAX_EXPONENT)
    const exponent = Math.floor(log)
    const mantissa = 10 ** (log - exponent)
    return new BigNum(mantissa, exponent)
  }

  static min(left, right) {
    return BigNum.from(left).min(right)
  }

  static max(left, right) {
    return BigNum.from(left).max(right)
  }

  toJSON() {
    return { m: this.m, e: this.e }
  }

  toString() {
    if (this.isZero()) return '0'
    if (this.e < 3) return String(Math.floor(this.toNumber()))
    return `${this.m.toFixed(2)}e+${this.e}`
  }
}

export const BIG_ZERO = BigNum.zero()
export const BIG_ONE = BigNum.one()
export const BIG_MAX = new BigNum(1, MAX_EXPONENT)

export function big(value) {
  return BigNum.from(value)
}

export function bigAdd(left, right) {
  return BigNum.from(left).add(right)
}

export function bigMul(left, right) {
  return BigNum.from(left).mul(right)
}

export function bigPow(base, exponent) {
  return BigNum.from(base).pow(exponent)
}

export function bigLog10(value) {
  return BigNum.from(value).log10()
}

export function bigMaxMantissaExponent() {
  return MAX_EXPONENT
}

export function isBigNum(value) {
  return value instanceof BigNum
}
