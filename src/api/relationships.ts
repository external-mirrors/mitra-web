import { BACKEND_URL } from "@/constants"
import { handleResponse, http } from "./common"
import { Profile } from "./users"

export interface Relationship {
  id: string,
  following: boolean,
  followed_by: boolean,
  requested: boolean,
  subscription_to: boolean,
  subscription_from: boolean,
  showing_reblogs: boolean,
  showing_replies: boolean,
  muting: boolean,
}

export async function follow(
  authToken: string,
  accountId: string,
  showReposts: boolean,
  showReplies: boolean,
): Promise<Relationship> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/follow`
  const response = await http(url, {
    method: "POST",
    json: {
      reblogs: showReposts,
      replies: showReplies,
    },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function getRelationship(
  authToken: string,
  accountId: string,
): Promise<Relationship> {
  const url = `${BACKEND_URL}/api/v1/accounts/relationships`
  const response = await http(url, {
    method: "GET",
    queryParams: { "id[]": accountId },
    authToken,
  })
  const data = await handleResponse(response)
  return data[0]
}

export async function unfollow(
  authToken: string,
  accountId: string,
): Promise<Relationship> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/unfollow`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function mute(
  authToken: string,
  accountId: string,
): Promise<Relationship> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/mute`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function unmute(
  authToken: string,
  accountId: string,
): Promise<Relationship> {
  const url = `${BACKEND_URL}/api/v1/accounts/${accountId}/unmute`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

interface ProfileListPage {
  profiles: Profile[];
  nextPageUrl: string | null;
}

function getNextPageUrl(response: Response): string | null {
  const linkHeader = response.headers.get("Link")
  if (!linkHeader) {
    return null
  }
  // TODO: use advanced Link header parser
  const link = linkHeader.split(";")[0]
  return link.slice(1, link.length - 1)
}

export async function getFollowers(
  authToken: string,
  accountId: string,
  url?: string,
): Promise<ProfileListPage> {
  if (!url) {
    url = `${BACKEND_URL}/api/v1/accounts/${accountId}/followers`
  }
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return {
    profiles: data,
    nextPageUrl: getNextPageUrl(response),
  }
}

export async function getFollowing(
  authToken: string,
  accountId: string,
  url?: string,
): Promise<ProfileListPage> {
  if (!url) {
    url = `${BACKEND_URL}/api/v1/accounts/${accountId}/following`
  }
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return {
    profiles: data,
    nextPageUrl: getNextPageUrl(response),
  }
}
