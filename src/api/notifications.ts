import { BACKEND_URL } from "@/constants"

import { handleResponse, http, PAGE_SIZE } from "./common"
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
  maxId?: string,
): Promise<Notification[]> {
  const url = `${BACKEND_URL}/api/v1/notifications`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await handleResponse(response)
  return data
}
