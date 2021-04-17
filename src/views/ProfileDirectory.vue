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
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"

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

  async created() {
    const authToken = this.store.ensureAuthToken()
    this.profiles = await getProfiles(authToken)
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
