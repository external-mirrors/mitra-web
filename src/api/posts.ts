import { BACKEND_URL } from "@/constants"

import { handleResponse, http, getNextPageUrl, PAGE_SIZE } from "./common"
import { getEmojiShortcode, CustomEmoji } from "./emojis"
import { Poll } from "./polls"
import { getRelationships, Relationship } from "./relationships"
import { defaultProfile, Profile } from "./users"

export interface Attachment {
  id: string;
  type: string;
  url: string;
  description: string | null,
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
  const data = await handleResponse(response)
  return data
}

export async function updateAttachment(
  authToken: string,
  attachmentId: string,
  description: string | null,
): Promise<Attachment> {
  const url = `${BACKEND_URL}/api/v1/media/${attachmentId}`
  const response = await http(url, {
    method: "PUT",
    json: { description: description },
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export enum Visibility {
  Public = "public",
  Followers = "private",
  Subscribers = "subscribers",
  Conversation = "conversation",
  Direct = "direct",
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

interface PleromaEmojiReaction {
  name: string,
  url: string | null,
  count: number,
  me: boolean,
}

export interface Post {
  id: string;
  uri: string;
  url: string,
  created_at: string;
  edited_at: string | null;
  account: Profile;
  content: string;
  in_reply_to_id: string | null;
  in_reply_to_account_id: string | null,
  reblog: Post | null;
  visibility: Visibility;
  sensitive: boolean;
  pinned: boolean;
  replies_count: number;
  favourites_count: number;
  reblogs_count: number;
  poll: Poll | null,
  media_attachments: Attachment[];
  mentions: Mention[];
  tags: Tag[];
  emojis: CustomEmoji[];
  favourited: boolean;
  reblogged: boolean;
  bookmarked: boolean,

  pleroma: {
    emoji_reactions: PleromaEmojiReaction[],
    parent_visible: boolean,
    quote: { id: string } | null,
  },

  ipfs_cid: string | null;
  links: Post[];

  // Data added by client
  contentSource?: string | null,
  relationship?: Relationship | null;
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
  const data = await handleResponse(response)
  return data
}

export async function getPublicTimeline(
  authToken: string | null,
  onlyLocal: boolean,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/public`
  const queryParams = {
    local: onlyLocal,
    max_id: maxId,
    limit: PAGE_SIZE,
  }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await handleResponse(response)
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
  const data = await handleResponse(response)
  return data
}

export async function getProfileTimeline(
  authToken: string | null,
  authorId: string,
  excludeReplies: boolean,
  exclideReposts: boolean,
  onlyPinned: boolean,
  onlyMedia: boolean,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/accounts/${authorId}/statuses`
  const queryParams = {
    exclude_replies: excludeReplies,
    exclude_reblogs: exclideReposts,
    pinned: onlyPinned,
    only_media: onlyMedia,
    max_id: maxId,
    limit: PAGE_SIZE,
  }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function getListTimeline(
  authToken: string,
  listId: number,
  maxId?: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/timelines/list/${listId}`
  const queryParams = { max_id: maxId, limit: PAGE_SIZE }
  const response = await http(url, {
    method: "GET",
    queryParams,
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function getPostThread(
  authToken: string | null,
  postId: string,
): Promise<Post[]> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/thread`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

interface PostListPage {
  posts: Post[],
  nextPageUrl: string | null,
}

export async function getBookmarks(
  authToken: string,
  url: string | null,
): Promise<PostListPage> {
  if (!url) {
    url = `${BACKEND_URL}/api/v1/bookmarks`
  }
  const response = await http(url, {
    method: "GET",
    authToken,
  })
  const data = await handleResponse(response)
  return {
    posts: data,
    nextPageUrl: getNextPageUrl(response),
  }
}

export async function addRelationships(
  authToken: string,
  posts: Post[],
): Promise<void> {
  const authors = posts.flatMap((post) => {
    const result = [post.account.id]
    if (post.reblog) {
      result.push(post.reblog.account.id)
    }
    return result
  })
  const relationships = await getRelationships(authToken, authors)
  for (const relationship of relationships) {
    for (const post of posts) {
      if (post.account.id === relationship.id) {
        post.relationship = relationship
      }
      if (post.reblog && post.reblog.account.id === relationship.id) {
        post.reblog.relationship = relationship
      }
    }
  }
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
  const data = await handleResponse(response)
  return {
    id: "",
    uri: "",
    url: "",
    created_at: "",
    edited_at: null,
    account: defaultProfile(),
    content: data.content,
    in_reply_to_id: null,
    in_reply_to_account_id: null,
    reblog: null,
    visibility: Visibility.Public,
    sensitive: false,
    pinned: false,
    replies_count: 0,
    favourites_count: 0,
    reblogs_count: 0,
    poll: null,
    media_attachments: [],
    mentions: [],
    tags: [],
    emojis: data.emojis,
    favourited: false,
    reblogged: false,
    bookmarked: false,
    pleroma: {
      emoji_reactions: [],
      parent_visible: true,
      quote: null,
    },
    ipfs_cid: null,
    links: [],
  }
}

export interface PostData {
  idempotencyKey: string,
  content: string;
  inReplyToId: string | null;
  visibility: string;
  isSensitive: boolean;
  attachments: Attachment[];
  quoteId: string | null,
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
    in_reply_to_id: postData.inReplyToId,
    visibility: postData.visibility,
    sensitive: postData.isSensitive,
    quote_id: postData.quoteId,
  }
  const response = await http(url, {
    method: "POST",
    json: statusData,
    authToken,
    headers: { "Idempotency-Key": postData.idempotencyKey },
  })
  const data = await handleResponse(response)
  return data
}

export async function getPost(
  authToken: string | null,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export interface PostSource {
  content_type?: string,
  text: string,
}

export async function getPostSource(
  authToken: string,
  postId: string,
): Promise<PostSource> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/source`
  const response = await http(url, { authToken })
  const data = await handleResponse(response)
  return data
}

export async function updatePost(
  authToken: string,
  postId: string,
  content: string,
  attachments: Attachment[],
  isSensitive: boolean,
  quoteId: string | null,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}`
  const response = await http(url, {
    method: "PUT",
    authToken,
    json: {
      status: content,
      content_type: "text/markdown",
      "media_ids[]": attachments.map((attachment) => attachment.id),
      sensitive: isSensitive,
      quote_id: quoteId,
    },
  })
  const data = await handleResponse(response)
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
  await handleResponse(response)
}

export async function favourite(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/favourite`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export async function unfavourite(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unfavourite`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export interface ReactionEmoji {
  name: string | null,
  text: string,
  url: string | null,
}

export function getReactionEmoji(reaction: PleromaEmojiReaction): ReactionEmoji {
  if (reaction.url) {
    return { name: reaction.name, text: getEmojiShortcode(reaction.name), url: reaction.url }
  } else {
    return { name: null, text: reaction.name, url: null }
  }
}

export async function createReaction(
  authToken: string,
  postId: string,
  content: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/pleroma/statuses/${postId}/reactions/${content}`
  const response = await http(url, { method: "PUT", authToken })
  const data = await handleResponse(response)
  return data
}

export async function deleteReaction(
  authToken: string,
  postId: string,
  content: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/pleroma/statuses/${postId}/reactions/${content}`
  const response = await http(url, { method: "DELETE", authToken })
  const data = await handleResponse(response)
  return data
}

export async function createRepost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/reblog`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
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
  const data = await handleResponse(response)
  return data
}

export async function createBookmark(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/bookmark`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export async function deleteBookmark(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unbookmark`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export async function pinPost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/pin`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export async function unpinPost(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/unpin`
  const response = await http(url, { method: "POST", authToken })
  const data = await handleResponse(response)
  return data
}

export async function makePermanent(
  authToken: string,
  postId: string,
): Promise<Post> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/make_permanent`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  const data = await handleResponse(response)
  return data
}

export async function loadConversation(
  authToken: string,
  postId: string,
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/statuses/${postId}/load_conversation`
  const response = await http(url, {
    method: "POST",
    authToken,
  })
  await handleResponse(response, 204)
}
