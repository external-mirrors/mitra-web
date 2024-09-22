<template>
  <sidebar-layout v-if="profile">
    <template #content>
      <h1>{{ $t('subscriptions.subscription') }}</h1>
      <subscription-monero v-if="isMonero()" :profile="profile"></subscription-monero>
      <div v-else>{{ $t('subscriptions.no_subscription_info') }}</div>
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
import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionMonero from "@/components/SubscriptionMonero.vue"
import { useSubscribe } from "@/composables/subscribe"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const { t } = useI18n({ useScope: "global" })
const route = useRoute()
const { authToken, currentUser } = useCurrentUser()
const { getSubscriptionOption } = useSubscribe()
const { setPageTitle } = useTitle()

const profile = ref<Profile | null>(null)
const subscriptionOption = ref<ProfilePaymentOption | null>(null)

onMounted(async () => {
  setPageTitle(t("subscriptions.subscription"))
  // Recipient
  if (route.params.acct) {
    profile.value = await lookupProfile(
      authToken.value,
      route.params.acct as string,
    )
  } else {
    profile.value = await getProfile(
      authToken.value,
      route.params.profileId as string,
    )
  }
  if (isRemoteProfile(profile.value) && currentUser.value === null) {
    // Only authenticated users may view remote subscriptions
    return
  }
  subscriptionOption.value = getSubscriptionOption(profile.value)
})

function isMonero(): boolean {
  if (!subscriptionOption.value?.chain_id) {
    return false
  }
  return isMoneroChain(subscriptionOption.value.chain_id)
}
</script>
