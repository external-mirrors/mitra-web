<template>
  <router-view :key="route.fullPath" />
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"
import { useHead } from "@vueuse/head"

import { useInstanceInfo } from "@/store/instance"
import { APP_VERSION } from "@/constants"

const route = useRoute()
const { loadInstanceInfo } = useInstanceInfo()

useHead({
  meta: [{
    name: "application-name",
    content: `mitra-web v${APP_VERSION}`,
  }],
})

loadInstanceInfo()
</script>

<style lang="scss">
@import "styles/reset";
@import "styles/layout";
@import "styles/theme";

html {
  min-height: 100%;
}

body {
  background: $background-color;
  color: $text-color;
  font-family: $text-font;
  font-size: $text-font-size;
}

a {
  color: $link-color;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    color: $link-hover-color;
  }
}

.static-text p {
  a {
    text-decoration: underline;
    text-decoration-skip-ink: none;

    &:hover {
      text-decoration: none;
    }
  }
}

input,
textarea {
  background-color: $block-background-color;
  border: 1px solid $block-background-color;
  box-shadow: none;
  box-sizing: border-box;
  color: $text-color;
  font-family: $text-font;
  font-size: $text-font-size;
  margin: 0;
  padding: $input-padding;
  width: 100%;

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: $secondary-text-color;
    opacity: 1;
  }
}

input[type="file"] {
  background-color: transparent;
  border: none;
  padding: 2px 1px;
}

textarea {
  resize: vertical;
}

button {
  background-color: transparent;
  border: none;
  color: $link-color;
  cursor: pointer;
  font-family: $text-font;
  font-size: $text-font-size;
  padding: 0;

  &:hover {
    color: $link-hover-color;
  }
}

.btn {
  background-color: $btn-background-color;
  border: none;
  border-radius: $btn-border-radius;
  box-shadow: $btn-shadow;
  color: $btn-text-color;
  cursor: pointer;
  display: inline-block;
  font-size: $text-font-size;
  font-weight: bold;
  padding: $input-padding 30px;
  white-space: nowrap;

  &:hover {
    background-color: $btn-background-hover-color;
    color: $btn-text-hover-color;
  }

  &[disabled] {
    background-color: #ddd !important;
    box-shadow: none;
    color: #999 !important;
    cursor: initial;
  }
}

.btn.secondary {
  background-color: $btn-secondary-background-color;
  color: $btn-secondary-text-color;

  &:hover {
    background-color: $btn-background-hover-color;
    color: $btn-text-hover-color;
  }
}

menu {
  list-style: none;
}

.wide {
  /* Reserve space for floating avatar */
  padding: $body-padding $content-gap * 1.5;
}

@media screen and (max-width: $screen-breakpoint-medium) {
  .wide {
    padding: $body-padding;
  }
}
</style>
