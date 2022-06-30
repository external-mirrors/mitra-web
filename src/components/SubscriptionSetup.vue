<template>
  <h1>Configure subscription</h1>
  <div class="subscription">
    <div class="connect-wallet" v-if="canConnectWallet()">
      <button class="btn" @click="connectWallet()">Connect wallet</button>
    </div>
    <div class="wallet-error" v-if="walletError">
      {{ walletError }}
    </div>
    <div class="info" v-if="subscriptionConfigured !== null">
      <template v-if="subscription">
        <span>Subscription is enabled</span>
        <div class="price">
          {{ subscription.pricePerMonth }} {{ subscription.tokenSymbol }}
          <span class="price-subtext">per month</span>
        </div>
      </template>
      <template v-else>
        Subscription is not configured
      </template>
    </div>
    <form class="setup" v-if="canConfigureSubscription()">
      <div class="price">
        <label for="price">Price</label>
        <input type="number" id="price" v-model="subscriptionPrice" min="0.00">
        <span>{{ subscriptionToken.symbol }} per month</span>
      </div>
      <button
        class="btn primary"
        :disabled="subscriptionPrice <= 0"
        @click.prevent="onConfigureSubscription()"
      >
        Set up subscription
      </button>
    </form>
    <form class="withdraw" v-if="subscription !== null">
      <input v-model="subscriberAddress" placeholder="Subscriber address">
      <button
        class="btn"
        @click.prevent="onCheckSubsciptionState()"
      >
        Check
      </button>
      <button
        class="btn"
        v-if="subscriptionState !== null"
        @click.prevent="onWithdrawReceived()"
      >
        Withdraw {{ subscription.formatAmount(subscriptionState.recipientBalance) }} {{ subscription.tokenSymbol }}
      </button>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue"
import { $, $$, $ref } from "vue/macros"

import { getVerifiedEthereumAddress, Profile } from "@/api/users"
import {
  configureSubscription,
  getPricePerSec,
  getSubscriptionAuthorization,
  getSubscriptionInfo,
  getSubscriptionState,
  getSubscriptionToken,
  withdrawReceived,
  Subscription,
  SubscriptionState,
  SubscriptionToken,
} from "@/api/subscriptions"
import Loader from "@/components/Loader.vue"
import { useWallet } from "@/composables/wallet"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { ethereumAddressMatch } from "@/utils/ethereum"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const { ensureAuthToken } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
const { connectWallet: connectEthereumWallet, getSigner } = useWallet()
const profileEthereumAddress = getVerifiedEthereumAddress(props.profile)
const subscriptionPrice = $ref<number>(1)
let { walletAddress, walletError } = $(useWallet())
let isLoading = $ref(false)
let subscriptionToken = $ref<SubscriptionToken | null>(null)
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)
let subscriberAddress = $ref<string | null>(null)

onMounted(() => {
  if (walletAddress && !walletError) {
    // Load info immediately if wallet is already connected
    checkSubscription()
  }
})

function canConnectWallet(): boolean {
  return (
    Boolean(instance?.blockchain_id) &&
    Boolean(instance?.blockchain_contract_address) &&
    Boolean(instance?.blockchain_features?.subscription) &&
    // Only profiles with verified address can have subscription
    profileEthereumAddress !== null &&
    walletAddress === null
  )
}

function reset() {
  subscriptionConfigured = null
  subscription = null
  subscriptionState = null
  subscriberAddress = null
}

async function connectWallet() {
  await connectEthereumWallet()
  if (!walletError) {
    checkSubscription()
  }
}

watch($$(walletAddress), reset)

async function checkSubscription() {
  if (
    !instance?.blockchain_contract_address ||
    !profileEthereumAddress ||
    !walletAddress
  ) {
    return
  }
  if (!ethereumAddressMatch(walletAddress, profileEthereumAddress)) {
    // Recipient must use verified account
    walletError = "Incorrect wallet address"
    return
  }
  isLoading = true
  const signer = getSigner()
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    profileEthereumAddress,
  )
  if (subscription !== null) {
    subscriptionConfigured = true
  } else {
    subscriptionConfigured = false
    subscriptionToken = await getSubscriptionToken(
      instance.blockchain_contract_address,
      signer,
    )
  }
  isLoading = false
}

function canConfigureSubscription(): boolean {
  return (
    profileEthereumAddress !== null &&
    subscriptionConfigured === false &&
    subscriptionToken !== null
  )
}

async function onConfigureSubscription() {
  if (
    profileEthereumAddress === null ||
    !instance ||
    !instance.blockchain_contract_address ||
    subscriptionToken === null
  ) {
    return
  }
  isLoading = true
  const signer = getSigner()
  const authToken = ensureAuthToken()
  const pricePerSec = getPricePerSec(
    subscriptionPrice,
    subscriptionToken.decimals,
  )
  const signature = await getSubscriptionAuthorization(authToken, pricePerSec)
  let transaction
  try {
    transaction = await configureSubscription(
      instance.blockchain_contract_address,
      signer,
      profileEthereumAddress,
      pricePerSec,
      signature,
    )
  } catch (error) {
    console.error(error)
    isLoading = false
    return
  }
  await transaction.wait()
  subscriptionConfigured = true
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    profileEthereumAddress,
  )
  isLoading = false
}

async function onCheckSubsciptionState() {
  if (
    !profileEthereumAddress ||
    !instance?.blockchain_contract_address ||
    !subscriberAddress
  ) {
    return
  }
  isLoading = true
  const signer = getSigner()
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    subscriberAddress,
    profileEthereumAddress,
  )
  isLoading = false
}

async function onWithdrawReceived() {
  if (
    !instance?.blockchain_contract_address ||
    !subscriberAddress
  ) {
    return
  }
  isLoading = true
  const signer = getSigner()
  await withdrawReceived(
    instance.blockchain_contract_address,
    signer,
    subscriberAddress,
  )
  subscriptionState = null
  isLoading = false
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.subscription {
  display: flex;
  flex-direction: column;
  gap: $block-outer-padding;
  text-align: center;
}

.wallet-error {
  color: $error-color;
}

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

.setup {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;

  .price {
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
}

.withdraw {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;

  input {
    width: 400px;
  }
}

.loader {
  margin: 0 auto;
}
</style>
