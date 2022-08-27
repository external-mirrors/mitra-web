import { BigNumber } from "@ethersproject/bignumber"

import { BACKEND_URL } from "@/constants"
import { http } from "./common"
import {
  formatAmount,
  getPricePerMonth as _getPricePerMonth,
  getPricePerSec as _getPricePerSec,
} from "./subscriptions"
import { Profile, User } from "./users"

export function getPricePerSec(pricePerMonth: number): number {
  return _getPricePerSec(pricePerMonth, 12).toNumber()
}

export function getPricePerMonth(pricePerSec: number): number {
  const pricePerSecInt = BigNumber.from(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return formatAmount(pricePerMonthInt, 12).toUnsafeFloat()
}

export async function enableMoneroSubscriptions(
  authToken: string,
  price: number,
  payoutAddress: string,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/enable`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { type: "monero", price, payout_address: payoutAddress },
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}
