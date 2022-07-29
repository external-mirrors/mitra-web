<template>
  <div id="main">
    <div class="content posts">
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"

import { Post, getPublicTimeline } from "@/api/posts"
import PostList from "@/components/PostList.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken } = useCurrentUser()
let posts = $ref<Post[]>([])

onMounted(async () => {
  const authToken = ensureAuthToken()
  posts = await getPublicTimeline(authToken)
})

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await getPublicTimeline(authToken, maxId)
  posts.push(...nextPage)
}
</script>

<style scoped lang="scss">
</style>
