<template>
  <sidebar-layout>
    <template #content>
      <div v-if="!isLoading && posts.length === 0" class="content-message">
        {{ $t('post_list.no_posts_found') }}
      </div>
      <post
        v-for="post in posts"
        :post="post"
        :highlighted="false"
        :in-thread="false"
        :key="post.id"
        @post-deleted="onPostDeleted(post.id)"
      ></post>
      <loader v-if="isLoading"></loader>
      <button
        v-if="nextPageUrl"
        class="btn secondary next-btn"
        :disabled="isNextPageLoading"
        @click="loadNextPage()"
      >
        {{ $t('post.next_page') }}
      </button>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { addRelationships, getBookmarks, Post as PostObject } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const { ensureAuthToken } = useCurrentUser()
const posts = ref<PostObject[]>([])
const isLoading = ref(false)
const nextPageUrl = ref<string | null>(null)
const isNextPageLoading = ref(false)

async function loadPage(): Promise<void> {
  const authToken = ensureAuthToken()
  const page = await getBookmarks(
    authToken,
    nextPageUrl.value,
  )
  await addRelationships(authToken, page.posts)
  posts.value = [...posts.value, ...page.posts]
  nextPageUrl.value = page.nextPageUrl
}

function onPostDeleted(postId: string) {
  const postIndex = posts.value.findIndex((post) => post.id === postId)
  posts.value.splice(postIndex, 1)
}

async function loadNextPage() {
  isNextPageLoading.value = true
  await loadPage()
  isNextPageLoading.value = false
}

onMounted(async () => {
  isLoading.value = true
  await loadPage()
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.content-message {
  @include content-message;
}

.loader {
  margin: $block-outer-padding auto;
}

.post {
  margin-bottom: $block-outer-padding;
}

.next-btn {
  margin-bottom: $block-outer-padding;
}
</style>
