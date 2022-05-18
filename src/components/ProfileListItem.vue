<template>
  <router-link class="profile" :to="{ name: 'profile', params: { profileId: profile.id }}">
    <avatar :profile="profile"></avatar>
    <div class="name">
      <div class="display-name">{{ profile.display_name || profile.username }}</div>
      <div class="actor-address">@{{ getActorAddress(profile) }}</div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { Profile } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import { useInstanceInfo } from "@/store/instance"

const { getActorAddress } = useInstanceInfo()

const props = defineProps<{
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

  .avatar {
    height: $avatar-size;
    margin-right: $block-inner-padding;
    width: $avatar-size;
  }

  .display-name {
    color: $text-color;
  }

  .actor-address {
    color: $secondary-text-color;
  }
}
</style>
