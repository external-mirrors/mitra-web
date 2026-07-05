import { BACKEND_URL } from "@/constants"
import { handleResponse, http, PAGE_SIZE } from "./common"
import { Post } from "./posts"
import { Profile } from "./users"

export async function createGroup(
  authToken: string,
  name: string,
  description: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/groups`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { name, description },
  })
  const data = await handleResponse(response)
  return data
}

export interface GroupSource {
  description: string,
}

export async function getGroupSource(
  authToken: string,
  groupId: string,
): Promise<GroupSource> {
  const url = `${BACKEND_URL}/api/v1/groups/${groupId}/source`
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function updateGroup(
  authToken: string,
  groupId: string,
  description: string,
): Promise<Profile> {
  const url = `${BACKEND_URL}/api/v1/groups/${groupId}`
  const response = await http(url, {
    method: "PATCH",
    authToken,
    json: { description },
  })
  const data = await handleResponse(response)
  return data
}

export async function deleteGroup(
  authToken: string,
  groupId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/groups/${groupId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  await handleResponse(response, 204)
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
