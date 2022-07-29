<template>
  <sidebar-layout>
    <template #content>
      <post-editor @post-created="insertPost"></post-editor>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"

import { Post, getHomeTimeline } from "@/api/posts"
import PostEditor from "@/components/PostEditor.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken } = useCurrentUser()

let posts = $ref<Post[]>([])

onMounted(async () => {
  const authToken = ensureAuthToken()
  posts = await getHomeTimeline(authToken)
})

function insertPost(post: Post) {
  posts = [post, ...posts]
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await getHomeTimeline(authToken, maxId)
  posts.push(...nextPage)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.post-form {
  margin-bottom: $block-outer-padding * 2;
}
</style>
