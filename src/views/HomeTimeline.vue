<template>
  <sidebar-layout>
    <template #content>
      <post-editor :in-reply-to="null" @post-created="insertPost"></post-editor>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"

import { Post, getHomeTimeline } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken } = useCurrentUser()

let posts = $ref<Post[]>([])
let isLoading = $ref(false)

onMounted(async () => {
  isLoading = true
  const authToken = ensureAuthToken()
  posts = await getHomeTimeline(authToken)
  isLoading = false
})

function insertPost(post: Post) {
  posts = [post, ...posts]
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await getHomeTimeline(authToken, maxId)
  posts = [...posts, ...nextPage]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-form {
  margin-bottom: $block-outer-padding * 2;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
