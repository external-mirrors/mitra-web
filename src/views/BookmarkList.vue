<template>
  <sidebar-layout>
    <template #content>
      <div v-if="!isLoading && posts.length === 0" class="content-message">
        {{ $t('post_list.no_posts_found') }}
      </div>
      <post-list :posts="posts" @load-next-page="loadNextPage"></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { addRelationships, getBookmarks, Post } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const { ensureAuthToken } = useCurrentUser()
const posts = ref<Post[]>([])
const isLoading = ref(false)

async function loadTimelinePage(
  maxId?: string,
): Promise<Post[]> {
  const authToken = ensureAuthToken()
  const page = await getBookmarks(
    authToken,
    maxId,
  )
  await addRelationships(authToken, page)
  return page
}

onMounted(async () => {
  isLoading.value = true
  posts.value = await loadTimelinePage()
  isLoading.value = false
})

async function loadNextPage(maxId: string) {
  const nextPage = await loadTimelinePage(maxId)
  posts.value = [...posts.value, ...nextPage]
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
