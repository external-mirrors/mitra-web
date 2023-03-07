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

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  profile: ProfileWrapper,
}>()

function getDisplayNameHtml(): string {
  const profile = props.profile
  const escaped = new Option(profile.getDisplayName()).innerHTML
  return replaceShortcodes(escaped, profile.emojis)
}
</script>

<style scoped lang="scss">
@import "../styles/theme";

$display-name-line-height: 1.4;

.display-name {
  line-height: $display-name-line-height;

  :deep(.emoji) {
    height: $display-name-line-height * 0.8em;
    vertical-align: text-bottom;
    width: $display-name-line-height * 0.8em;
  }
}
</style>
