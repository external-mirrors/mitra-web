<template>
  <div id="main">
    <div class="content posts">
      <post-list
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

import { Post, getTagTimeline } from "@/api/posts"
import PostList from "@/components/PostList.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

const route = useRoute()
const posts = ref<Post[]>([])

onMounted(async () => {
  const { authToken } = useCurrentUser()
  posts.value = await getTagTimeline(
    authToken.value,
    route.params.tagName,
  )
})

async function loadNextPage(maxId: string) {
  const { authToken } = useCurrentUser()
  const newPosts = await getTagTimeline(
    authToken.value,
    route.params.tagName,
    maxId,
  )
  posts.value.push(...newPosts)
}
</script>
