<template>
  <div class="subscription">
    <div class="participants">
      <component
        class="profile-card"
        :is="sender.id ? 'router-link' : 'div'"
        :to="{ name: 'profile-by-acct', params: { acct: sender.acct } }"
      >
        <avatar :profile="sender"></avatar>
        <profile-display-name :profile="sender"></profile-display-name>
      </component>
      <div class="separator">
        <img src="@/assets/feather/arrow-right.svg">
      </div>
      <router-link
        class="profile-card"
        :to="{ name: 'profile-by-acct', params: { acct: recipient.acct }}"
      >
        <avatar :profile="recipient"></avatar>
        <profile-display-name :profile="recipient"></profile-display-name>
      </router-link>
    </div>
    <form class="sender" v-if="sender.id === ''">
      <input
        type="text"
        v-model="senderAcct"
        placeholder="Enter your username or Fediverse address (username@example.org)"
      >
      <button
        type="submit"
        class="btn"
        :disabled="!senderAcct"
        @click.prevent="identifySender()"
      >
        Find profile
      </button>
      <span class="sender-error">{{ senderError }}</span>
    </form>
    <div class="info" v-if="subscriptionOption !== null && sender.id !== ''">
      <template v-if="subscriptionPrice">
        <div class="price">
          {{ subscriptionPrice }} XMR
          <span class="price-subtext">per month</span>
        </div>
        <div class="status">
          <template v-if="!isSubscribed()">
            You are not subscribed yet
          </template>
          <template v-else-if="subscriptionDetails">
            <div>
              Subscription expires
              {{ formatDate(subscriptionDetails.expires_at) }}
            </div>
          </template>
        </div>
      </template>
      <template v-else>
        Subscription is not available.
      </template>
    </div>
    <div v-if="!recipient.isLocal() && subscriptionOption">
      <a
        v-if="canSubscribeRemote()"
        class="btn primary"
        :href="subscriptionOption.object_id"
        target="_blank"
        rel="noreferrer"
      >
        Pay
      </a>
    </div>
    <form class="payment" v-if="canSubscribe()">
      <div class="duration" @click="editDuration()">
        <label for="duration">Duration</label>
        <input
          v-if="!isAmountEditable"
          type="number"
          id="duration"
          v-model="paymentDurationInputValue"
          min="1"
        >
        <span
          v-else
          class="editable-value"
          title="Click to edit"
        >
          {{ paymentDuration }}
        </span>
        <span>months</span>
      </div>
      <div class="payment-amount" @click="editAmount()">
        <label for="amount">Amount</label>
        <input
          v-if="isAmountEditable && subscriptionPrice"
          type="number"
          id="amount"
          v-model="paymentAmountInputValue"
          :step="subscriptionPrice"
          min="0"
        >
        <span
          v-else
          class="editable-value"
          title="Click to edit"
        >
          {{ formatXmrAmount(paymentAmount) }}
        </span>
        <span>XMR</span>
      </div>
      <div
        v-if="paymentMessage"
        class="payment-message"
        v-html="paymentMessage"
      >
      </div>
      <button
        type="submit"
        class="btn primary"
        :disabled="!canCreateInvoice()"
        @click.prevent="onCreateInvoice()"
      >
        <template v-if="!isSubscribed()">
          Pay
        </template>
        <template v-else>Extend</template>
      </button>
    </form>
    <div class="invoice" v-if="invoice">
      <template v-if="invoice.status === 'open' || invoice.status === 'underpaid'">
        <div>Please send {{ formatXmrAmount(invoice.amount) }} XMR to this address:</div>
        <a
          class="payment-address"
          :href="getPaymentUri(invoice)"
        >
          {{ invoice.payment_address }}
        </a>
        <qr-code :url="getPaymentUri(invoice)"></qr-code>
      </template>
      <div class="invoice-status">
        <template v-if="invoice.status === 'open'">
          Waiting for payment ({{ getPaymentMinutesLeft(invoice) }} minutes left)
        </template>
        <template v-else-if="invoice.status === 'paid' || invoice.status === 'forwarded' || invoice.status === 'failed'">Processing payment</template>
        <template v-else-if="invoice.status === 'timeout'">Payment timed out</template>
        <template v-else-if="invoice.status === 'cancelled'">Payment cancelled</template>
        <template v-else-if="invoice.status === 'underpaid'">Payment amount is too small</template>
        <template v-else-if="invoice.status === 'completed'">Payment completed</template>
      </div>
      <button
        v-if="invoice.status === 'open'"
        class="btn"
        @click="onCancelInvoice()"
      >
        Cancel
      </button>
      <button
        v-else-if="invoice.status === 'completed' || invoice.status === 'timeout' || invoice.status === 'cancelled'"
        class="btn"
        @click="closeInvoice()"
      >
        OK
      </button>
    </div>
    <loader v-if="isLoaderVisible()"></loader>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue"
import { $, $computed, $ref } from "vue/macros"
import { useRoute } from "vue-router"
import { DateTime } from "luxon"

import { getRelationship, Relationship } from "@/api/relationships"
import { searchProfilesByAcct } from "@/api/search"
import { findSubscription, SubscriptionDetails } from "@/api/subscriptions-common"
import {
  cancelInvoice,
  createInvoice,
  formatXmrAmount,
  getInvoice,
  getPaymentAmount,
  getPricePerMonth,
  getSubscriptionDuration,
  parseXmrAmount,
  Invoice,
} from "@/api/subscriptions-monero"
import { defaultProfile, Profile, ProfilePaymentOption, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import QrCode from "@/components/QrCode.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useSubscribe } from "@/composables/subscribe"
import { useCurrentUser } from "@/composables/user"
import { formatDate } from "@/utils/dates"
import { createMoneroPaymentUri } from "@/utils/monero"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const INVOICE_ID_STORAGE_KEY = "invoice"
const PAYMENT_AMOUNT_MIN = 0.001

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const route = useRoute()
const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { getBlockchainInfo, getMoneroChainMetadata } = useInstanceInfo()
const { getSubscriptionOption } = useSubscribe()
const recipient = new ProfileWrapper(props.profile)
const senderAcct = $ref("")
let senderError = $ref<string | null>(null)
let sender = $ref(new ProfileWrapper(currentUser || defaultProfile({ display_name: "You" })))
let subscriptionOption = $ref<ProfilePaymentOption | null>(null)
let subscriptionDetails = $ref<SubscriptionDetails | null>(null)
let relationship = $ref<Relationship | null>(null)
let paymentDurationInputValue = $ref<number | "">(1)
let paymentAmountInputValue = $ref<number | "">(0)
let isAmountEditable = $ref(false)
let invoice = $ref<Invoice | null>(null)

let isLoading = $ref(false)

function getInvoiceIdStorageKey(): string {
  return `${INVOICE_ID_STORAGE_KEY}_${recipient.id}`
}

onMounted(async () => {
  isLoading = true
  const option = getSubscriptionOption(recipient)
  if (
    option !== null &&
    option.chain_id !== undefined &&
    isMoneroChain(option.chain_id)
  ) {
    subscriptionOption = option
    if (sender.id !== "") {
      if (recipient.isLocal()) {
        await loadSubscriptionDetails()
      } else {
        // Only authenticated users may view remote subscriptions
        relationship = await getRelationship(ensureAuthToken(), recipient.id)
      }
    }
  }
  isLoading = false
})

function isLoaderVisible(): boolean {
  return (
    isLoading ||
    invoice?.status === "paid" ||
    invoice?.status === "forwarded" ||
    invoice?.status === "failed"
  )
}

async function loadSubscriptionDetails() {
  subscriptionDetails = await findSubscription(sender.id, recipient.id)
  const invoiceId = (
    route.query.invoice_id ||
    localStorage.getItem(getInvoiceIdStorageKey())
  )
  if (invoiceId) {
    invoice = await getInvoice(invoiceId as string)
    if (invoice && invoice.status !== "forwarded") {
      watchInvoice()
    }
  }
}

// Human-readable subscription price
const subscriptionPrice = $computed<number | null>(() => {
  if (!subscriptionOption?.price) {
    return null
  }
  return getPricePerMonth(subscriptionOption.price)
})

async function identifySender() {
  if (!senderAcct) {
    return
  }
  isLoading = true
  const profiles = await searchProfilesByAcct(null, senderAcct)
  if (profiles.length > 1) {
    senderError = "Please provide full address"
  } else {
    const profile = profiles[0]
    if (profile && profile.id !== recipient.id) {
      sender = new ProfileWrapper(profile)
      senderError = null
      await loadSubscriptionDetails()
    } else {
      senderError = "Profile not found"
    }
  }
  isLoading = false
}

function isSubscribed(): boolean {
  if (!recipient.isLocal()) {
    if (relationship === null) {
      return false
    }
    return relationship.subscription_to
  }
  if (subscriptionDetails === null) {
    return false
  }
  const expiresAt = DateTime.fromISO(subscriptionDetails.expires_at)
  return DateTime.now() < expiresAt
}

function canSubscribe(): boolean {
  return (
    sender.id !== "" &&
    sender.id !== recipient.id &&
    recipient.isLocal() &&
    subscriptionPrice !== null &&
    invoice === null
  )
}

function canSubscribeRemote(): boolean {
  return (
    !recipient.isLocal() &&
    subscriptionOption !== null &&
    subscriptionOption.object_id !== undefined
  )
}

function editDuration() {
  if (!isAmountEditable) {
    return
  }
  paymentDurationInputValue = paymentDuration.value
  isAmountEditable = false
}

const paymentDuration = computed<number>(() => {
  if (!subscriptionOption?.price) {
    return 0
  }
  if (!isAmountEditable) {
    if (paymentDurationInputValue === "") {
      return 0
    }
    return paymentDurationInputValue
  }
  if (paymentAmountInputValue === "") {
    return 0
  }
  return getSubscriptionDuration(
    subscriptionOption.price,
    parseXmrAmount(paymentAmountInputValue),
  )
})

function editAmount() {
  if (isAmountEditable) {
    return
  }
  paymentAmountInputValue = formatXmrAmount(paymentAmount)
  isAmountEditable = true
}

const paymentAmount = $computed<number>(() => {
  if (!subscriptionOption?.price) {
    return 0
  }
  if (isAmountEditable) {
    if (paymentAmountInputValue === "") {
      return 0
    }
    return parseXmrAmount(paymentAmountInputValue)
  }
  if (paymentDurationInputValue === "") {
    return 0
  }
  return getPaymentAmount(
    subscriptionOption.price,
    paymentDurationInputValue,
  )
})

const paymentMessage = computed<string | null>(() => {
  const blockchain = getBlockchainInfo()
  if (blockchain && blockchain.chain_id === subscriptionOption?.chain_id) {
    return getMoneroChainMetadata(blockchain)?.description || null
  } else {
    return null
  }
})

function canCreateInvoice(): boolean {
  return paymentAmount !== 0 && paymentAmount >= parseXmrAmount(PAYMENT_AMOUNT_MIN)
}

async function onCreateInvoice() {
  if (paymentAmount === 0) {
    return
  }
  if (!subscriptionOption || !subscriptionOption.chain_id) {
    return
  }
  isLoading = true
  try {
    invoice = await createInvoice(
      sender.id,
      recipient.id,
      subscriptionOption.chain_id,
      paymentAmount,
    )
  } catch (error: any) {
    alert(error.message)
    isLoading = false
    return
  }
  // Add invoice ID to current URL
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?invoice_id=${invoice.id}`,
  )
  localStorage.setItem(getInvoiceIdStorageKey(), invoice.id)
  isLoading = false
  watchInvoice()
}

function watchInvoice() {
  const watcher = setInterval(async () => {
    if (!invoice) {
      // Stop watching if invoice was closed
      clearInterval(watcher)
      return
    }
    invoice = await getInvoice(invoice.id)
    if (invoice.status === "completed") {
      // Stop watching and refresh subscription details
      clearInterval(watcher)
      subscriptionDetails = await findSubscription(sender.id, recipient.id)
    }
  }, 10000)
}

async function onCancelInvoice() {
  if (!invoice) {
    throw new Error("invoice doesn't exist")
  }
  await cancelInvoice(invoice.id)
  closeInvoice()
}

function closeInvoice() {
  invoice = null
  // Remove invoice ID from current URL
  window.history.pushState(
    {},
    "",
    window.location.pathname,
  )
  localStorage.removeItem(getInvoiceIdStorageKey())
}

function getPaymentUri(invoice: Invoice): string {
  return createMoneroPaymentUri(
    invoice.payment_address,
    formatXmrAmount(invoice.amount),
  )
}

function getPaymentMinutesLeft(invoice: Invoice): number {
  const expiresAt = DateTime.fromISO(invoice.expires_at)
  const now = DateTime.now()
  const diff = expiresAt.diff(now)
  return Math.round(diff.as("minutes"))
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
    background-color: var(--block-background-color);
    border-radius: $block-border-radius;
    display: flex;
    flex-basis: 50%;
    flex-direction: column;
    gap: calc($block-inner-padding / 2);
    min-width: 0;
    padding: $block-inner-padding;
  }

  .separator img {
    filter: var(--text-colorizer);
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

.sender {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
}

.info {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding;

  .price {
    font-size: 16px;
    font-weight: bold;
  }

  .price-subtext {
    font-size: $text-font-size;
  }

  .status {
    color: var(--secondary-text-color);
  }
}

.payment {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;

  .duration,
  .payment-amount {
    align-items: center;
    display: flex;
    font-size: 16px;
    font-weight: bold;
    gap: $input-padding;
    justify-content: center;

    input {
      font-size: inherit;
      width: 100px;
    }

    .editable-value {
      cursor: pointer;
    }
  }

  .payment-message {
    :deep(a) {
      @include block-link;
    }
  }
}

.invoice {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
  padding-bottom: $block-inner-padding;

  .payment-address {
    font-family: monospace;
    max-width: 100%;
    word-wrap: break-word;
  }
}

.qr-wrapper {
  margin: 0 auto;
  max-width: 300px;
}

.loader {
  margin: 0 auto;
}
</style>
