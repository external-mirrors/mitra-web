<template>
  <div class="subscription">
    <div class="participants">
      <component
        class="profile-card"
        :is="sender.id ? 'router-link' : 'div'"
        :to="{ name: 'profile', params: { profileId: sender.id } }"
      >
        <avatar :profile="sender"></avatar>
        <div class="display-name">{{ sender.getDisplayName() }}</div>
      </component>
      <div class="separator">
        <img :src="require('@/assets/feather/arrow-right.svg')">
      </div>
      <router-link class="profile-card" :to="{ name: 'profile', params: { profileId: recipient.id }}">
        <avatar :profile="recipient"></avatar>
        <div class="display-name">{{ recipient.getDisplayName() }}</div>
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
          <template v-else>
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
    <form class="payment" v-if="canSubscribe()">
      <div class="duration">
        <label for="duration">Duration</label>
        <input type="number" id="duration" v-model="paymentDuration" min="1">
        <span>months</span>
      </div>
      <div class="payment-amount">
        <label>Amount</label>
        <div>{{ formatXmrAmount(paymentAmount) }} XMR</div>
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
      <template v-if="invoice.status === 'open'">
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
        <template v-else-if="invoice.status === 'paid'">Processing payment</template>
        <template v-else-if="invoice.status === 'timeout'">Payment timed out</template>
        <template v-else-if="invoice.status === 'forwarded'">Payment completed</template>
      </div>
      <button
        v-if="invoice.status === 'forwarded' || invoice.status === 'timeout'"
        class="btn"
        @click="closeInvoice()"
      >
        OK
      </button>
    </div>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $computed, $ref } from "vue/macros"
import { useRoute } from "vue-router"
import { DateTime } from "luxon"

import { searchProfilesByAcct } from "@/api/search"
import { findSubscription, SubscriptionDetails } from "@/api/subscriptions-common"
import {
  createInvoice,
  formatXmrAmount,
  getInvoice,
  getPaymentAmount,
  getPricePerMonth,
  Invoice,
} from "@/api/subscriptions-monero"
import { defaultProfile, Profile, ProfilePaymentOption, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import QrCode from "@/components/QrCode.vue"
import { useCurrentUser } from "@/store/user"
import { formatDate } from "@/utils/dates"
import { createMoneroPaymentUri } from "@/utils/monero"

const INVOICE_ID_STORAGE_KEY = "invoice"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const route = useRoute()
const { currentUser } = $(useCurrentUser())
const recipient = new ProfileWrapper(props.profile)
const senderAcct = $ref("")
let senderError = $ref<string | null>(null)
let sender = $ref(new ProfileWrapper(currentUser || defaultProfile()))
let subscriptionOption = $ref<ProfilePaymentOption | null>(null)
let subscriptionDetails = $ref<SubscriptionDetails | null>(null)
const paymentDuration = $ref<number>(1)
let invoice = $ref<Invoice | null>(null)

let isLoading = $ref(false)

function getInvoiceIdStorageKey(): string {
  return `${INVOICE_ID_STORAGE_KEY}_${recipient.id}`
}

onMounted(async () => {
  isLoading = true
  subscriptionOption = recipient.payment_options.find((option) => {
    return option.type === "monero-subscription" && option.price !== undefined
  }) || null
  if (subscriptionOption && sender.id !== "") {
    subscriptionDetails = await findSubscription(sender.id, recipient.id)
  }
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
  isLoading = false
})

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
  const profiles = await searchProfilesByAcct(senderAcct)
  if (profiles.length > 1) {
    senderError = "Please provide full address"
  } else {
    const profile = profiles[0]
    if (profile && profile.id !== recipient.id) {
      sender = new ProfileWrapper(profile)
      senderError = null
    } else {
      senderError = "Profile not found"
    }
  }
  isLoading = false
}

function isSubscribed(): boolean {
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
    subscriptionPrice !== null &&
    invoice === null
  )
}

const paymentAmount = $computed<number | null>(() => {
  if (!subscriptionOption?.price) {
    return null
  }
  return getPaymentAmount(subscriptionOption.price, paymentDuration)
})

function canCreateInvoice(): boolean {
  return paymentAmount !== null
}

async function onCreateInvoice() {
  if (paymentAmount === null) {
    return
  }
  isLoading = true
  invoice = await createInvoice(
    sender.id,
    recipient.id,
    paymentAmount,
  )
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
    if (invoice.status === "forwarded") {
      // Stop watching and refresh subscription details
      clearInterval(watcher)
      subscriptionDetails = await findSubscription(sender.id, recipient.id)
    }
  }, 10000)
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
    background-color: $block-background-color;
    border-radius: $block-border-radius;
    display: flex;
    flex-basis: 50%;
    flex-direction: column;
    gap: calc($block-inner-padding / 2);
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

.sender {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: $block-inner-padding;
}

.info {
  background-color: $block-background-color;
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
    color: $secondary-text-color;
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
