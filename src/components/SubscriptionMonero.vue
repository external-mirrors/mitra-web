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
        <div>{{ getPaymentAmount() }} XMR</div>
      </div>
      <button
        type="submit"
        class="btn primary"
        :disabled="!canPay()"
        @click.prevent="onCreateInvoice()"
      >
        <template v-if="!isSubscribed()">
          Pay
        </template>
        <template v-else>Extend</template>
      </button>
    </form>
    <div class="invoice" v-if="invoice">
      <div>Please send {{ getPaymentAmount() }} XMR to this address:</div>
      <div class="payment-address">{{ invoice.payment_address }}</div>
      <div class="invoice-status">
        <template v-if="invoice.status === 'open'">Waiting for payment</template>
        <template v-else-if="invoice.status === 'paid'">Waiting for confirmation</template>
      </div>
      <button class="btn" @click.prevent="checkInvoice()">Check payment</button>
    </div>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { DateTime } from "luxon"

import { searchProfilesByAcct } from "@/api/search"
import { findSubscription, SubscriptionDetails } from "@/api/subscriptions-common"
import {
  createInvoice,
  getInvoice,
  getPricePerMonth,
  Invoice,
} from "@/api/subscriptions-monero"
import { guest, Profile, ProfilePaymentOption, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import { useCurrentUser } from "@/store/user"
import { formatDate } from "@/utils/dates"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const { currentUser } = $(useCurrentUser())
const recipient = new ProfileWrapper(props.profile)
const senderAcct = $ref("")
let senderError = $ref<string | null>(null)
let sender = $ref<ProfileWrapper>(new ProfileWrapper(currentUser || guest()))
let subscriptionOption = $ref<ProfilePaymentOption | null>(null)
let subscriptionPrice = $ref<number | null>(null)
let subscriptionDetails = $ref<SubscriptionDetails | null>(null)
const paymentDuration = $ref<number>(1)
let invoice = $ref<Invoice | null>(null)

let isLoading = $ref(false)

onMounted(async () => {
  subscriptionOption = recipient.payment_options.find((option) => {
    return option.type === "monero-subscription" && option.price !== undefined
  }) || null
  if (subscriptionOption?.price) {
    subscriptionPrice = getPricePerMonth(subscriptionOption.price)
    if (sender.id !== "") {
      subscriptionDetails = await findSubscription(sender.id, recipient.id)
    }
  }
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

function getPaymentAmount(): number {
  if (!subscriptionPrice) {
    return 0
  }
  const amount = subscriptionPrice * paymentDuration
  return amount
}

function canPay(): boolean {
  return getPaymentAmount() > 0
}

async function onCreateInvoice() {
  isLoading = true
  invoice = await createInvoice(
    sender.id,
    recipient.id,
  )
  isLoading = false
}

async function checkInvoice() {
  if (!invoice) {
    return
  }
  isLoading = true
  invoice = await getInvoice(invoice.id)
  if (invoice.status === "forwarded") {
    subscriptionDetails = await findSubscription(sender.id, recipient.id)
    invoice = null
  }
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

  .payment-address {
    font-family: monospace;
    max-width: 100%;
    user-select: all;
    word-wrap: break-word;
  }
}

.loader {
  margin: 0 auto;
}
</style>
