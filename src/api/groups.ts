import { BACKEND_URL } from "@/constants"
import { handleResponse, http, PAGE_SIZE } from "./common"
import { Post } from "./posts"
import { Profile } from "./users"

export async function createGroup(
  authToken: string,
  name: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/groups`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { name },
  })
  const data = await handleResponse(response)
  return data
}

export async function getGroups(
  authToken: string,
  filter: "following" | "moderating",
  offset?: number,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/groups/followed`
  const response = await http(url, {
    authToken,
    queryParams: { filter, offset },
  })
  const data = await handleResponse(response)
  return data
}

export async function getGroupTimeline(
  authToken: string,
  groupId: string,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/group/${groupId}`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await handleResponse(response)
  return data
}
