<template>
  <div
    v-for="post in posts"
    :key="post.id"
    class="post-list-item"
    :class="{ marked: post.id === marker }"
  >
    <post-or-repost
      :post="post"
      @post-deleted="onPostDeleted($event)"
    ></post-or-repost>
  </div>
  <button
    v-if="isPageFull()"
    class="btn secondary next-btn"
    :disabled="isNextPageLoading"
    @click="loadNextPage()"
  >
    {{ $t('post.next_page') }}
  </button>
</template>

<script setup lang="ts">
import { ref, watch } from "vue"

import { PAGE_SIZE } from "@/api/common"
import { Post as PostObject } from "@/api/posts"
import PostOrRepost from "@/components/PostOrRepost.vue"

const props = defineProps<{
  posts: PostObject[],
  marker?: string | null,
}>()

const emit = defineEmits<{
  (event: "load-next-page", maxId: string): void,
}>()

defineExpose({ resetPagination })

let initialPostCount: number | null = null
const isNextPageLoading = ref(false)

watch(() => props.posts, (posts) => {
  if (initialPostCount === null) {
    initialPostCount = posts.length
  }
  isNextPageLoading.value = false
})

function onPostDeleted(postId: string) {
  const posts = props.posts
  const postIndex = posts.findIndex((post) => post.id === postId)
  posts.splice(postIndex, 1)
}

function isPageFull(): boolean {
  return initialPostCount === null ? false : initialPostCount >= PAGE_SIZE
}

function resetPagination() {
  initialPostCount = null
}

function loadNextPage() {
  if (props.posts.length > 0) {
    const maxId = props.posts[props.posts.length - 1].id
    isNextPageLoading.value = true
    emit("load-next-page", maxId)
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-list-item:not(:nth-of-type(1)).marked {
  margin-top: $block-outer-padding * 4;
}

.next-btn {
  margin-bottom: $block-outer-padding;
}
</style>
