<template>
  <div class="subscription">
    <div class="participants">
      <component
        class="profile-card"
        :is="sender.id ? 'router-link' : 'div'"
        :to="getActorLocation('profile', sender)"
      >
        <avatar :profile="sender"></avatar>
        <profile-display-name :profile="sender"></profile-display-name>
      </component>
      <div class="separator">
        <icon-arrow-right></icon-arrow-right>
      </div>
      <router-link
        class="profile-card"
        :to="getActorLocation('profile', recipient)"
      >
        <avatar :profile="recipient"></avatar>
        <profile-display-name :profile="recipient"></profile-display-name>
      </router-link>
    </div>
    <form class="sender" v-if="sender.id === ''">
      <input
        type="text"
        v-model="senderAcct"
        :placeholder="$t('subscriptions.enter_your_username')"
      >
      <button
        type="submit"
        class="btn"
        :disabled="!senderAcct"
        @click.prevent="identifySender()"
      >
        {{ $t('subscriptions.find_profile') }}
      </button>
      <span class="sender-error">{{ senderError }}</span>
    </form>
    <div class="info" v-if="subscriptionOption !== null && sender.id !== ''">
      <template v-if="subscriptionPrice">
        <div class="price">
          {{ subscriptionPrice }} XMR
          <span class="price-subtext">{{ $t('subscriptions.price_per_month') }}</span>
        </div>
        <div class="status">
          <template v-if="!isSubscribed()">
            {{ $t('subscriptions.you_are_not_subscribed_yet') }}
          </template>
          <template v-else-if="subscriptionDetails">
            <div>
              {{ $t('subscriptions.subscription_expires', { date: formatDate(subscriptionDetails.expires_at) }) }}
            </div>
          </template>
          <template v-else>
            {{ $t('subscriptions.subscription_is_active') }}
          </template>
        </div>
      </template>
      <template v-else>
        {{ $t('subscriptions.subscription_is_not_available') }}
      </template>
    </div>
    <form class="payment" v-if="canSubscribe()">
      <div class="duration" @click="editDuration()">
        <label for="duration">{{ $t('subscriptions.duration') }}</label>
        <input
          v-if="!isAmountEditable"
          type="number"
          id="duration"
          v-model="paymentDurationInput"
          min="1"
          :max="PAYMENT_DURATION_MAX"
        >
        <span
          v-else
          class="editable-value"
          :title="$t('subscriptions.click_to_edit')"
        >
          {{ paymentDuration }}
        </span>
        <span>{{ $t('subscriptions.unit_months') }}</span>
      </div>
      <div class="payment-amount" @click="editAmount()">
        <label for="amount">{{ $t('subscriptions.amount') }}</label>
        <input
          v-if="isAmountEditable && subscriptionPrice"
          type="number"
          id="amount"
          v-model="paymentAmountInput"
          :step="subscriptionPrice"
          min="0"
        >
        <span
          v-else
          class="editable-value"
          :title="$t('subscriptions.click_to_edit')"
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
          {{ $t('subscriptions.pay') }}
        </template>
        <template v-else>
          {{ $t('subscriptions.extend') }}
        </template>
      </button>
    </form>
    <div class="invoice" v-if="invoice">
      <template v-if="invoice.status === 'open' || invoice.status === 'underpaid'">
        <div class="payment-header">
          {{ $t('subscriptions.please_send_to_this_address', { amount: formatXmrAmount(invoice.amount), currency: 'XMR' }) }}
          <a
            class="payment-request-toggle"
            :title="$t('subscriptions.show_additional_payment_information')"
            @click="paymentRequestVisible = !paymentRequestVisible"
          >
            <icon-chevron-down></icon-chevron-down>
          </a>
        </div>
        <a
          class="payment-address"
          :href="getPaymentUri(invoice)"
        >
          {{ invoice.payment_address }}
        </a>
        <code
          v-if="paymentRequestVisible"
          class="payment-request"
        >
          {{ getPaymentRequest(invoice) }}
        </code>
        <qr-code :url="getPaymentUri(invoice)"></qr-code>
      </template>
      <div class="invoice-status">
        <template v-if="invoice.status === 'requested'">
          {{ $t('subscriptions.payment_awaiting_response') }}
        </template>
        <template v-else-if="invoice.status === 'open'">
          {{ $t('subscriptions.payment_waiting', { n: getPaymentMinutesLeft(invoice) }) }}
        </template>
        <template v-else-if="invoice.status === 'paid' || invoice.status === 'forwarded' || invoice.status === 'failed'">
          {{ $t('subscriptions.payment_processing') }}
        </template>
        <template v-else-if="invoice.status === 'timeout'">
          {{ $t('subscriptions.payment_timed_out') }}
        </template>
        <template v-else-if="invoice.status === 'cancelled'">
          {{ $t('subscriptions.payment_cancelled') }}
        </template>
        <template v-else-if="invoice.status === 'underpaid'">
          {{ $t('subscriptions.payment_amount_is_too_small') }}
        </template>
        <template v-else-if="invoice.status === 'completed'">
          {{ $t('subscriptions.payment_completed') }}
        </template>
      </div>
      <button
        v-if="invoice.status === 'open'"
        class="btn"
        @click="onCancelInvoice()"
      >
        {{ $t('subscriptions.cancel_payment') }}
      </button>
      <button
        v-else-if="invoice.status === 'completed' || invoice.status === 'timeout' || invoice.status === 'cancelled'"
        class="btn"
        @click="closeInvoice()"
      >
        {{ $t('subscriptions.ok_payment') }}
      </button>
    </div>
    <loader v-if="isLoaderVisible()"></loader>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { DateTime } from "luxon"

import { getRelationship, Relationship } from "@/api/relationships"
import { searchProfilesByAcct } from "@/api/search"
import {
  findSubscription,
  SubscriptionDetails,
  DAYS_IN_MONTH,
} from "@/api/subscriptions-common"
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
import IconArrowRight from "@/assets/feather/arrow-right.svg?component"
import IconChevronDown from "@/assets/feather/chevron-down.svg?component"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import QrCode from "@/components/QrCode.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useSubscribe } from "@/composables/subscribe"
import { useCurrentUser } from "@/composables/user"
import { formatDate, isPastDate } from "@/utils/dates"
import {
  createMoneroPaymentRequest,
  createMoneroPaymentUri,
} from "@/utils/monero"
import { isMoneroChain } from "@/utils/cryptocurrencies"

const INVOICE_ID_STORAGE_KEY = "invoice"
const PAYMENT_AMOUNT_MIN = 0.001
const PAYMENT_DURATION_MAX = 1000

const props = defineProps<{
  profile: Profile,
}>()

const route = useRoute()
const { getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken } = useCurrentUser()
const { getBlockchainInfo, getMoneroChainMetadata } = useInstanceInfo()
const { getSubscriptionOption } = useSubscribe()
const recipient = new ProfileWrapper(props.profile)
const senderAcct = ref("")
const senderError = ref<string | null>(null)
const sender = ref(new ProfileWrapper(currentUser.value || defaultProfile({ display_name: "You" })))
const subscriptionOption = ref<ProfilePaymentOption | null>(null)
const subscriptionDetails = ref<SubscriptionDetails | null>(null)
const relationship = ref<Relationship | null>(null)
const paymentDurationInput = ref<number | "">(1)
const paymentAmountInput = ref<number | "">(0)
const isAmountEditable = ref(false)
const invoice = ref<Invoice | null>(null)
const paymentRequestVisible = ref(false)

const isLoading = ref(false)

function getInvoiceIdStorageKey(): string {
  return `${INVOICE_ID_STORAGE_KEY}_${recipient.id}`
}

onMounted(async () => {
  isLoading.value = true
  const option = getSubscriptionOption(recipient)
  if (
    option !== null &&
    option.chain_id !== undefined &&
    isMoneroChain(option.chain_id)
  ) {
    subscriptionOption.value = option
    if (sender.value.id !== "") {
      await loadSubscriptionDetails()
      if (subscriptionDetails.value === null && currentUser.value !== null) {
        // Pre FEP-0837
        // Only authenticated users may view remote subscriptions
        relationship.value = await getRelationship(ensureAuthToken(), recipient.id)
      }
    }
  }
  isLoading.value = false
})

watch(paymentDurationInput, (value) => {
  if (value !== "" && value > PAYMENT_DURATION_MAX) {
    paymentDurationInput.value = PAYMENT_DURATION_MAX
  } else {
    paymentDurationInput.value = value
  }
})

function isLoaderVisible(): boolean {
  return (
    isLoading.value ||
    invoice.value?.status === "paid" ||
    invoice.value?.status === "forwarded" ||
    invoice.value?.status === "failed"
  )
}

async function loadSubscriptionDetails() {
  subscriptionDetails.value = await findSubscription(
    sender.value.id,
    recipient.id,
  )
  const invoiceId = (
    route.query.invoice_id ||
    localStorage.getItem(getInvoiceIdStorageKey())
  )
  if (invoiceId) {
    const lastInvoice = await getInvoice(invoiceId as string)
    if (
      lastInvoice.sender_id !== sender.value.id ||
      lastInvoice.recipient_id !== recipient.id
    ) {
      // Invoice created by different user
      return
    }
    invoice.value = lastInvoice
    if (
      invoice.value &&
      invoice.value.status !== "completed" &&
      invoice.value.status !== "cancelled"
    ) {
      watchInvoice()
    }
  }
}

// Human-readable subscription price
const subscriptionPrice = computed<number | null>(() => {
  if (!subscriptionOption.value?.price) {
    return null
  }
  return getPricePerMonth(subscriptionOption.value.price)
})

async function identifySender() {
  if (!senderAcct.value) {
    return
  }
  isLoading.value = true
  let profiles
  try {
    profiles = await searchProfilesByAcct(
      null,
      senderAcct.value,
      true,
    )
  } catch (error: any) {
    if (error.message === "Too Many Requests") {
      senderError.value = "Too many requests"
      isLoading.value = false
      return
    }
    throw error
  }
  if (profiles.length > 1) {
    senderError.value = "Please provide full address"
  } else {
    const profile = profiles[0]
    if (profile && profile.id !== recipient.id) {
      sender.value = new ProfileWrapper(profile)
      senderError.value = null
      await loadSubscriptionDetails()
    } else {
      senderError.value = "Profile not found"
    }
  }
  isLoading.value = false
}

function isSubscribed(): boolean {
  if (subscriptionDetails.value === null) {
    if (!recipient.isLocal()) {
      // Pre-FEP-0837 remote subscriptions are simply relationships
      if (relationship.value === null) {
        return false
      }
      return relationship.value.subscription_to
    } else {
      return false
    }
  }
  return !isPastDate(subscriptionDetails.value.expires_at)
}

function canSubscribe(): boolean {
  return (
    sender.value.id !== "" &&
    sender.value.id !== recipient.id &&
    subscriptionOption.value !== null &&
    subscriptionPrice.value !== null &&
    invoice.value === null
  )
}

function editDuration() {
  if (!isAmountEditable.value) {
    return
  }
  paymentDurationInput.value = paymentDuration.value
  isAmountEditable.value = false
}

const paymentDuration = computed<number>(() => {
  if (!subscriptionOption.value?.price) {
    return 0
  }
  if (!isAmountEditable.value) {
    if (paymentDurationInput.value === "") {
      return 0
    }
    return paymentDurationInput.value
  }
  if (paymentAmountInput.value === "") {
    return 0
  }
  return getSubscriptionDuration(
    subscriptionOption.value.price,
    parseXmrAmount(paymentAmountInput.value),
  )
})

function editAmount() {
  if (isAmountEditable.value) {
    return
  }
  paymentAmountInput.value = formatXmrAmount(paymentAmount.value)
  isAmountEditable.value = true
}

const paymentAmount = computed<number>(() => {
  if (!subscriptionOption.value?.price) {
    return 0
  }
  if (isAmountEditable.value) {
    if (paymentAmountInput.value === "") {
      return 0
    }
    return parseXmrAmount(paymentAmountInput.value)
  }
  if (paymentDurationInput.value === "") {
    return 0
  }
  return getPaymentAmount(
    subscriptionOption.value.price,
    paymentDurationInput.value,
  )
})

const paymentMessage = computed<string | null>(() => {
  if (!recipient.isLocal()) {
    return null
  }
  const blockchain = getBlockchainInfo()
  if (blockchain && blockchain.chain_id === subscriptionOption.value?.chain_id) {
    return getMoneroChainMetadata(blockchain)?.description || null
  } else {
    return null
  }
})

function canCreateInvoice(): boolean {
  return (
    paymentAmount.value !== 0 &&
    paymentAmount.value >= parseXmrAmount(PAYMENT_AMOUNT_MIN)
  )
}

async function onCreateInvoice() {
  if (paymentAmount.value === 0) {
    return
  }
  if (!subscriptionOption.value?.chain_id) {
    return
  }
  isLoading.value = true
  try {
    invoice.value = await createInvoice(
      sender.value.id,
      recipient.id,
      subscriptionOption.value.chain_id,
      paymentAmount.value,
    )
  } catch (error: any) {
    alert(error.message)
    isLoading.value = false
    return
  }
  // Add invoice ID to current URL
  window.history.pushState(
    {},
    "",
    `${window.location.pathname}?invoice_id=${invoice.value.id}`,
  )
  localStorage.setItem(getInvoiceIdStorageKey(), invoice.value.id)
  isLoading.value = false
  watchInvoice()
}

function watchInvoice() {
  const watcher = setInterval(async () => {
    if (!invoice.value) {
      // Stop watching if invoice was closed
      clearInterval(watcher)
      return
    }
    invoice.value = await getInvoice(invoice.value.id)
    if (invoice.value.status === "completed") {
      // Stop watching and refresh subscription details
      clearInterval(watcher)
      subscriptionDetails.value = await findSubscription(
        sender.value.id,
        recipient.id,
      )
    }
  }, 10000)
}

async function onCancelInvoice() {
  if (!invoice.value) {
    throw new Error("invoice doesn't exist")
  }
  await cancelInvoice(invoice.value.id)
  closeInvoice()
}

function closeInvoice() {
  invoice.value = null
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

function getPaymentRequest(invoice: Invoice): string {
  if (subscriptionPrice.value === null) {
    return ""
  }
  return createMoneroPaymentRequest(
    `Subscription to @${recipient.acct}`,
    subscriptionPrice.value,
    DAYS_IN_MONTH,
    invoice.payment_address,
    invoice.created_at,
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

  .separator svg {
    height: $icon-size;
    min-width: $icon-size;
    object-fit: contain;
    stroke: var(--text-color);
    width: $icon-size;
  }

  .avatar {
    height: $avatar-size;
    margin: 0 auto;
    width: $avatar-size;
  }

  .display-name {
    font-size: 16px;
    overflow: hidden;
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

  .payment-header {
    box-sizing: border-box;
    padding: 0 $block-inner-padding;
    position: relative;
    width: 100%;
  }

  .payment-request-toggle {
    bottom: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 1em;

    svg {
      stroke: var(--text-color);
      vertical-align: middle;
    }
  }

  .payment-address {
    font-family: monospace;
    max-width: 100%;
    word-wrap: break-word;
  }

  .payment-request {
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
