<template>
  <post-or-repost
    v-for="post in posts"
    :post="post"
    :key="post.id"
    @post-deleted="onPostDeleted($event)"
  ></post-or-repost>
  <button
    v-if="isPageFull()"
    class="btn secondary next-btn"
    @click="loadNextPage()"
  >
    Show more posts
  </button>
</template>

<script setup lang="ts">
import { watch } from "vue"

import { PAGE_SIZE } from "@/api/common"
import { Post as PostObject } from "@/api/posts"
import PostOrRepost from "@/components/PostOrRepost.vue"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  posts: PostObject[],
}>()
/* eslint-disable-next-line no-undef, func-call-spacing */
const emit = defineEmits<{
  (event: "load-next-page", maxId: string): void,
}>()

let initialPostCount: number | null = null

watch(() => props.posts.length, (postCount) => {
  if (initialPostCount === null) {
    initialPostCount = postCount
  }
})

function onPostDeleted(postId: string) {
  const posts = props.posts
  const postIndex = posts.findIndex((post) => post.id === postId)
  posts.splice(postIndex, 1)
}

function isPageFull(): boolean {
  return initialPostCount === null ? false : initialPostCount >= PAGE_SIZE
}

function loadNextPage() {
  if (props.posts.length > 0) {
    const maxId = props.posts[props.posts.length - 1].id
    emit("load-next-page", maxId)
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.next-btn {
  margin-bottom: $block-outer-padding;
}
</style>
