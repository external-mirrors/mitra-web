<template>
  <div class="profile">
    <avatar :profile="profile"></avatar>
    <div class="name">
      <profile-display-name :profile="profile"></profile-display-name>
      <div v-if="profile.id" class="actor-address">@{{ getActorAddress(profile) }}</div>
      <!-- Fallback for dummy profiles -->
      <div v-else class="actor-address">{{ profile.url }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { Profile, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useInstanceInfo } from "@/composables/instance"

const { getActorAddress } = useInstanceInfo()

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const profile = computed(() => new ProfileWrapper(props.profile))
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile {
  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  flex-direction: row;
  padding: $block-inner-padding;
  text-align: left;

  .avatar {
    height: $avatar-size;
    margin-right: $block-inner-padding;
    min-width: $avatar-size;
    width: $avatar-size;
  }

  .name {
    min-width: 0;
  }

  .display-name {
    color: var(--text-color);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actor-address {
    color: var(--secondary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
