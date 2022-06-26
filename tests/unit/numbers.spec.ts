import { expect } from "chai"
import { BigNumber } from "@ethersproject/bignumber"
import { roundBigNumber } from "@/utils/numbers"

describe("Numbers utils", () => {
  it("Should round big number", () => {
    const value = BigNumber.from(534985)
    expect(roundBigNumber(value, 2).toNumber()).to.equal(530000)
    expect(roundBigNumber(value, 3).toNumber()).to.equal(535000)
    expect(roundBigNumber(value, 4).toNumber()).to.equal(535000)
    expect(roundBigNumber(value, 5).toNumber()).to.equal(534990)
    expect(roundBigNumber(value, 6).toNumber()).to.equal(534985)
  })
})
