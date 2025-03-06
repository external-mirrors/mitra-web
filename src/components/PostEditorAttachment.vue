<template>
  <div class="attachment">
    <button
      class="remove-attachment"
      :title="$t('post_editor.remove_attachment')"
      @click.prevent="removeAttachment()"
    >
      <icon-remove></icon-remove>
    </button>
    <div
      v-if="attachment.type === 'image'"
      class="attachment-description"
    >
      <button
        v-if="description === null"
        @click.prevent="editDescription()"
      >
        {{ $t('post_editor.click_to_edit_description') }}
      </button>
      <form v-else @submit.prevent="updateDescription()">
        <textarea
          v-model.trim="description"
          rows="1"
          :placeholder="$t('post_editor.enter_image_description')"
        ></textarea>
        <button type="submit">{{ $t('post_editor.save_image_description') }}</button>
      </form>
    </div>
    <img
      v-if="attachment.type === 'image'"
      :alt="attachment.description || undefined"
      :title="attachment.description || undefined"
      :src="attachment.url"
    >
    <div v-else class="placeholder">{{ attachment.url }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"

import { updateAttachment, Attachment } from "@/api/posts"
import IconRemove from "@/assets/feather/x.svg?component"
import { useCurrentUser } from "@/composables/user"

const props = defineProps<{
  attachment: Attachment,
}>()

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "attachment-removed"): void,
  (event: "attachment-updated", attachment: Attachment): void,
}>()

const { ensureAuthToken } = useCurrentUser()

const description = ref<string | null>(null)

function editDescription() {
  description.value = props.attachment.description || ""
}

async function updateDescription() {
  if (description.value === "") {
    description.value = null
  }
  const attachment = await updateAttachment(
    ensureAuthToken(),
    props.attachment.id,
    description.value,
  )
  description.value = null
  emit("attachment-updated", attachment)
}

function removeAttachment() {
  emit("attachment-removed")
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

$media-btn-opacity: 0.95;

.attachment {
  display: flex;
  position: relative;

  > img {
    min-height: 100px;
    object-fit: contain;
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

.remove-attachment {
  @include media-btn;

  opacity: $media-btn-opacity;
  padding: $input-padding / 2;
  position: absolute;
  right: $input-padding;
  top: $input-padding;
}

.attachment-description {
  background-color: var(--block-background-color);
  border-radius: $btn-border-radius;
  bottom: $block-inner-padding;
  box-shadow: $btn-shadow-size var(--shadow-color);
  left: $block-inner-padding;
  opacity: $media-btn-opacity;
  position: absolute;
  right: $block-inner-padding;

  > button {
    border-radius: inherit;
    padding: $input-padding;
    text-align: center;
    width: 100%;
  }

  form {
    display: flex;

    textarea {
      border: none;
      border-radius: $btn-border-radius 0 0 $btn-border-radius;
      overflow-x: hidden;
    }

    button[type="submit"] {
      border-left: 1px solid var(--separator-color);
      border-radius: 0 $btn-border-radius $btn-border-radius 0;
      font-size: $text-font-size;
      font-weight: bold;
      padding: $input-padding;
    }
  }
}
</style>
