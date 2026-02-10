<template>
  <sidebar-layout>
    <template #content>
      <div v-if="feed" class="feed-info">
        <span>{{ feed.title }}</span>
        <router-link
          class="icon"
          :title="$t('custom_feeds.configure_feed')"
          :to="{ name: 'custom-feed', params: { feedId: feed.id } }"
        >
          <icon-configure></icon-configure>
        </router-link>
      </div>
      <div v-if="!isLoading && posts.length === 0" class="content-message">
        {{ $t('post_list.no_posts_found') }}
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
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import { getCustomFeed, CustomFeed } from "@/api/custom-feeds"
import { addRelationships, getCustomFeedTimeline, Post } from "@/api/posts"
import IconConfigure from "@/assets/feather/sliders.svg?component"
import Loader from "@/components/Loader.vue"
import PostList from "@/components/PostList.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const feed = ref<CustomFeed | null>(null)
const posts = ref<Post[]>([])
const isLoading = ref(false)

async function loadTimelinePage(
  authToken: string,
  maxId?: string,
): Promise<Post[]> {
  if (feed.value === null) {
    throw new Error("feed info is not present")
  }
  const page = await getCustomFeedTimeline(
    authToken,
    feed.value.id,
    maxId,
  )
  await addRelationships(authToken, page)
  return page
}

async function loadNextPage(maxId: string) {
  const authToken = ensureAuthToken()
  const nextPage = await loadTimelinePage(authToken, maxId)
  posts.value = [...posts.value, ...nextPage]
}

onMounted(async () => {
  setPageTitle(t("custom_feeds.custom_feed"))
  isLoading.value = true
  const authToken = ensureAuthToken()
  feed.value = await getCustomFeed(
    authToken,
    route.params.feedId as string,
  )
  setPageTitle(feed.value.title)
  posts.value = await loadTimelinePage(authToken)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.feed-info {
  @include block-icon;
  @include content-message;

  align-items: center;
  display: flex;
  gap: $block-inner-padding;
  margin-bottom: $block-outer-padding;

  a {
    margin-left: auto;
  }
}

.content-message {
  @include content-message;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
