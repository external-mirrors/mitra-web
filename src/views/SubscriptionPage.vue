<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('subscriptions.subscription') }}</h1>
      <template v-if="!isLoading">
        <subscription-monero
          v-if="profile && isMonero()"
          :profile="profile"
        ></subscription-monero>
        <div v-else>{{ $t('subscriptions.no_subscription_info') }}</div>
      </template>
      <loader v-else></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute } from "vue-router"

import {
  isRemoteProfile,
  lookupProfile,
  getProfile,
  Profile,
  ProfilePaymentOption,
} from "@/api/users"
import Loader from "@/components/Loader.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionMonero from "@/components/SubscriptionMonero.vue"
import { useSubscribe } from "@/composables/subscribe"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { authToken, currentUser } = useCurrentUser()
const { getSubscriptionProposal } = useSubscribe()
const { setPageTitle } = useTitle()

const profile = ref<Profile | null>(null)
const subscriptionProposal = ref<ProfilePaymentOption | null>(null)
const isLoading = ref(true)

onMounted(async () => {
  setPageTitle(t("subscriptions.subscription"))
  // Recipient
  let _profile
  try {
    if (route.params.acct) {
      _profile = await lookupProfile(
        authToken.value,
        route.params.acct as string,
      )
    } else {
      _profile = await getProfile(
        authToken.value,
        route.params.profileId as string,
      )
    }
  } catch (error: any) {
    if (error.message === "profile not found") {
      isLoading.value = false
      return
    }
    throw error
  }
  if (isRemoteProfile(_profile) && currentUser.value === null) {
    // Only authenticated users can view remote subscriptions
    isLoading.value = false
    return
  }
  profile.value = _profile
  // The subscription page is displayed
  // even if current user matches `profile` (as a preview of actual page)
  subscriptionProposal.value = getSubscriptionProposal(profile.value)
  isLoading.value = false
})

function isMonero(): boolean {
  if (!subscriptionProposal.value?.chain_id) {
    return false
  }
  return isMoneroChain(subscriptionProposal.value.chain_id)
}
</script>

<style scoped lang="scss">
.loader {
  margin: 0 auto;
}
</style>
