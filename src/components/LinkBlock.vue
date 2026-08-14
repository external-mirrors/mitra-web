<template>
  <router-link
    class="link-block"
    :to="to"
  >
    <div class="icon">
      <slot name="icon"></slot>
    </div>
    <div class="title">{{ title }}</div>
    <div class="icon">
      <icon-arrow-right></icon-arrow-right>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { RouteLocationRaw } from "vue-router"

import IconArrowRight from "@/assets/feather/arrow-right.svg?component"

defineProps<{
  to: RouteLocationRaw,
  title: string,
}>()
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

.link-block {
  align-items: center;
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
  display: flex;
  gap: $block-inner-padding;
  padding: $block-inner-padding;

  :deep(.icon) svg {
    @include standard-icon;

    stroke: var(--link-color);
  }

  &:hover {
    :deep(.icon) svg {
      stroke: var(--link-hover-color);
    }
  }

  .title {
    flex-grow: 1;
  }
}
</style>
