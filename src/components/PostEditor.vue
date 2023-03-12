<template>
  <form class="post-form" :class="{ reply: inReplyTo }">
    <router-link
      v-if="author"
      class="floating-avatar"
      :to="{ name: 'profile-by-acct', params: { acct: author.acct }}"
    >
      <avatar :profile="author"></avatar>
    </router-link>
    <div class="textarea-group">
      <textarea
        id="content"
        ref="postFormContentRef"
        v-show="preview === null"
        v-model="content"
        @input="saveLocalDraft()"
        rows="1"
        required
        :placeholder="inReplyTo ? 'Your reply' : 'What\'s on your mind?'"
        @paste="onPaste($event)"
      ></textarea>
      <post-content
        v-if="preview"
        :post="preview"
        @click.prevent=""
      ></post-content>
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
          <img v-if="attachment.type === 'image'" :src="attachment.url">
          <div v-else class="placeholder">{{ attachment.url }}</div>
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
            :accept="getAcceptedMediaTypes()"
            style="display: none;"
            @change="onAttachmentUpload($event)"
          >
        </button>
        <div
          class="dropdown-menu-wrapper"
          v-click-away="hideVisibilityMenu"
        >
          <button
            v-if="canChangeVisibility()"
            type="button"
            class="icon"
            title="Change visibility"
            @click="toggleVisibilityMenu()"
          >
            <visibility-icon :visibility="visibility"></visibility-icon>
          </button>
          <span v-else class="icon">
            <visibility-icon :visibility="visibility"></visibility-icon>
          </span>
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
        <div class="toolbar-space"></div>
        <button
          v-if="canPreview()"
          type="button"
          class="icon"
          title="Toggle preview"
          @click="togglePreview()"
        >
          <img v-if="preview === null" :src="require('@/assets/feather/eye.svg')">
          <img v-else :src="require('@/assets/feather/eye-off.svg')">
        </button>
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
  createPost,
  previewPost,
  uploadAttachment,
  Attachment,
  Mention,
  Post,
  Visibility,
  VISIBILITY_MAP,
} from "@/api/posts"
import { User } from "@/api/users"
import Avatar from "@/components/Avatar.vue"
import PostContent from "@/components/PostContent.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import { useInstanceInfo } from "@/store/instance"
import { useCurrentUser } from "@/store/user"
import { setupAutoResize, triggerResize } from "@/utils/autoresize"
import { fileToDataUrl, dataUrlToBase64 } from "@/utils/upload"

const visibilityMap = Object.entries(VISIBILITY_MAP)
const POST_CONTENT_STORAGE_KEY = "post_content"

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

let content = $ref(loadLocalDraft())
let attachments = $ref<Attachment[]>([])
let visibility = $ref(Visibility.Public)

let visibilityMenuVisible = $ref(false)
let preview = $ref<Post | null>(null)
let isLoading = $ref(false)
let isAttachmentLoading = $ref(false)
let errorMessage = $ref<string | null>(null)

const author = $computed<User | null>(() => {
  return currentUser
})

if (props.inReplyTo && content.length === 0) {
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
    triggerResize(postFormContentRef)
  }
})

function getLocalDraftKey(): string {
  const postId = props.inReplyTo?.id || "new"
  return `${POST_CONTENT_STORAGE_KEY}_${postId}`
}

function loadLocalDraft(): string {
  return localStorage.getItem(getLocalDraftKey()) || ""
}

function saveLocalDraft() {
  localStorage.setItem(getLocalDraftKey(), content)
}

function removeLocalDraft() {
  localStorage.removeItem(getLocalDraftKey())
}

async function onPaste(event: ClipboardEvent) {
  const files = event.clipboardData?.files || []
  if (files.length > 0) {
    event.preventDefault()
    // NOTE: files property gets emptied after event propagation
    await addAttachment(files[0])
  }
}

function canAttachFile(): boolean {
  if (!instance) {
    return false
  }
  return (
    attachments.length < instance.configuration.statuses.max_media_attachments &&
    !isAttachmentLoading
  )
}

function getAcceptedMediaTypes(): string {
  if (!instance) {
    return ""
  }
  return instance.configuration.media_attachments.supported_mime_types
    .join(",")
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
  await addAttachment(files[0])
}

async function addAttachment(file: File) {
  isAttachmentLoading = true
  const imageDataUrl = await fileToDataUrl(file)
  const imageData = dataUrlToBase64(imageDataUrl)
  const attachment = await uploadAttachment(
    ensureAuthToken(),
    imageData.data,
    imageData.mediaType,
  )
  attachments.push(attachment)
  isAttachmentLoading = false
}

function removeAttachment(index: number) {
  attachments.splice(index, 1)
}

function canChangeVisibility(): boolean {
  return (
    props.inReplyTo === null ||
    props.inReplyTo.visibility === Visibility.Public
  )
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
  return (instance.configuration.statuses.max_characters - content.length)
}

function canPreview(): boolean {
  return content.length > 0
}

async function togglePreview() {
  if (preview === null) {
    preview = await previewPost(ensureAuthToken(), content)
  } else {
    preview = null
  }
}

function canPublish(): boolean {
  return getCharacterCount() >= 0 && !isLoading && !isAttachmentLoading
}

async function publish() {
  const postData = {
    content: content,
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
  removeLocalDraft()
  content = ""
  attachments = []
  preview = null
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

#content {
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

  .placeholder {
    background-color: $background-color;
    box-sizing: border-box;
    padding: $block-inner-padding;
    text-align: center;
    width: 100%;
    word-wrap: break-word;
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

  .toolbar-space {
    flex-grow: 1;
  }

  .character-counter {
    font-weight: bold;
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
