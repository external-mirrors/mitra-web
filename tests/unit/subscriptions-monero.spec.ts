import { expect } from "chai"
import {
  formatXmrAmount,
  getPaymentAmount,
  getSubscriptionDuration,
  parseXmrAmount,
} from "@/api/subscriptions-monero"

describe("Monero subscription utils", () => {
  it("Should format XMR amount", () => {
    expect(formatXmrAmount(1)).to.equal(0.000000000001)
    expect(formatXmrAmount(77750000000)).to.equal(0.07775)
    expect(formatXmrAmount(7775000000000000)).to.equal(7775)
  })

  it("Should parse XMR amount", () => {
    expect(parseXmrAmount(0.000000000001)).to.equal(1)
    expect(parseXmrAmount(0.07775)).to.equal(77750000000)
    expect(parseXmrAmount(7775)).to.equal(7775000000000000)
  })

  it("Should calculate payment amount", () => {
    const price = 12000
    expect(getPaymentAmount(price, 0.01)).to.equal(311000000)
    expect(getPaymentAmount(price, 2.5)).to.equal(77750000000)
    expect(getPaymentAmount(price, 1000)).to.equal(31100000000000)
  })

  it("Should calculate subscription duration", () => {
    const price = 12000
    expect(getSubscriptionDuration(price, 311000000)).to.equal(0.01)
    expect(getSubscriptionDuration(price, 77750000000)).to.equal(2.5)
    expect(getSubscriptionDuration(price, 31100000000000)).to.equal(1000)
  })
})
