<template>
  <div class="subscription">
    <h1>Subscription</h1>
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
        <div>Price of one month: {{ subscription.price }}</div>
        <template v-if="subscriptionState">
          <div>Your address: {{ subscriptionState.senderAddress }}</div>
          <div>Your balance: {{ subscriptionState.senderBalance }}</div>
          <div>Expires at: {{ subscription.getExpirationDate(subscriptionState.senderBalance).toLocaleString() }}</div>
        </template>
      </template>
      <template v-else>
        Subscription is not available.
      </template>
    </div>
    <div class="payment" v-if="canSubscribe()">
      <button class="btn" @click="onMakeSubscriptionPayment()">
        Pay for subscription
      </button>
    </div>
    <div class="cancel" v-if="canCancel()">
      <button class="btn" @click="onCancelSubscription()">
        Cancel subscription
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $, $ref } from "vue/macros"

import { getVerifiedEthereumAddress, Profile } from "@/api/users"
import {
  cancelSubscription,
  getSubscriptionInfo,
  getSubscriptionState,
  makeSubscriptionPayment,
  Subscription,
  SubscriptionState,
} from "@/api/subscriptions"
import { useWallet } from "@/composables/wallet"
import { useInstanceInfo } from "@/store/instance"
import { ethereumAddressMatch, getWeb3Provider } from "@/utils/ethereum"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const { instance } = $(useInstanceInfo())
const { connectWallet: connectEthereumWallet } = useWallet()
const recipientEthereumAddress = getVerifiedEthereumAddress(props.profile)
let { walletAddress, walletError } = $(useWallet())
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)

function canConnectWallet(): boolean {
  return (
    Boolean(instance?.blockchain_id) &&
    Boolean(instance?.blockchain_contract_address) &&
    // Only profiles with verified address can have subscription
    recipientEthereumAddress !== null &&
    walletAddress === null
  )
}

function reset() {
  subscriptionConfigured = null
  subscription = null
  subscriptionState = null
}

async function connectWallet() {
  await connectEthereumWallet(reset)
  if (!recipientEthereumAddress || !walletAddress) {
    return
  }
  if (ethereumAddressMatch(walletAddress, recipientEthereumAddress)) {
    walletError = "incorrect wallet address"
    return
  }
  checkSubscription()
}

async function checkSubscription() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    recipientEthereumAddress,
  )
  if (subscription !== null) {
    subscriptionConfigured = true
  } else {
    subscriptionConfigured = false
  }
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    walletAddress,
    recipientEthereumAddress,
  )
}

function canSubscribe(): boolean {
  return subscriptionConfigured === true
}

async function onMakeSubscriptionPayment() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  const transaction = await makeSubscriptionPayment(
    instance.blockchain_contract_address,
    signer,
    recipientEthereumAddress,
  )
  await transaction.wait()
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    walletAddress,
    recipientEthereumAddress,
  )
}

function canCancel(): boolean {
  return (
    subscriptionState !== null &&
    !subscriptionState.senderBalance.isZero()
  )
}

async function onCancelSubscription() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  const transaction = await cancelSubscription(
    instance.blockchain_contract_address,
    signer,
    recipientEthereumAddress,
  )
  await transaction.wait()
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    walletAddress,
    recipientEthereumAddress,
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
  gap: $block-inner-padding / 2;
  margin-bottom: $block-outer-padding;
  padding: $block-inner-padding;

  h1 {
    font-size: 20px;
    margin: 0;
  }
}
</style>
