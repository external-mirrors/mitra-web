<template>
  <h1>Manage subscriptions</h1>
  <div class="subscription">
    <div class="connect-wallet" v-if="canConnectWallet()">
      <button class="btn" @click="connectWallet()">Connect wallet</button>
    </div>
    <div class="wallet-error" v-if="walletError">
      {{ walletError }}
    </div>
    <div class="info" v-if="subscriptionsEnabled !== null">
      <template v-if="subscriptionConfig">
        <span>Subscriptions are enabled</span>
        <div class="price">
          {{ subscriptionConfig.pricePerMonth }} {{ subscriptionConfig.tokenSymbol }}
          <span class="price-subtext">per month</span>
        </div>
      </template>
      <template v-else>
        Subscriptions are not enabled
      </template>
    </div>
    <form class="setup" v-if="canEnableSubscriptions()">
      <div class="price">
        <label for="price">Price</label>
        <input type="number" id="price" v-model="subscriptionPrice" min="0.00">
        <span>{{ subscriptionToken.symbol }} per month</span>
      </div>
      <button
        class="btn primary"
        :disabled="subscriptionPrice <= 0"
        @click.prevent="onEnableSubscriptions()"
      >
        Enable subscriptions
      </button>
    </form>
    <form class="withdraw" v-if="subscriptionConfig !== null">
      <h2>Subscribers</h2>
      <div
        v-for="subscription in subscribers"
        class="subscriber"
        :class="{ expired: !isSubscriptionActive(subscription) }"
        :key="subscription.id"
        @click="onSubscriberSelected(subscription)"
      >
        <profile-list-item :profile="subscription.sender"></profile-list-item>
      </div>
      <input v-model="subscriberAddress" placeholder="Subscriber address">
      <button
        class="btn"
        :disabled="!subscriberAddress"
        @click.prevent="onCheckSubsciptionState()"
      >
        Check
      </button>
      <button
        class="btn"
        v-if="subscriptionState !== null"
        @click.prevent="onWithdrawReceived()"
      >
        Withdraw
        {{ subscriptionConfig.formatAmount(subscriptionState.recipientBalance) }}
        {{ subscriptionConfig.tokenSymbol }}
      </button>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue"
import { $, $$, $computed, $ref } from "vue/macros"

import { DateTime } from "luxon"

import { Profile, ProfileWrapper } from "@/api/users"
import {
  configureSubscriptions,
  getPricePerSec,
  getSubscribers,
  getSubscriptionAuthorization,
  getSubscriptionConfig,
  getSubscriptionState,
  getSubscriptionToken,
  onSubscriptionsEnabled,
  withdrawReceived,
  Subscription,
  SubscriptionConfig,
  SubscriptionState,
  SubscriptionToken,
} from "@/api/subscriptions"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import { useWallet } from "@/composables/wallet"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { ethereumAddressMatch } from "@/utils/ethereum"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const { ensureAuthToken, setCurrentUser } = $(useCurrentUser())
const { instance } = $(useInstanceInfo())
const { connectWallet: connectEthereumWallet, getSigner } = useWallet()
const profile = new ProfileWrapper(props.profile)
const profileEthereumAddress = profile.getVerifiedEthereumAddress()
const subscriptionPrice = $ref<number>(1)
let { walletAddress, walletError } = $(useWallet())
let isLoading = $ref(false)
let subscriptionToken = $ref<SubscriptionToken | null>(null)
let subscriptionsEnabled = $ref<boolean | null>(null)
let subscriptionConfig = $ref<SubscriptionConfig | null>(null)
let subscriptionState = $ref<SubscriptionState | null>(null)
let subscribers = $ref<Subscription[]>([])
let subscriberAddress = $ref<string | null>(null)

onMounted(() => {
  if (walletAddress && !walletError) {
    // Load info immediately if wallet is already connected
    checkSubscription()
  }
})

const blockchain = $computed(() => instance?.blockchains[0])

function canConnectWallet(): boolean {
  return (
    Boolean(blockchain?.contract_address) &&
    Boolean(blockchain?.features.subscriptions) &&
    // Only profiles with verified address can have subscription
    profileEthereumAddress !== null &&
    walletAddress === null
  )
}

function reset() {
  subscriptionToken = null
  subscriptionsEnabled = null
  subscriptionConfig = null
  subscriptionState = null
  subscriberAddress = null
}

async function connectWallet() {
  await connectEthereumWallet()
  if (!walletError) {
    checkSubscription()
  }
}

watch($$(walletAddress), (newValue) => {
  if (newValue === null) {
    reset()
  }
})

async function checkSubscription() {
  if (
    !blockchain?.contract_address ||
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
  subscriptionConfig = await getSubscriptionConfig(
    blockchain.contract_address,
    signer,
    profileEthereumAddress,
  )
  if (subscriptionConfig !== null) {
    subscriptionsEnabled = true
    // Ensure server is aware of subscription configuration
    await onSubscriptionsEnabled(ensureAuthToken())
    subscribers = await getSubscribers(
      ensureAuthToken(),
      profile.id,
    )
  } else {
    subscriptionsEnabled = false
    subscriptionToken = await getSubscriptionToken(
      blockchain.contract_address,
      signer,
    )
  }
  isLoading = false
}

function canEnableSubscriptions(): boolean {
  return (
    profileEthereumAddress !== null &&
    subscriptionsEnabled === false &&
    subscriptionToken !== null
  )
}

async function onEnableSubscriptions() {
  if (
    profileEthereumAddress === null ||
    !blockchain?.contract_address ||
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
    transaction = await configureSubscriptions(
      blockchain.contract_address,
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
  subscriptionsEnabled = true
  subscriptionConfig = await getSubscriptionConfig(
    blockchain.contract_address,
    signer,
    profileEthereumAddress,
  )
  const user = await onSubscriptionsEnabled(authToken)
  setCurrentUser(user)
  profile.subscription_page_url = user.subscription_page_url
  isLoading = false
}

function isSubscriptionActive(subscription: Subscription): boolean {
  const expiresAt = DateTime.fromISO(subscription.expires_at)
  return expiresAt > DateTime.now()
}

function onSubscriberSelected(subscription: Subscription) {
  if (subscription.sender_address !== null) {
    subscriberAddress = subscription.sender_address
    subscriptionState = null
  }
}

async function onCheckSubsciptionState() {
  if (
    !profileEthereumAddress ||
    !blockchain?.contract_address ||
    !subscriberAddress
  ) {
    return
  }
  isLoading = true
  const signer = getSigner()
  subscriptionState = await getSubscriptionState(
    blockchain.contract_address,
    signer,
    subscriberAddress,
    profileEthereumAddress,
  )
  isLoading = false
}

async function onWithdrawReceived() {
  if (
    !blockchain?.contract_address ||
    !subscriberAddress
  ) {
    return
  }
  isLoading = true
  const signer = getSigner()
  await withdrawReceived(
    blockchain.contract_address,
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

  h2 {
    font-size: 20px;
  }

  .subscriber,
  input {
    width: 400px;
  }

  .subscriber.expired {
    opacity: 0.5;
  }
}

.loader {
  margin: 0 auto;
}
</style>
