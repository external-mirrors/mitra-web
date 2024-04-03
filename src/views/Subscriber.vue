<template>
  <sidebar-layout>
    <template #content>
      <h1>Subscriber details</h1>
      <router-link
        v-if="subscriber && !isLoading"
        :to="getActorLocation('profile', subscriber)"
      >
        <profile-list-item :profile="subscriber">
          <template #profile-footer>
            <div class="subscription-info">
              <template v-if="subscription">
                <template v-if="isPastDate(subscription.expires_at)">Subscription expired</template>
                <template v-else>Subscription expires</template>
                {{ formatDate(subscription.expires_at) }}
              </template>
              <template v-else>
                Not subscribed yet
              </template>
            </div>
          </template>
        </profile-list-item>
      </router-link>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRoute } from "vue-router"

import {
  findSubscription,
  SubscriptionDetails,
} from "@/api/subscriptions-common"
import { getProfile, Profile } from "@/api/users"
import Loader from "@/components/Loader.vue"
import ProfileListItem from "@/components/ProfileListItem.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"
import { formatDate, isPastDate } from "@/utils/dates"

const route = useRoute()
const { getActorLocation } = useActorHandle()
const { ensureAuthToken, ensureCurrentUser } = useCurrentUser()

const subscriber = ref<Profile | null>(null)
const subscription = ref<SubscriptionDetails | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  subscriber.value = await getProfile(
    ensureAuthToken(),
    route.params.profileId as string,
  )
  try {
    subscription.value = await findSubscription(
      subscriber.value.id,
      ensureCurrentUser().id,
    )
  } catch (error: any) {
    if (error.message !== "subscription not found") {
      isLoading.value = false
      throw error
    }
  }
  isLoading.value = false
})
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.subscription-info {
  margin-top: $block-inner-padding;
}

.loader {
  margin: 0 auto;
}
</style>
