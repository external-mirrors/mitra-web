<template>
  <span v-if="!isLoading && feeds.length === 0">
    {{ $t('custom_feeds.this_user_has_not_been_added_to_any_custom_feed') }}
  </span>
  <router-link
    v-for="feed in feeds"
    class="feed"
    :key="feed.id"
    :to="{ name: 'custom-feed', params: { feedId: feed.id } }"
  >
    {{ feed.title }}
  </router-link>
  <loader v-if="isLoading"></loader>
  <button type="submit" class="btn">
    {{ $t('dialog.ok') }}
  </button>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { getCustomFeedsBySource, CustomFeed } from "@/api/custom-feeds"
import Loader from "@/components/Loader.vue"
import { useCurrentUser } from "@/composables/user"

const props = defineProps<{
  profileId: string
}>()

const { ensureAuthToken } = useCurrentUser()

const feeds = ref<CustomFeed[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  const authToken = ensureAuthToken()
  feeds.value = await getCustomFeedsBySource(authToken, props.profileId)
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

.feed {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  padding: calc($block-inner-padding / 2);
}

.loader {
  --loader-size: 2em;
  margin: 0 auto;
}
</style>
