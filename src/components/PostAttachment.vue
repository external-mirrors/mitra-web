<template>
  <div
    v-if="attachment.type === 'image'"
    class="image"
    :class="{ sensitive: contentWarningEnabled }"
  >
    <button
      v-if="contentWarningEnabled"
      class="show-image"
      @click="showImage()"
    >
      Sensitive content
    </button>
    <button
      v-else-if="isSensitive"
      class="hide-image"
      title="Hide image"
      @click="hideImage()"
    >
      <img src="@/assets/feather/eye-off.svg">
    </button>
    <img :src="attachment.url" @click="onImageClick()">
  </div>
  <video v-else-if="attachment.type === 'video'" :src="attachment.url" controls></video>
  <audio v-else-if="attachment.type === 'audio'" :src="attachment.url" controls></audio>
  <div v-else>
    &bull; <a :href="attachment.url">{{ attachment.url }}</a>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import { Attachment } from "@/api/posts"
import { useClientConfig } from "@/composables/client-config"

const { contentWarningsEnabled } = useClientConfig()

const props = defineProps<{
  attachment: Attachment,
  isSensitive: boolean,
}>()

const contentWarningEnabled = ref(props.isSensitive && contentWarningsEnabled.value)

function showImage() {
  contentWarningEnabled.value = false
}

function hideImage() {
  contentWarningEnabled.value = true
}

function onImageClick() {
  if (props.isSensitive && contentWarningEnabled.value === true) {
    // If post is marked as sensitive, hide content warning
    showImage()
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";

a {
  @include block-link;

  word-wrap: break-word;
}

button {
  background-color: var(--block-background-color);
  border-radius: $btn-border-radius;
  display: flex;
  padding: $input-padding;

  img {
    filter: var(--link-colorizer);
    height: $icon-size;
    width: $icon-size;
  }
}

.image {
  overflow: hidden;
  position: relative;

  .show-image {
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  .hide-image {
    left: $body-padding;
    padding: $input-padding;
    position: absolute;
    top: $body-padding;
    z-index: 1;
  }

  > img {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }

  &.sensitive > img {
    filter: blur(50px);
  }
}

audio,
video {
  width: 100%;
}
</style>
