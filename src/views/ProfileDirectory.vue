<template>
  <sidebar-layout>
    <template #content>
      <div class="profile-grid">
        <router-link
          v-for="profile in profiles"
          class="profile-list-item"
          :to="{ name: 'profile', params: { profileId: profile.id }}"
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
        Show more profiles
      </button>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $ref } from "vue/macros"

import { PAGE_SIZE } from "@/api/common"
import { Profile, getProfiles } from "@/api/users"
import ProfileCard from "@/components/ProfileCard.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken } = useCurrentUser()

let profiles = $ref<Profile[]>([])
let initialProfileCount = $ref<number | null>(null)

onMounted(async () => {
  const authToken = ensureAuthToken()
  profiles = await getProfiles(authToken)
  initialProfileCount = profiles.length
})

function isPageFull(): boolean {
  if (initialProfileCount === null) {
    return false
  }
  return initialProfileCount >= PAGE_SIZE
}

async function loadNextPage() {
  const authToken = ensureAuthToken()
  const offset = profiles.length
  const nextPage = await getProfiles(authToken, offset)
  profiles = [...profiles, ...nextPage]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile-grid {
  display: grid;
  gap: $block-outer-padding;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.profile-list-item {
  color: $text-color;
}

.next-btn {
  margin-bottom: $block-outer-padding;
}
</style>
