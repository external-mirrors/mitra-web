<template>
  <static-page class="wide">
    <template #heading>Ethereum</template>
    <template #text>
      <div v-html="text"></div>
    </template>
  </static-page>
</template>

<script setup lang="ts">
import StaticPage from "@/components/StaticPage.vue"
import { renderMarkdown } from "@/utils/markdown"

const text = renderMarkdown("In order to register on this server, you need an [Ethereum wallet](https://ethereum.org/en/wallets/find-wallet/?filters=has_explore_dapps). [MetaMask](https://metamask.io/) is a good choice for beginners. Your wallet address will be stored for authentication purposes and will not be exposed unless you later complete an address verification procedure. In that case, your address will be publicly associated with your account. To protect your privacy, it is recommended that you create a fresh address and don't link it to your other activities. This can be achieved by using a [mixer](https://tornado.cash/) or an exchange [that doesn't require identity verification](http://kycnot.me/). For general privacy recommendations, visit [PrivacyGuides](https://www.privacyguides.org/tools/) website.")
</script>
