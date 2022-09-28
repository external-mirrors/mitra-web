<template>
  <form class="post-form" :class="{'reply': inReplyTo}">
    <router-link
      v-if="author"
      class="floating-avatar"
      :to="{ name: 'profile', params: { profileId: author.id }}"
    >
      <avatar :profile="author"></avatar>
    </router-link>
    <div class="textarea-group">
      <textarea
        id="content"
        ref="postFormContentRef"
        v-model="content"
        rows="1"
        required
        :placeholder="inReplyTo ? 'Your reply' : 'What\'s on your mind?'"
      ></textarea>
      <div v-if="attachments.length > 0" class="attachments">
        <div
          v-for="(attachment, index) in attachments"
          class="attachment"
          :key="attachment.id"
        >
          <button
            class="remove-attachment"
            title="Remove attachment"
            @click.prevent="removeAttachment(index)"
          >
            <img :src="require('@/assets/feather/x.svg')">
          </button>
          <img :src="attachment.url">
        </div>
      </div>
      <div class="toolbar">
        <button
          type="button"
          class="icon"
          title="Attach image"
          :disabled="!canAttachFile()"
          @click="selectAttachment()"
        >
          <img :src="require('@/assets/feather/paperclip.svg')">
          <input
            type="file"
            ref="attachmentUploadInputRef"
            accept="image/*"
            style="display: none;"
            @change="onAttachmentUpload($event)"
          >
        </button>
        <div
          class="dropdown-menu-wrapper"
          v-click-away="hideVisibilityMenu"
        >
          <button
            type="button"
            class="icon"
            title="Change visibility"
            @click="toggleVisibilityMenu()"
          >
            <visibility-icon :visibility="visibility"></visibility-icon>
          </button>
          <menu v-if="visibilityMenuVisible" class="dropdown-menu">
            <li v-for="[value, display] in visibilityMap" :key="value">
              <button
                class="icon"
                :title="display"
                @click="hideVisibilityMenu(); visibility = value"
              >
                <visibility-icon :visibility="value"></visibility-icon>
                <span>{{ display }}</span>
              </button>
            </li>
          </menu>
        </div>
        <div class="character-counter" title="Characters left">
          {{ getCharacterCount() }}
        </div>
        <button
          type="submit"
          v-if="inReplyTo"
          class="submit-btn-small"
          :disabled="!canPublish()"
          @click.prevent="publish()"
        >
          Publish
        </button>
      </div>
    </div>
    <div v-if="!inReplyTo" class="submit-btn-wrapper">
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <button
        class="btn"
        type="submit"
        :disabled="!canPublish()"
        @click.prevent="publish()"
      >Publish</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { nextTick, onMounted } from "vue"
import { $, $computed, $ref } from "vue/macros"

import {
  Visibility,
  VISIBILITY_MAP,
  Mention,
  Post,
  createPost,
  Attachment,
  uploadAttachment,
} from "@/api/posts"
import { User } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { setupAutoResize, triggerResize } from "@/utils/autoresize"
import { renderMarkdownLite } from "@/utils/markdown"
import { fileToDataUrl, dataUrlToBase64 } from "@/utils/upload"

const visibilityMap = Object.entries(VISIBILITY_MAP)
const ATTACHMENTS_MAX_NUM = 10

const { currentUser, ensureAuthToken } = $(useCurrentUser())
const { instance, getActorAddress } = $(useInstanceInfo())

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  inReplyTo: Post | null,
}>()

/* eslint-disable-next-line no-undef, func-call-spacing */
const emit = defineEmits<{
  (event: "post-created", post: Post): void,
}>()

const postFormContentRef = $ref<HTMLTextAreaElement | null>(null)
const attachmentUploadInputRef = $ref<HTMLInputElement | null>(null)

let content = $ref("")
let attachments = $ref<Attachment[]>([])
let visibility = $ref(Visibility.Public)

let visibilityMenuVisible = $ref(false)
let isLoading = $ref(false)
let errorMessage = $ref<string | null>(null)

const author = $computed<User | null>(() => {
  return currentUser
})

if (props.inReplyTo) {
  const mentions: Mention[] = [
    props.inReplyTo.account,
    ...props.inReplyTo.mentions,
  ]
  content = mentions
    .filter(mention => mention.id !== currentUser?.id)
    .map(mention => "@" + getActorAddress(mention))
    // Remove duplicates
    .filter((mention, index, mentions) => mentions.indexOf(mention) === index)
    .join(" ")
}
if (props.inReplyTo && props.inReplyTo.visibility !== Visibility.Public) {
  visibility = Visibility.Direct
}

onMounted(() => {
  if (postFormContentRef) {
    setupAutoResize(postFormContentRef)
  }
})

function canAttachFile(): boolean {
  return attachments.length < ATTACHMENTS_MAX_NUM
}

function selectAttachment() {
  if (attachmentUploadInputRef) {
    attachmentUploadInputRef.click()
  }
}

async function onAttachmentUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files
  if (!files) {
    return
  }
  const imageDataUrl = await fileToDataUrl(files[0])
  const imageBase64 = dataUrlToBase64(imageDataUrl)
  const attachment = await uploadAttachment(
    ensureAuthToken(),
    imageBase64,
  )
  attachments.push(attachment)
}

function removeAttachment(index: number) {
  attachments.splice(index, 1)
}

function toggleVisibilityMenu() {
  visibilityMenuVisible = !visibilityMenuVisible
}

function hideVisibilityMenu() {
  visibilityMenuVisible = false
}

function getCharacterCount(): number {
  if (!instance) {
    return 0
  }
  return (instance.post_character_limit - content.length)
}

function canPublish(): boolean {
  return getCharacterCount() >= 0 && !isLoading
}

async function publish() {
  const contentRendered = renderMarkdownLite(content)
  const postData = {
    content: contentRendered,
    in_reply_to_id: props.inReplyTo ? props.inReplyTo.id : null,
    visibility: visibility,
    mentions: [],
    attachments: attachments,
  }
  isLoading = true
  let post
  try {
    post = await createPost(
      ensureAuthToken(),
      postData,
    )
  } catch (error: any) {
    errorMessage = error.message
    isLoading = false
    return
  }
  // Refresh editor
  errorMessage = null
  isLoading = false
  attachments = []
  content = ""
  if (postFormContentRef) {
    await nextTick()
    triggerResize(postFormContentRef)
  }
  emit("post-created", post)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/mixins";
@import "../styles/theme";

$line-height: 1.5;

.post-form {
  position: relative;

  .floating-avatar {
    @include floating-avatar;

    left: $block-inner-padding;
    margin-top: calc($line-height * 1em / 2);
    position: absolute;
    top: $block-inner-padding;

    @media screen and (max-width: $screen-breakpoint-medium) {
      display: none;
    }
  }
}

.textarea-group {
  background-color: $block-background-color;
  border-radius: $block-border-radius;
}

textarea {
  border-radius: $block-border-radius $block-border-radius 0 0;
  height: 100px;
  line-height: $line-height;
  padding: $block-inner-padding;
  width: 100%;
}

.attachments {
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;
}

.attachment {
  display: flex;
  position: relative;

  .remove-attachment {
    background-color: $btn-background-color;
    display: flex;
    position: absolute;
    right: 0;
    top: 0;

    img {
      filter: $btn-text-colorizer;
      height: $icon-size;
      width: $icon-size;
    }
  }

  > img {
    width: 100%;
  }
}

.toolbar {
  @include post-icon;

  align-items: center;
  border-radius: 0 0 $block-border-radius $block-border-radius;
  border-top: 1px solid $separator-color;
  color: $secondary-text-color;
  display: flex;
  flex-direction: row;
  gap: calc($block-inner-padding / 2);
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;

  .character-counter {
    font-weight: bold;
    margin-left: auto;
  }

  .submit-btn-small {
    font-weight: bold;
    margin-left: $block-inner-padding;

    &[disabled] {
      color: $btn-disabled-text-color;
      cursor: initial;
    }
  }
}

.dropdown-menu-wrapper {
  @include block-dropdown-menu;
}

.submit-btn-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: calc($block-inner-padding / 1.5);

  .error-message {
    color: $error-color;
    margin-right: $block-inner-padding;
  }
}

.post-form.reply {
  textarea {
    height: calc(1.5em + #{2 * $block-inner-padding});
  }
}
</style>
