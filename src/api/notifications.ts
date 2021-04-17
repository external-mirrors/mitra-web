import { BACKEND_URL } from "@/constants"

import { http } from "./common"
import { Post } from "./posts"
import { Profile } from "./users"

export interface Notification {
  id: string;
  type: "follow" | "reply" | "favourite";
  account: Profile;
  status: Post | null;
  created_at: string;
}

export async function getNotifications(
  authToken: string,
): Promise<Notification[]> {
  const url = `${BACKEND_URL}/api/v1/notifications`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}
