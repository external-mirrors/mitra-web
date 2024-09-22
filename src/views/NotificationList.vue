<template>
  <sidebar-layout>
    <template #content>
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
            v-html="getReactionHtml(notification)"
          >
          </span>
          <icon-comment v-else-if="notification.type === 'mention'"></icon-comment>
          <icon-repost v-else-if="notification.type === 'reblog'"></icon-repost>
          <icon-payment
            v-else-if="notification.type === 'subscription' || notification.type === 'subscription_expiration'"
          ></icon-payment>
          <icon-user-minus v-else-if="notification.type === 'subscriber_leaving'"></icon-user-minus>
          <icon-truck v-else-if="notification.type === 'move'"></icon-truck>
          <icon-user-check v-else-if="notification.type === 'admin.sign_up'"></icon-user-check>
          <router-link
            :title="getActorHandle(getSender(notification))"
            :to="getActorLocation('profile', notification.account)"
            class="display-name-link"
          >
            <profile-display-name :profile="getSender(notification)">
            </profile-display-name>
          </router-link>
          <span v-if="notification.type === 'follow'">
            {{ $t('notifications.followed_you') }}
          </span>
          <span v-else-if="notification.type === 'follow_request'">
            {{ $t('notifications.sent_a_follow_request') }}
          </span>
          <span v-else-if="notification.type === 'mention' && notification.subtype === 'reply'">
            {{ $t('notifications.replied_to_your_post') }}
          </span>
          <span v-else-if="notification.type === 'favourite'">
            {{ $t('notifications.liked_your_post') }}
          </span>
          <span v-else-if="notification.type === 'emoji_reaction' || notification.type === 'pleroma:emoji_reaction'">
            {{ $t('notifications.reacted_to_your_post') }}
          </span>
          <span v-else-if="notification.type === 'mention'">
            {{ $t('notifications.mentioned_you') }}
          </span>
          <span v-else-if="notification.type === 'reblog'">
            {{ $t('notifications.reposted_your_post') }}
          </span>
          <span v-else-if="notification.type === 'subscription'">
            {{ $t('notifications.paid_for_subscription') }}
          </span>
          <span v-else-if="notification.type === 'subscription_expiration'">
            {{ $t('notifications.subscription_expired') }}
          </span>
          <span v-else-if="notification.type === 'subscriber_leaving'">
            {{ $t('notifications.is_no_longer_a_subscriber') }}
          </span>
          <span v-else-if="notification.type === 'move'">
            {{ $t('notifications.moved_to_a_new_instance') }}
          </span>
          <span v-else-if="notification.type === 'admin.sign_up'">
            {{ $t('notifications.signed_up') }}
          </span>
        </div>
        <post
          v-if="notification.status !== null && !isGrouped(index)"
          :post="notification.status"
          :highlighted="false"
          :in-thread="false"
          @post-deleted="onPostDeleted(index)"
        ></post>
        <router-link
          v-else-if="notification.status === null"
          class="profile"
          :title="getActorHandle(notification.account)"
          :to="getActorLocation('profile', notification.account)"
        >
          <div class="floating-avatar">
            <avatar :profile="notification.account"></avatar>
          </div>
          <profile-display-name :profile="getSender(notification)">
          </profile-display-name>
          <div class="actor-address">{{ getActorHandle(notification.account) }}</div>
          <div class="timestamp">
            <timestamp :date="notification.created_at"></timestamp>
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
import { replaceShortcodes } from "@/api/emojis"
import { getNotifications, Notification } from "@/api/notifications"
import { addRelationships } from "@/api/posts"
import { ProfileWrapper } from "@/api/users"
import IconUserCheck from "@/assets/feather/user-check.svg?component"
import IconUserMinus from "@/assets/feather/user-minus.svg?component"
import IconUserPlus from "@/assets/feather/user-plus.svg?component"
import IconRepost from "@/assets/feather/repeat.svg?component"
import IconTruck from "@/assets/feather/truck.svg?component"
import IconComment from "@/assets/forkawesome/comment-o.svg?component"
import IconLike from "@/assets/forkawesome/thumbs-o-up.svg?component"
import IconPayment from "@/assets/tabler/coin.svg?component"
import Avatar from "@/components/Avatar.vue"
import Loader from "@/components/Loader.vue"
import Post from "@/components/Post.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import Timestamp from "@/components/Timestamp.vue"
import { useActorHandle } from "@/composables/handle"
import { useNotifications } from "@/composables/notifications"
import { useTitle } from "@/composables/title"
import { useCurrentUser } from "@/composables/user"

const { t } = useI18n({ useScope: "global" })
const { ensureAuthToken } = useCurrentUser()
const { getActorHandle, getActorLocation } = useActorHandle()
const {
  loadNotifications,
  notifications,
  updateUnreadNotificationCount,
} = useNotifications()
const { setPageTitle } = useTitle()

const isLoading = ref(false)
const isNextPageLoading = ref(false)

onMounted(async () => {
  setPageTitle(t("navigation.notifications"))
  window.scrollTo({ top: 0 })
  const authToken = ensureAuthToken()
  if (notifications.value.length === 0) {
    isLoading.value = true
    await loadNotifications(authToken)
    isLoading.value = false
  }
  // Update notification timeline marker
  await updateUnreadNotificationCount(authToken)
  // Add relationships
  const posts = notifications.value.flatMap((notification) => {
    return notification.status !== null ? [notification.status] : []
  })
  await addRelationships(authToken, posts)
})

function getReactionHtml(notification: Notification): string {
  if (notification.reaction === null) {
    return ""
  }
  let content = notification.reaction.content
  if (notification.reaction.emoji !== null) {
    content = replaceShortcodes(content, [notification.reaction.emoji])
  }
  return content
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
}

function isPageFull(): boolean {
  return notifications.value.length >= PAGE_SIZE
}

async function loadNextPage() {
  const maxId = notifications.value[notifications.value.length - 1].id
  isNextPageLoading.value = true
  const newItems = await getNotifications(ensureAuthToken(), maxId)
  notifications.value = [...notifications.value, ...newItems]
  isNextPageLoading.value = false
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.notification:not(.collapsed) {
  margin-bottom: $block-outer-padding;
}

.action {
  @include post-action;

  .emoji-reaction {
    @include emoji-inline;

    margin-right: calc($icon-size / 2);
    text-align: center;
    width: $icon-size;

    :deep(.emoji) {
      @include emoji-zoom;
    }
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
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-address {
    flex-basis: 25%;
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .timestamp {
    text-align: right;
    white-space: nowrap;
  }
}

.next-btn {
  margin-bottom: $block-outer-padding;
}

.loader {
  margin: $block-outer-padding auto;
}
</style>
