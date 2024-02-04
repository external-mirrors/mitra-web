<template>
  <sidebar-layout>
    <template #content>
      <div v-if="!isLoading && posts.length === 0" class="content-message">
        No posts found
      </div>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { Post, getPublicTimeline } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { authToken } = useCurrentUser()
let posts = $ref<Post[]>([])
let isLoading = $ref(false)

onMounted(async () => {
  isLoading = true
  try {
    posts = await getPublicTimeline(
      authToken.value,
      route.name === "local",
    )
  } catch (error) {
    // Authentication required?
    console.error(error)
  }
  isLoading = false
})

async function loadNextPage(maxId: string) {
  const nextPage = await getPublicTimeline(
    authToken.value,
    route.name === "local",
    maxId,
  )
  posts = [...posts, ...nextPage]
}
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
</style>
