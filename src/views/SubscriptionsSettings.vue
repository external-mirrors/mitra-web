<template>
  <sidebar-layout>
    <template #content>
      <h1>Manage subscriptions</h1>
      <subscription-settings-ethereum v-if="isEthereum()"></subscription-settings-ethereum>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { $, $computed } from "vue/macros"

import SidebarLayout from "@/components/SidebarLayout.vue"
import SubscriptionSettingsEthereum from "@/components/SubscriptionSettingsEthereum.vue"
import { useInstanceInfo } from "@/store/instance"

const { instance } = $(useInstanceInfo())

const blockchain = $computed(() => instance?.blockchains[0])

function isEthereum(): boolean {
  if (!blockchain) {
    return false
  }
  return blockchain.chain_id.startsWith("eip155")
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
