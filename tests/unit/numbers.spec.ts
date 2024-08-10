import { expect } from "chai"
import { floatToBigNumber, roundBigNumber } from "@/utils/numbers"

describe("Numbers utils", () => {
  it("Should round big number", () => {
    const value = 534985n
    expect(roundBigNumber(value, 2)).to.equal(530000n)
    expect(roundBigNumber(value, 3)).to.equal(535000n)
    expect(roundBigNumber(value, 4)).to.equal(535000n)
    expect(roundBigNumber(value, 5)).to.equal(534990n)
    expect(roundBigNumber(value, 6)).to.equal(534985n)
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
