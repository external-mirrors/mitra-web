<template>
  <div class="post" :class="{ 'highlighted': highlighted }" :data-post-id="post.id" :id="post.id">
    <div class="post-header">
      <router-link class="floating-avatar" :to="{ name: 'profile', params: { profileId: post.account.id }}">
        <avatar :profile="post.account"></avatar>
      </router-link>
      <router-link
        class="display-name"
        :to="{ name: 'profile', params: { profileId: post.account.id }}"
        :title="authorName"
      >
        {{ authorName }}
      </router-link>
      <div class="actor-address" :title="'@' + actorAddress">
        @{{ actorAddress }}
      </div>
      <a
        v-if="inThread && post.in_reply_to_id"
        class="icon"
        title="Go to previous post"
        @mouseover="highlight(post.in_reply_to_id)"
        @mouseleave="highlight(null)"
        @click="navigateTo(post.in_reply_to_id)"
      >
        <img :src="require('@/assets/tabler/corner-left-up.svg')">
      </a>
      <a
        class="icon icon-small"
        :href="post.uri"
        :title="visibilityDisplay"
        target="_blank"
        rel="noreferrer"
      >
        <visibility-icon :visibility="post.visibility"></visibility-icon>
      </a>
      <a
        class="timestamp"
        @click="navigateTo(post.id)"
      >
        {{ formatDate(post.created_at) }}
      </a>
    </div>
    <div class="post-subheader" v-if="replyingTo.length > 0">
      <span>replying to</span>
      <router-link
        v-for="mention in replyingTo"
        :to="{ name: 'profile', params: { profileId: mention.id }}"
        :key="mention.id"
      >
        @{{ mention.username }}
      </router-link>
    </div>
    <div class="post-content" ref="postContent" v-html="post.content"></div>
    <div class="post-attachment" v-if="post.media_attachments.length > 0">
      <img v-for="attachment in post.media_attachments" :src="attachment.url" :key="attachment.id">
    </div>
    <div class="post-footer">
      <router-link
        v-if="!inThread"
        class="icon"
        title="View replies"
        :to="{ name: 'post', params: { postId: post.id }}"
      >
        <img :src="require('@/assets/forkawesome/comment-o.svg')">
        <span>{{ post.replies_count }}</span>
      </router-link>
      <button
        v-else-if="inThread && canReply()"
        class="icon"
        title="Reply"
        @click="commentFormVisible = !commentFormVisible"
      >
        <img :src="require('@/assets/forkawesome/comment-o.svg')">
        <span>{{ post.replies_count }}</span>
      </button>
      <span v-else class="icon">
        <img :src="require('@/assets/forkawesome/comment-o.svg')">
        <span>{{ post.replies_count }}</span>
      </span>
      <button
        v-if="canRepost()"
        class="icon"
        :class="{ 'highlighted': post.reblogged }"
        title="Repost"
        @click="toggleRepost()"
      >
        <img :src="require('@/assets/feather/repeat.svg')">
        <span>{{ post.reblogs_count }}</span>
      </button>
      <span v-else class="icon">
        <img :src="require('@/assets/feather/repeat.svg')">
        <span>{{ post.reblogs_count }}</span>
      </span>
      <button
        v-if="canLike()"
        class="icon"
        :class="{ 'highlighted': post.favourited }"
        title="Like"
        @click="toggleLike()"
      >
        <img :src="require('@/assets/forkawesome/thumbs-o-up.svg')">
        <span>{{ post.favourites_count }}</span>
      </button>
      <span v-else class="icon">
        <img :src="require('@/assets/forkawesome/thumbs-o-up.svg')">
        <span>{{ post.favourites_count }}</span>
      </span>
      <a
        v-if="ipfsUrl"
        class="icon"
        title="Saved to IPFS"
        :href="ipfsUrl"
        target="_blank"
        rel="noreferrer"
      >
        <img :src="require('@/assets/ipfs.svg')">
      </a>
      <router-link
        v-if="isTokenized"
        class="icon tokenized"
        title="View token"
        :to="{ name: 'post-overlay', params: { postId: post.id }}"
      >
        <img :src="require('@/assets/forkawesome/diamond.svg')">
      </router-link>
      <a
        v-if="isWaitingForToken"
        class="icon tokenize-progress"
        title="Tokenizing..."
      >
        <img :src="require('@/assets/forkawesome/diamond.svg')">
      </a>
      <div
        class="dropdown-menu-wrapper"
        v-if="canSaveToIpfs() || canMintToken() || canDeletePost()"
        v-click-away="hideMenu"
      >
        <button class="icon" title="More" @click="toggleMenu()">
          <img :src="require('@/assets/feather/more-horizontal.svg')">
        </button>
        <ul v-if="menuVisible" class="dropdown-menu">
          <li v-if="canSaveToIpfs()">
            <a
              class="icon"
              title="Save to IPFS"
              @click="hideMenu(); saveToIpfs()"
            >
              <img :src="require('@/assets/ipfs.svg')">
              <span>Save to IPFS</span>
            </a>
          </li>
          <li v-if="canMintToken()">
            <a
              class="icon"
              title="Mint NFT"
              @click="hideMenu(); mintToken()"
            >
              <img :src="require('@/assets/forkawesome/diamond.svg')">
              <span>Mint NFT</span>
            </a>
          </li>
          <li v-if="canDeletePost()">
            <a
              class="icon"
              title="Delete post"
              @click="hideMenu(); deletePost()"
            >
              <img :src="require('@/assets/feather/trash.svg')">
              <span>Delete post</span>
            </a>
          </li>
        </ul>
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

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"
import { Prop } from "vue-property-decorator"

import { makePermanent, getSignature, mintToken, onTokenMinted } from "@/api/nft"
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
import Avatar from "@/components/Avatar.vue"
import CryptoAddress from "@/components/CryptoAddress.vue"
import PostEditor from "@/components/PostEditor.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { CRYPTOCURRENCIES } from "@/utils/cryptocurrencies"
import { getSigner } from "@/utils/ethereum"
import { formatDate } from "@/utils/format"

interface PaymentOption {
  code: string;
  name: string;
  address: string;
}

@Options({
  components: {
    Avatar,
    CryptoAddress,
    PostEditor,
    VisibilityIcon,
  },
})
export default class PostComponent extends Vue {

  @Prop()
  post!: Post

  @Prop()
  highlighted = false

  @Prop()
  inThread = false

  commentFormVisible = false
  menuVisible = false

  private store = setup(() => {
    const { currentUser, ensureAuthToken } = useCurrentUser()
    const { instance, getActorAddress } = useInstanceInfo()
    return { currentUser, ensureAuthToken, instance, getActorAddress }
  })

  $refs!: { postContent: HTMLElement }

  mounted() {
    const mentions = this.$refs.postContent.getElementsByClassName("mention")
    for (const mention of Array.from(mentions)) {
      mention.setAttribute("target", "_blank")
      mention.setAttribute("rel", "noreferrer")
    }
  }

  get authorName(): string {
    return this.post.account.display_name || this.post.account.username
  }

  get actorAddress(): string {
    return this.store.getActorAddress(this.post.account)
  }

  highlight(postId: string | null) {
    this.$emit("highlight", postId)
  }

  navigateTo(postId: string) {
    if (this.inThread) {
      this.$emit("navigate-to", postId)
    } else {
      this.$router.push({ name: "post", params: { postId: postId } })
    }
  }

  get visibilityDisplay(): string {
    return VISIBILITY_MAP[this.post.visibility]
  }

  formatDate(isoDate: string): string {
    return formatDate(isoDate)
  }

  get replyingTo(): Mention[] {
    if (this.post.in_reply_to_id === null) {
      return []
    }
    return this.post.mentions
  }

  canReply(): boolean {
    return this.store.currentUser !== null
  }

  onCommentCreated(post: Post) {
    this.commentFormVisible = false
    this.$emit("comment-created", post)
  }

  canRepost(): boolean {
    return this.store.currentUser !== null && this.post.visibility === "public"
  }

  async toggleRepost() {
    if (!this.store.currentUser) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    let post
    try {
      if (this.post.reblogged) {
        post = await deleteRepost(authToken, this.post.id)
      } else {
        post = await createRepost(authToken, this.post.id)
      }
    } catch (error) {
      console.log(error)
      return
    }
    this.post.reblogs_count = post.reblogs_count
    this.post.reblogged = post.reblogged
  }

  canLike(): boolean {
    return this.store.currentUser !== null && this.post.visibility === "public"
  }

  async toggleLike() {
    if (!this.store.currentUser) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    let post
    try {
      if (this.post.favourited) {
        post = await unfavourite(authToken, this.post.id)
      } else {
        post = await favourite(authToken, this.post.id)
      }
    } catch (error) {
      console.log(error)
      return
    }
    this.post.favourites_count = post.favourites_count
    this.post.favourited = post.favourited
  }

  toggleMenu() {
    this.menuVisible = !this.menuVisible
  }

  hideMenu() {
    this.menuVisible = false
  }

  get ipfsUrl(): string | null {
    const gatewayUrl = this.store.instance?.ipfs_gateway_url
    if (
      !gatewayUrl ||
      this.post.ipfs_cid === null ||
      this.isTokenized ||
      this.isWaitingForToken
    ) {
      return null
    }
    return `${gatewayUrl}/ipfs/${this.post.ipfs_cid}`
  }

  canSaveToIpfs(): boolean {
    return (
      !!this.store.instance?.ipfs_gateway_url &&
      this.post.account.id === this.store.currentUser?.id &&
      this.post.visibility === "public" &&
      this.post.ipfs_cid === null &&
      !this.isWaitingForToken
    )
  }

  async saveToIpfs() {
    const { currentUser, instance } = this.store
    if (!currentUser || !instance || !instance.ipfs_gateway_url) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    const { ipfs_cid } = await makePermanent(authToken, this.post.id)
    this.post.ipfs_cid = ipfs_cid
  }

  canDeletePost(): boolean {
    return this.post.account.id === this.store.currentUser?.id
  }

  async deletePost() {
    const authToken = this.store.ensureAuthToken()
    await deletePost(authToken, this.post.id)
    this.$emit("post-deleted")
  }

  getPaymentOptions(): PaymentOption[] {
    const items = []
    for (const [code, name] of CRYPTOCURRENCIES) {
      const symbol = `$${code}`
      const field = this.post.account.fields.find(item => item.name === symbol)
      if (!field) {
        continue
      }
      const address = field.value.trim()
      items.push({ code, name, address })
    }
    return items
  }

  selectedPaymentAddress: string | null = null

  togglePaymentAddress(payment: PaymentOption) {
    this.selectedPaymentAddress = this.selectedPaymentAddress === payment.address ? null : payment.address
  }

  get isTokenized(): boolean {
    return this.post.token_id !== null
  }

  isWaitingForToken = false

  canMintToken(): boolean {
    return (
      !!this.store.instance?.nft_contract_address &&
      this.post.account.id === this.store.currentUser?.id &&
      this.post.visibility === "public" &&
      !this.isTokenized &&
      !this.isWaitingForToken
    )
  }

  async mintToken() {
    const { currentUser, instance } = this.store
    if (!currentUser || !instance || !instance.nft_contract_name || !instance.nft_contract_address) {
      return
    }
    if (this.isTokenized || this.isWaitingForToken) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    this.isWaitingForToken = true
    if (this.post.ipfs_cid === null) {
      const { ipfs_cid } = await makePermanent(authToken, this.post.id)
      this.post.ipfs_cid = ipfs_cid
    }
    const tokenUri = `ipfs://${this.post.ipfs_cid}`
    console.info("token URI:", tokenUri)
    let signature
    try {
      signature = await getSignature(authToken, this.post.id)
    } catch (error) {
      console.log(error)
      this.isWaitingForToken = false
      return
    }
    const signer = await getSigner()
    if (!signer) {
      this.isWaitingForToken = false
      return
    }
    try {
      const transaction = await mintToken(
        instance.nft_contract_name,
        instance.nft_contract_address,
        currentUser.wallet_address,
        tokenUri,
        signature,
        signer,
      )
      await onTokenMinted(authToken, this.post.id, transaction.hash)
    } catch (error) {
      // User has rejected tx
      this.isWaitingForToken = false
      return
    }
    // Wait until the server sees the tx
    const intervalId = setInterval(async () => {
      const post = await getPost(authToken, this.post.id)
      if (post.token_id) {
        clearInterval(intervalId)
        this.isWaitingForToken = false
        // Update post
        this.post.token_id = post.token_id
        this.post.token_tx_id = post.token_tx_id
      }
    }, 5000)
  }

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
  gap: $block-inner-padding / 2;
  padding: $block-inner-padding $block-inner-padding 0;

  .floating-avatar {
    @include floating-avatar;

    @media screen and (min-width: $screen-breakpoint-medium + 1) {
      margin-right: -$block-inner-padding / 2;
    }
  }

  .display-name {
    color: $text-color;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-address {
    flex-grow: 1;
    min-width: 15%;
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
  gap: 0.25em;
  padding: $block-inner-padding / 4 $block-inner-padding 0;
}

.post-content {
  color: $text-color;
  line-height: 1.5;
  padding: $block-inner-padding;

  :deep(pre) {
    overflow-x: scroll;
  }

  :deep(ul),
  :deep(ol) {
    list-style-position: inside;
  }
}

.post-attachment {
  padding: 0 $block-inner-padding $block-inner-padding;

  img {
    display: block;
    width: 100%;
  }
}

.post-footer {
  @include post-icon;

  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $block-inner-padding / 2;
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
  @include post-dropdown-menu;
}

.crypto-widget {
  display: flex;
  flex-grow: 1;
  gap: $block-inner-padding / 2;
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
