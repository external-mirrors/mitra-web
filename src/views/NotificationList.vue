<template>
  <div id="main">
    <div class="content">
      <div
        class="notification"
        v-for="(notification, index) in notifications"
        :key="notification.id"
      >
        <div class="action">
          <template v-if="notification.type === 'follow'">
            <img :src="require('@/assets/feather/user-plus.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>followed you</span>
          </template>
          <template v-else-if="notification.type === 'reply'">
            <img :src="require('@/assets/forkawesome/comment-o.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>replied to your post</span>
          </template>
          <template v-else-if="notification.type === 'favourite'">
            <img :src="require('@/assets/forkawesome/thumbs-o-up.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>liked your post</span>
          </template>
          <template v-else-if="notification.type === 'mention'">
            <img :src="require('@/assets/forkawesome/comment-o.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>mentioned you</span>
          </template>
          <template v-else-if="notification.type === 'reblog'">
            <img :src="require('@/assets/feather/repeat.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>reposted your post</span>
          </template>
          <template v-else-if="notification.type === 'subscription'">
            <img :src="require('@/assets/tabler/coin.svg')">
            <router-link :to="{ name: 'profile', params: { profileId: notification.account.id }}">
              {{ getSenderName(notification) }}
            </router-link>
            <span>paid for subscription</span>
          </template>
        </div>
        <post
          v-if="notification.status"
          :post="notification.status"
          @post-deleted="onPostDeleted(index)"
        ></post>
        <router-link
          v-else
          class="profile"
          :to="{ name: 'profile', params: { profileId: notification.account.id }}"
        >
          <div class="floating-avatar">
            <avatar :profile="notification.account"></avatar>
          </div>
          <div class="display-name">{{ getSenderName(notification) }}</div>
          <div class="actor-address">@{{ getActorAddress(notification.account) }}</div>
          <div class="timestamp">{{ formatDate(notification.created_at) }}</div>
        </router-link>
      </div>
      <button
        v-if="isPageFull()"
        class="btn secondary next-btn"
        @click="loadNextPage()"
      >
        Show more notifications
      </button>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"

import { PAGE_SIZE } from "@/api/common"
import { updateNotificationMarker } from "@/api/markers"
import { getNotifications, Notification } from "@/api/notifications"
import Avatar from "@/components/Avatar.vue"
import Post from "@/components/Post.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useInstanceInfo } from "@/store/instance"
import { useNotifications } from "@/store/notifications"
import { useCurrentUser } from "@/store/user"
import { formatDate } from "@/utils/format"

const { ensureAuthToken } = useCurrentUser()
const { getActorAddress } = useInstanceInfo()
const { notifications } = useNotifications()

onMounted(async () => {
  // Update notification timeline marker
  const firstNotification = notifications.value[0]
  if (firstNotification) {
    await updateNotificationMarker(
      ensureAuthToken(),
      firstNotification.id,
    )
  }
})

function getSenderName(notification: Notification): string {
  const sender = notification.account
  return sender.display_name || sender.username
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
  notifications.value.push(...newItems)
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
}

.profile {
  align-items: center;
  background-color: $block-background-color;
  border-radius: $block-border-radius;
  box-sizing: border-box;
  color: $secondary-text-color;
  display: flex;
  gap: $block-inner-padding / 2;
  padding: $block-inner-padding;

  .floating-avatar {
    @include floating-avatar;
  }

  .display-name {
    color: $text-color;
    font-weight: bold;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actor-address {
    flex-grow: 1;
    min-width: 15%;
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
