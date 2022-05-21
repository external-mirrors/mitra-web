<template>
  <div id="main" v-if="profile">
    <div class="content subscription">
      <h1>
        Subscription: @{{ getActorAddress(profile) }}
      </h1>
      <div class="connect-wallet" v-if="canConnectWallet()">
        <button class="btn" @click="connectWallet()">Connect wallet</button>
      </div>
      <div class="info" v-if="subscriptionConfigured !== null">
        <template v-if="subscription">
          <div>Recipient address: {{ subscription.recipientAddress }}</div>
          <div>Token address: {{ subscription.tokenAddress }}</div>
          <div>Token symbol: {{ subscription.tokenSymbol }}</div>
          <div>Price of one month: {{ subscription.price }}</div>
          <template v-if="subscription.senderAddress">
            <div>Your address: {{ subscription.senderAddress }}</div>
            <div>Your balance: {{ subscription.senderBalance }}</div>
          </template>
        </template>
        <template v-else-if="isCurrentUser()">
          Subscription is not configured.
        </template>
        <template v-else>
          Subscription is not available.
        </template>
      </div>
      <div class="setup" v-if="canConfigureSubscription()">
        <button class="btn" @click="onConfigureSubscription()">
          Set up subscription
        </button>
      </div>
      <div class="payment" v-if="canSubscribe()">
        <button class="btn" @click="onMakeSubscriptionPayment()">
          Pay for subscription
        </button>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

import {
  getProfile,
  getVerifiedEthereumAddress,
  Profile,
} from "@/api/users"
import {
  configureSubscription,
  getSubscriptionAuthorization,
  getSubscriptionInfo,
  makeSubscriptionPayment,
  Subscription,
} from "@/api/subscriptions"
import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { getWallet } from "@/utils/ethereum"

const route = useRoute()
const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { instance, getActorAddress } = $(useInstanceInfo())
let profile = $ref<Profile | null>(null)
let walletConnected = $ref(false)
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)

onMounted(async () => {
  const { authToken } = useCurrentUser()
  profile = await getProfile(
    authToken,
    route.params.profileId,
  )
})

function isCurrentUser(): boolean {
  if (!currentUser || !profile) {
    return false
  }
  return currentUser.id === profile.id
}

function canConnectWallet(): boolean {
  // Only profiles with verified address can have subscription
  return (
    Boolean(instance?.blockchain_contract_address) &&
    profile !== null &&
    getVerifiedEthereumAddress(profile) !== null &&
    !walletConnected
  )
}

async function connectWallet() {
  const signer = await getWallet()
  if (!signer) {
    return
  }
  walletConnected = true
  checkSubscription()
}

async function checkSubscription() {
  if (
    !profile ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const profileEthereumAddress = getVerifiedEthereumAddress(profile)
  if (!profileEthereumAddress) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    profileEthereumAddress,
  )
  if (subscription !== null) {
    subscriptionConfigured = true
  } else {
    subscriptionConfigured = false
  }
}

function canConfigureSubscription(): boolean {
  // If wallet is not connected, subscriptionConfigured is set to null
  return isCurrentUser() && subscriptionConfigured === false
}

async function onConfigureSubscription() {
  if (
    !currentUser ||
    !isCurrentUser() ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  // Subscription configuration tx can be send from any address
  const signer = await getWallet()
  if (!signer) {
    return
  }
  const authToken = ensureAuthToken()
  const signature = await getSubscriptionAuthorization(authToken)
  const transaction = await configureSubscription(
    instance.blockchain_contract_address,
    signer,
    currentUser.wallet_address,
    signature,
  )
  await transaction.wait()
  subscriptionConfigured = true
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    currentUser.wallet_address,
  )
}

function canSubscribe(): boolean {
  return !isCurrentUser() && subscriptionConfigured === true
}

async function onMakeSubscriptionPayment() {
  if (
    !profile ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const profileEthereumAddress = getVerifiedEthereumAddress(profile)
  if (!profileEthereumAddress) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  const transaction = await makeSubscriptionPayment(
    instance.blockchain_contract_address,
    signer,
    profileEthereumAddress,
  )
  await transaction.wait()
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    profileEthereumAddress,
  )
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.subscription {
  @include block-btn;

  background-color: $block-background-color;
  border-radius: $block-border-radius;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
  margin-bottom: $block-outer-padding;
  padding: $block-inner-padding;

  h1 {
    font-size: 20px;
    margin: 0;
  }
}
</style>
