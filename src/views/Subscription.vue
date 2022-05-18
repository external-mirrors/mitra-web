<template>
  <div id="main" v-if="profile">
    <div class="content subscription">
      <h1>
        Subscription: @{{ getActorAddress(profile) }}
      </h1>
      <div class="connect-wallet" v-if="canConnectWallet()">
        <button class="btn" @click="connectWallet()">Connect wallet</button>
      </div>
      <div class="setup" v-if="canConfigureSubscription()">
        <template v-if="subscriptionConfigured">
          Subscription is configured.
        </template>
        <button v-else class="btn" @click="onConfigureSubscription()">
          Set up subscription
        </button>
      </div>
      <div class="payment" v-if="canSubscribe()">
        <template v-if="!subscriptionConfigured">
          Subscription is not available.
        </template>
        <button v-else class="btn" @click="onMakeSubscriptionPayment()">
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

import { getProfile, Profile } from "@/api/users"
import {
  getSubscriptionAuthorization,
  configureSubscription,
  isSubscriptionConfigured,
  makeSubscriptionPayment,
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
  return (
    Boolean(instance?.blockchain_contract_address) &&
    Boolean(profile?.wallet_address) &&
    !walletConnected
  )
}

async function connectWallet() {
  const signer = await getWallet()
  if (!signer) {
    return
  }
  walletConnected = true
  checkSubscriptionConfigured()
}

async function checkSubscriptionConfigured() {
  if (
    !profile ||
    !profile.wallet_address ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  subscriptionConfigured = await isSubscriptionConfigured(
    instance.blockchain_contract_address,
    signer,
    profile.wallet_address,
  )
}

function canConfigureSubscription(): boolean {
  // If wallet is not connected, subscriptionConfigured is set to null
  return isCurrentUser() && subscriptionConfigured !== null
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
  await configureSubscription(
    instance.blockchain_contract_address,
    signer,
    currentUser.wallet_address,
    signature,
  )
  subscriptionConfigured = true
}

function canSubscribe(): boolean {
  return !isCurrentUser() && subscriptionConfigured !== null
}

async function onMakeSubscriptionPayment() {
  if (
    !profile ||
    !profile.wallet_address ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const signer = await getWallet()
  if (!signer) {
    return
  }
  await makeSubscriptionPayment(
    instance.blockchain_contract_address,
    signer,
    profile.wallet_address,
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
  margin-bottom: $block-outer-padding;
  padding: $block-inner-padding;

  h1 {
    font-size: 20px;
    text-align: center;
  }
}

.connect-wallet,
.setup,
.payment {
  display: flex;
  justify-content: center;
}
</style>
