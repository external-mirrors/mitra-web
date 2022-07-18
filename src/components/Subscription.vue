<template>
  <h1>Subscription</h1>
  <div class="subscription">
    <div class="participants">
      <component
        class="profile-card"
        :is="sender.id ? 'router-link' : 'div'"
        :to="{ name: 'profile', params: { profileId: sender.id }}"
      >
        <avatar :profile="sender"></avatar>
        <div class="display-name">{{ sender.getDisplayName() }}</div>
        <div class="wallet-address">{{ senderEthereumAddress || '?' }}</div>
      </component>
      <div class="separator">
        <img :src="require('@/assets/feather/arrow-right.svg')">
      </div>
      <router-link class="profile-card" :to="{ name: 'profile', params: { profileId: recipient.id }}">
        <avatar :profile="recipient"></avatar>
        <div class="display-name">{{ recipient.getDisplayName() }}</div>
        <div class="wallet-address">{{ recipientEthereumAddress }}</div>
      </router-link>
    </div>
    <div class="connect-wallet" v-if="canConnectWallet()">
      <button class="btn primary" @click="connectWallet()">Connect wallet</button>
    </div>
    <div class="wallet-error" v-if="walletError">
      {{ walletError }}
    </div>
    <div class="info" v-if="subscriptionConfigured !== null">
      <template v-if="subscription">
        <div class="price">
          {{ subscription.pricePerMonth }} {{ subscription.tokenSymbol }}
          <span class="price-subtext">per month</span>
        </div>
        <div class="status" v-if="subscriptionState">
          <template v-if="subscriptionState.senderBalance.isZero()">
            You are not subscribed yet
          </template>
          <template v-else>
            <div>Your balance is {{ subscription.formatAmount(subscriptionState.senderBalance) }} {{ subscription.tokenSymbol }}</div>
            <div>Subscription expires {{ subscription.getExpirationDate(subscriptionState.senderBalance).toLocaleString() }}</div>
          </template>
        </div>
      </template>
      <template v-else>
        Subscription is not available.
      </template>
    </div>
    <form class="payment" v-if="canSubscribe()">
      <div class="duration">
        <label for="duration">Duration</label>
        <input type="number" id="duration" v-model="paymentDuration" min="1">
        <span>months</span>
      </div>
      <div>
        <div class="payment-amount">
          <label>Amount</label>
          <div>{{ getPaymentAmount() }} {{ subscription.tokenSymbol }}</div>
        </div>
        <div
          v-if="tokenBalance !== null"
          class="token-balance"
          :class="{ error: !canPay() }"
          @click="refreshTokenBalance()"
        >
          <label>You have</label>
          <div>{{ subscription.formatAmount(tokenBalance) }} {{ subscription.tokenSymbol }}</div>
        </div>
      </div>
      <div class="button-row">
        <button
          type="submit"
          class="btn primary"
          :disabled="!canPay()"
          @click.prevent="onMakeSubscriptionPayment()"
        >
          <template v-if="!subscriptionState || subscriptionState.senderBalance.isZero()">Pay</template>
          <template v-else>Extend</template>
        </button>
        <button
          v-if="isBalancePositive()"
          class="btn secondary"
          :disabled="!canCancel()"
          @click.prevent="onCancelSubscription()"
        >
          Cancel
        </button>
      </div>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { BigNumber, FixedNumber } from "ethers"
import { onMounted, watch } from "vue"
import { $, $$, $ref } from "vue/macros"

import { Profile, ProfileWrapper } from "@/api/users"
import {
  cancelSubscription,
  getSubscriptionInfo,
  getSubscriptionState,
  getTokenBalance,
  makeSubscriptionPayment,
  Subscription,
  SubscriptionState,
} from "@/api/subscriptions"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import { useWallet } from "@/composables/wallet"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { ethereumAddressMatch } from "@/utils/ethereum"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const guest: Profile = {
  id: "",
  username: "",
  acct: "",
  url: "",
  display_name: "You",
  note: null,
  avatar: null,
  header: null,
  identity_proofs: [],
  fields: [],
  followers_count: 0,
  following_count: 0,
  statuses_count: 0,
}

const { currentUser } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
const { connectWallet: connectEthereumWallet } = useWallet()
const recipient = new ProfileWrapper(props.profile)
const recipientEthereumAddress = recipient.getVerifiedEthereumAddress()
const sender = $ref<ProfileWrapper>(new ProfileWrapper(currentUser || guest))
let senderEthereumAddress = $ref<string | null>(sender.getVerifiedEthereumAddress())
let { walletAddress, walletError, getSigner } = $(useWallet())
let isLoading = $ref(false)
let subscriptionConfigured = $ref<boolean | null>(null)
let subscription = $ref<Subscription | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)
let tokenBalance = $ref<BigNumber | null>(null)
const paymentDuration = $ref<number>(1)

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
  await connectEthereumWallet()
  if (!walletError) {
    checkSubscription()
  }
}

watch($$(walletAddress), reset)

async function checkSubscription() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress
  ) {
    return
  }
  if (ethereumAddressMatch(walletAddress, recipientEthereumAddress)) {
    walletError = "Incorrect wallet address"
    return
  }
  senderEthereumAddress = walletAddress.toLowerCase()
  const signer = getSigner()
  isLoading = true
  subscription = await getSubscriptionInfo(
    instance.blockchain_contract_address,
    signer,
    recipientEthereumAddress,
  )
  if (subscription !== null) {
    subscriptionConfigured = true
  } else {
    subscriptionConfigured = false
    isLoading = false
    return
  }
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    walletAddress,
    recipientEthereumAddress,
  )
  tokenBalance = await getTokenBalance(signer, subscription.tokenAddress)
  isLoading = false
}

function canSubscribe(): boolean {
  return subscriptionConfigured === true
}

function getPaymentAmount(): FixedNumber {
  if (!subscription) {
    return FixedNumber.from(0)
  }
  const amount = subscription.pricePerMonthInt.mul(paymentDuration)
  return subscription.formatAmount(amount)
}

function canPay(): boolean {
  if (!subscription || !tokenBalance || isLoading) {
    return false
  }
  const amount = subscription.pricePerMonthInt.mul(paymentDuration)
  return amount.lte(tokenBalance)
}

async function refreshTokenBalance() {
  if (!subscription) {
    return
  }
  const signer = getSigner()
  tokenBalance = await getTokenBalance(signer, subscription.tokenAddress)
}

async function onMakeSubscriptionPayment() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress ||
    !subscription ||
    !subscriptionState
  ) {
    return
  }
  const signer = getSigner()
  const amount = subscription.pricePerMonthInt.mul(paymentDuration)
  isLoading = true
  let transaction
  try {
    transaction = await makeSubscriptionPayment(
      instance.blockchain_contract_address,
      signer,
      recipientEthereumAddress,
      amount,
    )
  } catch (error) {
    console.error(error)
    isLoading = false
    return
  }
  await transaction.wait()
  // Wait for sender balance update
  // because JSON-RPC API can return outdated info on the first call
  let newSubscriptionState
  while (!newSubscriptionState || subscriptionState.senderBalance === newSubscriptionState.senderBalance) {
    newSubscriptionState = await getSubscriptionState(
      instance.blockchain_contract_address,
      signer,
      walletAddress,
      recipientEthereumAddress,
    )
  }
  subscriptionState = newSubscriptionState
  tokenBalance = await getTokenBalance(signer, subscription.tokenAddress)
  isLoading = false
}

function isBalancePositive(): boolean {
  return (
    subscriptionState !== null &&
    !subscriptionState.senderBalance.isZero()
  )
}

function canCancel(): boolean {
  return isBalancePositive() && !isLoading
}

async function onCancelSubscription() {
  if (
    !instance?.blockchain_contract_address ||
    !recipientEthereumAddress ||
    !walletAddress ||
    !subscription
  ) {
    return
  }
  const signer = getSigner()
  isLoading = true
  let transaction
  try {
    transaction = await cancelSubscription(
      instance.blockchain_contract_address,
      signer,
      recipientEthereumAddress,
    )
  } catch (error) {
    console.error(error)
    isLoading = false
    return
  }
  await transaction.wait()
  subscriptionState = await getSubscriptionState(
    instance.blockchain_contract_address,
    signer,
    walletAddress,
    recipientEthereumAddress,
  )
  tokenBalance = await getTokenBalance(signer, subscription.tokenAddress)
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

.participants {
  $avatar-size: 60px;

  align-items: center;
  display: flex;
  gap: $block-inner-padding;

  .profile-card {
    background-color: $block-background-color;
    border-radius: $block-border-radius;
    display: flex;
    flex-basis: 50%;
    flex-direction: column;
    gap: $block-inner-padding / 2;
    min-width: 0;
    padding: $block-inner-padding;
  }

  .separator img {
    height: $icon-size;
    min-width: $icon-size;
    object-fit: contain;
    width: $icon-size;
  }

  .avatar {
    height: $avatar-size;
    margin: 0 auto;
    width: $avatar-size;
  }

  .display-name {
    font-size: 16px;
  }

  .wallet-address {
    font-family: monospace;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
  }
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

  .price-subtext {
    font-size: $text-font-size;
  }

  .status {
    color: $secondary-text-color;
  }
}

.payment {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;

  .duration,
  .payment-amount,
  .token-balance {
    align-items: center;
    display: flex;
    gap: $input-padding;
    justify-content: center;
  }

  .duration {
    font-size: 16px;

    label {
      font-weight: bold;
    }

    input {
      width: 100px;
    }
  }

  .payment-amount {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: $input-padding / 2;
  }

  .token-balance {
    color: $secondary-text-color;

    &.error {
      color: $text-color;
    }
  }

  .button-row {
    display: flex;
    gap: $block-inner-padding;
  }
}

.loader {
  margin: 0 auto;
}
</style>
