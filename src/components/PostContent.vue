<template>
  <div class="post-content" ref="postContentRef" v-html="getContent()"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { replaceShortcodes } from "@/api/emojis"
import { Post } from "@/api/posts"
import { useCurrentUser } from "@/composables/user"
import { addGreentext } from "@/utils/greentext"

const router = useRouter()
const { currentUser } = $(useCurrentUser())

/* eslint-disable-next-line no-undef */
const props = defineProps<{
  post: Post,
}>()

const postContentRef = $ref<HTMLElement | null>(null)

onMounted(() => {
  if (currentUser !== null) {
    configureInlineLinks()
  }
})

function configureInlineLinks() {
  if (postContentRef === null) {
    return
  }
  const mentions = postContentRef.getElementsByClassName("mention")
  for (const mentionElement of Array.from(mentions)) {
    const mention = props.post.mentions
      .find((mention) => mentionElement.getAttribute("href") === mention.url)
    if (mention) {
      mentionElement.addEventListener("click", (event: Event) => {
        event.preventDefault()
        router.push({ name: "profile-by-acct", params: { acct: mention.acct } })
      })
    }
  }
  const hashtags = postContentRef.getElementsByClassName("hashtag")
  for (const hashtagElement of Array.from(hashtags)) {
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
    }
  }
  for (const linkedPost of props.post.links) {
    const links = postContentRef.querySelectorAll("a")
    for (const linkElement of Array.from(links)) {
      if (linkedPost.uri === linkElement.getAttribute("href")) {
        linkElement.addEventListener("click", (event: Event) => {
          event.preventDefault()
          router.push({ name: "post", params: { postId: linkedPost.id } })
        })
      }
    }
  }
}

function getContent(): string {
  let content = addGreentext(props.post.content)
  // Replace emoji shortcodes
  content = replaceShortcodes(content, props.post.emojis)
  return content
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
@import "../styles/mixins";

.post-content {
  color: var(--text-color);
  line-height: 1.5;
  padding: $block-inner-padding;
  word-wrap: break-word;

  :deep(p) {
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
    @include block-link;
  }

  :deep(pre),
  :deep(code) {
    overflow-x: auto;
  }

  :deep(ul),
  :deep(ol) {
    list-style-position: inside;
  }

  :deep(ul) {
    list-style-type: disc;
  }

  :deep(.greentext) {
    color: $greentext-color;
  }

  :deep(blockquote) {
    color: $greentext-color;

    &::before {
      content: ">";
      float: left;
    }
  }

  :deep(.emoji) {
    height: 24px;
    vertical-align: text-bottom;
    width: 24px;

    &:hover {
      height: 48px;
      transition: 100ms linear;
      transition-delay: 0.5s;
      width: 48px;
    }
  }
}
</style>
