import { BACKEND_URL } from "@/constants"
import { PAGE_SIZE, http } from "./common"
import { CustomEmoji } from "./emojis"
import { defaultProfile, Profile } from "./users"

export interface Attachment {
  id: string;
  type: string;
  url: string;
}

export async function uploadAttachment(
  authToken: string,
  base64data: string,
  mediaType: string,
): Promise<Attachment> {
  const url = `${BACKEND_URL}/api/v1/media`
  const response = await http(url, {
    method: "POST",
    json: { file: base64data, media_type: mediaType },
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}

export enum Visibility {
  Public = "public",
  Followers = "private",
  Subscribers = "subscribers",
  Direct = "direct",
}

export const VISIBILITY_MAP = {
  [Visibility.Public]: "Public",
  [Visibility.Followers]: "Followers",
  [Visibility.Subscribers]: "Subscribers",
  [Visibility.Direct]: "Direct",
}

export interface Mention {
  id: string;
  username: string;
  acct: string;
  url: string;
}

export interface Tag {
  name: string;
  url: string;
}

export interface Post {
  id: string;
  uri: string;
  created_at: string;
  edited_at: string | null;
  account: Profile;
  content: string;
  in_reply_to_id: string | null;
  reblog: Post | null;
  visibility: Visibility;
  replies_count: number;
  favourites_count: number;
  reblogs_count: number;
  media_attachments: Attachment[];
  mentions: Mention[];
  tags: Tag[];
  emojis: CustomEmoji[];
  favourited: boolean;
  reblogged: boolean;
  ipfs_cid: string | null;
  token_id: number | null;
  token_tx_id: string | null;
  links: Post[];
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

export async function getPublicTimeline(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/public`
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
  excludeReplies?: boolean,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/${authorId}/statuses`
  const queryParams = {
    exclude_replies: excludeReplies,
    max_id: maxId,
    limit: PAGE_SIZE,
  }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await response.json()
  return data
}

export async function getPostThread(
  authToken: string | null,
  postId: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/thread`
  const response = await http(url, { authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}

export async function previewPost(
  authToken: string,
  content: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/preview`
  const response = await http(url, {
    method: "POST",
    json: {
      status: content,
      content_type: "text/markdown",
    },
    authToken,
  })
  const data = await response.json()
  return {
    id: "",
    uri: "",
    created_at: "",
    edited_at: null,
    account: defaultProfile(),
    content: data.content,
    in_reply_to_id: null,
    reblog: null,
    visibility: Visibility.Public,
    replies_count: 0,
    favourites_count: 0,
    reblogs_count: 0,
    media_attachments: [],
    mentions: [],
    tags: [],
    emojis: data.emojis,
    favourited: false,
    reblogged: false,
    ipfs_cid: null,
    token_id: null,
    token_tx_id: null,
    links: [],
  }
}

export interface PostData {
  content: string;
  in_reply_to_id: string | null;
  visibility: string;
  mentions: string[];
  attachments: Attachment[];
}

export async function createPost(
  authToken: string,
  postData: PostData,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses`
  // Convert to Mastodon API Status entity
  const statusData = {
    status: postData.content,
    content_type: "text/markdown",
    "media_ids[]": postData.attachments.map((attachment) => attachment.id),
    in_reply_to_id: postData.in_reply_to_id,
    visibility: postData.visibility,
    mentions: postData.mentions,
  }
  const response = await http(url, {
    method: "POST",
    json: statusData,
    authToken,
  })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
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
    throw new Error(data.error_description)
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
    throw new Error(data.error_description)
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
    throw new Error(data.error_description)
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
    throw new Error(data.error_description)
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
    throw new Error(data.error_description)
  }
  if (data.reblog === null) {
    throw new Error("reblog property is null")
  }
  return data.reblog
}

export async function deleteRepost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unreblog`
  const response = await http(url, { method: "POST", authToken })
  const data = await response.json()
  if (response.status !== 200) {
    throw new Error(data.error_description)
  }
  return data
}
