<template>
  <sidebar-layout>
    <template #content>
      <h1>
        {{ $t('explore.explore') }}
      </h1>
      <h2>
        Basic feeds
      </h2>
      <div class="feed-list">
        <div class="feed">
          <router-link
            class="feed-name"
            :to="{ name: 'local' }"
          >
            {{ $t('navigation.local') }}
          </router-link>
        </div>
        <div class="feed">
          <router-link
            class="feed-name"
            :to="{ name: 'known-network' }"
          >
            {{ $t('navigation.federated') }}
          </router-link>
        </div>
      </div>
      <h2>
        {{ $t('custom_feeds.custom_feeds') }}
      </h2>
      <div v-if="!isLoading" class="feed-list">
        <div
          v-for="feed in feeds"
          :key="feed.id"
          class="feed"
        >
          <router-link
            class="feed-name"
            :title="$t('custom_feeds.view_feed')"
            :to="{ name: 'custom-feed-timeline', params: { feedId: feed.id } }"
          >
            {{ feed.title }}
          </router-link>
        </div>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import {
  getCustomFeeds,
  CustomFeed,
} from "@/api/custom-feeds"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const feeds = ref<CustomFeed[]>([])
const isLoading = ref(false)

onMounted(async () => {
  setPageTitle("Explore")
  isLoading.value = true
  feeds.value = await getCustomFeeds(ensureAuthToken())
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.content-header {
  @include content-list-header;

  font-size: inherit;
}

.content-message {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;

  &:not(:last-child) {
    margin-bottom: $block-outer-padding;
  }
}

.feed {
  @include block-icon;

  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  gap: $block-inner-padding;
  padding: $block-inner-padding;

  .feed-name {
    flex-grow: 1;
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
