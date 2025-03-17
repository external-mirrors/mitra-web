<template>
  <span
    class="display-name"
    v-html="getDisplayNameHtml()"
  >
  </span>
</template>

<script setup lang="ts">
import { replaceShortcodes } from "@/api/emojis"
import { ProfileWrapper } from "@/api/users"
import { escapeHtml } from "@/utils/html"

const props = defineProps<{
  profile: ProfileWrapper,
}>()

function getDisplayNameHtml(): string {
  const profile = props.profile
  // HTML is cleaned by the server, but we'll do it anyway
  const escaped = escapeHtml(profile.getDisplayName())
  return replaceShortcodes(escaped, profile.emojis)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

.display-name {
  @include emoji-inline;
}
</style>
