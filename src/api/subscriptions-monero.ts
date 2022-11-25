import { BigNumber } from "@ethersproject/bignumber"

import { BACKEND_URL } from "@/constants"
import { http } from "./common"
import {
  formatAmount,
  getPricePerMonth as _getPricePerMonth,
  getPricePerSec as _getPricePerSec,
  registerSubscriptionOption,
} from "./subscriptions-common"
import { Profile, User } from "./users"

const MONERO_DECIMALS = 12

export function formatXmrAmount(value: number | BigNumber): number {
  if (typeof value === "number") {
    value = BigNumber.from(value)
  }
  return formatAmount(value, MONERO_DECIMALS).toUnsafeFloat()
}

export function getPricePerSec(pricePerMonth: number): number {
  return _getPricePerSec(pricePerMonth, MONERO_DECIMALS).toNumber()
}

export function getPricePerMonth(pricePerSec: number): number {
  const pricePerSecInt = BigNumber.from(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return formatXmrAmount(pricePerMonthInt)
}

export function getPaymentAmount(
  pricePerSec: number,
  durationMonths: number,
): number {
  const pricePerSecInt = BigNumber.from(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return Math.round(pricePerMonthInt.toNumber() * durationMonths)
}

export async function registerMoneroSubscriptionOption(
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
  amount: number,
  status: string,
  expires_at: string,
}

export async function createInvoice(
  senderId: string,
  recipientId: string,
  amount: number,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices`
  const response = await http(url, {
    method: "POST",
    json: {
      sender_id: senderId,
      recipient_id: recipientId,
      amount,
    },
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
