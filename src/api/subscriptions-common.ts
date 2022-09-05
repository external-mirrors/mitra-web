import { BACKEND_URL } from "@/constants"
import { http } from "./common"

export interface SubscriptionOption {
  type: string;
  price: number | null;
  payout_address: number | null;
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
    throw new Error(data.message)
  } else {
    return data
  }
}

export interface SubscriptionDetails {
  id: number,
  expires_at: string,
}

export async function getSubscription(
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
    throw new Error(data.message)
  }
}
