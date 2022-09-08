import { BigNumber } from "@ethersproject/bignumber"

import { BACKEND_URL } from "@/constants"
import { http } from "./common"
import { registerSubscriptionOption } from "./subscriptions-common"
import {
  formatAmount,
  getPricePerMonth as _getPricePerMonth,
  getPricePerSec as _getPricePerSec,
} from "./subscriptions-ethereum"
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
  return await registerSubscriptionOption(authToken, {
    type: "monero",
    price,
    payout_address: payoutAddress,
  })
}

export interface Invoice {
  id: string,
  sender_id: string,
  recipient_id: string,
  payment_address: string,
  status: string,
}

export async function createInvoice(
  senderId: string,
  recipientId: string,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices`
  const response = await http(url, {
    method: "POST",
    json: { sender_id: senderId, recipient_id: recipientId },
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}

export async function getInvoice(
  invoiceId: string,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices/${invoiceId}`
  const response = await http(url, {
    method: "GET",
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  } else {
    return data
  }
}
