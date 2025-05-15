<template>
  <div
    class="post-content"
    ref="postContentElement"
    v-html="post.content"
  ></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import { replaceShortcodes } from "@/api/emojis"
import { Post } from "@/api/posts"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"
import { addGreentext } from "@/utils/greentext"
import { replaceTextNodes } from "@/utils/html"

const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser } = useCurrentUser()

const props = defineProps<{
  post: Post,
}>()

const postContentElement = ref<HTMLElement | null>(null)

onMounted(() => {
  replaceText()
  if (currentUser.value !== null) {
    configureInlineLinks()
  }
})

function replaceText() {
  if (postContentElement.value === null) {
    return
  }
  replaceTextNodes(postContentElement.value, addGreentext)
  replaceTextNodes(postContentElement.value, (text: string) => {
    return replaceShortcodes(text, props.post.emojis)
  })
}

function configureInlineLinks() {
  if (postContentElement.value === null) {
    return
  }
  const mentions = postContentElement.value.getElementsByClassName("mention")
  for (const mentionElement of Array.from(mentions)) {
    if (!(mentionElement instanceof HTMLElement)) {
      continue
    }
    const mention = props.post.mentions
      .find((mention) => mentionElement.getAttribute("href") === mention.url)
    if (mention) {
      mentionElement.addEventListener("click", (event: Event) => {
        event.preventDefault()
        router.push(getActorLocation("profile", mention))
      })
      mentionElement.dataset.internalLink = "true"
    }
  }
  const hashtags = postContentElement.value.querySelectorAll('.hashtag, [rel~="tag"]')
  for (const hashtagElement of Array.from(hashtags)) {
    if (!(hashtagElement instanceof HTMLElement)) {
      continue
    }
    const hashtag = props.post.tags
      .find((tag) => {
        const innerText = (hashtagElement as HTMLElement).innerText
        return innerText.toLowerCase() === `#${tag.name}`
      })
    if (hashtag) {
      hashtagElement.addEventListener("click", (event: Event) => {
        event.preventDefault()
        router.push({ name: "tag", params: { tagName: hashtag.name } })
      })
      hashtagElement.dataset.internalLink = "true"
    }
  }
  for (const linkedPost of props.post.links) {
    const links = postContentElement.value.querySelectorAll("a")
    for (const linkElement of Array.from(links)) {
      if (linkedPost.uri === linkElement.getAttribute("href")) {
        linkElement.addEventListener("click", (event: Event) => {
          event.preventDefault()
          router.push({ name: "post", params: { postId: linkedPost.id } })
        })
        linkElement.dataset.internalLink = "true"
      }
    }
  }
  const links = postContentElement.value.querySelectorAll("a")
  for (const linkElement of links) {
    if (linkElement.dataset.internalLink !== "true") {
      linkElement.target = "_blank"
    }
  }
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
@import "../styles/mixins";

.post-content {
  color: var(--text-color);
  line-height: 1.5;
  text-align: initial;
  word-wrap: break-word;

  :deep(p) {
    /* 'plaintext' may not work: https://stackoverflow.com/questions/78885123/unicode-bidi-plaintext-not-working-in-firefox */
    unicode-bidi: plaintext;
    white-space: pre-wrap;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6),
  :deep(p),
  :deep(blockquote),
  :deep(ul),
  :deep(ol),
  :deep(hr),
  :deep(pre) {
    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  :deep(h1) {
    font-size: 1.6rem;
  }

  :deep(h2) {
    font-size: 1.4rem;
  }

  :deep(h3) {
    font-size: 1.2em;
  }

  :deep(h4),
  :deep(h5),
  :deep(h6) {
    font-size: 1rem;
  }

  :deep(a) {
    @include block-external-link;

    /* data-object-link is set by configureInlineLinks() */
    &[data-internal-link="true"] {
      @include block-link;
    }
  }

  :deep(pre),
  :deep(:not(pre) > code) {
    background-color: var(--widget-background-color);
    overflow-x: auto;
  }

  :deep(pre) {
    margin: 1rem 0;
    padding: $input-padding;
  }

  :deep(:not(pre) > code) {
    padding: $whitespace;
  }

  :deep(ul),
  :deep(ol) {
    padding-inline-start: 1rem;
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(.greentext) {
    color: $greentext-color;
  }

  :deep(blockquote) {
    border-inline-start: 3px solid var(--secondary-text-color);
    padding-inline-start: $input-padding;
  }

  :deep(.emoji) {
    @include emoji-zoom;

    height: $emoji-size-em;
    max-width: $emoji-size * 3;
  }
}
</style>
