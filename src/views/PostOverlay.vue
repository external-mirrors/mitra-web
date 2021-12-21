<template>
  <div v-if="post && token" class="post-overlay">
    <div v-if="canGoBack()" class="back-btn-wrapper">
      <a class="back-btn" title="Back" @click="goBack()">
        <img :src="require('@/assets/feather/arrow-left.svg')">
      </a>
    </div>
    <div class="token">
      <div class="token-content">
        <div class="token-description" v-html="token.description"></div>
        <div class="token-image">
          <img :src="imageUrl">
        </div>
      </div>
      <div class="token-info">
        <router-link class="profile" :to="{ name: 'profile', params: { profileId: post.account.id }}">
          <avatar :profile="post.account"></avatar>
          <div class="actor-address">@{{ actorAddress }}</div>
        </router-link>
        <a
          v-if="transactionUrl"
          class="token-tx-id"
          :href="transactionUrl"
          title="Mint Tx"
          target="_blank"
          rel="noreferrer"
        >
          <img :src="require('@/assets/forkawesome/ethereum.svg')">
          <div>0x{{ post.token_tx_id }}</div>
        </a>
        <a
          v-if="metadataUrl"
          class="token-ipfs-cid"
          title="Metadata IPFS CID"
          :href="metadataUrl"
          target="_blank"
          rel="noreferrer"
        >
          <img :src="require('@/assets/ipfs.svg')">
          <div>{{ post.ipfs_cid }}</div>
        </a>
        <div class="created-at">
          <div class="label">Created:</div>
          <router-link :to="{ name: 'post', params: { postId: post.id }}">
            {{ formatDate(post.created_at) }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { DateTime } from "luxon"

import { getTokenMetadata, TokenMetadata } from "@/api/nft"
import { Post, getPost } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    Avatar,
  },
})
export default class PostOverlay extends Vue {

  post: Post | null = null
  token: TokenMetadata | null = null

  private store = setup(() => {
    const { currentUser, authToken } = useCurrentUser()
    const { instance, getActorAddress } = useInstanceInfo()
    return { currentUser, authToken, instance, getActorAddress }
  })

  async created() {
    this.post = await getPost(
      this.store.authToken,
      this.$route.params.postId as string,
    )
    const metadataUrl = this.metadataUrl
    if (metadataUrl) {
      this.token = await getTokenMetadata(metadataUrl)
    }
  }

  canGoBack(): boolean {
    return this.store.currentUser !== null
  }

  goBack() {
    this.$router.back()
  }

  get actorAddress(): string {
    if (!this.post) {
      return ""
    }
    return this.store.getActorAddress(this.post.account)
  }

  get transactionUrl(): string | null {
    const explorerUrl = this.store.instance?.ethereum_explorer_url
    if (!explorerUrl || !this.post?.token_tx_id) {
      return null
    }
    return `${explorerUrl}/tx/0x${this.post.token_tx_id}`
  }

  get metadataUrl(): string | null {
    const gatewayUrl = this.store.instance?.ipfs_gateway_url
    if (!gatewayUrl || !this.post) {
      return null
    }
    return `${gatewayUrl}/ipfs/${this.post.ipfs_cid}`
  }

  get imageUrl(): string | null {
    const gatewayUrl = this.store.instance?.ipfs_gateway_url
    if (!gatewayUrl || !this.token) {
      return null
    }
    return this.token.image.replace("ipfs://", `${gatewayUrl}/ipfs/`)
  }

  formatDate(isoDate: string): string {
    const date = DateTime.fromISO(isoDate)
    return date.toLocaleString(DateTime.DATE_FULL)
  }

}

</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$page-width: $wide-content-width + $content-gap + $wide-sidebar-width;

.post-overlay {
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
}

.back-btn-wrapper {
  left: 0;
  padding-left: inherit;
  padding-right: inherit;
  position: absolute;
  right: 0;
  top: $body-padding;

  .back-btn {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    width: $page-width;

    img {
      filter: $btn-text-colorizer;
      width: 40px;
    }
  }
}

.token {
  margin: 0 auto;
  max-width: 100%;
  width: $page-width;
}

.token-content {
  font-size: 24px;
  line-height: 1.5;
  padding-bottom: 5%;
  text-align: center;
}

.token-image {
  margin-top: 30px;
}

.token-info {
  align-items: center;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: $block-outer-padding 70px;
  justify-content: center;
}

.profile {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 10px;

  .avatar {
    height: $avatar-size;
    width: $avatar-size;
  }
}

.token-tx-id,
.token-ipfs-cid {
  display: flex;
  flex-direction: row;
  gap: 10px;
  line-height: 20px;
  max-width: 150px;

  img {
    filter: $text-colorizer;
    height: 20px;
    width: 20px;
  }

  div {
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}

.created-at {
  display: flex;
  flex-direction: row;

  .label {
    font-weight: bold;
    margin-right: 5px;
  }
}

@media screen and (max-width: $screen-breakpoint-medium) {
  .token-info {
    flex-direction: column;
  }
}
</style>
