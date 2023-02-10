<template>
  <div class="profile">
    <avatar :profile="profile"></avatar>
    <div class="name">
      <div class="display-name">{{ profile.getDisplayName() }}</div>
      <div class="actor-address">@{{ getActorAddress(profile) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $computed } from "vue/macros"

import { Profile, ProfileWrapper } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"

const { getActorAddress } = useInstanceInfo()

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: Profile,
}>()

const profile = $computed(() => new ProfileWrapper(props.profile))
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
