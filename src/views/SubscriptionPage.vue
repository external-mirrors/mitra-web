<template>
  <sidebar-layout v-if="profile && isLocalUser()">
    <template #content>
      <h1>Subscription</h1>
      <subscription-ethereum v-if="isEthereum()" :profile="profile"></subscription-ethereum>
      <subscription-monero v-if="isMonero()" :profile="profile"></subscription-monero>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $computed, $ref } from "vue/macros"
import { useRoute } from "vue-router"

import {
  lookupProfile,
  getProfile,
  Profile,
} from "@/api/users"
import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionEthereum from "@/components/SubscriptionEthereum.vue"
import SubscriptionMonero from "@/components/SubscriptionMonero.vue"
import { useCurrentUser } from "@/store/user"
import { useInstanceInfo } from "@/store/instance"

const route = useRoute()
const { authToken } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
let profile = $ref<Profile | null>(null)

const blockchain = $computed(() => instance?.blockchains[0])

onMounted(async () => {
  // Recipient
  if (route.params.acct) {
    profile = await lookupProfile(
      authToken,
      route.params.acct as string,
    )
  } else {
    profile = await getProfile(
      authToken,
      route.params.profileId as string,
    )
  }
})

function isLocalUser(): boolean {
  if (!profile) {
    return false
  }
  return profile.username === profile.acct
}

function isEthereum(): boolean {
  if (!blockchain) {
    return false
  }
  return blockchain.chain_id.startsWith("eip155")
}

function isMonero(): boolean {
  if (!blockchain) {
    return false
  }
  return blockchain.chain_id.startsWith("monero")
}
</script>
