<template>
  <sidebar-layout>
    <template #content>
      <h1 class="content-header">
        {{ $t('custom_feeds.custom_feeds') }}
      </h1>
      <form class="create-feed" @submit.prevent="onCreateFeed">
        <input
          type="text"
          :placeholder="$t('custom_feeds.enter_feed_name')"
          v-model.trim="newFeedName"
        >
        <button
          type="submit"
          class="btn"
          :disabled="newFeedName.length === 0"
        >
          {{ $t('custom_feeds.create_feed') }}
        </button>
      </form>
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
          <router-link
            class="icon"
            :title="$t('custom_feeds.configure_feed')"
            :to="{ name: 'custom-feed', params: { feedId: feed.id } }"
          >
            <icon-configure></icon-configure>
          </router-link>
        </div>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import {
  createCustomFeed,
  getCustomFeeds,
  CustomFeed,
} from "@/api/custom-feeds"
import IconConfigure from "@/assets/feather/sliders.svg?component"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const feeds = ref<CustomFeed[]>([])
const isLoading = ref(false)
const newFeedName = ref<string>("")

async function onCreateFeed() {
  isLoading.value = true
  const feed = await createCustomFeed(
    ensureAuthToken(),
    newFeedName.value,
  )
  feeds.value = [feed, ...feeds.value]
  newFeedName.value = ""
  isLoading.value = false
}

onMounted(async () => {
  setPageTitle(t("custom_feeds.custom_feeds"))
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

.create-feed {
  @include content-form;

  align-items: normal;
  flex-direction: row;
  margin-bottom: $block-outer-padding;
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
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
