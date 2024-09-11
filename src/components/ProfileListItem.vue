<template>
  <div class="profile">
    <div class="profile-info-group">
      <avatar :profile="profile"></avatar>
      <div class="name">
        <profile-display-name :profile="profile"></profile-display-name>
        <div
          v-if="profile.id"
          class="actor-address"
          :title="getActorHandle(profile)"
        >
          {{ getActorHandle(profile) }}
        </div>
        <!-- Fallback for dummy profiles -->
        <div v-else class="actor-address">{{ profile.url }}</div>
      </div>
      <slot name="profile-actions"></slot>
    </div>
    <slot name="profile-footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { Profile, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import ProfileDisplayName from "@/components/ProfileDisplayName.vue"
import { useActorHandle } from "@/composables/handle"

const { getActorHandle } = useActorHandle()

const props = defineProps<{
  profile: Profile,
}>()

const profile = computed(() => new ProfileWrapper(props.profile))
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile {
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  color: var(--text-color);
  padding: $block-inner-padding;
  text-align: left;
}

.profile-info-group {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $block-inner-padding;

  .avatar {
    flex-shrink: 0;
    height: $avatar-size;
    width: $avatar-size;
  }

  .name {
    flex-grow: 1;
    min-width: 0;
  }

  .display-name {
    color: var(--text-color);
    display: block;
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
