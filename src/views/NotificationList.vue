<template>
  <sidebar-layout>
    <template #content>
      <div v-if="notifications.length === 0 && !isLoading" class="content-message">
        {{ $t('notifications.you_dont_have_any_notifications') }}
      </div>
      <div
        class="notification"
        v-for="(notification, index) in notifications"
        :key="notification.id"
        :class="{ collapsed: isGrouped(index) }"
      >
        <div class="action">
          <icon-user-plus v-if="notification.type === 'follow'"></icon-user-plus>
          <icon-user-plus v-else-if="notification.type === 'follow_request'"></icon-user-plus>
          <icon-comment v-else-if="notification.type === 'mention' && notification.subtype === 'reply'"></icon-comment>
          <icon-like v-else-if="notification.type === 'favourite'"></icon-like>
          <span
            v-else-if="notification.type === 'emoji_reaction' || notification.type === 'pleroma:emoji_reaction'"
            class="emoji-reaction"
          >
            <emoji-image :emoji="getReactionEmoji(notification)"></emoji-image>
          </span>
          <icon-comment v-else-if="notification.type === 'mention'"></icon-comment>
          <icon-repost v-else-if="notification.type === 'reblog'"></icon-repost>
          <icon-payment
            v-else-if="notification.type === 'subscription' || notification.type === 'subscription_expiration' || notification.type === 'payment_anonymous'"
          ></icon-payment>
          <icon-user-minus v-else-if="notification.type === 'subscriber_leaving'"></icon-user-minus>
          <icon-truck v-else-if="notification.type === 'move'"></icon-truck>
          <icon-user-check v-else-if="notification.type === 'admin.sign_up'"></icon-user-check>
          <i18n-t :keypath="getNotificationTextKeypath(notification)" scope="global">
            <template #name>
              <router-link
                v-if="notification.type !== 'payment_anonymous'"
                :title="getActorHandle(getSender(notification))"
                :to="getActorLocation('profile', notification.account)"
                class="display-name-link"
              >
                <profile-display-name :profile="getSender(notification)">
                </profile-display-name>
              </router-link>
            </template>
          </i18n-t>
        </div>
        <post
          v-if="notification.status !== null && !isGrouped(index)"
          :post="notification.status"
          :highlighted="false"
          :in-thread="false"
          @post-deleted="onPostDeleted(index)"
        ></post>
        <div
          v-else-if="notification.type === 'payment_anonymous'"
          class="profile"
        >
          <div class="floating-avatar">
            <avatar :profile="defaultProfile()"></avatar>
          </div>
          <span class="payment-amount">
            <template v-if="notification.payment_amount">
              {{ formatXmrAmount(notification.payment_amount) }} XMR
            </template>
            <template v-else>
              Unknown amount
            </template>
          </span>
          <div class="timestamp">
            <timestamp :date="notification.created_at" :preset="shortPostTimestamp ? 'short' : 'full'"></timestamp>
          </div>
        </div>
        <router-link
          v-else-if="notification.status === null"
          class="profile"
          :title="getActorHandle(notification.account)"
          :to="getActorLocation('profile', notification.account)"
        >
          <div class="floating-avatar">
            <avatar :profile="notification.account"></avatar>
          </div>
          <span
            v-if="notification.type === 'subscription'"
            class="payment-amount"
          >
            <template v-if="notification.payment_amount">
              {{ formatXmrAmount(notification.payment_amount) }} XMR
            </template>
            <template v-else>
              Unknown amount
            </template>
          </span>
          <template v-else>
            <profile-display-name :profile="getSender(notification)">
            </profile-display-name>
            <div class="actor-address">{{ getActorHandle(notification.account) }}</div>
          </template>
          <div class="timestamp">
            <timestamp :date="notification.created_at" :preset="shortPostTimestamp ? 'short' : 'full'"></timestamp>
          </div>
        </router-link>
      </div>
      <button
        v-if="isPageFull()"
        class="btn secondary next-btn"
        :disabled="isNextPageLoading"
        @click="loadNextPage()"
      >
        {{ $t('notifications.show_more_notifications') }}
      </button>
      <loader v-if="isLoading"></loader>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"

import { PAGE_SIZE } from "@/api/common"
import { emojiFromApiEntity, Emoji } from "@/api/emojis"
import { getNotifications, Notification } from "@/api/notifications"
import { addRelationships } from "@/api/posts"
import { formatXmrAmount } from "@/api/subscriptions-monero"
import { defaultProfile, ProfileWrapper } from "@/api/users"
import IconUserCheck from "@/assets/feather/user-check.svg?component"
import IconUserMinus from "@/assets/feather/user-minus.svg?component"
import IconUserPlus from "@/assets/feather/user-plus.svg?component"
import IconRepost from "@/assets/feather/repeat.svg?component"
import IconTruck from "@/assets/feather/truck.svg?component"
import IconComment from "@/assets/forkawesome/comment-o.svg?component"
import IconPayment from "@/assets/tabler/coin.svg?component"
import Avatar from "@/components/Avatar.vue"
import EmojiImage from "@/components/EmojiImage.vue"
import IconLike from "@/components/IconLike.vue"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Timestamp from "@/components/Timestamp.vue"
import { useClientConfig } from "@/composables/client-config"
import { useActorHandle } from "@/composables/handle"
import { useNotifications } from "@/composables/notifications"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { ensureAuthToken } = useCurrentUser()
const { getActorHandle, getActorLocation } = useActorHandle()
const { shortPostTimestamp } = useClientConfig()
const {
  loadNotifications,
  notifications: backgroundNotifications,
  updateUnreadNotificationCount,
} = useNotifications()
const { setPageTitle } = useTitle()

const notifications = ref<Notification[]>([])
const isLoading = ref(false)
const isNextPageLoading = ref(false)

async function onNotificationPageLoad(page: Notification[]) {
  // Add relationships
  // NOTE: notifications from muted users are not displayed anyway
  const posts = page.flatMap((notification) => {
    return notification.status !== null ? [notification.status] : []
  })
  const authToken = ensureAuthToken()
  await addRelationships(authToken, posts)
}

function getNotificationTextKeypath(notification: Notification): string {
  if (notification.type === "follow") {
    return "notifications.user_followed_you"
  } else if (notification.type === "follow_request") {
    return "notifications.user_sent_a_follow_request"
  } else if (notification.type === "mention" && notification.subtype === "reply") {
    return "notifications.user_replied_to_your_post"
  } else if (notification.type === "favourite") {
    return "notifications.user_liked_your_post"
  } else if (notification.type === "emoji_reaction" || notification.type === "pleroma:emoji_reaction") {
    return "notifications.user_reacted_to_your_post"
  } else if (notification.type === "mention") {
    return "notifications.user_mentioned_you"
  } else if (notification.type === "reblog") {
    return "notifications.user_reposted_your_post"
  } else if (notification.type === "payment_anonymous") {
    return "notifications.you_received_an_anonymous_payment"
  } else if (notification.type === "subscription") {
    return "notifications.user_paid_for_subscription"
  } else if (notification.type === "subscription_expiration") {
    return "notifications.user_subscription_expired"
  } else if (notification.type === "subscriber_leaving") {
    return "notifications.user_is_no_longer_a_subscriber"
  } else if (notification.type === "move") {
    return "notifications.user_moved_to_a_new_instance"
  } else if (notification.type === "admin.sign_up") {
    return "notifications.user_signed_up"
  } else {
    // Unexpected notification type
    return ""
  }
}

onMounted(async () => {
  setPageTitle(t("navigation.notifications"))
  window.scrollTo({ top: 0 })
  const authToken = ensureAuthToken()
  if (backgroundNotifications.value.length === 0) {
    isLoading.value = true
    await loadNotifications(authToken)
    isLoading.value = false
  }
  // Make a copy to prevent list reloads caused by background updates
  notifications.value = [...backgroundNotifications.value]
  // Update notification timeline marker
  await updateUnreadNotificationCount(authToken)
  await onNotificationPageLoad(notifications.value)
})

function getReactionEmoji(notification: Notification): Emoji {
  if (notification.reaction === null) {
    throw Error("unexpected notification data")
  }
  if (notification.reaction.emoji !== null) {
    return emojiFromApiEntity(notification.reaction.emoji)
  } else {
    return {
      name: null,
      text: notification.reaction.content,
      url: null,
    }
  }
}

function getSender(notification: Notification): ProfileWrapper {
  return new ProfileWrapper(notification.account)
}

function isGrouped(notificationIndex: number) {
  const current = notifications.value[notificationIndex]
  if (!current || !current.status) {
    return false
  }
  if (notificationIndex % PAGE_SIZE === PAGE_SIZE - 1) {
    // Never collapse last post in a page
    return false
  }
  const next = notifications.value[notificationIndex + 1]
  return current.status.id === next?.status?.id
}

function onPostDeleted(notificationIndex: number) {
  notifications.value.splice(notificationIndex, 1)
  // Clear background notification list to trigger reload
  backgroundNotifications.value.splice(0, backgroundNotifications.value.length)
}

function isPageFull(): boolean {
  return notifications.value.length >= PAGE_SIZE
}

async function loadNextPage() {
  const maxId = notifications.value[notifications.value.length - 1].id
  isNextPageLoading.value = true
  const newItems = await getNotifications(ensureAuthToken(), maxId)
  await onNotificationPageLoad(newItems)
  notifications.value = [...notifications.value, ...newItems]
  isNextPageLoading.value = false
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.content-message {
  @include content-message;
}

.notification:not(.collapsed):not(:last-child) {
  margin-bottom: $block-outer-padding;
}

.action {
  @include post-action;

  .emoji-reaction {
    margin-right: calc($icon-size / 2);

    :deep(.emoji) {
      @include emoji-zoom;

      /* smaller than standard EmojiImage */
      font-size: calc($icon-size / $line-height);
      height: $icon-size;
      min-width: $icon-size;
      width: $icon-size;
    }
  }

  &:not(:has(.display-name-link)) {
    flex-wrap: nowrap;
  }
}

.profile {
  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  box-sizing: border-box;
  color: var(--secondary-text-color);
  display: flex;
  gap: calc($block-inner-padding / 2);
  padding: $block-inner-padding;

  .floating-avatar {
    @include floating-avatar;

    @media screen and (min-width: $screen-breakpoint-medium + 1) {
      margin-right: calc(0px - $block-inner-padding / 2);
    }
  }

  .display-name {
    color: var(--text-color);
    flex-grow: 1;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .display-name:has(+ .actor-address) {
    flex-grow: 0;
  }

  .actor-address {
    flex-basis: 25%;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .payment-amount {
    color: var(--text-color);
    flex-grow: 1;
    font-weight: bold;
  }

  .timestamp {
    text-align: right;
    white-space: nowrap;
  }
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
