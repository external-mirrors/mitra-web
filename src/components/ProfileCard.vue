<template>
  <div class="profile">
    <div class="profile-header">
      <img v-if="profile.header" :src="profile.header">
    </div>
    <div class="profile-info">
      <div class="avatar-row">
        <avatar :profile="profile"></avatar>
        <div class="name-group">
          <div class="display-name">{{ profile.getDisplayName() }}</div>
          <div class="actor-address">@{{ getActorAddress(profile) }}</div>
        </div>
      </div>
      <div v-if="!compact" class="bio" v-html="profile.note"></div>
      <div v-if="!compact" class="bottom-row">
        <div class="post-count">
          <div class="value">{{ profile.statuses_count }}</div>
          <div class="name">posts</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $computed } from "vue/macros"

import { Profile, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
  compact: boolean,
}>()

const { getActorAddress } = useInstanceInfo()

const profile = $computed(() => new ProfileWrapper(props.profile))
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

$avatar-size: 90px;
$profile-padding: calc($block-inner-padding / 2);

.profile {
  background-color: $block-background-color;
  border-radius: $block-border-radius;

  .profile-header {
    background-color: $text-color;
    border-radius: $block-border-radius $block-border-radius 0 0;
    height: 100px;

    img {
      border-radius: inherit;
      height: 100%;
      object-fit: cover;
      width: 100%;
    }
  }
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: $profile-padding;
  padding: $profile-padding;
}

.avatar-row {
  display: flex;
  flex-direction: row;

  .avatar {
    height: $avatar-size;
    margin-right: $profile-padding;
    margin-top: calc(-1 * ($profile-padding + $avatar-size / 3));
    min-width: $avatar-size;
    padding: 4px;
    width: $avatar-size;
  }

  .name-group {
    overflow-x: hidden;

    .display-name {
      font-weight: bold;
    }

    .actor-address {
      color: $secondary-text-color;
      overflow-x: hidden;
      text-overflow: ellipsis;
    }
  }
}

.bio {
  height: 1.2em;
  overflow: hidden;
  white-space: nowrap;

  :deep(p) {
    margin: 0;
    overflow-x: hidden;
    text-overflow: ellipsis;
  }
}

.bottom-row {
  display: flex;
  flex-direction: row;

  .post-count {
    display: flex;
    flex-direction: row;
    font-weight: bold;

    .value {
      font-weight: bold;
    }

    .name {
      color: $secondary-text-color;
      margin-left: 0.3em;
    }
  }
}
</style>
