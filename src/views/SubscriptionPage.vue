<template>
  <sidebar-layout v-if="profile && isLocalUser()">
    <template #content>
      <component
        :is="isCurrentUser() ? SubscriptionSetup : Subscription"
        :profile="profile"
      ></component>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import { getProfile, Profile } from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
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

function isLocalUser(): boolean {
  if (!profile) {
    return false
  }
  return profile.username === profile.acct
}

function isCurrentUser(): boolean {
  if (!currentUser || !profile) {
    return false
  }
  return currentUser.id === profile.id
}
</script>
