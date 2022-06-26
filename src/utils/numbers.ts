import { BigNumber } from "@ethersproject/bignumber"

export function roundBigNumber(value: BigNumber, precision: number): BigNumber {
  const decimals = value.toString().length
  const divisor = BigNumber.from(10).pow(decimals - precision)
  const remainder = value.mod(divisor)
  const midpoint = BigNumber.from(10).pow(Math.max(decimals - precision - 1, 0)).mul(5)
  if (remainder.gte(midpoint)) {
    return value.div(divisor).add(1).mul(divisor)
  } else {
    return value.div(divisor).mul(divisor)
  }
}
