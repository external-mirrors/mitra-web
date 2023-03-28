<template>
  <div
    class="post"
    :class="{ highlighted: highlighted }"
    :data-post-id="post.id"
    :id="post.id"
  >
    <div class="post-header">
      <a
        class="floating-avatar"
        :href="post.account.url"
        :title="author.getDisplayName()"
        @click="openProfile($event, post.account)"
      >
        <avatar :profile="post.account"></avatar>
      </a>
      <a
        class="display-name-link"
        :href="post.account.url"
        :title="author.getDisplayName()"
        @click="openProfile($event, post.account)"
      >
        <profile-display-name :profile="author"></profile-display-name>
      </a>
      <div class="actor-address" :title="'@' + getActorAddress(post.account)">
        @{{ getActorAddress(post.account) }}
      </div>
      <a
        v-if="inThread && post.in_reply_to_id"
        class="icon"
        title="Go to previous post"
        @mouseover="highlight(post.in_reply_to_id)"
        @mouseleave="highlight(null)"
        @click.prevent="scrollTo(post.in_reply_to_id)"
      >
        <img src="@/assets/tabler/corner-left-up.svg">
      </a>
      <span
        class="icon icon-small"
        :title="getVisibilityDisplay()"
      >
        <visibility-icon :visibility="post.visibility"></visibility-icon>
      </span>
      <span v-if="post.edited_at">edited</span>
      <a
        class="timestamp"
        :href="post.uri"
        :title="formatDateTime(post.created_at)"
        @click="openPost($event, post.id)"
      >
        {{ humanizeDate(post.created_at) }}
      </a>
    </div>
    <div class="post-subheader" v-if="getReplyMentions().length > 0">
      <span>replying to</span>
      <a
        v-for="mention in getReplyMentions()"
        :key="mention.id"
        :href="mention.url"
        :title="getActorAddress(mention)"
        @click="openProfile($event, mention)"
      >
        @{{ mention.username }}
      </a>
    </div>
    <post-content :post="post"></post-content>
    <div class="post-attachments" v-if="post.media_attachments.length > 0">
      <post-attachment
        v-for="attachment in post.media_attachments"
        :attachment="attachment"
        :key="attachment.id"
      ></post-attachment>
    </div>
    <a
      v-for="linkedPost in post.links"
      class="post-quote"
      :href="linkedPost.uri"
      :key="linkedPost.id"
      @click="openPost($event, linkedPost.id, true)"
    >
      <div class="quote-header">
        <avatar :profile="linkedPost.account"></avatar>
        <profile-display-name :profile="getQuoteAuthor(linkedPost)">
        </profile-display-name>
        <span class="actor-address">
          @{{ getActorAddress(linkedPost.account) }}
        </span>
      </div>
      <post-content :post="linkedPost"></post-content>
      <div class="quote-attachments" v-if="linkedPost.media_attachments.length > 0">
        <post-attachment
          v-for="attachment in linkedPost.media_attachments"
          :attachment="attachment"
          :key="attachment.id"
        ></post-attachment>
      </div>
    </a>
    <div class="post-footer">
      <router-link
        v-if="!inThread"
        class="icon"
        title="View replies"
        :to="{ name: 'post', params: { postId: post.id }}"
      >
        <img src="@/assets/forkawesome/comment-o.svg">
        <span>{{ post.replies_count }}</span>
      </router-link>
      <button
        v-else-if="inThread && canReply()"
        class="icon"
        title="Reply"
        @click="commentFormVisible = !commentFormVisible"
      >
        <img src="@/assets/forkawesome/comment-o.svg">
        <span>{{ post.replies_count }}</span>
      </button>
      <span v-else class="icon">
        <img src="@/assets/forkawesome/comment-o.svg">
        <span>{{ post.replies_count }}</span>
      </span>
      <button
        v-if="canRepost()"
        class="icon"
        :class="{ highlighted: post.reblogged }"
        title="Repost"
        @click="toggleRepost()"
      >
        <img src="@/assets/feather/repeat.svg">
        <span>{{ post.reblogs_count }}</span>
      </button>
      <span v-else class="icon">
        <img src="@/assets/feather/repeat.svg">
        <span>{{ post.reblogs_count }}</span>
      </span>
      <button
        v-if="canLike()"
        class="icon"
        :class="{ highlighted: post.favourited }"
        title="Like"
        @click="toggleLike()"
      >
        <img src="@/assets/forkawesome/thumbs-o-up.svg">
        <span>{{ post.favourites_count }}</span>
      </button>
      <span v-else class="icon">
        <img src="@/assets/forkawesome/thumbs-o-up.svg">
        <span>{{ post.favourites_count }}</span>
      </span>
      <a
        v-if="getIpfsUrl()"
        class="icon"
        title="Saved to IPFS"
        :href="getIpfsUrl() || ''"
        target="_blank"
        rel="noreferrer"
      >
        <img src="@/assets/ipfs.svg">
      </a>
      <router-link
        v-if="isTokenized()"
        class="icon tokenized"
        title="View token"
        :to="{ name: 'post-overlay', params: { postId: post.id }}"
      >
        <img src="@/assets/forkawesome/diamond.svg">
      </router-link>
      <a
        v-if="isWaitingForToken"
        class="icon tokenize-progress"
        title="Tokenizing..."
      >
        <img src="@/assets/forkawesome/diamond.svg">
      </a>
      <div
        class="dropdown-menu-wrapper"
        v-if="canSaveToIpfs() || canMintToken() || canDeletePost()"
        v-click-away="hideMenu"
      >
        <button class="icon" title="More" @click="toggleMenu()">
          <img src="@/assets/feather/more-horizontal.svg">
        </button>
        <menu v-if="menuVisible" class="dropdown-menu">
          <li v-if="canSaveToIpfs()">
            <button
              class="icon"
              title="Save to IPFS"
              @click="hideMenu(); saveToIpfs()"
            >
              <img src="@/assets/ipfs.svg">
              <span>Save to IPFS</span>
            </button>
          </li>
          <li v-if="canMintToken()">
            <button
              class="icon"
              title="Mint NFT"
              @click="hideMenu(); onMintToken()"
            >
              <img src="@/assets/forkawesome/diamond.svg">
              <span>Mint NFT</span>
            </button>
          </li>
          <li v-if="canDeletePost()">
            <button
              class="icon"
              title="Delete post"
              @click="hideMenu(); onDeletePost()"
            >
              <img src="@/assets/feather/trash.svg">
              <span>Delete post</span>
            </button>
          </li>
        </menu>
      </div>
      <div class="crypto-widget">
        <crypto-address
          v-if="selectedPaymentAddress"
          :address="selectedPaymentAddress"
        ></crypto-address>
        <button
          v-for="option in getPaymentOptions()"
          :key="option.code"
          class="icon"
          :title="'Send '+ option.name"
          @click="togglePaymentAddress(option)"
        >
          <img :src="require('@/assets/cryptoicons/' + option.code.toLowerCase() + '.svg')">
        </button>
      </div>
    </div>
    <post-editor
      v-if="commentFormVisible"
      :in-reply-to="post"
      @post-created="onCommentCreated"
    >
    </post-editor>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { $, $computed, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import {
  makePermanent,
  getMintingAuthorization,
  mintToken,
  onTokenMinted,
} from "@/api/nft"
import {
  VISIBILITY_MAP,
  Mention,
  Post,
  getPost,
  deletePost,
  favourite,
  unfavourite,
  createRepost,
  deleteRepost,
} from "@/api/posts"
import {
  Permissions,
  Profile,
  ProfileWrapper,
} from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import CryptoAddress from "@/components/CryptoAddress.vue"
import PostAttachment from "@/components/PostAttachment.vue"
import PostContent from "@/components/PostContent.vue"
import PostEditor from "@/components/PostEditor.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { CRYPTOCURRENCIES } from "@/utils/cryptocurrencies"
import { getWallet } from "@/utils/ethereum"
import { formatDateTime, humanizeDate } from "@/utils/dates"

interface PaymentOption {
  code: string;
  name: string;
  address: string;
}

const router = useRouter()
const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { instance, getActorAddress } = $(useInstanceInfo())

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  post: Post,
  highlighted: boolean,
  inThread: boolean,
}>()

/* eslint-disable-next-line no-undef, func-call-spacing */
const emit = defineEmits<{
  (event: "highlight", postId: string | null): void,
  (event: "navigate-to", postId: string): void,
  (event: "comment-created", post: Post): void,
  (event: "post-deleted"): void,
}>()

let commentFormVisible = $ref(false)
let menuVisible = $ref(false)
let selectedPaymentAddress = $ref<string | null>(null)
let isWaitingForToken = $ref(false)

const blockchain = $computed(() => instance?.blockchains[0])
const author = $computed(() => new ProfileWrapper(props.post.account))

function openProfile(event: Event, profile: Mention | Profile) {
  if (currentUser === null) {
    // Viewing as guest; do not override click handler
    return
  }
  event.preventDefault()
  router.push({ name: "profile-by-acct", params: { acct: profile.acct } })
}

function highlight(postId: string | null) {
  emit("highlight", postId)
}

function scrollTo(postId: string) {
  emit("navigate-to", postId)
}

function openPost(event: Event, postId: string, forcePush = false) {
  if (currentUser === null) {
    // Viewing as guest; do not override click handler
    return
  }
  event.preventDefault()
  if (props.inThread && !forcePush) {
    scrollTo(postId)
  } else {
    router.push({ name: "post", params: { postId: postId } })
  }
}

function getVisibilityDisplay(): string {
  return VISIBILITY_MAP[props.post.visibility]
}

function getReplyMentions(): Mention[] {
  if (props.post.in_reply_to_id === null) {
    return []
  }
  return props.post.mentions
}

function getQuoteAuthor(post: Post): ProfileWrapper {
  return new ProfileWrapper(post.account)
}

function canReply(): boolean {
  if (currentUser === null) {
    return false
  }
  return currentUser.role.permissions.includes(Permissions.CreatePost)
}

function onCommentCreated(post: Post) {
  commentFormVisible = false
  emit("comment-created", post)
}

function canRepost(): boolean {
  if (currentUser === null) {
    return false
  }
  return (
    props.post.visibility === "public" &&
    currentUser.role.permissions.includes(Permissions.CreatePost)
  )
}

async function toggleRepost() {
  if (!currentUser) {
    return
  }
  const authToken = ensureAuthToken()
  let updatedPost
  try {
    if (props.post.reblogged) {
      updatedPost = await deleteRepost(authToken, props.post.id)
    } else {
      updatedPost = await createRepost(authToken, props.post.id)
    }
  } catch (error) {
    console.log(error)
    return
  }
  props.post.reblogs_count = updatedPost.reblogs_count
  props.post.reblogged = updatedPost.reblogged
}

function canLike(): boolean {
  return currentUser !== null
}

async function toggleLike() {
  if (!currentUser) {
    return
  }
  const authToken = ensureAuthToken()
  let updatedPost
  try {
    if (props.post.favourited) {
      updatedPost = await unfavourite(authToken, props.post.id)
    } else {
      updatedPost = await favourite(authToken, props.post.id)
    }
  } catch (error) {
    console.log(error)
    return
  }
  props.post.favourites_count = updatedPost.favourites_count
  props.post.favourited = updatedPost.favourited
}

function toggleMenu() {
  menuVisible = !menuVisible
}

function hideMenu() {
  menuVisible = false
}

function getIpfsUrl(): string | null {
  const gatewayUrl = instance?.ipfs_gateway_url
  if (
    !gatewayUrl ||
    props.post.ipfs_cid === null ||
    isTokenized() ||
    isWaitingForToken
  ) {
    return null
  }
  return `${gatewayUrl}/ipfs/${props.post.ipfs_cid}`
}

function canSaveToIpfs(): boolean {
  return (
    Boolean(instance?.ipfs_gateway_url) &&
    props.post.account.id === currentUser?.id &&
    props.post.visibility === "public" &&
    props.post.ipfs_cid === null &&
    !isWaitingForToken
  )
}

async function saveToIpfs() {
  if (!currentUser || !instance || !instance.ipfs_gateway_url) {
    return
  }
  const authToken = ensureAuthToken()
  const { ipfs_cid } = await makePermanent(authToken, props.post.id)
  props.post.ipfs_cid = ipfs_cid
}

function canDeletePost(): boolean {
  return props.post.account.id === currentUser?.id
}

async function onDeletePost() {
  if (confirm("Are you sure you want to delete this post?")) {
    const authToken = ensureAuthToken()
    await deletePost(authToken, props.post.id)
    emit("post-deleted")
  }
}

function getPaymentOptions(): PaymentOption[] {
  const items = []
  for (const [code, name] of CRYPTOCURRENCIES) {
    const symbol = `$${code}`
    const field = props.post.account.fields.find(item => {
      return item.name.toLowerCase() === symbol.toLowerCase()
    })
    if (!field) {
      continue
    }
    const address = field.value.trim()
    items.push({ code, name, address })
  }
  return items
}

function togglePaymentAddress(payment: PaymentOption) {
  selectedPaymentAddress = selectedPaymentAddress === payment.address ? null : payment.address
}

function isTokenized(): boolean {
  return props.post.token_id !== null
}

function canMintToken(): boolean {
  return (
    Boolean(instance?.ipfs_gateway_url) &&
    Boolean(blockchain?.contract_address) &&
    Boolean(blockchain?.features.minter) &&
    props.post.account.id === currentUser?.id &&
    props.post.visibility === "public" &&
    author.getVerifiedEthereumAddress() !== null &&
    !isTokenized() &&
    !isWaitingForToken
  )
}

async function onMintToken() {
  if (
    !instance ||
    !blockchain?.contract_address
  ) {
    return
  }
  if (isTokenized() || isWaitingForToken) {
    return
  }
  const authorAddress = author.getVerifiedEthereumAddress()
  if (!authorAddress) {
    return
  }
  const authToken = ensureAuthToken()
  isWaitingForToken = true
  if (props.post.ipfs_cid === null) {
    const { ipfs_cid } = await makePermanent(authToken, props.post.id)
    props.post.ipfs_cid = ipfs_cid
  }
  const tokenUri = `ipfs://${props.post.ipfs_cid}`
  console.info("token URI:", tokenUri)
  let signature
  try {
    signature = await getMintingAuthorization(authToken, props.post.id)
  } catch (error) {
    console.log(error)
    isWaitingForToken = false
    return
  }
  const signer = await getWallet()
  if (!signer) {
    isWaitingForToken = false
    return
  }
  try {
    const transaction = await mintToken(
      blockchain.contract_address,
      signer,
      authorAddress,
      tokenUri,
      signature,
    )
    await onTokenMinted(authToken, props.post.id, transaction.hash)
  } catch (error) {
    // User has rejected tx
    isWaitingForToken = false
    return
  }
  // Wait until the server sees the tx
  const intervalId = setInterval(async () => {
    const updatedPost = await getPost(authToken, props.post.id)
    if (updatedPost.token_id) {
      clearInterval(intervalId)
      isWaitingForToken = false
      // Update post
      props.post.token_id = updatedPost.token_id
      props.post.token_tx_id = updatedPost.token_tx_id
    }
  }, 5000)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
@import "../styles/mixins";

.post {
  background-color: $block-background-color;
  border-radius: $block-border-radius;
  text-align: left;

  &.highlighted {
    outline: 1px solid #FFA500;
  }
}

.post-header {
  @include post-icon;

  align-items: center;
  color: $secondary-text-color;
  display: flex;
  flex-direction: row;
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding $block-inner-padding 0;

  .floating-avatar {
    @include floating-avatar;

    @media screen and (min-width: $screen-breakpoint-medium + 1) {
      margin-right: calc(0px - $block-inner-padding / 2);
    }
  }

  .display-name-link {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .display-name {
      color: $text-color;
      font-weight: bold;
    }
  }

  .actor-address {
    flex-basis: 25%;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: all;
  }

  .timestamp {
    color: $secondary-text-color;
    text-align: right;
    white-space: nowrap;

    &:hover {
      color: $secondary-text-hover-color;
    }
  }
}

.post-subheader {
  color: $secondary-text-color;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $whitespace;
  padding: calc($block-inner-padding / 4) $block-inner-padding 0;

  a {
    @include block-link;

    overflow: hidden;
    word-wrap: break-word;
  }
}

.post-attachments,
.quote-attachments {
  padding: 0 $block-inner-padding $block-inner-padding;
}

.post-quote {
  border: 1px solid $separator-color;
  border-radius: $block-border-radius;
  color: inherit;
  display: block;
  margin: 0 $block-inner-padding $block-inner-padding;

  &:hover {
    color: inherit;
  }
}

.quote-header {
  align-items: center;
  color: $secondary-text-color;
  display: flex;
  flex-direction: row;
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding $block-inner-padding 0;

  .avatar {
    height: $icon-size;
    width: $icon-size;
  }

  .display-name {
    color: $text-color;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-address {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.post-footer {
  @include post-icon;

  align-items: center;
  display: flex;
  flex-direction: row;
  gap: calc($block-inner-padding / 2);
  padding: 0 $block-inner-padding $block-inner-padding;

  .icon {
    &.tokenized img {
      filter: invert(51%) sepia(48%) saturate(437%) hue-rotate(222deg) brightness(92%) contrast(84%);
    }

    &.tokenize-progress img {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.dropdown-menu-wrapper {
  @include block-dropdown-menu;
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

  .icon img {
    /* Make filled icons lighter to match line icons */
    opacity: 0.75;
  }
}

.post-form {
  border-top: 1px solid #f3f2ed;
}

@media screen and (max-width: $screen-breakpoint-small) {
  .post-footer {
    flex-wrap: wrap;
  }
}
</style>
