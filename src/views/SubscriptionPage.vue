<template>
  <div id="main" v-if="profile">
    <div class="content">
      <component
        :is="isCurrentUser() ? SubscriptionSetup : Subscription"
        :profile="profile"
      ></component>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { getProfile, Profile } from "@/api/users"
import Sidebar from "@/components/Sidebar.vue"
import Subscription from "@/components/Subscription.vue"
import SubscriptionSetup from "@/components/SubscriptionSetup.vue"
import { useCurrentUser } from "@/store/user"

const route = useRoute()
const { currentUser, authToken } = $(useCurrentUser())
let profile = $ref<Profile | null>(null)

onMounted(async () => {
  profile = await getProfile(
    authToken,
    route.params.profileId as string,
  )
})

function isCurrentUser(): boolean {
  if (!currentUser || !profile) {
    return false
  }
  return currentUser.id === profile.id
}
</script>
