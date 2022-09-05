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
