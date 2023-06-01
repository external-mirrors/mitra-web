import { expect } from "chai"
import { createMoneroPaymentRequestV1 } from "@/utils/monero"

describe("Monero utils", () => {
  it("Should create payment request", () => {
    // https://github.com/lukeprofits/Monero_Payment_Request_Standard#example-python-function-to-create-a-monero-payment-request
    const data = {
      custom_label: "My Subscription",
      sellers_wallet: "4At3X5rvVypTofgmueN9s9QtrzdRe5BueFrskAZi17BoYbhzysozzoMFB6zWnTKdGC6AxEAbEE5czFR3hbEEJbsm4hCeX2S",
      currency: "USD",
      amount: "19.99",
      payment_id: "9fc88080d1d5dc09",
      start_date: "2023-04-26T13:45:33Z",
      days_per_billing_cycle: 30,
      number_of_payments: 0,
      change_indicator_url: "www.example.com/api/monero-request",
    }
    const code = createMoneroPaymentRequestV1(data)
    expect(code).to.equal("monero-request:1:H4sIAAAAAAACAy1P2U7DMBD8FeTnHjlLk7e0tEigItEWKH2xHHvbWPgIPmgTxL/jIJ52d2Z2ducbEam9cqhEcTEpCjRCtCHqDJgrxilx2mBvRKAvl8sErkS2AiZUyylp+VRqBUaPDXx6sG7Y9caAol3Qv+zu/gDrtMSC1DCYbLqbna8tNbx1XKsgYKSzuAWDay4EV2dMOyoAlWk0QsrLOjD6hFvSSVDOojLA/wPmLDgWJzqfR/OIxSxnNBoCWBACjMUXEuqQLKtcesjN12vX7vXpLD08FbZ4dqZnW8gXHtbGflRHHt8u9Hvd9J3Vfa8368Wsf1P7R3a/nFXXVVWvVjnt19u0Cd1DbWXWLOGQ7IaTjhiHGXHhc5RESTqOsnEy28dpmeVlmh7Rzy/y6ViJagEAAA==")
  })
})
