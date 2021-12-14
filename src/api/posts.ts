import { BACKEND_URL } from "@/constants"
import { PAGE_SIZE, http } from "./common"
import { Profile } from "./users"

export interface Attachment {
  id: string;
  type: string;
  url: string;
}

export async function uploadAttachment(
  authToken: string,
  base64data: string,
): Promise<Attachment> {
  const url = `${BACKEND_URL}/api/v1/media`
  const response = await http(url, {
    method: "POST",
    json: { file: base64data },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export interface Post {
  id: string;
  uri: string;
  created_at: string;
  account: Profile,
  content: string;
  in_reply_to_id: string | null;
  reblog: Post | null;
  replies_count: number;
  favourites_count: number;
  reblogs_count: number;
  media_attachments: Attachment[];
  favourited: boolean;
  reblogged: boolean;
  ipfs_cid: string | null;
  token_id: number | null;
  token_tx_id: string | null;
}

export async function getHomeTimeline(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/home`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await response.json()
  return data
}

export async function getTagTimeline(
  authToken: string | null,
  tagName: string,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/tag/${tagName}`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await response.json()
  return data
}

export async function getProfileTimeline(
  authToken: string | null,
  authorId: string,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/${authorId}/statuses`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await response.json()
  return data
}

export async function getPostContext(
  authToken: string | null,
  postId: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/context`
  const response = await http(url, { authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export interface PostData {
  content: string;
  in_reply_to_id: string | null;
}

export async function createPost(
  authToken: string,
  postData: PostData,
  attachment: Attachment | null,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses`
  // Convert to Mastodon API Status entity
  const statusData = {
    status: postData.content,
    "media_ids[]": attachment ? [attachment.id] : null,
    in_reply_to_id: postData.in_reply_to_id,
  }
  const response = await http(url, {
    method: "POST",
    json: statusData,
    authToken,
  })
  const data = await response.json()
  if (response.status !== 201) {
    throw new Error(data.message)
  }
  return data
}

export async function getPost(
  authToken: string | null,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}`
  const response = await http(url, { authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export async function deletePost(
  authToken: string,
  postId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}`
  const response = await http(url, {
    method: "DELETE",
    authToken,
  })
  if (response.status !== 204) {
    const data = await response.json()
    throw new Error(data.message)
  }
}

export async function favourite(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/favourite`
  const response = await http(url, { method: "POST", authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export async function unfavourite(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unfavourite`
  const response = await http(url, { method: "POST", authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export async function createRepost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/reblog`
  const response = await http(url, { method: "POST", authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}

export async function deleteRepost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unreblog`
  const response = await http(url, { method: "POST", authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.message)
  }
  return data
}
