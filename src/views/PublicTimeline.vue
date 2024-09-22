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
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import { Post, addRelationships, getPublicTimeline } from "@/api/posts"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { authToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const posts = ref<Post[]>([])
const isLoading = ref(false)

async function loadTimelinePage(
  authToken: string | null,
  maxId?: string,
): Promise<Post[]> {
  const page = await getPublicTimeline(
    authToken,
    route.name === "local",
    maxId,
  )
  if (authToken !== null) {
    await addRelationships(authToken, page)
  }
  return page
}

onMounted(async () => {
  if (route.name === "local") {
    setPageTitle(t("navigation.local"))
  } else {
    setPageTitle(t("navigation.federated"))
  }
  isLoading.value = true
  posts.value = await loadTimelinePage(authToken.value)
  isLoading.value = false
})

async function loadNextPage(maxId: string) {
  const nextPage = await loadTimelinePage(authToken.value, maxId)
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
