import { BACKEND_URL } from "@/constants"
import { floatToBigNumber } from "@/utils/numbers"
import { handleResponse, http } from "./common"
import {
  formatAmount,
  getPricePerMonth as _getPricePerMonth,
  getPricePerSec as _getPricePerSec,
  registerSubscriptionOption,
  SubscriptionDetails,
} from "./subscriptions-common"
import { User } from "./users"

const MONERO_DECIMALS = 12

export function formatXmrAmount(value: number | bigint): number {
  if (typeof value === "number") {
    value = BigInt(value)
  }
  return formatAmount(value, MONERO_DECIMALS).toUnsafeFloat()
}

export function parseXmrAmount(value: number): number {
  return Number(floatToBigNumber(value, MONERO_DECIMALS))
}

export function getPricePerSec(pricePerMonth: number): number {
  return Number(_getPricePerSec(pricePerMonth, MONERO_DECIMALS))
}

export function getPricePerMonth(pricePerSec: number): number {
  const pricePerSecInt = BigInt(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return formatXmrAmount(pricePerMonthInt)
}

export function getPaymentAmount(
  pricePerSec: number,
  durationMonths: number,
): number {
  const pricePerSecInt = BigInt(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return Math.round(Number(pricePerMonthInt) * durationMonths)
}

export function getSubscriptionDuration(
  pricePerSec: number,
  amount: number,
): number {
  const pricePerSecInt = BigInt(pricePerSec)
  const pricePerMonthInt = _getPricePerMonth(pricePerSecInt)
  return parseFloat((amount / Number(pricePerMonthInt)).toFixed(2))
}

export async function registerMoneroSubscriptionOption(
  authToken: string,
  chainId: string,
  price: number,
  payoutAddress: string,
): Promise<User> {
  return await registerSubscriptionOption(authToken, {
    type: "monero",
    chain_id: chainId,
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
  created_at: string,
  expires_at: string,
}

export async function createInvoice(
  senderId: string,
  recipientId: string,
  chainId: string,
  amount: number,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices`
  const response = await http(url, {
    method: "POST",
    json: {
      sender_id: senderId,
      recipient_id: recipientId,
      chain_id: chainId,
      amount,
    },
  })
  const data = await handleResponse(response)
  return data
}

export async function getInvoice(
  invoiceId: string,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices/${invoiceId}`
  const response = await http(url, {
    method: "GET",
  })
  const data = await handleResponse(response)
  return data
}

export async function cancelInvoice(
  invoiceId: string,
): Promise<Invoice> {
  const url = `${BACKEND_URL}/api/v1/subscriptions/invoices/${invoiceId}`
  const response = await http(url, {
    method: "DELETE",
  })
  const data = await handleResponse(response)
  return data
}

export async function extendSubscription(
  authToken: string,
  subscriberId: string,
  duration: number,
): Promise<SubscriptionDetails> {
  const url = `${BACKEND_URL}/api/v1/subscriptions`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: {
      subscriber_id: subscriberId,
      duration,
    },
  })
  const data = await handleResponse(response)
  return data
}
