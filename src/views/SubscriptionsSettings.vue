<template>
  <sidebar-layout>
    <template #content>
      <h1>Manage subscriptions</h1>
      <subscription-settings-ethereum v-if="isEthereum()"></subscription-settings-ethereum>
      <subscription-settings-monero v-if="isMonero()"></subscription-settings-monero>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $computed } from "vue/macros"

import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionSettingsEthereum from "@/components/SubscriptionSettingsEthereum.vue"
import SubscriptionSettingsMonero from "@/components/SubscriptionSettingsMonero.vue"
import { useInstanceInfo } from "@/composables/instance"

const { getBlockchainInfo } = $(useInstanceInfo())

const blockchain = $computed(() => getBlockchainInfo())

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

<style scoped lang="scss">
@import "../styles/layout";

.subscription-settings {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  text-align: center;
}
</style>
