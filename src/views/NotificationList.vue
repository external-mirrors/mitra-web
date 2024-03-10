<template>
  <sidebar-layout>
    <template #content>
      <div
        class="notification"
        v-for="(notification, index) in notifications"
        :key="notification.id"
      >
        <div class="action">
          <img v-if="notification.type === 'follow'" src="@/assets/feather/user-plus.svg">
          <img v-else-if="notification.type === 'follow_request'" src="@/assets/feather/user-plus.svg">
          <img v-else-if="notification.type === 'reply'" src="@/assets/forkawesome/comment-o.svg">
          <img v-else-if="notification.type === 'favourite'" src="@/assets/forkawesome/thumbs-o-up.svg">
          <span
            v-else-if="notification.type === 'emoji_reaction'"
            class="emoji-reaction"
            v-html="getReactionHtml(notification)"
          >
          </span>
          <img v-else-if="notification.type === 'mention'" src="@/assets/forkawesome/comment-o.svg">
          <img v-else-if="notification.type === 'reblog'" src="@/assets/feather/repeat.svg">
          <img
            v-else-if="notification.type === 'subscription' || notification.type === 'subscription_expiration'"
            src="@/assets/tabler/coin.svg"
          >
          <img v-else-if="notification.type === 'move'" src="@/assets/feather/truck.svg">
          <img v-else-if="notification.type === 'admin.sign_up'" src="@/assets/feather/user-check.svg">
          <router-link
            :title="getSenderInfo(notification)"
            :to="{ name: 'profile-by-acct', params: { acct: notification.account.acct } }"
            class="display-name-link"
          >
            <profile-display-name :profile="getSender(notification)">
            </profile-display-name>
          </router-link>
          <span v-if="notification.type === 'follow'">followed you</span>
          <span v-else-if="notification.type === 'follow_request'">sent a follow request</span>
          <span v-else-if="notification.type === 'reply'">replied to your post</span>
          <span v-else-if="notification.type === 'favourite'">liked your post</span>
          <span v-else-if="notification.type === 'emoji_reaction'">reacted to your post</span>
          <span v-else-if="notification.type === 'mention'">mentioned you</span>
          <span v-else-if="notification.type === 'reblog'">reposted your post</span>
          <span v-else-if="notification.type === 'subscription'">paid for subscription</span>
          <span v-else-if="notification.type === 'subscription_expiration'">subscription expired</span>
          <span v-else-if="notification.type === 'move'">moved to a new instance</span>
          <span v-else-if="notification.type === 'admin.sign_up'">signed up</span>
        </div>
        <post
          v-if="notification.status"
          :post="notification.status"
          :highlighted="false"
          :in-thread="false"
          @post-deleted="onPostDeleted(index)"
        ></post>
        <router-link
          v-else
          class="profile"
          :to="{ name: 'profile-by-acct', params: { acct: notification.account.acct } }"
        >
          <div class="floating-avatar">
            <avatar :profile="notification.account"></avatar>
          </div>
          <profile-display-name :profile="getSender(notification)">
          </profile-display-name>
          <div class="actor-address">@{{ getActorAddress(notification.account) }}</div>
          <div class="timestamp">{{ humanizeDate(notification.created_at) }}</div>
        </router-link>
      </div>
      <button
        v-if="isPageFull()"
        class="btn secondary next-btn"
        @click="loadNextPage()"
      >
        Show more notifications
      </button>
    </template>
  </sidebar-layout>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

import { PAGE_SIZE } from "@/api/common"
import { replaceShortcodes } from "@/api/emojis"
import { getNotifications, Notification } from "@/api/notifications"
import { addRelationships } from "@/api/posts"
import { ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import Post from "@/components/Post.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import SidebarLayout from "@/components/SidebarLayout.vue"
import { useInstanceInfo } from "@/composables/instance"
import { useNotifications } from "@/composables/notifications"
import { useCurrentUser } from "@/composables/user"
import { humanizeDate } from "@/utils/dates"

const { ensureAuthToken } = useCurrentUser()
const { getActorAddress } = useInstanceInfo()
const {
  loadNotifications,
  notifications,
  updateUnreadNotificationCount,
} = useNotifications()

onMounted(async () => {
  const authToken = ensureAuthToken()
  if (notifications.value.length === 0) {
    await loadNotifications(authToken)
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

function getSenderInfo(notification: Notification): string {
  const senderName = getSender(notification).getDisplayName()
  return `${senderName} (${getActorAddress(notification.account)})`
}

function onPostDeleted(notificationIndex: number) {
  notifications.value.splice(notificationIndex, 1)
}

function isPageFull(): boolean {
  return notifications.value.length >= PAGE_SIZE
}

async function loadNextPage() {
  const maxId = notifications.value[notifications.value.length - 1].id
  const newItems = await getNotifications(ensureAuthToken(), maxId)
  notifications.value = [...notifications.value, ...newItems]
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.notification {
  margin-bottom: $block-outer-padding;
}

.action {
  @include post-action;

  .emoji-reaction {
    @include emoji-inline;

    margin-right: calc($icon-size / 2);
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
</style>
