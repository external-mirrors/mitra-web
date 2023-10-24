import { expect } from "chai"
import { getCurrencyByLabel, ETHEREUM, MONERO } from "@/utils/cryptocurrencies"

describe("Cryptocurrency utils", () => {
  it("Should find Ethereum by label", () => {
    const currency = getCurrencyByLabel("$ETH")
    expect(currency).to.deep.equal(ETHEREUM)
  })

  it("Should find Monero by label", () => {
    const currency = getCurrencyByLabel("$XMR")
    expect(currency).to.deep.equal(MONERO)
  })
})
