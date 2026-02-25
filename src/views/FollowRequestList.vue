<template>
  <sidebar-layout>
    <template #content>
      <h1 class="content-header">
        {{ $t('follow_requests.follow_requests') }}
      </h1>
      <div class="tab-bar">
        <a
          class="tab"
          :class="{ active: tabName === 'incoming' }"
          @click="switchTab('incoming')"
        >
          {{ $t('follow_requests.incoming') }}
        </a>
        <a
          class="tab"
          :class="{ active: tabName === 'outgoing' }"
          @click="switchTab('outgoing')"
        >
          {{ $t('follow_requests.outgoing') }}
        </a>
      </div>
      <div v-if="!isLoading && profiles.length === 0" class="content-message">
        {{ $t('follow_requests.no_follow_requests_found') }}
      </div>
      <div v-if="!isLoading" class="profile-list">
        <router-link
          v-for="profile in profiles"
          :key="profile.id"
          :to="getActorLocation('profile', profile)"
        >
          <profile-list-item :profile="profile"></profile-list-item>
        </router-link>
        <button
          v-if="nextPageUrl"
          class="btn secondary next-btn"
          @click="loadNextPage()"
        >
          {{ $t('follow_requests.show_more_requests') }}
        </button>
      </div>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import { getFollowRequests, getOutgoingFollowRequests } from "@/api/relationships"
import { Profile } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const tabName = ref<"incoming" | "outgoing">("incoming")
const profiles = ref<Profile[]>([])
const nextPageUrl = ref<string | null>(null)
const isLoading = ref(false)

async function loadPage(pageUrl?: string) {
  isLoading.value = true
  const authToken = ensureAuthToken()
  let page
  switch (tabName.value) {
    case "incoming":
      page = await getFollowRequests(authToken, pageUrl)
      break
    case "outgoing":
      page = await getOutgoingFollowRequests(authToken, pageUrl)
      break
  }
  profiles.value.push(...page.profiles)
  nextPageUrl.value = page.nextPageUrl
  isLoading.value = false
}

async function switchTab(name: "incoming" | "outgoing") {
  tabName.value = name
  profiles.value.length = 0
  nextPageUrl.value = null
  await loadPage()
}

onMounted(async () => {
  setPageTitle(t("follow_requests.follow_requests"))
  await switchTab(tabName.value)
})

async function loadNextPage() {
  if (nextPageUrl.value === null) {
    return
  }
  await loadPage(nextPageUrl.value)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.content-header {
  @include content-list-header;

  font-size: inherit;
}

.content-message {
  @include content-message;

  margin-bottom: $block-outer-padding;
}

.tab-bar {
  @include tab-bar;

  margin-bottom: $block-outer-padding;
}

.profile-list {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;

  .next-btn {
    align-self: flex-start;
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
