<template>
  <div class="subscription">
    <h1>Configure subscription</h1>
    <div class="connect-wallet" v-if="canConnectWallet()">
      <button class="btn" @click="connectWallet()">Connect wallet</button>
    </div>
    <div class="wallet-error" v-if="walletError">
      {{ walletError }}
    </div>
    <div class="info" v-if="subscriptionConfigured !== null">
      <template v-if="subscription">
        <div>Recipient address: {{ subscription.recipientAddress }}</div>
        <div>Token address: {{ subscription.tokenAddress }}</div>
        <div>Token symbol: {{ subscription.tokenSymbol }}</div>
        <div>Price of one month: {{ subscription.pricePerMonth.round(2) }}</div>
      </template>
      <template v-else>
        Subscription is not configured.
      </template>
    </div>
    <div class="setup" v-if="canConfigureSubscription()">
      <button class="btn" @click="onConfigureSubscription()">
        Set up subscription
      </button>
    </div>
    <div class="withdraw" v-if="subscription !== null">
      <input v-model="subscriberAddress" placeholder="Subscriber address">
      <button class="btn" @click="onCheckSubsciptionState()">Check</button>
      <button class="btn" v-if="subscriptionState !== null" @click="onWithdrawReceived()">
        Withdraw {{ subscriptionState.recipientBalance }} {{ subscription.tokenSymbol }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"

import { getVerifiedEthereumAddress, Profile } from "@/api/users"
import {
  configureSubscription,
  getSubscriptionAuthorization,
  getSubscriptionInfo,
  getSubscriptionState,
  withdrawReceived,
  Subscription,
  SubscriptionState,
} from "@/api/subscriptions"
import { useWallet } from "@/composables/wallet"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { ethereumAddressMatch, getWeb3Provider } from "@/utils/ethereum"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
const { connectWallet: connectEthereumWallet } = useWallet()
const profileEthereumAddress = getVerifiedEthereumAddress(props.profile)
let { walletAddress, walletError } = $(useWallet())
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)
let subscriberAddress = $ref<string | null>(null)

function canConnectWallet(): boolean {
  return (
    Boolean(instance?.blockchain_id) &&
    Boolean(instance?.blockchain_contract_address) &&
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
  await connectEthereumWallet(reset)
  if (!profileEthereumAddress || !walletAddress) {
    return
  }
  if (!ethereumAddressMatch(walletAddress, profileEthereumAddress)) {
    // Recipient must use verified account
    walletError = "incorrect wallet address"
    return
  }
  checkSubscription()
}

async function checkSubscription() {
  if (
    !profileEthereumAddress ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
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
  return (
    Boolean(currentUser?.wallet_address) &&
    subscriptionConfigured === false
  )
}

async function onConfigureSubscription() {
  if (
    !currentUser ||
    !currentUser.wallet_address ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  // Subscription configuration tx can be sent from any address
  const signer = getWeb3Provider().getSigner()
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

async function onCheckSubsciptionState() {
  if (
    !profileEthereumAddress ||
    !instance?.blockchain_contract_address ||
    !subscriberAddress
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    subscriberAddress,
    profileEthereumAddress,
  )
}

async function onWithdrawReceived() {
  if (
    !instance?.blockchain_contract_address ||
    !subscriberAddress
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  await withdrawReceived(
    instance.blockchain_contract_address,
    signer,
    subscriberAddress,
  )
  subscriptionState = null
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
  gap: $block-inner-padding / 2;
  margin-bottom: $block-outer-padding;
  padding: $block-inner-padding;

  h1 {
    font-size: 20px;
    margin: 0;
  }
}

.withdraw {
  display: flex;
  flex-wrap: wrap;
  gap: $block-inner-padding / 2;

  input {
    border: 1px solid $btn-background-hover-color;
    border-radius: $btn-border-radius;
  }
}
</style>
