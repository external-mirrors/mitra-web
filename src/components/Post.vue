<template>
  <div
    v-if="!editorVisible"
    class="post"
    :class="{ highlighted: highlighted }"
    :data-post-id="post.id"
    :id="post.id"
  >
    <div class="post-header">
      <universal-link
        class="floating-avatar"
        :to="getProfileLocation(post.account)"
        :title="author.getDisplayName()"
      >
        <template #link-content>
          <avatar :profile="post.account"></avatar>
        </template>
      </universal-link>
      <div class="name-group">
        <universal-link
          class="display-name-link"
          :to="getProfileLocation(post.account)"
          :title="author.getDisplayName()"
        >
          <template #link-content>
            <profile-display-name :profile="author"></profile-display-name>
          </template>
        </universal-link>
        <div
          class="actor-address"
          :title="getActorHandle(post.account)"
        >
          {{ getActorHandle(post.account) }}
        </div>
      </div>
      <div class="timestamp-group">
        <router-link
          v-if="inThread && post.in_reply_to_id && post.pleroma.parent_visible"
          class="icon"
          :to="{ name: 'post', params: { postId: post.in_reply_to_id } }"
          :title="$t('post.go_to_previous_post')"
          @mouseover="highlight(post.in_reply_to_id)"
          @mouseleave="highlight(null)"
        >
          <icon-left-up @click.prevent="scrollTo(post.in_reply_to_id as string)">
          </icon-left-up>
        </router-link>
        <span
          class="icon icon-small"
          :title="getVisibilityDisplay()"
        >
          <visibility-icon :visibility="post.visibility"></visibility-icon>
        </span>
        <span
          v-if="post.pinned"
          class="icon icon-small"
          :title="$t('post.featured')"
        >
          <icon-pin></icon-pin>
        </span>
        <span v-if="post.edited_at">{{ $t('post.edited') }}</span>
        <router-link
          v-if="currentUser && inThread"
          class="timestamp"
          :to="{ name: 'post', params: { postId: post.id } }"
          :title="formatDateTime(post.created_at)"
        >
          <span @click.prevent="scrollTo(post.id)">
            <timestamp :date="post.created_at"></timestamp>
          </span>
        </router-link>
        <universal-link
          v-else
          class="timestamp"
          :to="getPostLocation(post)"
          :title="formatDateTime(post.created_at)"
        >
          <template #link-content>
            <timestamp :date="post.created_at"></timestamp>
          </template>
        </universal-link>
      </div>
    </div>
    <div class="post-subheader" v-if="post.in_reply_to_id">
      <router-link
        v-if="inThread && post.pleroma.parent_visible"
        class="replying-to"
        :to="{ name: 'post', params: { postId: post.in_reply_to_id } }"
      >
        <span
          @mouseover="highlight(post.in_reply_to_id)"
          @mouseleave="highlight(null)"
          @click.prevent="scrollTo(post.in_reply_to_id)"
        >
          {{ $t('post.replying_to') }}
        </span>
      </router-link>
      <span v-else class="replying-to">{{ $t('post.replying_to') }}</span>
      <universal-link
        v-for="mention in getReplyMentions()"
        class="mention"
        :key="mention.id"
        :to="getProfileLocation(mention)"
        :title="getActorHandle(mention)"
      >
        <template #link-content>
          @{{ mention.username }}
        </template>
      </universal-link>
    </div>
    <post-content v-if="post.content" :post="post"></post-content>
    <post-poll
      v-if="post.poll"
      :poll="post.poll"
      :author="post.account"
      @poll-updated="onPollUpdate($event)"
    ></post-poll>
    <div class="post-attachments" v-if="post.media_attachments.length > 0">
      <post-attachment
        v-for="attachment in post.media_attachments"
        :attachment="attachment"
        :is-sensitive="post.sensitive"
        :key="attachment.id"
      ></post-attachment>
    </div>
    <universal-link
      v-for="linkedPost in post.links"
      class="post-quote"
      :to="getPostLocation(linkedPost)"
      :key="linkedPost.id"
    >
      <template #link-content>
        <post-preview :post="linkedPost"></post-preview>
      </template>
    </universal-link>
    <div
      class="post-reactions"
      :class="{ 'visible': getReactionCount() > 0, 'first-reaction': getReactionCount() === 1 }"
    >
      <button
        v-if="post.favourites_count > 0"
        class="reaction"
        :class="{ reacted: post.favourited }"
        @click="toggleLike()"
        :disabled="!canLike()"
      >
        <emoji-image :emoji="{ name: null, text: '👍', url: null }"></emoji-image>
        <span>{{ post.favourites_count }}</span>
      </button>
      <button
        v-for="reaction in post.pleroma.emoji_reactions"
        :key="reaction.name"
        class="reaction"
        :class="{ reacted: hasReacted(getReactionEmoji(reaction)) }"
        @click="onToggleReaction(getReactionEmoji(reaction))"
        :disabled="!canReact()"
      >
        <emoji-image :emoji="getReactionEmoji(reaction)"></emoji-image>
        <span>{{ reaction.count }}</span>
      </button>
    </div>
    <div class="post-footer">
      <router-link
        v-if="!inThread"
        class="icon"
        :title="$t('post.view_conversation')"
        :to="{ name: 'post', params: { postId: post.id }}"
        :target="conversationNewTab ? '_blank': undefined"
      >
        <icon-comment></icon-comment>
        <span>{{ post.replies_count }}</span>
      </router-link>
      <button
        v-else-if="inThread && canReply()"
        class="icon"
        :title="$t('post.reply')"
        @click="toggleReplyForm()"
      >
        <icon-comment></icon-comment>
        <span>{{ post.replies_count }}</span>
      </button>
      <span v-else class="icon">
        <icon-comment></icon-comment>
        <span>{{ post.replies_count }}</span>
      </span>
      <button
        v-if="canRepost()"
        class="icon"
        :class="{ highlighted: post.reblogged }"
        :disabled="isProcessingRepost"
        :title="post.reblogged ? $t('post.delete_repost') : $t('post.repost')"
        @click="toggleRepost()"
      >
        <icon-repost></icon-repost>
        <span>{{ post.reblogs_count }}</span>
      </button>
      <span v-else-if="isRepostPossible()" class="icon">
        <icon-repost></icon-repost>
        <span>{{ post.reblogs_count }}</span>
      </span>
      <button
        v-if="canLike()"
        class="icon"
        :class="{ highlighted: post.favourited }"
        :disabled="isProcessingLike"
        :title="post.favourited ? $t('post.unlike'): $t('post.like')"
        @click="toggleLike()"
      >
        <icon-like></icon-like>
      </button>
      <div
        v-if="canReact()"
        class="dropdown-menu-wrapper"
        v-click-away="hideEmojiPicker"
      >
        <button
          type="button"
          class="icon"
          :title="$t('post.react_with_emoji')"
          @click="toggleEmojiPicker"
        >
          <icon-smile></icon-smile>
        </button>
        <emoji-picker
          v-if="emojiPickerVisible"
          @emoji-picked="onToggleReaction($event)"
        ></emoji-picker>
      </div>
      <a
        v-if="getIpfsUrl()"
        class="icon"
        :title="$t('post.saved_to_ipfs')"
        :href="getIpfsUrl() || ''"
        target="_blank"
        rel="noreferrer"
      >
        <icon-ipfs></icon-ipfs>
      </a>
      <div
        class="dropdown-menu-wrapper"
        v-click-away="hideMenu"
      >
        <button class="icon" :title="$t('post.more')" @click="toggleMenu()">
          <icon-more></icon-more>
        </button>
        <menu v-if="menuVisible" class="dropdown-menu">
          <li>
            <a
              :href="post.url"
              class="icon"
              @click.prevent="hideMenu(); copyPostUrl()"
            >
              <icon-link></icon-link>
              <span>{{ $t('post.copy_link_to_post') }}</span>
            </a>
          </li>
          <li v-if="canCreateBookmark()">
            <button
              class="icon"
              @click="onCreateBookmark()"
            >
              <icon-bookmark></icon-bookmark>
              <span>{{ $t('post.bookmark') }}</span>
            </button>
          </li>
          <li v-if="canDeleteBookmark()">
            <button
              class="icon"
              @click="onDeleteBookmark()"
            >
              <icon-remove-bookmark></icon-remove-bookmark>
              <span>{{ $t('post.remove_bookmark') }}</span>
            </button>
          </li>
          <li v-if="canPin()">
            <button
              class="icon"
              @click="hideMenu(); onPin()"
            >
              <icon-pin></icon-pin>
              <span>{{ $t('post.add_to_featured') }}</span>
            </button>
          </li>
          <li v-if="canUnpin()">
            <button
              class="icon"
              @click="hideMenu(); onUnpin()"
            >
              <icon-unpin></icon-unpin>
              <span>{{ $t('post.remove_from_featured') }}</span>
            </button>
          </li>
          <li v-if="canSaveToIpfs()">
            <button
              class="icon"
              @click="hideMenu(); saveToIpfs()"
            >
              <icon-ipfs></icon-ipfs>
              <span>{{ $t('post.save_to_ipfs') }}</span>
            </button>
          </li>
          <li v-if="canRepostWithComment()">
            <button
              class="icon"
              @click="hideMenu(); onRepostWithComment()"
            >
              <icon-quote></icon-quote>
              <span>{{ $t('post.repost_with_comment') }}</span>
            </button>
          </li>
          <li v-if="canEditPost()">
            <button
              class="icon"
              @click="hideMenu(); onEditPost()"
            >
              <icon-edit></icon-edit>
              <span>{{ $t('post.edit_post') }}</span>
            </button>
          </li>
          <li v-if="canDeletePost()">
            <button
              class="icon"
              @click="hideMenu(); onDeletePost()"
            >
              <icon-trash></icon-trash>
              <span>{{ $t('post.delete_post') }}</span>
            </button>
          </li>
          <li v-if="canMute()">
            <button
              class="icon"
              @click="onMute()"
            >
              <icon-mute></icon-mute>
              <span>{{ $t('post.mute_author') }}</span>
            </button>
          </li>
          <li v-if="canUnmute()">
            <button
              class="icon"
              @click="onUnmute()"
            >
              <icon-unmute></icon-unmute>
              <span>{{ $t('post.unmute_author') }}</span>
            </button>
          </li>
          <li v-if="isAdmin()" role="separator"></li>
          <li v-if="isAdmin()">
            <button
              class="icon"
              @click="hideMenu(); copyObjectId()"
            >
              <icon-link></icon-link>
              <span>{{ $t('post.copy_object_id') }}</span>
            </button>
          </li>
          <li v-if="canLoadConversation()">
            <button
              class="icon"
              @click="hideMenu(); onLoadConversation()"
            >
              <icon-refresh></icon-refresh>
              <span>{{ $t('post.load_replies') }}</span>
            </button>
          </li>
        </menu>
      </div>
      <div class="crypto-widget">
        <crypto-address
          v-if="selectedPaymentOption?.address"
          :address="selectedPaymentOption.address"
        ></crypto-address>
        <universal-link
          v-if="selectedPaymentOption?.subscription"
          :to="selectedPaymentOption.subscription"
          :title="$t('post.become_a_subscriber')"
          class="subscribe-btn"
        >
          <template #link-content>{{ $t('post.subscribe') }}</template>
        </universal-link>
        <button
          v-for="option in getPaymentOptions()"
          :key="option.code"
          class="icon"
          :title="$t('post.send_coin', { name: option.name })"
          @click="togglePaymentAddress(option)"
        >
          <crypto-icon :code="option.code"></crypto-icon>
        </button>
      </div>
    </div>
    <post-editor
      v-if="replyFormVisible"
      class="comment-form"
      :post="null"
      :in-reply-to="post"
      :repost-of="null"
      @post-saved="onReplyCreated"
      @post-editor-closed="replyFormVisible = false"
    >
    </post-editor>
    <post-editor
      v-if="repostFormVisible"
      class="comment-form"
      :post="null"
      :in-reply-to="null"
      :repost-of="post"
      @post-saved="onRepostCreated"
      @post-editor-closed="repostFormVisible = false"
    >
    </post-editor>
  </div>
  <post-editor
    v-else
    class="post-edit-form"
    :post="post"
    :in-reply-to="null"
    :repost-of="null"
    @post-saved="onPostUpdated"
    @post-editor-closed="editorVisible = false"
  >
  </post-editor>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter, RouteLocationRaw } from "vue-router"

import { getEmojiShortcode, Emoji } from "@/api/emojis"
import { Poll } from "@/api/polls"
import {
  createBookmark,
  deleteBookmark,
  getPostSource,
  deletePost,
  favourite,
  unfavourite,
  createRepost,
  deleteRepost,
  pinPost,
  unpinPost,
  loadConversation,
  getReactionEmoji,
  createReaction,
  deleteReaction,
  makePermanent,
  Post,
  ReactionEmoji,
  Visibility,
} from "@/api/posts"
import { mute, unmute } from "@/api/relationships"
import {
  isRemoteProfile,
  Mention,
  Permissions,
  Profile,
  ProfileWrapper,
} from "@/api/users"
import IconIpfs from "@/assets/extra-icons/ipfs.svg?component"
import IconEdit from "@/assets/feather/edit-3.svg?component"
import IconLink from "@/assets/feather/link.svg?component"
import IconMore from "@/assets/feather/more-horizontal.svg?component"
import IconRefresh from "@/assets/feather/refresh-ccw.svg?component"
import IconRepost from "@/assets/feather/repeat.svg?component"
import IconTrash from "@/assets/feather/trash.svg?component"
import IconMute from "@/assets/feather/volume-x.svg?component"
import IconUnmute from "@/assets/feather/volume-2.svg?component"
import IconComment from "@/assets/forkawesome/comment-o.svg?component"
import IconLike from "@/assets/forkawesome/thumbs-o-up.svg?component"
import IconBookmark from "@/assets/tabler/bookmark.svg?component"
import IconRemoveBookmark from "@/assets/tabler/bookmark-off.svg?component"
import IconLeftUp from "@/assets/tabler/corner-left-up.svg?component"
import IconPin from "@/assets/tabler/pin.svg?component"
import IconUnpin from "@/assets/tabler/pinned-off.svg?component"
import IconQuote from "@/assets/tabler/quote.svg?component"
import IconSmile from "@/assets/feather/smile.svg?component"
import Avatar from "@/components/Avatar.vue"
import CryptoAddress from "@/components/CryptoAddress.vue"
import CryptoIcon from "@/components/CryptoIcon.vue"
import EmojiImage from "@/components/EmojiImage.vue"
import EmojiPicker from "@/components/EmojiPicker.vue"
import PostAttachment from "@/components/PostAttachment.vue"
import PostContent from "@/components/PostContent.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostPoll from "@/components/PostPoll.vue"
import PostPreview from "@/components/PostPreview.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import Timestamp from "@/components/Timestamp.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import UniversalLink from "@/components/UniversalLink.vue"
import { useClientConfig } from "@/composables/client-config"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useSubscribe } from "@/composables/subscribe"
import { useCurrentUser } from "@/composables/user"
import { useVisibility } from "@/composables/visibility"
import { getCurrencyByLabel, Currency, MONERO } from "@/utils/cryptocurrencies"
import { formatDateTime } from "@/utils/dates"

interface PaymentOption {
  code: string;
  name: string;
  address: string | null;
  subscription: string | RouteLocationRaw | null;
}

const router = useRouter()
const { t } = useI18n({ useScope: "global" })
const { getActorHandle, getActorLocation } = useActorHandle()
const { conversationNewTab } = useClientConfig()
const { currentUser, ensureAuthToken, isAdmin } = useCurrentUser()
const { instance } = useInstanceInfo()
const { getSubscriptionLink } = useSubscribe()
const { VISIBILITY_MAP } = useVisibility()

const props = defineProps<{
  post: Post,
  highlighted: boolean,
  inThread: boolean,
}>()

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "highlight", postId: string | null): void,
  (event: "navigate-to", postId: string): void,
  (event: "comment-created", post: Post): void,
  (event: "post-deleted"): void,
}>()

const replyFormVisible = ref(false)
const repostFormVisible = ref(false)
const editorVisible = ref(false)
const isProcessingRepost = ref(false)
const isProcessingLike = ref(false)
const emojiPickerVisible = ref(false)
const menuVisible = ref(false)
const selectedPaymentOption = ref<PaymentOption | null>(null)

const author = computed(() => new ProfileWrapper(props.post.account))

function getProfileLocation(profile: Mention | Profile): string | RouteLocationRaw {
  if (currentUser.value === null && isRemoteProfile(profile)) {
    // Redirect to remote servers when viewing as guest
    return profile.url
  }
  return getActorLocation("profile", profile)
}

function getPostLocation(post: Post): string | RouteLocationRaw {
  if (currentUser.value === null && isRemoteProfile(post.account)) {
    // Redirect to remote servers when viewing as guest
    return post.uri
  }
  return { name: "post", params: { postId: post.id } }
}

function highlight(postId: string | null) {
  emit("highlight", postId)
}

function scrollTo(postId: string) {
  emit("navigate-to", postId)
}

function getVisibilityDisplay(): string {
  return VISIBILITY_MAP[props.post.visibility].description
}

function getReplyMentions(): Mention[] {
  if (
    props.post.in_reply_to_id === null ||
    props.post.in_reply_to_account_id === null ||
    props.post.pleroma.in_reply_to_account_acct === null
  ) {
    return []
  }
  const inReplyToUser = {
    id: props.post.in_reply_to_account_id,
    acct: props.post.pleroma.in_reply_to_account_acct,
    username: props.post.pleroma.in_reply_to_account_acct.split("@")[0],
    url: "",
  }
  return [
    inReplyToUser,
    ...props.post.mentions
      .filter(mention => mention.id !== props.post.in_reply_to_account_id),
  ]
}

function canReply(): boolean {
  if (currentUser.value === null) {
    return false
  }
  return currentUser.value.role.permissions_names.includes(Permissions.CreatePost)
}

function toggleReplyForm() {
  replyFormVisible.value = !replyFormVisible.value
}

function onReplyCreated(post: Post) {
  replyFormVisible.value = false
  repostFormVisible.value = false
  emit("comment-created", post)
}

function canRepostWithComment(): boolean {
  return (
    props.inThread &&
    props.post.visibility === Visibility.Public &&
    canReply()
  )
}

async function onRepostWithComment() {
  replyFormVisible.value = false
  repostFormVisible.value = true
}

function onRepostCreated() {
  repostFormVisible.value = false
  router.push({ name: "home" })
}

function isRepostPossible(): boolean {
  return props.post.visibility === Visibility.Public
}

function canRepost(): boolean {
  if (currentUser.value === null) {
    return false
  }
  return (
    isRepostPossible() &&
    currentUser.value.role.permissions_names.includes(Permissions.CreatePost)
  )
}

async function toggleRepost() {
  if (currentUser.value === null) {
    return
  }
  const authToken = ensureAuthToken()
  isProcessingRepost.value = true
  let updatedPost
  try {
    if (props.post.reblogged) {
      updatedPost = await deleteRepost(authToken, props.post.id)
    } else {
      updatedPost = await createRepost(authToken, props.post.id)
    }
  } catch (error) {
    isProcessingRepost.value = false
    console.error(error)
    return
  }
  isProcessingRepost.value = false
  props.post.reblogs_count = updatedPost.reblogs_count
  props.post.reblogged = updatedPost.reblogged
}

function onPollUpdate(poll: Poll) {
  props.post.poll = poll
}

function getReactionCount(): number {
  return props.post.favourites_count + props.post.pleroma.emoji_reactions.length
}

function canLike(): boolean {
  return currentUser.value !== null
}

async function toggleLike() {
  if (currentUser.value === null) {
    return
  }
  const authToken = ensureAuthToken()
  isProcessingLike.value = true
  let updatedPost
  try {
    if (props.post.favourited) {
      updatedPost = await unfavourite(authToken, props.post.id)
    } else {
      updatedPost = await favourite(authToken, props.post.id)
    }
  } catch (error) {
    isProcessingLike.value = false
    console.error(error)
    return
  }
  isProcessingLike.value = false
  props.post.favourites_count = updatedPost.favourites_count
  props.post.favourited = updatedPost.favourited
}

function canReact(): boolean {
  return currentUser.value !== null
}

function hasReacted(emoji: Emoji | ReactionEmoji): boolean {
  const reaction = props.post.pleroma.emoji_reactions
    .find((reaction) => {
      const reactionEmoji = getReactionEmoji(reaction)
      return reactionEmoji.text === emoji.text
    })
  return reaction?.me || false
}

async function onToggleReaction(emoji: Emoji | ReactionEmoji) {
  if (currentUser.value === null) {
    return
  }
  const authToken = ensureAuthToken()
  if (hasReacted(emoji)) {
    const updatedPost = await deleteReaction(authToken, props.post.id, emoji.text)
    props.post.favourites_count = updatedPost.favourites_count
    props.post.pleroma = updatedPost.pleroma
  } else {
    const updatedPost = await createReaction(authToken, props.post.id, emoji.text)
    props.post.favourites_count = updatedPost.favourites_count
    props.post.pleroma = updatedPost.pleroma
  }
}

function toggleEmojiPicker() {
  emojiPickerVisible.value = !emojiPickerVisible.value
}

function hideEmojiPicker() {
  emojiPickerVisible.value = false
}

function toggleMenu() {
  menuVisible.value = !menuVisible.value
}

function hideMenu() {
  menuVisible.value = false
}

function copyPostUrl(): void {
  navigator.clipboard.writeText(props.post.url)
}

function copyObjectId(): void {
  navigator.clipboard.writeText(props.post.uri)
}

function canCreateBookmark(): boolean {
  return currentUser.value !== null && !props.post.bookmarked
}

function canDeleteBookmark(): boolean {
  return currentUser.value !== null && props.post.bookmarked
}

async function onCreateBookmark() {
  const authToken = ensureAuthToken()
  const { bookmarked } = await createBookmark(authToken, props.post.id)
  props.post.bookmarked = bookmarked
}

async function onDeleteBookmark() {
  const authToken = ensureAuthToken()
  const { bookmarked } = await deleteBookmark(authToken, props.post.id)
  props.post.bookmarked = bookmarked
}

function canPin(): boolean {
  return (
    props.post.account.id === currentUser.value?.id &&
    props.post.visibility === Visibility.Public &&
    !props.post.pinned
  )
}

async function onPin() {
  const authToken = ensureAuthToken()
  const { pinned } = await pinPost(authToken, props.post.id)
  props.post.pinned = pinned
}

function canUnpin(): boolean {
  return (
    props.post.account.id === currentUser.value?.id &&
    props.post.visibility === Visibility.Public &&
    props.post.pinned
  )
}

async function onUnpin() {
  const authToken = ensureAuthToken()
  const { pinned } = await unpinPost(authToken, props.post.id)
  props.post.pinned = pinned
}

function getIpfsUrl(): string | null {
  const gatewayUrl = instance.value?.ipfs_gateway_url
  if (
    !gatewayUrl ||
    props.post.ipfs_cid === null
  ) {
    return null
  }
  return `${gatewayUrl}/ipfs/${props.post.ipfs_cid}`
}

function canSaveToIpfs(): boolean {
  return (
    Boolean(instance.value?.ipfs_gateway_url) &&
    props.post.account.id === currentUser.value?.id &&
    props.post.visibility === "public" &&
    props.post.ipfs_cid === null
  )
}

async function saveToIpfs() {
  if (!currentUser.value || !instance.value || !instance.value.ipfs_gateway_url) {
    return
  }
  const authToken = ensureAuthToken()
  const { ipfs_cid } = await makePermanent(authToken, props.post.id)
  props.post.ipfs_cid = ipfs_cid
}

function canEditPost(): boolean {
  return props.post.account.id === currentUser.value?.id
}

async function onEditPost() {
  const authToken = ensureAuthToken()
  const postSource = await getPostSource(authToken, props.post.id)
  if (postSource.content_type === "text/html") {
    throw new Error("post can not be edited")
  }
  props.post.contentSource = postSource.text
  editorVisible.value = true
}

function onPostUpdated(updatedPost: Post) {
  Object.assign(props.post, updatedPost)
  editorVisible.value = false
}

function canDeletePost(): boolean {
  return props.post.account.id === currentUser.value?.id
}

async function onDeletePost() {
  if (confirm(t("post.confirm_delete_this_post"))) {
    const authToken = ensureAuthToken()
    await deletePost(authToken, props.post.id)
    emit("post-deleted")
  }
}

function canMute(): boolean {
  return (
    props.post.account.id !== currentUser.value?.id &&
    // Don't show menu item if post.relationship property is not set
    !!props.post.relationship &&
    !props.post.relationship.muting
  )
}

async function onMute() {
  const authToken = ensureAuthToken()
  props.post.relationship = await mute(authToken, props.post.account.id)
}

function canUnmute(): boolean {
  return (
    props.post.account.id !== currentUser.value?.id &&
    // Don't show menu item if post.relationship property is not set
    !!props.post.relationship &&
    props.post.relationship.muting
  )
}

async function onUnmute() {
  const authToken = ensureAuthToken()
  props.post.relationship = await unmute(authToken, props.post.account.id)
}

function canLoadConversation(): boolean {
  return (
    currentUser.value !== null &&
    isAdmin() &&
    !author.value.isLocal()
  )
}

async function onLoadConversation() {
  alert(t("misc.reload_page"))
  await loadConversation(
    ensureAuthToken(),
    props.post.id,
  )
}

function getPaymentOptions(): PaymentOption[] {
  const options: PaymentOption[] = []
  for (const field of props.post.account.fields) {
    const currency = getCurrencyByLabel(field.name)
    if (!currency) {
      continue
    }
    if (options.some(option => option.code === currency.code)) {
      continue
    }
    const address = field.value.trim()
    options.push({
      code: currency.code,
      name: currency.name,
      address,
      subscription: null,
    })
  }
  const subscriptionLink = getSubscriptionLink(props.post.account)
  if (subscriptionLink) {
    // TODO: use CAIP-2 ID -> symbol mapping
    let currency: Currency
    if (subscriptionLink.type === "monero") {
      currency = MONERO
    } else {
      throw new Error("invalid subscription type")
    }
    const option = options.find((option) => {
      return option.code === currency.code
    })
    if (option) {
      // Add subscription link if option already exists
      option.subscription = subscriptionLink.location
    } else {
      options.push({
        code: currency.code,
        name: currency.name,
        address: null,
        subscription: subscriptionLink.location,
      })
    }
  }
  return options
}

function togglePaymentAddress(option: PaymentOption) {
  selectedPaymentOption.value = option.code === selectedPaymentOption.value?.code
    ? null
    : option
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

$reaction-border: 1px;
$reaction-padding: 5px;

.post {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  text-align: left;

  &.highlighted {
    /* requires nav menu offset on small screens */
    outline: 1px solid var(--highlight-color);
  }
}

.post-header {
  @include post-icon;

  align-items: center;
  color: var(--secondary-text-color);
  display: flex;
  flex-direction: row;
  gap: 3px calc($block-inner-padding / 2);
  padding: $block-inner-padding $block-inner-padding 0;
  white-space: nowrap;

  @media screen and (max-width: $screen-breakpoint-medium) {
    align-items: start;
  }

  .floating-avatar {
    @include floating-avatar;

    align-self: center;

    @media screen and (min-width: $screen-breakpoint-medium + 1) {
      margin-right: calc(0px - $block-inner-padding / 2);
    }
  }

  .name-group {
    display: flex;
    flex-grow: 1;
    gap: inherit;
    overflow: hidden;

    @media screen and (max-width: $screen-breakpoint-medium) {
      flex-direction: column;
    }
  }

  .display-name-link {
    overflow: hidden;
    text-overflow: ellipsis;

    .display-name {
      color: var(--text-color);
      font-weight: bold;
    }
  }

  .actor-address {
    flex-basis: 25%;
    flex-grow: 1;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: all;
  }

  .timestamp-group {
    align-items: center;
    display: flex;
    flex-direction: row;
    gap: inherit;
    justify-content: right;
    text-align: right;
  }

  .icon-small svg {
    $icon-size-small: calc($icon-size / $line-height);

    height: $icon-size-small;
    min-width: $icon-size-small;
    width: $icon-size-small;
  }

  .timestamp {
    color: var(--secondary-text-color);

    &:hover {
      color: var(--secondary-text-hover-color);
    }
  }
}

@media screen and (max-width: $screen-breakpoint-x-small) {
  .post-header {
    .timestamp-group {
      column-gap: calc($block-inner-padding / 4);
      flex-basis: 25%;
      flex-wrap: wrap;
      height: calc($text-font-size * $line-height * 2); /* same as avatar */
    }

    .timestamp {
      flex-basis: 100%;
      order: -1;
    }
  }
}

.post-subheader {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $whitespace;
  padding: calc($block-inner-padding / 2) $block-inner-padding 0;

  .replying-to {
    color: var(--secondary-text-color);
  }

  .mention {
    @include block-link;

    overflow: hidden;
    word-wrap: break-word;
  }
}

.post-content {
  margin: $block-inner-padding 0;
  padding: 0 $block-inner-padding;
}

.post-poll {
  margin: $block-inner-padding 0;
  padding: 0 $block-inner-padding;
}

.post-attachments {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);
  margin: $block-inner-padding 0;
  padding: 0 $block-inner-padding;
}

.post-quote {
  color: inherit;
  display: block;
  margin: 0 $block-inner-padding $block-inner-padding;

  &:hover {
    color: inherit;
  }
}

.post-reactions {
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $input-padding;
  margin: $block-inner-padding 0;
  padding: 0 $block-inner-padding;
  transition: height 0.3s ease-in-out, margin 0.3s ease-in-out;

  /* TODO: use @starting-style */
  &:not(.visible) {
    height: 0;
    margin: 0;
  }

  &.first-reaction {
    height: $emoji-size + $reaction-padding * 2 + $reaction-border * 2;
    overflow: hidden;
  }
}

.reaction {
  align-items: center;
  background-color: var(--widget-background-color);
  border: $reaction-border solid var(--widget-background-color);
  border-radius: $btn-border-radius;
  display: flex;
  flex-direction: row;
  gap: $whitespace;
  padding: $reaction-padding;

  .emoji {
    max-width: $emoji-size * 3;
    width: auto;
  }

  &.reacted {
    background-color: var(--widget-active-background-color);
    border: 1px solid var(--widget-active-border-color);
  }

  &:not(:disabled):hover {
    background-color: var(--widget-active-background-color);
  }
}

.post-footer {
  @include post-icon;

  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: calc($block-inner-padding / 2);
  padding: 0 $block-inner-padding $block-inner-padding;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.dropdown-menu-wrapper {
  @include block-dropdown-menu;

  a.icon,
  button.icon {
    gap: calc($block-inner-padding / 2);
  }
}

.crypto-widget {
  display: flex;
  flex-grow: 1;
  gap: calc($block-inner-padding / 2);
  justify-content: right;

  .crypto-address {
    max-width: 200px;
    width: 100%;
  }

  .subscribe-btn {
    background-color: var(--widget-background-color);
    border-radius: calc($icon-size / 2);
    font-family: monospace;
    font-size: 12px;
    line-height: $icon-size;
    padding: 0 7px;
  }

  .icon svg {
    /* Make filled icons lighter to match line icons */
    opacity: 0.75;
  }
}

.comment-form {
  border-top: 1px solid var(--separator-color);
}
</style>
