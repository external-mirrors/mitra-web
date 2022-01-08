<template>
  <div id="main">
    <div class="content profile-list">
      <router-link
        v-for="profile in profiles"
        class="profile-list-item"
        :to="{ name: 'profile', params: { profileId: profile.id }}"
        :key="profile.id"
      >
        <profile-card :profile="profile"></profile-card>
      </router-link>
      <button
        v-if="isPageFull()"
        class="btn"
        @click="loadNextPage()"
      >
        Show more profiles
      </button>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

import { PAGE_SIZE } from "@/api/common"
import { Profile, getProfiles } from "@/api/users"
import ProfileCard from "@/components/ProfileCard.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useCurrentUser } from "@/store/user"

@Options({
  components: {
    ProfileCard,
    Sidebar,
  },
})
export default class ProfileDirectory extends Vue {

  private store = setup(() => {
    const { ensureAuthToken } = useCurrentUser()
    return { ensureAuthToken }
  })

  profiles: Profile[] = []
  initialProfileCount: number | null = null

  async created() {
    const authToken = this.store.ensureAuthToken()
    this.profiles = await getProfiles(authToken)
    this.initialProfileCount = this.profiles.length
  }

  isPageFull(): boolean {
    if (this.initialProfileCount === null) {
      return false
    }
    return this.initialProfileCount >= PAGE_SIZE
  }

  async loadNextPage() {
    const authToken = this.store.ensureAuthToken()
    const offset = this.profiles.length
    const profiles = await getProfiles(authToken, offset)
    this.profiles.push(...profiles)
  }

}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile-list {
  display: grid;
  gap: $block-outer-padding;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
}

.profile-list-item {
  color: $text-color;
}
</style>
