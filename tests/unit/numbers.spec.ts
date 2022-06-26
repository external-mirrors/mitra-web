import { expect } from "chai"
import { BigNumber } from "@ethersproject/bignumber"
import { floatToBigNumber, roundBigNumber } from "@/utils/numbers"

describe("Numbers utils", () => {
  it("Should round big number", () => {
    const value = BigNumber.from(534985)
    expect(roundBigNumber(value, 2).toNumber()).to.equal(530000)
    expect(roundBigNumber(value, 3).toNumber()).to.equal(535000)
    expect(roundBigNumber(value, 4).toNumber()).to.equal(535000)
    expect(roundBigNumber(value, 5).toNumber()).to.equal(534990)
    expect(roundBigNumber(value, 6).toNumber()).to.equal(534985)
  })

  it("Should convert float to big number", () => {
    const value1 = 3.94031726813
    const value2 = 1
    const decimals = 18
    expect(floatToBigNumber(value1, decimals).toString())
      .to.equal("3940317268130000000")
    expect(floatToBigNumber(value2, decimals).toString())
      .to.equal("1000000000000000000")
  })
})
