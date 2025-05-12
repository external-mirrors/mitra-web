import { BACKEND_URL } from "@/constants"
import { handleResponse, http, PAGE_SIZE } from "./common"
import { Profile } from "./users"

export interface CustomFeed {
  id: number,
  title: string,
}

export async function getCustomFeeds(
  authToken: string,
): Promise<CustomFeed[]> {
  const url = `${BACKEND_URL}/api/v1/lists`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export async function createCustomFeed(
  authToken: string,
  feedName: string,
): Promise<CustomFeed> {
  const url = `${BACKEND_URL}/api/v1/lists`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { title: feedName },
  })
  const data = await handleResponse(response)
  return data
}

export async function getCustomFeed(
  authToken: string,
  feedId: number,
): Promise<CustomFeed> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export async function updateCustomFeed(
  authToken: string,
  feedId: number,
  feedName: string,
): Promise<CustomFeed> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}`
  const response = await http(url, {
    method: "PUT",
    authToken,
    json: { title: feedName },
  })
  const data = await handleResponse(response)
  return data
}

export async function deleteCustomFeed(
  authToken: string,
  feedId: number,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  await handleResponse(response)
}

export async function addCustomFeedSource(
  authToken: string,
  feedId: number,
  sourceId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}/accounts`
  const response = await http(url, {
    method: "POST",
    authToken,
    json: { account_ids: [sourceId] },
  })
  await handleResponse(response)
}

export async function removeCustomFeedSource(
  authToken: string,
  feedId: number,
  sourceId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}/accounts`
  const response = await http(url, {
    method: "DELETE",
    authToken,
    queryParams: { "account_ids[0]": sourceId },
  })
  await handleResponse(response)
}

export async function getCustomFeedSources(
  authToken: string,
  feedId: number,
  maxId?: string,
): Promise<Profile[]> {
  const url = `${BACKEND_URL}/api/v1/lists/${feedId}/accounts`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    authToken,
    queryParams,
  })
  const data = await handleResponse(response)
  return data
}
