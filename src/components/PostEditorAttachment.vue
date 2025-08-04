<template>
  <div class="attachment">
    <button
      class="remove-attachment"
      :title="$t('post_editor.remove_attachment')"
      @click.prevent="removeAttachment()"
    >
      <icon-remove></icon-remove>
    </button>
    <button
      v-if="attachment.type === 'image' && description === null"
      class="edit-description"
      :title="$t('post_editor.edit_description')"
      @click.prevent="editDescription()"
    >
      <icon-edit></icon-edit>
    </button>
    <form
      v-if="attachment.type === 'image' && description !== null"
      class="attachment-description"
      @submit.prevent="updateDescription()">
      <textarea
        v-model.trim="description"
        rows="1"
        :placeholder="$t('post_editor.enter_image_description')"
      ></textarea>
      <button type="submit">{{ $t('post_editor.save_image_description') }}</button>
    </form>
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
import IconEdit from "@/assets/feather/edit-3.svg?component"
import IconRemove from "@/assets/feather/x.svg?component"
import { useCurrentUser } from "@/composables/user"

const props = defineProps<{
  attachment: Attachment,
}>()

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

$media-btn-opacity: 0.95;

.attachment {
  display: flex;
  /* two media buttons plus margins */
  min-height: ($icon-size + $input-padding) * 2 + $input-padding * 3;
  position: relative;

  > img {
    margin: auto;
    object-fit: contain;
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
  padding: calc($input-padding / 2);
  position: absolute;
  right: $input-padding;
  top: $input-padding;
}

.edit-description {
  @include media-btn;

  bottom: $input-padding;
  opacity: $media-btn-opacity;
  padding: calc($input-padding / 2);
  position: absolute;
  right: $input-padding;
}

.attachment-description {
  background-color: var(--block-background-color);
  border-radius: $btn-border-radius;
  bottom: $input-padding;
  box-shadow: $btn-shadow-size var(--shadow-color);
  display: flex;
  left: $input-padding;
  opacity: $media-btn-opacity;
  position: absolute;
  right: $input-padding;

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
</style>
