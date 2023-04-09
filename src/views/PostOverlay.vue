<template>
  <div v-if="post && token" class="post-overlay wide">
    <div v-if="canGoBack()" class="back-btn-wrapper">
      <a class="back-btn" title="Back" @click="goBack()">
        <img src="@/assets/feather/arrow-left.svg">
      </a>
    </div>
    <div class="token">
      <div class="token-content">
        <div class="token-description" v-html="token.description"></div>
        <div class="token-image" v-if="imageUrl">
          <img :src="imageUrl">
        </div>
      </div>
      <div class="token-info">
        <router-link
          class="profile"
          :to="{ name: 'profile-by-acct', params: { acct: post.account.acct }}"
        >
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
          <img src="@/assets/forkawesome/ethereum.svg">
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
          <img src="@/assets/ipfs.svg">
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

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref, $computed } from "vue/macros"
import { useRoute, useRouter } from "vue-router"

import { getTokenMetadata, TokenMetadata } from "@/api/nft"
import { Post, getPost } from "@/api/posts"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"
import { formatDate } from "@/utils/dates"

const route = useRoute()
const router = useRouter()
const { currentUser, authToken } = $(useCurrentUser())
const {
  getActorAddress,
  getBlockchainInfo,
  instance,
} = $(useInstanceInfo())

let post = $ref<Post | null>(null)
let token = $ref<TokenMetadata | null>(null)

onMounted(async () => {
  post = await getPost(
    authToken,
    route.params.postId as string,
  )
  if (metadataUrl) {
    token = await getTokenMetadata(metadataUrl)
  }
})

function canGoBack(): boolean {
  return currentUser !== null
}

function goBack() {
  router.back()
}

const actorAddress = $computed<string>(() => {
  if (!post) {
    return ""
  }
  return getActorAddress(post.account)
})

const transactionUrl = $computed<string | null>(() => {
  const blockchain = getBlockchainInfo()
  const explorerUrl = blockchain?.chain_metadata?.explorer_url
  if (!explorerUrl || !post?.token_tx_id) {
    return null
  }
  return `${explorerUrl}/tx/0x${post.token_tx_id}`
})

const metadataUrl = $computed<string | null>(() => {
  const gatewayUrl = instance?.ipfs_gateway_url
  if (!gatewayUrl || !post) {
    return null
  }
  return `${gatewayUrl}/ipfs/${post.ipfs_cid}`
})

const imageUrl = $computed<string | null>(() => {
  const gatewayUrl = instance?.ipfs_gateway_url
  if (!gatewayUrl || !token) {
    return null
  }
  return token.image.replace("ipfs://", `${gatewayUrl}/ipfs/`)
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$page-width: $wide-content-width + $content-gap + $wide-sidebar-width;

.post-overlay {
  background-color: var(--block-background-color);
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
      filter: var(--text-colorizer);
      height: 40px;
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
    filter: var(--text-colorizer);
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
