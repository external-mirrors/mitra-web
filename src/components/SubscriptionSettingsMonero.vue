<template>
  <div class="subscription-settings">
    <div class="info" v-if="!isLoading">
      <template v-if="subscriptionOption !== null">
        Subscriptions are enabled
        <div class="price">
          {{ getPricePerMonth(subscriptionOption.price) }} XMR per month
        </div>
      </template>
      <template v-else>
        Subscriptions are not enabled
      </template>
    </div>
    <form v-if="canEnableSubscriptions()">
      <div class="price-input-group">
        <label for="price">Price</label>
        <input type="number" id="price" v-model="subscriptionPrice" min="0.00" step="0.01">
        <span>XMR per month</span>
      </div>
      <input
        type="text"
        id="payout_address"
        v-model="subscriptionPayoutAddress"
        placeholder="Payout address"
      >
      <button
        type="submit"
        class="btn"
        :disabled="!isFormValid()"
        @click.prevent="enableSubscriptions()"
      >
        Enable subscriptions
      </button>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"

import {
  getSubscriptionOptions,
  SubscriptionOption,
} from "@/api/subscriptions-common"
import {
  enableMoneroSubscriptions,
  getPricePerMonth,
  getPricePerSec,
} from "@/api/subscriptions-monero"
import Loader from "@/components/Loader.vue"
import { useCurrentUser } from "@/store/user"

const { ensureAuthToken, setCurrentUser } = $(useCurrentUser())

const subscriptionPrice = $ref(0.01)
const subscriptionPayoutAddress = $ref("")
let isLoading = $ref(false)
let subscriptionOption = $ref<SubscriptionOption | null>(null)

onMounted(async () => {
  isLoading = true
  await loadSubscriptionConfig()
  isLoading = false
})

async function loadSubscriptionConfig() {
  const subscriptionOptions = await getSubscriptionOptions(ensureAuthToken())
  subscriptionOption = subscriptionOptions.find((item) => {
    return item.type === "monero"
  }) || null
}

function canEnableSubscriptions(): boolean {
  return (
    !isLoading &&
    subscriptionOption === null
  )
}

function isFormValid(): boolean {
  return (
    getPricePerSec(subscriptionPrice) > 0 &&
    subscriptionPayoutAddress.length > 0
  )
}

async function enableSubscriptions() {
  isLoading = true
  const user = await enableMoneroSubscriptions(
    ensureAuthToken(),
    getPricePerSec(subscriptionPrice),
    subscriptionPayoutAddress,
  )
  setCurrentUser(user)
  await loadSubscriptionConfig()
  isLoading = false
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.info {
  background-color: $block-background-color;
  border-radius: $block-border-radius;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding / 2;
  padding: $block-inner-padding;

  .price {
    font-size: 16px;
    font-weight: bold;
  }
}

form {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
}

.price-input-group {
  align-items: center;
  display: flex;
  font-size: 16px;
  gap: $input-padding;
  justify-content: center;

  label {
    font-weight: bold;
  }

  input {
    width: 100px;
  }
}

.loader {
  margin: 0 auto;
}
</style>
