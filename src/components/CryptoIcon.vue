<template>
  <component :is="icon"></component>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from "vue"

import { CurrencyCode } from "@/utils/cryptocurrencies"

const props = defineProps<{
  code: string,
}>()

const icon = defineAsyncComponent(() => {
  switch (props.code) {
    case CurrencyCode.Bitcoin:
      return import("@/assets/cryptoicons/btc.svg?component")
    case CurrencyCode.BitcoinCash:
      return import("@/assets/cryptoicons/bch.svg?component")
    case CurrencyCode.Dash:
      return import("@/assets/cryptoicons/dash.svg?component")
    case CurrencyCode.Dogecoin:
      return import("@/assets/cryptoicons/doge.svg?component")
    case CurrencyCode.Ethereum:
      return import("@/assets/forkawesome/ethereum.svg?component")
    case CurrencyCode.Litecoin:
      return import("@/assets/cryptoicons/ltc.svg?component")
    case CurrencyCode.Monero:
      return import("@/assets/cryptoicons/xmr.svg?component")
    case CurrencyCode.Zcash:
      return import("@/assets/cryptoicons/zec.svg?component")
    case CurrencyCode.BitcoinLightning:
      return import("@/assets/extra-icons/lightning.svg?component")
    default:
      throw Error("unexpected currency code")
  }
})
</script>
