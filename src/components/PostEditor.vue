<template>
  <form class="post-form">
    <router-link
      v-if="currentUser"
      class="floating-avatar"
      :to="getActorLocation('profile', currentUser)"
    >
      <avatar :profile="currentUser"></avatar>
    </router-link>
    <div class="textarea-group">
      <textarea
        id="content"
        ref="contentInputElement"
        v-show="preview === null"
        :value="content"
        rows="1"
        required
        :placeholder="inReplyTo ? $t('post_editor.prompt_reply') : (repostOf ? $t('post_editor.prompt_repost') : $t('post_editor.prompt'))"
        @input="onContentInput"
        @drop="onDrop($event)"
        @paste="onPaste($event)"
        @keyup.ctrl.enter="onCtrlEnter()"
      ></textarea>
      <div
        class="suggestions"
        v-if="mentionSuggestionList.length > 0 && preview === null"
      >
        <button
          v-for="profile in mentionSuggestionList"
          type="button"
          :key="profile.id"
          @click.prevent="autocompleteMention(profile)"
        >
          <span>@{{ profile.acct }}</span>
        </button>
      </div>
      <div
        v-if="emojiSuggestionList.length > 0 && preview === null"
        class="suggestions"
      >
        <button
          v-for="emoji in emojiSuggestionList"
          type="button"
          :key="emoji.name"
          @click="autocompleteEmoji(emoji)"
        >
          <emoji-image :emoji="emoji"></emoji-image>
          <span>{{ getEmojiShortcode(emoji.name) }}</span>
        </button>
      </div>
      <post-content
        v-if="preview"
        class="preview"
        :post="preview"
        @click.prevent="togglePreview()"
      ></post-content>
      <div v-if="pollEditorVisible" class="poll-editor">
        <input
          v-for="index in pollOptionCount"
          type="text"
          :key="index"
          :placeholder="$t('poll_editor.option', { n: index })"
          v-model.trim="pollOptions[index - 1]"
        >
        <div class="poll-settings">
          <div class="input-group">
            <label :for="`duration-${idempotencyKey}`">
              {{ $t('poll_editor.poll_duration') }}
            </label>
            <input
              :id="`duration-${idempotencyKey}`"
              type="number"
              min="1"
              v-model="pollDuration"
            >
            <select v-model="pollDurationUnit">
              <option :value="3600">{{ $t('poll_editor.duration_hour', { n: pollDuration }) }}</option>
              <option :value="86400">{{ $t('poll_editor.duration_day', { n: pollDuration }) }}</option>
            </select>
          </div>
          <div class="input-group">
            <label :for="`multichoice-${idempotencyKey}`">
              {{ $t('poll_editor.multiple_choices') }}
            </label>
            <input
              :id="`multichoice-${idempotencyKey}`"
              type="checkbox"
              v-model="pollMultichoice"
            >
          </div>
        </div>
      </div>
      <div v-if="attachmentList.length > 0" class="attachments">
        <post-editor-attachment
          v-for="(attachment, index) in attachmentList"
          :attachment="attachment"
          :key="attachment.id"
          @attachment-updated="onAttachmentUpdated(index, $event)"
          @attachment-removed="onAttachmentRemoved(index)"
        ></post-editor-attachment>
      </div>
      <div class="toolbar">
        <button
          type="button"
          class="icon"
          :title="$t('post_editor.attach_file')"
          :disabled="!canAttachFile()"
          @click="selectAttachment()"
        >
          <icon-attach v-if="!isAttachmentLoading"></icon-attach>
          <loader v-else></loader>
          <input
            type="file"
            ref="attachmentUploaderElement"
            :accept="getAcceptedMediaTypes()"
            multiple="true"
            style="display: none;"
            @change="onAttachmentUpload($event)"
          >
        </button>
        <button
          v-if="post === null"
          type="button"
          class="icon"
          :class="{ highlighted: pollEditorVisible }"
          :title="pollEditorVisible ? $t('post_editor.remove_poll') : $t('post_editor.add_poll')"
          @click="togglePollEditor()"
        >
          <icon-chart></icon-chart>
        </button>
        <div
          class="dropdown-menu-wrapper"
          v-click-away="hideVisibilityMenu"
        >
          <button
            v-if="canChangeVisibility()"
            type="button"
            class="icon"
            :title="$t('post_editor.change_visibility')"
            @click="toggleVisibilityMenu()"
          >
            <visibility-icon :visibility="visibility"></visibility-icon>
          </button>
          <span
            v-else
            class="icon"
            :title="$t('post_editor.visibility_can_not_be_changed')"
          >
            <visibility-icon :visibility="visibility"></visibility-icon>
          </span>
          <menu v-if="visibilityMenuVisible" class="dropdown-menu">
            <li v-for="value in visibilityOptions" :key="value">
              <button
                class="icon"
                :title="VISIBILITY_MAP[value].description"
                @click="hideVisibilityMenu(); visibility = value"
              >
                <visibility-icon :visibility="value"></visibility-icon>
                <span>{{ VISIBILITY_MAP[value].name }}</span>
              </button>
            </li>
          </menu>
        </div>
        <button
          type="button"
          class="icon"
          :class="{ warning: isSensitive }"
          :title="isSensitive ? $t('post_editor.remove_content_warning') : $t('post_editor.add_content_warning')"
          @click="isSensitive = !isSensitive"
        >
          <icon-alert></icon-alert>
        </button>
        <div
          class="dropdown-menu-wrapper"
          v-click-away="hideEmojiPicker"
        >
          <button
            type="button"
            class="icon"
            :title="$t('post_editor.insert_emoji')"
            @click="toggleEmojiPicker"
          >
            <icon-smile></icon-smile>
          </button>
          <emoji-picker
            v-if="emojiPickerVisible"
            @emoji-picked="insertEmoji($event)"
          ></emoji-picker>
        </div>
        <div class="toolbar-space"></div>
        <div
          v-if="isCharacterCounterVisible()"
          class="character-counter"
          :title="$t('post_editor.characters_left')"
        >
          {{ getCharacterCount() }}
        </div>
        <button
          v-if="canPreview()"
          type="button"
          class="icon"
          :title="$t('post_editor.toggle_preview')"
          @click="togglePreview()"
        >
          <icon-show v-if="preview === null"></icon-show>
          <icon-hide v-else></icon-hide>
        </button>
        <div v-if="isEditorEmbedded" class="submit-reply-btn-wrapper">
          <button
            class="icon btn-small"
            @click.prevent="cancel()"
          >
            {{ $t('post_editor.cancel') }}
          </button>
          <button
            type="submit"
            class="icon btn-small"
            :disabled="!canPublish()"
            @click.prevent="publish()"
          >
            <template v-if="repostOf">{{ $t('post_editor.repost') }}</template>
            <template v-else>{{ $t('post_editor.publish') }}</template>
          </button>
        </div>
      </div>
    </div>
    <div v-if="!isEditorEmbedded" class="submit-btn-wrapper">
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      <button
        v-if="post"
        class="btn secondary"
        @click.prevent="cancel()"
      >
        {{ $t('post_editor.cancel') }}
      </button>
      <button
        class="btn"
        type="submit"
        :disabled="!canPublish()"
        @click.prevent="publish()"
      >
        <template v-if="post">{{ $t('post_editor.update') }}</template>
        <template v-else>{{ $t('post_editor.publish') }}</template>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
/* eslint-disable vue/no-setup-props-destructure */
import { computed, nextTick, onMounted, ref } from "vue"

import { getEmojis, getEmojiShortcode, Emoji } from "@/api/emojis"
import {
  createPost,
  previewPost,
  updatePost,
  uploadAttachment,
  Attachment,
  Mention,
  Post,
  Visibility,
} from "@/api/posts"
import { searchProfilesByAcct } from "@/api/search"
import { Profile } from "@/api/users"
import IconAlert from "@/assets/feather/alert-triangle.svg?component"
import IconChart from "@/assets/tabler/chart-bar.svg?component"
import IconShow from "@/assets/feather/eye.svg?component"
import IconHide from "@/assets/feather/eye-off.svg?component"
import IconAttach from "@/assets/feather/paperclip.svg?component"
import IconSmile from "@/assets/feather/smile.svg?component"
import Avatar from "@/components/Avatar.vue"
import EmojiImage from "@/components/EmojiImage.vue"
import EmojiPicker from "@/components/EmojiPicker.vue"
import Loader from "@/components/Loader.vue"
import PostContent from "@/components/PostContent.vue"
import PostEditorAttachment from "@/components/PostEditorAttachment.vue"
import VisibilityIcon from "@/components/VisibilityIcon.vue"
import { useClientConfig } from "@/composables/client-config"
import { useActorHandle } from "@/composables/handle"
import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"
import { useVisibility } from "@/composables/visibility"
import { resizeTextArea, setupAutoResize } from "@/utils/autoresize"
import { generateRandomString } from "@/utils/crypto"
import { debounce } from "@/utils/debounce"
import { fileToDataUrl, dataUrlToBase64 } from "@/utils/upload"

const FORM_ID_LENGTH = 20
const POST_CONTENT_STORAGE_KEY = "post_content"
const POLL_OPTION_COUNT_MIN = 2
const POLL_OPTION_COUNT_MAX = 6

const { ctrlEnterEnabled } = useClientConfig()
const { getActorHandle, getActorLocation } = useActorHandle()
const { currentUser, ensureAuthToken, ensureCurrentUser } = useCurrentUser()
const { instance } = useInstanceInfo()
const { getVisibilityOptions, VISIBILITY_MAP } = useVisibility()

const props = defineProps<{
  post: Post | null,
  inReplyTo: Post | null,
  repostOf: Post | null,
}>()

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "post-saved", post: Post): void,
  (event: "post-editor-closed"): void,
}>()

const contentInputElement = ref<HTMLTextAreaElement | null>(null)
const attachmentUploaderElement = ref<HTMLInputElement | null>(null)

const idempotencyKey = ref(generateRandomString(FORM_ID_LENGTH))
const content = ref("")
const attachmentList = ref<Attachment[]>([])
const visibility = ref(Visibility.Public)
const isSensitive = ref(false)

const pollEditorVisible = ref(false)
const pollOptions = ref<string[]>([])
const pollMultichoice = ref(false)
const pollDuration = ref<number>(1)
const pollDurationUnit = ref<number>(86400)

const mentionSuggestionList = ref<Profile[]>([])
const mentionPosition = ref<[number, number] | null>(null)
const emojiSuggestionList = ref<Emoji[]>([])
const emojiPosition = ref<[number, number] | null>(null)
const visibilityMenuVisible = ref(false)
const emojiPickerVisible = ref(false)
const preview = ref<Post | null>(null)
const isLoading = ref(false)
const isAttachmentLoading = ref(false)
const errorMessage = ref<string | null>(null)

const isEditorEmbedded = computed(() => {
  return props.inReplyTo !== null || props.repostOf !== null
})
const visibilityOptions = computed(() => {
  if (props.post) {
    // Visibility can not be changed after publishing
    return []
  } else {
    return getVisibilityOptions(ensureCurrentUser(), props.inReplyTo)
  }
})

if (props.post) {
  // Editing post
  content.value = props.post.contentSource || ""
  attachmentList.value = [...props.post.media_attachments]
  visibility.value = props.post.visibility
  isSensitive.value = props.post.sensitive
} else {
  // Writing new post
  content.value = loadLocalDraft()
}

function inlineMentions(mentions: Mention[]): string {
  const handles = mentions
    .filter(mention => mention.id !== currentUser.value?.id)
    .map(mention => getActorHandle(mention))
    // Remove non-webfinger handles
    .filter(handle => handle.startsWith("@"))
    // Remove duplicates
    .filter((handle, index, handles) => handles.indexOf(handle) === index)
  if (handles.length === 0) {
    return ""
  } else {
    return handles.join(" ") + " "
  }
}

if (props.inReplyTo && content.value.length === 0) {
  const mentions: Mention[] = [
    props.inReplyTo.account,
    ...props.inReplyTo.mentions,
  ]
  content.value = inlineMentions(mentions)
}

if (props.inReplyTo && props.post === null) {
  // First item is default visibility
  visibility.value = visibilityOptions.value[0]
}

if (props.repostOf && content.value.length === 0) {
  const mentions = [props.repostOf.account]
  content.value = inlineMentions(mentions)
}

onMounted(() => {
  if (contentInputElement.value) {
    setupAutoResize(contentInputElement.value)
    contentInputElement.value.focus()
  }
})

function getLocalDraftKey(): string {
  if (props.inReplyTo !== null) {
    return `${POST_CONTENT_STORAGE_KEY}_${props.inReplyTo.id}`
  } else if (props.repostOf !== null) {
    return `${POST_CONTENT_STORAGE_KEY}_${props.repostOf.id}_repost`
  } else {
    return `${POST_CONTENT_STORAGE_KEY}_new`
  }
}

function loadLocalDraft(): string {
  return localStorage.getItem(getLocalDraftKey()) || ""
}

function saveLocalDraft() {
  localStorage.setItem(getLocalDraftKey(), content.value)
}

function removeLocalDraft() {
  localStorage.removeItem(getLocalDraftKey())
}

async function showSuggestions() {
  if (contentInputElement.value === null) {
    return
  }
  const currentPosition = contentInputElement.value.selectionStart
  const contentBefore = content.value.substring(0, currentPosition)

  // "d" flag requires FF 88+
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/hasIndices
  const emojiRegexp = /(^|\s)(?<shortcode>:\S+)$/d
  const emojiMatch = emojiRegexp.exec(contentBefore)
  const emojiText = emojiMatch?.groups?.shortcode.substring(1)
  if (emojiText) {
    if (emojiText.length >= 2) {
      const indices = (emojiMatch as any).indices.groups.shortcode
      const emojis = await getEmojis()
      const results = emojis
        .filter(emoji => emoji.name.includes(emojiText))
        .slice(0, 10)
      if (results.length > 0) {
        emojiSuggestionList.value = results
        emojiPosition.value = indices
        // Hide another suggestion list
        mentionSuggestionList.value = []
        return
      }
    }
  }
  emojiSuggestionList.value = []

  const mentionRegexp = /(^|\s)(?<mention>@\S+)$/d
  const mentionMatch = mentionRegexp.exec(contentBefore)
  const mentionText = mentionMatch?.groups?.mention.substring(1)
  if (mentionText && mentionText.length >= 2) {
    const indices = (mentionMatch as any).indices.groups.mention
    const results = await searchProfilesByAcct(
      ensureAuthToken(),
      mentionText,
      false,
      4,
    )
    if (results.length !== 1 || results[0].acct !== mentionText) {
      mentionSuggestionList.value = results
      mentionPosition.value = indices
      return
    }
  }
  mentionSuggestionList.value = []
}

const showSuggestionsDebounced = debounce(showSuggestions, 500)

async function insertText(start: number, stop: number, text: string) {
  if (contentInputElement.value === null) {
    throw new Error("editor doesn't exist")
  }
  content.value =
    content.value.substring(0, start) +
    text +
    content.value.substring(stop)
  await nextTick()
  const newPosition = start + text.length
  contentInputElement.value.focus()
  contentInputElement.value.selectionEnd = newPosition
}

async function autocompleteMention(profile: Profile) {
  if (contentInputElement.value !== null && mentionPosition.value !== null) {
    const [start, stop] = mentionPosition.value
    // Suggested profile is expected to have webfinger address
    await insertText(start, stop, `@${profile.acct} `)
    mentionSuggestionList.value = []
  }
}

async function autocompleteEmoji(emoji: Emoji) {
  if (emojiPosition.value === null) {
    throw new Error("emoji position is null")
  }
  const [start, stop] = emojiPosition.value
  await insertText(start, stop, `${getEmojiShortcode(emoji.name)} `)
  emojiSuggestionList.value = []
}

function onContentInput(event: Event) {
  content.value = (event.target as HTMLTextAreaElement).value
  showSuggestionsDebounced()
  if (props.post === null) {
    saveLocalDraft()
  }
}

async function onDrop(event: DragEvent) {
  const files = event.dataTransfer?.files || []
  if (files.length > 0) {
    event.preventDefault()
    for (const file of files) {
      await addAttachment(file)
    }
  }
}

async function onPaste(event: ClipboardEvent) {
  const files = event.clipboardData?.files || []
  if (files.length > 0) {
    event.preventDefault()
    // NOTE: files property gets emptied after event propagation
    await addAttachment(files[0])
  }
}

function togglePollEditor() {
  if (pollEditorVisible.value) {
    pollOptions.value = []
  }
  pollEditorVisible.value = !pollEditorVisible.value
}

const pollOptionCount = computed(() => {
  const optionCount = pollOptions.value
    .filter(option => !!option)
    .length
  return Math.min(
    Math.max(optionCount + 1, POLL_OPTION_COUNT_MIN),
    POLL_OPTION_COUNT_MAX,
  )
})

function canAttachFile(): boolean {
  if (!instance.value) {
    return false
  }
  return (
    attachmentList.value.length < instance.value.configuration.statuses.max_media_attachments &&
    !isAttachmentLoading.value
  )
}

function getAcceptedMediaTypes(): string {
  if (!instance.value) {
    return ""
  }
  const types = [...instance.value.configuration.media_attachments.supported_mime_types]
  if (types.includes("video/x-m4v")) {
    // Some OSes don't associate .m4v files with video/x-m4v media type
    types.push(".m4v")
  }
  return types.join(",")
}

function selectAttachment() {
  if (attachmentUploaderElement.value) {
    attachmentUploaderElement.value.click()
  }
}

async function onAttachmentUpload(event: Event) {
  const files = (event.target as HTMLInputElement).files || []
  if (files.length > 0) {
    for (const file of files) {
      await addAttachment(file)
    }
  }
}

async function addAttachment(file: File) {
  isAttachmentLoading.value = true
  const imageDataUrl = await fileToDataUrl(file)
  const imageData = dataUrlToBase64(imageDataUrl)
  let attachment
  try {
    attachment = await uploadAttachment(
      ensureAuthToken(),
      imageData.data,
      imageData.mediaType,
    )
  } catch (error: any) {
    isAttachmentLoading.value = false
    alert(error.message)
    return
  }
  attachmentList.value.push(attachment)
  isAttachmentLoading.value = false
}

function onAttachmentUpdated(index: number, attachment: Attachment) {
  Object.assign(attachmentList.value[index], attachment)
}

function onAttachmentRemoved(index: number) {
  attachmentList.value.splice(index, 1)
}

function canChangeVisibility(): boolean {
  return visibilityOptions.value.length > 1
}

function toggleVisibilityMenu() {
  visibilityMenuVisible.value = !visibilityMenuVisible.value
}

function hideVisibilityMenu() {
  visibilityMenuVisible.value = false
}

function toggleEmojiPicker() {
  emojiPickerVisible.value = !emojiPickerVisible.value
}

function hideEmojiPicker() {
  emojiPickerVisible.value = false
}

async function insertEmoji(emojiText: string) {
  if (contentInputElement.value === null) {
    throw new Error("editor doesn't exist")
  }
  const position = contentInputElement.value.selectionStart
  // Add whitespace before and after emoji
  let text = `${emojiText} `
  if (position !== 0 && !/\s/.test(content.value.charAt(position - 1))) {
    text = " " + text
  }
  await insertText(position, position, text)
  hideEmojiPicker()
}

function getCharacterCount(): number {
  if (!instance.value) {
    return 0
  }
  return (instance.value.configuration.statuses.max_characters - content.value.length)
}

function isCharacterCounterVisible(): boolean {
  return getCharacterCount() < 100
}

function canPreview(): boolean {
  return content.value.length > 0
}

async function togglePreview() {
  if (preview.value === null) {
    preview.value = await previewPost(ensureAuthToken(), content.value)
  } else {
    preview.value = null
  }
}

function cancel() {
  emit("post-editor-closed")
}

function canPublish(): boolean {
  return getCharacterCount() >= 0 && !isLoading.value && !isAttachmentLoading.value
}

async function publish() {
  isLoading.value = true
  let post
  try {
    if (props.post !== null) {
      post = await updatePost(
        ensureAuthToken(),
        props.post.id,
        content.value,
        attachmentList.value,
        isSensitive.value,
        props.post.pleroma.quote?.id ?? null,
      )
    } else {
      const postData = {
        idempotencyKey: idempotencyKey.value,
        content: content.value,
        inReplyToId: props.inReplyTo ? props.inReplyTo.id : null,
        visibility: visibility.value,
        isSensitive: isSensitive.value,
        attachments: attachmentList.value,
        pollOptions: pollOptions.value.filter(option => !!option),
        pollDuration: pollDuration.value * pollDurationUnit.value,
        pollMultichoice: pollMultichoice.value,
        quoteId: props.repostOf ? props.repostOf.id : null,
      }
      post = await createPost(
        ensureAuthToken(),
        postData,
      )
    }
  } catch (error: any) {
    errorMessage.value = error.message
    isLoading.value = false
    if (isEditorEmbedded.value === true) {
      // Show alert if there's no errorbox
      alert(error.message)
    }
    return
  }
  // Refresh editor
  errorMessage.value = null
  isLoading.value = false
  idempotencyKey.value = generateRandomString(FORM_ID_LENGTH)
  content.value = ""
  isSensitive.value = false
  pollEditorVisible.value = false
  pollOptions.value = []
  attachmentList.value = []
  preview.value = null
  if (props.post === null) {
    removeLocalDraft()
  }
  emit("post-saved", post)
  // Reset textarea size. Must be done after update of the parent component.
  await nextTick()
  if (contentInputElement.value) {
    resizeTextArea(contentInputElement.value)
  }
}

async function onCtrlEnter() {
  if (ctrlEnterEnabled.value) {
    await publish()
  }
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
  background-color: var(--block-background-color);
  border-radius: $block-border-radius;
}

#content {
  border-radius: $block-border-radius $block-border-radius 0 0;
  height: 100px;
  line-height: $line-height;
  min-height: 100px;
  padding: $block-inner-padding;
  width: 100%;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: $input-padding;
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;

  button {
    align-items: center;
    background-color: var(--background-color);
    border-radius: $btn-border-radius;
    display: flex;
    gap: $whitespace;
    overflow: hidden;
    padding: calc($input-padding / 2);

    span {
      /* text-overflow doesn't work on flex elements */
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}

.poll-editor {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;

  input[type="text"] {
    border: 1px solid var(--separator-color);
    border-radius: $btn-border-radius;
  }
}

.poll-settings {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2) $block-inner-padding;
  padding: $input-padding;

  > div {
    align-items: center;
    display: flex;
    gap: calc($block-inner-padding / 2);
  }

  input[type="number"] {
    border: 1px solid var(--separator-color);
    border-radius: $btn-border-radius;
    width: 70px;
  }
}

.preview {
  padding: $block-inner-padding;
}

.attachments {
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;
}

.toolbar {
  @include post-icon;

  align-items: center;
  border-radius: 0 0 $block-border-radius $block-border-radius;
  border-top: 1px solid var(--separator-color);
  color: var(--secondary-text-color);
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: calc($block-inner-padding / 2);
  justify-content: right;
  padding: calc($block-inner-padding / 1.5) $block-inner-padding;

  .toolbar-space {
    flex-grow: 1;
  }

  .loader {
    --loader-size: #{$icon-size};
    --loader-width: 2px;
  }

  .icon.warning {
    color: $warning-color;

    svg {
      stroke: $warning-color;
    }
  }
}

.submit-reply-btn-wrapper {
  display: flex;
  flex-direction: row;
  gap: inherit;

  .btn-small {
    font-weight: bold;
    margin-left: calc($block-inner-padding / 2);

    &[type="submit"] {
      color: var(--link-color);

      &:hover {
        color: var(--link-hover-color);
      }
    }

    &[disabled],
    &[disabled]:hover {
      color: var(--btn-disabled-text-color);
      cursor: initial;
    }

    @media screen and (max-width: $screen-breakpoint-x-small) {
      margin-left: 0;
    }
  }
}

.dropdown-menu-wrapper {
  @include block-dropdown-menu;

  button.icon {
    gap: calc($block-inner-padding / 2);
  }
}

.submit-btn-wrapper {
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: $block-outer-padding;
  justify-content: flex-end;
  margin-top: calc($block-inner-padding / 1.5);

  .error-message {
    color: $error-color;
    margin-right: $block-inner-padding;
  }
}
</style>
