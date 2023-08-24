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
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { Post, getTagTimeline } from "@/api/posts"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/composables/user"

const route = useRoute()
const { authToken } = $(useCurrentUser())
let posts = $ref<Post[]>([])

onMounted(async () => {
  posts = await getTagTimeline(
    authToken,
    route.params.tagName as string,
  )
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
</style>
