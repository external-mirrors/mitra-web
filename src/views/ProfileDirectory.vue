<template>
  <sidebar-layout>
    <template #content>
      <div class="profile-grid">
        <router-link
          v-for="profile in profiles"
          class="profile-list-item"
          :to="getActorLocation('profile', profile)"
          :key="profile.id"
        >
          <profile-card :profile="profile" :compact="false"></profile-card>
        </router-link>
      </div>
      <button
        v-if="isPageFull()"
        class="btn secondary next-btn"
        @click="loadNextPage()"
      >
        {{ $t('profile_list.show_more_profiles') }}
      </button>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import { PAGE_SIZE } from "@/api/common"
import { Profile, getProfiles } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileCard from "@/components/ProfileCard.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { getActorLocation } = useActorHandle()
const { ensureAuthToken } = useCurrentUser()
const { setPageTitle } = useTitle()

const profiles = ref<Profile[]>([])
const initialProfileCount = ref<number | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  setPageTitle(t("navigation.profile_directory"))
  isLoading.value = true
  const authToken = ensureAuthToken()
  profiles.value = await getProfiles(authToken)
  initialProfileCount.value = profiles.value.length
  isLoading.value = false
})

function isPageFull(): boolean {
  if (initialProfileCount.value === null) {
    return false
  }
  return initialProfileCount.value >= PAGE_SIZE
}

async function loadNextPage() {
  const authToken = ensureAuthToken()
  const offset = profiles.value.length
  const nextPage = await getProfiles(authToken, offset)
  profiles.value = [...profiles.value, ...nextPage]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile-grid {
  display: grid;
  gap: $block-outer-padding;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  margin-bottom: $block-outer-padding;
}

.profile-list-item {
  color: var(--text-color);
}

.next-btn {
  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
