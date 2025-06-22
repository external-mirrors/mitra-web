<template>
  <div class="subscription-settings">
    <div class="info" v-if="subscriptionOptionLoaded">
      <template v-if="subscriptionOption !== null">
        <span>{{ $t('subscriptions.subscriptions_are_enabled') }}</span>
        <div class="info-item">
          {{ getPricePerMonth(subscriptionOption.price as number) }} XMR {{ $t('subscriptions.price_per_month') }}
        </div>
        <div class="info-item">
          {{ $t('subscriptions.subscribers', { n: subscriberCount }) }}
        </div>
      </template>
      <template v-else>
        {{ $t('subscriptions.subscriptions_are_not_enabled') }}
      </template>
    </div>
    <div class="subscription-page" v-if="subscriptionOption !== null && !isFormVisible && !isLoading">
      <div>
        {{ $t('subscriptions.subscribers_can_pay') }}
      </div>
      <router-link :to="getSubscriptionPagePath()">
        {{ getSubscriptionPageUrl() }}
      </router-link>
    </div>
    <div class="edit-settings" v-if="!isFormVisible && !isLoading">
      <button class="btn" @click="isFormVisible = true">
        {{ $t('subscriptions.edit_settings') }}
      </button>
    </div>
    <form class="settings" v-if="isFormVisible">
      <div class="price-input-group">
        <label for="price">{{ $t('subscriptions.price') }}</label>
        <input type="number" id="price" v-model="subscriptionPrice" min="0.00" step="0.01">
        <span>XMR {{ $t('subscriptions.price_per_month') }}</span>
      </div>
      <input
        type="text"
        id="payout_address"
        v-model="subscriptionPayoutAddress"
        :placeholder="$t('subscriptions.payout_address')"
      >
      <button
        type="submit"
        class="btn"
        :disabled="!isFormValid()"
        @click.prevent="saveSubscriptionSettings()"
      >
        <template v-if="subscriptionOption">
          {{ $t('subscriptions.save_settings') }}
        </template>
        <template v-else>
          {{ $t('subscriptions.enable_subscriptions') }}
        </template>
      </button>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </form>
    <loader v-if="isLoading"></loader>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import {
  getSubscriptionOptions,
  SubscriptionOption,
} from "@/api/subscriptions-common"
import {
  registerMoneroSubscriptionOption,
  getPricePerMonth,
  getPricePerSec,
} from "@/api/subscriptions-monero"
import { getCurrentUser } from "@/api/users"
import Loader from "@/components/Loader.vue"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"

const router = useRouter()
const { getActorLocation } = useActorHandle()
const {
  ensureAuthToken,
  ensureCurrentUser,
  setCurrentUser,
} = useCurrentUser()
const { getBlockchainInfo } = useInstanceInfo()

const isLoading = ref(false)
const subscriptionOption = ref<SubscriptionOption | null>(null)
const subscriptionOptionLoaded = ref(false)

const subscriptionPrice = ref(0.01)
const subscriptionPayoutAddress = ref("")
const isFormVisible = ref(false)
const errorMessage = ref<string | null>(null)

const subscriberCount = computed(() => {
  return ensureCurrentUser().subscribers_count
})

onMounted(async () => {
  isLoading.value = true
  await loadSubscriptionSettings()
  // Refresh subscriberCount
  const user = await getCurrentUser(ensureAuthToken())
  setCurrentUser(user)
  isLoading.value = false
})

async function loadSubscriptionSettings() {
  const subscriptionOptions = await getSubscriptionOptions(ensureAuthToken())
  subscriptionOption.value = subscriptionOptions.find((item) => {
    return item.type === "monero"
  }) || null
  subscriptionOptionLoaded.value = true
  if (
    subscriptionOption.value?.price &&
    subscriptionOption.value?.payout_address
  ) {
    subscriptionPrice.value = getPricePerMonth(subscriptionOption.value.price)
    subscriptionPayoutAddress.value = subscriptionOption.value.payout_address
  }
  if (subscriptionOption.value === null) {
    isFormVisible.value = true
  }
}

function getSubscriptionPagePath(): string {
  const route = router.resolve(
    getActorLocation("profile-subscription", ensureCurrentUser()))
  return route.fullPath
}

function getSubscriptionPageUrl(): string {
  return window.location.origin + getSubscriptionPagePath()
}

function isFormValid(): boolean {
  return (
    // Price must be greater than 0 when expressed in piconeros
    getPricePerSec(subscriptionPrice.value) > 0 &&
    subscriptionPayoutAddress.value.length > 0
  )
}

async function saveSubscriptionSettings() {
  const blockchain = getBlockchainInfo()
  if (blockchain === null) {
    return
  }
  isLoading.value = true
  let user
  try {
    user = await registerMoneroSubscriptionOption(
      ensureAuthToken(),
      blockchain.chain_id,
      getPricePerSec(subscriptionPrice.value),
      subscriptionPayoutAddress.value,
    )
  } catch (error: any) {
    isLoading.value = false
    errorMessage.value = error.message
    return
  }
  setCurrentUser(user)
  await loadSubscriptionSettings()
  isFormVisible.value = false
  isLoading.value = false
  errorMessage.value = null
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.info {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding;

  .info-item {
    font-size: 16px;
    font-weight: bold;
  }
}

.subscription-page {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);

  div {
    margin: 0 auto;
    max-width: 350px;
  }

  a {
    font-size: 16px;
    text-decoration: underline;
  }
}

form {
  @include content-form;

  align-items: center;
}

.price-input-group {
  align-items: center;
  display: flex;
  font-size: 16px;
  gap: $input-padding;
  justify-content: center;

  label {
    font-weight: bold;
  }

  input[type="number"] {
    width: 100px;
  }
}

.loader {
  margin: 0 auto;
}
</style>
