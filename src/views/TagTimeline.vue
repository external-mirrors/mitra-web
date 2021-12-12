<template>
  <div id="main">
    <div class="content posts">
      <post-or-repost
        v-for="post in posts"
        :post="post"
        :key="post.id"
        @post-deleted="onPostDeleted($event)"
      ></post-or-repost>
      <button
        v-if="isPageFull()"
        class="btn"
        @click="loadNextPage()"
      >
        Show more posts
      </button>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

import { PAGE_SIZE } from "@/api/common"
import { Post, getTagTimeline } from "@/api/posts"
import PostOrRepost from "@/components/PostOrRepost.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"
import { formatDate } from "@/utils/format"

const route = useRoute()
const posts = ref<Post[]>([])

onMounted(async () => {
  const { authToken } = useCurrentUser()
  posts.value = await getTagTimeline(
    authToken.value,
    route.params.tagName,
  )
})

function onPostDeleted(postId: string) {
  const postIndex = posts.value.findIndex((post) => post.id === postId)
  posts.value.splice(postIndex, 1)
}

function isPageFull(): boolean {
  return posts.value.length >= PAGE_SIZE
}

async function loadNextPage() {
  if (posts.value.length > 0) {
    const { authToken } = useCurrentUser()
    const newPosts = await getTagTimeline(
      authToken.value,
      route.params.tagName,
      posts.value[posts.value.length - 1].id,
    )
    posts.value.push(...newPosts)
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

:deep(.post) {
  margin-bottom: $block-outer-padding;
}
</style>
