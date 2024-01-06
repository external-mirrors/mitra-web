<template>
  <sidebar-layout>
    <template #content>
      <div class="tag-name">
        #{{ route.params.tagName }}
      </div>
      <post-list
        :posts="posts"
        @load-next-page="loadNextPage"
      ></post-list>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { $, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { Post, getTagTimeline } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { authToken } = $(useCurrentUser())
let posts = $ref<Post[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  posts = await getTagTimeline(
    authToken,
    route.params.tagName as string,
  )
  isLoading.value = false
})

async function loadNextPage(maxId: string) {
  const nextPage = await getTagTimeline(
    authToken,
    route.params.tagName as string,
    maxId,
  )
  posts = [...posts, ...nextPage]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.tag-name {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
