<template>
  <sidebar-layout>
    <template #content>
      <h1>Manage subscriptions</h1>
      <subscription-settings-monero v-if="isMonero()"></subscription-settings-monero>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { computed } from "vue"

import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionSettingsMonero from "@/components/SubscriptionSettingsMonero.vue"
import { useInstanceInfo } from "@/composables/instance"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const { getBlockchainInfo } = useInstanceInfo()

const blockchain = computed(() => getBlockchainInfo())

function isMonero(): boolean {
  if (!blockchain.value) {
    return false
  }
  return isMoneroChain(blockchain.value.chain_id)
}
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
