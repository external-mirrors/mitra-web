<template>
  <div
    v-if="attachment.type === 'image'"
    class="image"
    :class="{ sensitive: isSensitive }"
    @click="toggleFilter()"
  >
    <button v-if="isSensitive" class="content-warning">
      Sensitive content
    </button>
    <img :src="attachment.url">
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

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  attachment: Attachment,
  isSensitive: boolean,
}>()

const isSensitive = ref(props.isSensitive)

function toggleFilter() {
  if (props.isSensitive) {
    // Toggle works only if post is marked as sensitive
    isSensitive.value = !isSensitive.value
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

.image {
  overflow: hidden;
  position: relative;

  .content-warning {
    background-color: var(--block-background-color);
    border-radius: $btn-border-radius;
    left: 50%;
    padding: $input-padding;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: 1;
  }

  > img {
    display: block;
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
