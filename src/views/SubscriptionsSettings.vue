<template>
  <sidebar-layout>
    <template #content>
      <h1>{{ $t('subscriptions.manage_subscriptions') }}</h1>
      <subscription-settings-monero v-if="isMonero()"></subscription-settings-monero>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { useI18n } from "vue-i18n"

import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionSettingsMonero from "@/components/SubscriptionSettingsMonero.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useTitle } from "@/composables/title"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const { t } = useI18n({ useScope: "global" })
const { getBlockchainInfo } = useInstanceInfo()
const { setPageTitle } = useTitle()

function isMonero(): boolean {
  const blockchain = getBlockchainInfo() // any available chain
  if (!blockchain) {
    return false
  }
  return isMoneroChain(blockchain.chain_id)
}

onMounted(() => {
  setPageTitle(t("subscriptions.manage_subscriptions"))
})
</script>

<style scoped lang="scss">
@import "../styles/layout";

.subscription-settings {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  text-align: center;
}
</style>
