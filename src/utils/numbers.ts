export function roundBigNumber(value: bigint, precision: number): bigint {
  const decimals = value.toString().length
  const divisor = 10n ** BigInt(decimals - precision)
  const remainder = value % divisor
  const midpoint = 10n ** BigInt(Math.max(decimals - precision - 1, 0)) * 5n
  if (remainder >= midpoint) {
    return ((value / divisor) + 1n) * divisor
  } else {
    return value / divisor * divisor
  }
}

function getPrecision(value: number): number {
  if (typeof value !== "number") {
    return 0
  }
  if (!isFinite(value)) {
    return 0
  }
  let precision = 0
  while (Math.round(value * 10 ** precision) / 10 ** precision !== value) {
    precision++
  }
  return precision
}

export function floatToBigNumber(value: number, decimals: number): bigint {
  const precision = getPrecision(value)
  const denominator = 10 ** precision
  const numerator = Math.round(value * denominator)
  return 10n ** BigInt(decimals) * BigInt(numerator) / BigInt(denominator)
}
