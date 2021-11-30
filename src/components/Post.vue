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
      <div class="username" :title="'@' + post.account.acct">
        @{{ post.account.acct }}
      </div>
      <a
        class="icon icon-small"
        :href="post.uri"
        :title="'Visibility: ' + post.visibility"
        target="_blank"
        rel="noreferrer"
      >
        <img v-if="post.visibility === 'public'" :src="require('@/assets/feather/globe.svg')">
        <img v-else-if="post.visibility === 'direct'" :src="require('@/assets/feather/lock.svg')">
      </a>
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
        class="timestamp"
        @click="navigateTo(post.id)"
      >
        {{ formatDate(post.created_at) }}
      </a>
    </div>
    <div class="post-content" v-html="post.content"></div>
    <div class="post-attachment" v-if="post.media_attachments.length === 1">
      <img :src="post.media_attachments[0].url">
    </div>
    <div class="post-footer">
      <router-link
        v-if="!inThread"
        class="icon"
        title="View comments"
        :to="{ name: 'post', params: { postId: post.id }}"
      >
        <img :src="require('@/assets/forkawesome/comment-o.svg')">
        <span>{{ post.replies_count }}</span>
      </router-link>
      <a
        v-if="inThread && canReply()"
        class="icon"
        title="Reply"
        @click="commentFormVisible = !commentFormVisible"
      >
        <img :src="require('@/assets/tabler/arrow-forward.svg')">
      </a>
      <a
        class="icon"
        :class="{ 'highlighted': post.reblogged }"
        title="Repost"
        @click="toggleRepost()"
      >
        <img :src="require('@/assets/feather/repeat.svg')">
        <span>{{ post.reblogs_count }}</span>
      </a>
      <a
        class="icon"
        :class="{ 'highlighted': post.favourited }"
        title="Like"
        @click="toggleLike()"
      >
        <img :src="require('@/assets/forkawesome/thumbs-o-up.svg')">
        <span>{{ post.favourites_count }}</span>
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
        v-if="canTokenize()"
        class="icon"
        :class="{'waiting': isWaitingForToken}"
        title="Tokenize post"
        @click="tokenize()"
      >
        <img :src="require('@/assets/forkawesome/diamond.svg')">
      </a>
      <div class="crypto-widget">
        <crypto-address
          v-if="selectedPaymentAddress"
          :address="selectedPaymentAddress"
        ></crypto-address>
        <a
          v-for="option in getPaymentOptions()"
          :key="option.code"
          class="icon"
          :title="'Send '+ option.name"
          @click="togglePaymentAddress(option)"
        >
          <img :src="require('@/assets/cryptoicons/' + option.code.toLowerCase() + '.svg')">
        </a>
      </div>
    </div>
    <post-editor
      v-if="commentFormVisible"
      :in-reply-to="post.id"
      @post-created="onCommentCreated"
    >
    </post-editor>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"
import { Prop } from "vue-property-decorator"

import { makePermanent, getSignature, mintToken } from "@/api/nft"
import { Post, getPost, favourite, unfavourite, createRepost, deleteRepost } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import CryptoAddress from "@/components/CryptoAddress.vue"
import PostEditor from "@/components/PostEditor.vue"
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

  private store = setup(() => {
    const { currentUser, ensureAuthToken } = useCurrentUser()
    const { instance } = useInstanceInfo()
    return { currentUser, ensureAuthToken, instance }
  })

  get authorName(): string {
    return this.post.account.display_name || this.post.account.username
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

  formatDate(isoDate: string): string {
    return formatDate(isoDate)
  }

  canReply(): boolean {
    return this.store.currentUser !== null
  }

  onCommentCreated(post: Post) {
    this.commentFormVisible = false
    this.$emit("comment-created", post)
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

  canTokenize(): boolean {
    return this.post.account.id === this.store.currentUser?.id && !this.isTokenized
  }

  isWaitingForToken = false

  async tokenize() {
    const { currentUser, instance } = this.store
    if (!currentUser || !instance || !instance.nft_contract_name || !instance.nft_contract_address) {
      return
    }
    if (this.isTokenized || this.isWaitingForToken) {
      return
    }
    const authToken = this.store.ensureAuthToken()
    this.isWaitingForToken = true
    const { ipfs_cid } = await makePermanent(authToken, this.post.id)
    const tokenUri = `ipfs://${ipfs_cid}`
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
      await mintToken(
        instance.nft_contract_name,
        instance.nft_contract_address,
        currentUser.wallet_address,
        tokenUri,
        signature,
        signer,
      )
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
        this.post.ipfs_cid = post.ipfs_cid
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

  .username {
    flex-grow: 1;
    min-width: 15%;
    overflow: hidden;
    text-overflow: ellipsis;
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

.post-content {
  color: $text-color;
  line-height: 1.5;
  padding: $block-inner-padding;
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

    &.waiting img {
      animation: spin 1s linear infinite;
    }
  }
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
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
