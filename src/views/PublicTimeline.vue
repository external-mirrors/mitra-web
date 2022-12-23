<template>
  <sidebar-layout>
    <template #content>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"

import { Post, getPublicTimeline } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken } = useCurrentUser()
let posts = $ref<Post[]>([])
let isLoading = $ref(false)

onMounted(async () => {
  const authToken = ensureAuthToken()
  isLoading = true
  posts = await getPublicTimeline(authToken)
  isLoading = false
})

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await getPublicTimeline(authToken, maxId)
  posts = [...posts, ...nextPage]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.loader {
  margin: $block-outer-padding auto;
}
</style>
