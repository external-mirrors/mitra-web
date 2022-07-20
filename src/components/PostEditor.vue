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
        ref="postFormContent"
        v-model="content"
        rows="1"
        required
        :placeholder="inReplyTo ? 'Your reply' : 'What\'s on your mind?'"
      ></textarea>
      <div v-if="attachment" class="attachment">
        <img :src="attachment.url">
      </div>
      <div class="toolbar">
        <button
          type="button"
          class="icon"
          title="Attach image"
          @click="selectAttachment()"
        >
          <img :src="require('@/assets/feather/paperclip.svg')">
          <input
            type="file"
            ref="attachmentUploadInput"
            accept="image/*"
            style="display: none;"
            @change="uploadAttachment($event.target.files)"
          >
        </button>
        <div
          class="dropdown-menu-wrapper"
          v-click-away="hideVisibilityMenu"
        >
          <button
            type="button"
            class="icon"
            title="Post visibility"
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
        :disabled="getCharacterCount() < 0"
        @click.prevent="publish()"
      >Publish</button>
    </div>
  </form>
</template>

<script lang="ts">
import { Options, Vue, setup } from "vue-class-component"
import { Prop } from "vue-property-decorator"

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

@Options({
  components: {
    Avatar,
    VisibilityIcon,
  },
})
export default class PostEditor extends Vue {

  @Prop()
  inReplyTo: Post | null = null

  content = ""
  attachment: Attachment | null = null
  visibility = Visibility.Public
  mentions: string[] = []

  visibilityMenuVisible = false
  errorMessage: string | null = null

  $refs!: {
    postFormContent: HTMLTextAreaElement,
    attachmentUploadInput: HTMLInputElement,
  }

  private store = setup(() => {
    const { currentUser, ensureAuthToken } = useCurrentUser()
    const { instance, getActorAddress } = useInstanceInfo()
    return { currentUser, ensureAuthToken, instance, getActorAddress }
  })

  get author(): User | null {
    return this.store.currentUser
  }

  created() {
    if (this.inReplyTo) {
      const mentions: Mention[] = [
        this.inReplyTo.account,
        ...this.inReplyTo.mentions,
      ]
      this.content = mentions
        .filter(mention => mention.id !== this.store.currentUser?.id)
        .map(mention => "@" + this.store.getActorAddress(mention))
        // Remove duplicates
        .filter((mention, index, mentions) => mentions.indexOf(mention) === index)
        .join(" ")
    }
    if (this.inReplyTo && this.inReplyTo.visibility !== Visibility.Public) {
      this.visibility = Visibility.Direct
    }
  }

  mounted() {
    setupAutoResize(this.$refs.postFormContent)
  }

  selectAttachment() {
    this.$refs.attachmentUploadInput.click()
  }

  async uploadAttachment(files: FileList) {
    const imageDataUrl = await fileToDataUrl(files[0])
    const imageBase64 = dataUrlToBase64(imageDataUrl)
    this.attachment = await uploadAttachment(
      this.store.ensureAuthToken(),
      imageBase64,
    )
  }

  get visibilityMap() {
    return Object.entries(VISIBILITY_MAP)
  }

  toggleVisibilityMenu() {
    this.visibilityMenuVisible = !this.visibilityMenuVisible
  }

  hideVisibilityMenu() {
    this.visibilityMenuVisible = false
  }

  getCharacterCount(): number {
    if (!this.store.instance) {
      return 0
    }
    return (this.store.instance.post_character_limit - this.content.length)
  }

  async publish() {
    const content = renderMarkdownLite(this.content)
    const postData = {
      content,
      in_reply_to_id: this.inReplyTo ? this.inReplyTo.id : null,
      visibility: this.visibility,
      mentions: this.mentions,
    }
    let post
    try {
      post = await createPost(
        this.store.ensureAuthToken(),
        postData,
        this.attachment,
      )
    } catch (error: any) {
      this.errorMessage = error.message
      return
    }
    // Refresh editor
    this.errorMessage = null
    this.attachment = null
    this.content = ""
    this.$nextTick(() => {
      triggerResize(this.$refs.postFormContent)
    })
    this.$emit("post-created", post)
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
    margin-top: $line-height * 1em / 2;
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

.attachment {
  padding: $block-inner-padding / 1.5 $block-inner-padding;

  img {
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
  gap: $block-inner-padding / 2;
  padding: $block-inner-padding / 1.5 $block-inner-padding;

  .character-counter {
    font-weight: bold;
    margin-left: auto;
  }

  .submit-btn-small {
    font-weight: bold;
    margin-left: $block-inner-padding;
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
  margin-top: $block-inner-padding / 1.5;

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
