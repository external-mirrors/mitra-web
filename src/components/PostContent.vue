<template>
  <div
    class="post-content"
    :class="{ collapsed }"
  >
    <div
      v-if="collapsed"
      class="post-content-overlay"
      @click.stop.prevent="collapsed = false"
    >
      <button type="button">
        {{ $t('post.show_more') }}
      </button>
    </div>
    <div
      class="post-content-html"
      ref="postContentElement"
      v-html="post.content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useRouter } from "vue-router"

import { replaceShortcodes } from "@/api/emojis"
import { Post } from "@/api/posts"
import { useActorHandle } from "@/composables/handle"
import { useCurrentUser } from "@/composables/user"
import { addGreentext, addRedtext } from "@/utils/greentext"
import { htmlToText, replaceTextNodes } from "@/utils/html"

const POST_CONTENT_LIMIT = 1500

const router = useRouter()
const { getActorLocation } = useActorHandle()
const { currentUser } = useCurrentUser()

const props = defineProps<{
  post: Post,
  collapse?: boolean,
}>()

const collapsed = ref(props.collapse && htmlToText(props.post.content).length > POST_CONTENT_LIMIT)
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
  replaceTextNodes(postContentElement.value, addRedtext)
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
    if (!(mentionElement instanceof HTMLAnchorElement)) {
      continue
    }
    const mention = props.post.mentions
      .find((mention) => mentionElement.getAttribute("href") === mention.url)
    if (mention) {
      mentionElement.addEventListener("click", (event: Event) => {
        event.preventDefault()
        router.push(getActorLocation("profile", mention))
      })
      mentionElement.href = router
        .resolve(getActorLocation("profile", mention))
        .href
      mentionElement.dataset.internalLink = "true"
    }
  }
  const hashtags = postContentElement.value.querySelectorAll('.hashtag, [rel~="tag"]')
  for (const hashtagElement of Array.from(hashtags)) {
    if (!(hashtagElement instanceof HTMLAnchorElement)) {
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
      hashtagElement.href = router
        .resolve({ name: "tag", params: { tagName: hashtag.name } })
        .href
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
        linkElement.href = router
          .resolve({ name: "post", params: { postId: linkedPost.id } })
          .href
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
  position: relative;

  &.collapsed {
    max-height: 30em;
    overflow: hidden;

    .post-content-html {
      mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 1) 75%, rgba(0, 0, 0, 0) 100%);
      max-height: inherit;
    }
  }
}

.post-content-overlay {
  align-items: end;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  position: absolute;
  width: calc(100% - 2 * $block-inner-padding);
  z-index: 1;

  button {
    background-color: var(--widget-background-color);
    border-radius: $btn-border-radius;
    margin-bottom: $input-padding;
    padding: $input-padding;
  }
}

.post-content-html {
  color: var(--text-color);
  line-height: 1.5;
  text-align: initial;
  /* This can't be changed to `preserve` because some servers produce HTML with \n in it */
  white-space-collapse: collapse;
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
  :deep(table),
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

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(li) {
    /* Works for list items without ul/ol parent */
    list-style-position: inside;
  }

  :deep(li p) {
    /* https://stackoverflow.com/questions/72984723/css-list-style-position-makes-line-breaks-when-i-dont-want-it */
    display: inline;
  }

  :deep(dd) {
    margin-inline-start: 1rem;
  }

  :deep(table) {
    word-break: break-all;
  }

  :deep(td),
  :deep(th) {
    padding: $whitespace;
    text-align: left;
  }

  :deep(td:first-child),
  :deep(th:first-child) {
    padding-left: 0;
  }

  :deep(td:last-child),
  :deep(th:last-child) {
    padding-right: 0;
  }

  :deep(tr:not(:last-child)) {
    border-bottom: 1px solid var(--separator-color);
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

  :deep(.greentext) {
    color: var(--greentext-color);
  }

  :deep(.redtext) {
    color: var(--redtext-color);
  }
}
</style>
