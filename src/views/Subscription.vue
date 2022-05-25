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
          <template v-if="!isRecipient() && subscriptionState">
            <div>Your address: {{ subscriptionState.senderAddress }}</div>
            <div>Your balance: {{ subscriptionState.senderBalance }}</div>
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
      <div class="cancel" v-if="canCancel()">
        <button class="btn" @click="onCancelSubscription()">
          Cancel subscription
        </button>
      </div>
      <div class="withdraw" v-if="isRecipient()">
        <input v-model="subscriberAddress" placeholder="Subscriber address">
        <button class="btn" @click="onCheckSubsciptionState()">Check</button>
        <button class="btn" v-if="canWithdrawReceived()" @click="onWithdrawReceived()">
          Withdraw {{ subscriptionState.recipientBalance }}
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
  cancelSubscription,
  configureSubscription,
  getSubscriptionAuthorization,
  getSubscriptionInfo,
  getSubscriptionState,
  makeSubscriptionPayment,
  withdrawReceived,
  Subscription,
  SubscriptionState,
} from "@/api/subscriptions"
import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { ethereumAddressMatch, getWallet, getWeb3Provider } from "@/utils/ethereum"

const route = useRoute()
const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { instance, getActorAddress } = $(useInstanceInfo())
let profile = $ref<Profile | null>(null)
let profileEthereumAddress = $ref<string | null>(null)
let walletConnected = $ref(false)
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)
let subscriberAddress = $ref<string | null>(null)

onMounted(async () => {
  const { authToken } = useCurrentUser()
  profile = await getProfile(
    authToken,
    route.params.profileId,
  )
  profileEthereumAddress = getVerifiedEthereumAddress(profile)
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
    profileEthereumAddress !== null &&
    !walletConnected
  )
}

function disconnectWallet() {
  subscriptionConfigured = null
  subscription = null
  subscriptionState = null
  subscriberAddress = null
  walletConnected = false
}

async function connectWallet() {
  const web3Provider = getWeb3Provider()
  const signer = await getWallet(web3Provider)
  if (!signer) {
    return
  }
  const walletAddress = await signer.getAddress()
  if (isCurrentUser() && !ethereumAddressMatch(walletAddress, profileEthereumAddress)) {
    // Recipient must use verified account
    disconnectWallet()
    return
  }
  const walletChainId = await web3Provider.send("eth_chainId", [])
  console.info("chain ID:", walletChainId)
  web3Provider.provider.on("chainChanged", (chainId: string) => {
    disconnectWallet()
  })
  web3Provider.provider.on("accountsChanged", () => {
    disconnectWallet()
  })
  web3Provider.provider.on("disconnect", () => {
    disconnectWallet()
  })
  walletConnected = true
  checkSubscription()
}

async function checkSubscription() {
  if (
    !profile ||
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
  const signerAddress = await signer.getAddress()
  if (!ethereumAddressMatch(signerAddress, profileEthereumAddress)) {
    // Connected wallet is a subscriber
    subscriptionState = await getSubscriptionState(
      instance.blockchain_contract_address,
      signer,
      signerAddress,
      profileEthereumAddress,
    )
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

function canSubscribe(): boolean {
  return !isCurrentUser() && subscriptionConfigured === true
}

async function onMakeSubscriptionPayment() {
  if (
    !profile ||
    !profileEthereumAddress ||
    !instance ||
    !instance.blockchain_contract_address
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
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
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    await signer.getAddress(),
    profileEthereumAddress,
  )
}

function canCancel(): boolean {
  return !isCurrentUser() && subscription?.senderBalance && !subscription.senderBalance.isZero()
}

async function onCancelSubscription() {
  if (
    !profile ||
    !profileEthereumAddress ||
    !instance?.blockchain_contract_address
  ) {
    return
  }
  const signer = getWeb3Provider().getSigner()
  const transaction = await cancelSubscription(
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

function isRecipient(): boolean {
  return isCurrentUser() && subscription
}

async function onCheckSubsciptionState() {
  if (
    !profile ||
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

function canWithdrawReceived(): boolean {
  return isRecipient() && subscriptionState !== null
}

async function onWithdrawReceived() {
  if (
    !profile ||
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
