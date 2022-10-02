<template>
  <div class="post-content" ref="postContentRef" v-html="getContent()"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { $, $ref } from "vue/macros"
import { useRouter } from "vue-router"

import { Post } from "@/api/posts"
import { useCurrentUser } from "@/store/user"
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
        router.push({ name: "profile", params: { profileId: mention.id } })
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
  const quote = props.post.quote
  if (quote) {
    const links = postContentRef.querySelectorAll("a")
    for (const linkElement of Array.from(links)) {
      if (quote.uri === linkElement.getAttribute("href")) {
        linkElement.addEventListener("click", (event: Event) => {
          event.preventDefault()
          router.push({ name: "post", params: { postId: quote.id } })
        })
      }
    }
  }
}

function getContent(): string {
  const content = addGreentext(props.post.content)
  return content
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
@import "../styles/mixins";

.post-content {
  color: $text-color;
  line-height: 1.5;
  padding: $block-inner-padding;
  word-wrap: break-word;

  :deep(a) {
    @include block-link;
  }

  :deep(pre),
  :deep(code) {
    overflow-x: scroll;
  }

  :deep(ul),
  :deep(ol) {
    list-style-position: inside;
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
}
</style>
