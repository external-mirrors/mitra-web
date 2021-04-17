<template>
  <div id="main">
    <div class="content">
      <div class="notification" v-for="notification in notifications" :key="notification.id">
        <div class="action">
          <template v-if="notification.type === 'follow'">
            <img :src="require('@/assets/feather/user-plus.svg')">
            <span>{{ getSenderName(notification) }} followed you</span>
          </template>
          <template v-else-if="notification.type === 'reply'">
            <img :src="require('@/assets/forkawesome/comment-o.svg')">
            <span>{{ getSenderName(notification) }} replied to your post</span>
          </template>
          <template v-else-if="notification.type === 'favourite'">
            <img :src="require('@/assets/forkawesome/thumbs-o-up.svg')">
            <span>{{ getSenderName(notification) }} liked your post</span>
          </template>
        </div>
        <post v-if="notification.status" :post="notification.status"></post>
        <router-link
          v-else
          class="profile"
          :to="{ name: 'profile', params: { profileId: notification.account.id }}"
        >
          <div class="floating-avatar">
            <avatar :profile="notification.account"></avatar>
          </div>
          <div class="display-name">{{ getSenderName(notification) }}</div>
          <div class="username">@{{ notification.account.acct }}</div>
          <div class="timestamp">{{ formatDate(notification.created_at) }}</div>
        </router-link>
      </div>
    </div>
    <sidebar></sidebar>
  </div>
</template>

<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ref, onMounted } from "vue"
import { updateNotificationMarker } from "@/api/markers"
import { getNotifications } from "@/api/notifications"
import Avatar from "@/components/Avatar.vue"
import Post from "@/components/Post.vue"
import Sidebar from "@/components/Sidebar.vue"
import { useNotifications } from "@/store/notifications"
import { useCurrentUser } from "@/store/user"
import { formatDate } from "@/utils/format"

const { notifications } = useNotifications()

onMounted(async () => {
  const { ensureAuthToken } = useCurrentUser()
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
  display: flex;
  padding: $block-inner-padding;

  .floating-avatar {
    @include floating-avatar;
  }

  .display-name {
    color: $text-color;
    font-weight: bold;
    margin-right: $block-inner-padding / 2;
  }

  .username {
    color: $secondary-text-color;
    flex-grow: 1;
  }

  .timestamp {
    color: $secondary-text-color;
    text-align: right;

    &:hover {
      color: $secondary-text-hover-color;
    }
  }
}
</style>
