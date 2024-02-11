<template>
  <div class="attachment">
    <button
      class="remove-attachment"
      title="Remove attachment"
      @click.prevent="removeAttachment()"
    >
      <img src="@/assets/feather/x.svg">
    </button>
    <img v-if="attachment.type === 'image'" :src="attachment.url">
    <div v-else class="placeholder">{{ attachment.url }}</div>
  </div>
</template>

<script setup lang="ts">
import { Attachment } from "@/api/posts"

defineProps<{
  attachment: Attachment,
}>()

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "attachment-removed"): void,
}>()

function removeAttachment() {
  emit("attachment-removed")
}
</script>

<style scoped lang="scss">
@import "../styles/layout";

.attachment {
  display: flex;
  position: relative;

  .remove-attachment {
    background-color: var(--btn-background-color);
    display: flex;
    position: absolute;
    right: 0;
    top: 0;

    img {
      filter: var(--btn-text-colorizer);
      height: $icon-size;
      width: $icon-size;
    }
  }

  > img {
    width: 100%;
  }

  .placeholder {
    background-color: var(--background-color);
    box-sizing: border-box;
    padding: $block-inner-padding;
    text-align: center;
    width: 100%;
    word-wrap: break-word;
  }
}
</style>
