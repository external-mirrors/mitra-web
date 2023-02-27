<template>
  <div class="subscription-settings">
    <div class="info" v-if="subscriptionOptionLoaded">
      <template v-if="subscriptionOption !== null">
        <span>Subscriptions are enabled</span>
        <div class="info-item">
          {{ getPricePerMonth(subscriptionOption.price) }} XMR per month
        </div>
        <div class="info-item">
          {{ ensureCurrentUser().subscribers_count }} subscribers
        </div>
      </template>
      <template v-else>
        Subscriptions are not enabled
      </template>
    </div>
    <div class="subscription-page" v-if="subscriptionOption !== null && !isFormVisible && !isLoading">
      <div>
        Subscribers can pay for subscription by navigating to
        <br>
        your personal subscription page:
      </div>
      <router-link :to="getSubscriptionPagePath()">
        {{ getSubscriptionPageUrl() }}
      </router-link>
    </div>
    <div class="edit-settings" v-if="!isFormVisible && !isLoading">
      <button class="btn" @click="isFormVisible = true">
        Edit settings
      </button>
    </div>
    <form class="settings" v-if="isFormVisible">
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
        @click.prevent="saveSubscriptionSettings()"
      >
        <template v-if="subscriptionOption">Save</template>
        <template v-else>Enable subscriptions</template>
      </button>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import {
  getSubscriptionOptions,
  SubscriptionOption,
} from "@/api/subscriptions-common"
import {
  registerMoneroSubscriptionOption,
  getPricePerMonth,
  getPricePerSec,
} from "@/api/subscriptions-monero"
import Loader from "@/components/Loader.vue"
import { useCurrentUser } from "@/store/user"

const router = useRouter()
const {
  ensureAuthToken,
  ensureCurrentUser,
  setCurrentUser,
} = $(useCurrentUser())

let isLoading = $ref(false)
let subscriptionOption = $ref<SubscriptionOption | null>(null)
let subscriptionOptionLoaded = $ref(false)

let subscriptionPrice = $ref(0.01)
let subscriptionPayoutAddress = $ref("")
let isFormVisible = $ref(false)

onMounted(async () => {
  isLoading = true
  await loadSubscriptionSettings()
  isLoading = false
})

async function loadSubscriptionSettings() {
  const subscriptionOptions = await getSubscriptionOptions(ensureAuthToken())
  subscriptionOption = subscriptionOptions.find((item) => {
    return item.type === "monero"
  }) || null
  subscriptionOptionLoaded = true
  if (subscriptionOption?.price && subscriptionOption?.payout_address) {
    subscriptionPrice = getPricePerMonth(subscriptionOption.price)
    subscriptionPayoutAddress = subscriptionOption.payout_address
  }
  if (subscriptionOption === null) {
    isFormVisible = true
  }
}

function getSubscriptionPagePath(): string {
  const route = router.resolve({
    name: "profile-by-acct-subscription",
    params: { acct: ensureCurrentUser().acct },
  })
  return route.fullPath
}

function getSubscriptionPageUrl(): string {
  return window.location.origin + getSubscriptionPagePath()
}

function isFormValid(): boolean {
  return (
    // Price must be greater than 0 when expressed in piconeros
    getPricePerSec(subscriptionPrice) > 0 &&
    subscriptionPayoutAddress.length > 0
  )
}

async function saveSubscriptionSettings() {
  isLoading = true
  let user
  try {
    user = await registerMoneroSubscriptionOption(
      ensureAuthToken(),
      getPricePerSec(subscriptionPrice),
      subscriptionPayoutAddress,
    )
  } catch (error: any) {
    isLoading = false
    return
  }
  setCurrentUser(user)
  await loadSubscriptionSettings()
  isFormVisible = false
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
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding;

  .info-item {
    font-size: 16px;
    font-weight: bold;
  }
}

.subscription-page {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);

  a {
    font-size: 16px;
    text-decoration: underline;
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
