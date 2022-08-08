<template>
  <div class="profile">
    <avatar :profile="profile"></avatar>
    <div class="name">
      <div class="display-name">{{ profile.display_name || profile.username }}</div>
      <div class="actor-address">@{{ getActorAddress(profile) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Profile } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"

const { getActorAddress } = useInstanceInfo()

/* eslint-disable-next-line no-undef */
defineProps<{
  profile: Profile,
}>()
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";

.profile {
  align-items: center;
  background-color: $block-background-color;
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
    color: $text-color;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .actor-address {
    color: $secondary-text-color;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
