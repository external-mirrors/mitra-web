import { BigNumber, FixedNumber } from "@ethersproject/bignumber"

import { BACKEND_URL } from "@/constants"
import { floatToBigNumber, roundBigNumber } from "@/utils/numbers"
import { http } from "./common"
import { Profile, User } from "./users"

const SECONDS_IN_DAY = 3600 * 24
const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30

export function getPricePerSec(
  pricePerMonth: number,
  tokenDecimals: number,
): BigNumber {
  const pricePerMonthInt = floatToBigNumber(pricePerMonth, tokenDecimals)
  return pricePerMonthInt.div(SECONDS_IN_MONTH)
}

export function getPricePerMonth(
  pricePerSec: BigNumber,
): BigNumber {
  return roundBigNumber(pricePerSec.mul(SECONDS_IN_MONTH), 4)
}

export function formatAmount(
  value: BigNumber,
  tokenDecimals: number,
): FixedNumber {
  return FixedNumber.fromValue(value, tokenDecimals)
}

export interface SubscriptionOption {
  type: string;
  chain_id: string | null;
  price: number | null;
  payout_address: string | null;
}

export async function getSubscriptionOptions(
  authToken: string,
): Promise<SubscriptionOption[]> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/options`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

export async function registerSubscriptionOption(
  authToken: string,
  subscriptionOption: SubscriptionOption,
): Promise<User> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/options`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: subscriptionOption,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  } else {
    return data
  }
}

export interface SubscriptionDetails {
  id: number,
  expires_at: string,
}

export async function findSubscription(
  senderId: string,
  recipientId: string,
): Promise<SubscriptionDetails | null> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/find`
  const response = await http(url, {
    method: "GET",
    queryParams: { sender_id: senderId, recipient_id: recipientId },
  })
  const data = await response.json()
  if (response.status === 200) {
    return data
  } else if (response.status === 404) {
    return null
  } else {
    throw new Error(data.error_description)
  }
}

export interface Subscription {
  id: number,
  sender: Profile,
  sender_address: string | null,
  expires_at: string,
}

export async function getReceivedSubscriptions(
  authToken: string,
  accountId: string,
  includeExpired: boolean,
): Promise<Subscription[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/subscribers`
  const response = await http(url, {
    method: "GET",
    queryParams: { include_expired: includeExpired },
    authToken,
  })
  const data = await response.json()
  return data
}
