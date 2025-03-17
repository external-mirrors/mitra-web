<template>
  <form class="post-poll" @submit.prevent="onVote()">
    <div
      v-for="(option, index) in poll.options"
      class="poll-option"
      :style="`--option-share: ${getOptionShare(index)}%`"
      :class="{ 'poll-option-share': resultsVisible }"
      :key="option.title"
    >
      <input
        v-if="currentUser !== null && poll.multiple"
        type="checkbox"
        v-model="choices"
        :id="`poll-${poll.id}-${index}`"
        :name="`poll-${poll.id}`"
        :value="index"
        :disabled="!canVote()"
      >
      <input
        v-else-if="currentUser !== null && !poll.multiple"
        type="radio"
        v-model="choices[0]"
        :id="`poll-${poll.id}-${index}`"
        :name="`poll-${poll.id}`"
        :value="index"
        :disabled="!canVote()"
      >
      <label :for="`poll-${poll.id}-${index}`" v-html="getOptionName(option)"></label>
      <div
        v-if="resultsVisible"
        class="poll-option-count"
        :title="$t('poll.num_votes', { n: option.votes_count })"
      >
        {{ getOptionShare(index) }}%
      </div>
    </div>
    <div class="poll-footer">
      <button
        v-if="canVote()"
        type="submit"
        class="btn secondary"
        :disabled="choices.length === 0"
      >
        {{ $t('poll.vote') }}
      </button>
      <span v-if="poll.multiple">{{ $t('poll.multiple_choices') }}</span>
      <span v-if="poll.expired">{{ $t('poll.closed') }}</span>
      <span v-else :title="formatDateTime(poll.expires_at)">
        <i18n-t keypath="poll.ends" scope="global">
          <timestamp :date="poll.expires_at"></timestamp>
        </i18n-t>
      </span>
      <span v-if="!resultsVisible">
        <button @click="resultsRevealed = true">
          {{ $t('poll.see_results') }}
        </button>
      </span>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"

import { replaceShortcodes } from "@/api/emojis"
import { vote, Poll, PollOption } from "@/api/polls"
import { Profile } from "@/api/users"
import Timestamp from "@/components/Timestamp.vue"
import { useCurrentUser } from "@/composables/user"
import { formatDateTime } from "@/utils/dates"

const props = defineProps<{
  poll: Poll,
  author: Profile,
}>()

/* eslint-disable-next-line func-call-spacing */
const emit = defineEmits<{
  (event: "poll-updated", poll: Poll): void,
}>()

const { currentUser, ensureAuthToken } = useCurrentUser()

const resultsRevealed = ref(false)
const choices = ref<number[]>([])

if (props.poll.own_votes !== null) {
  choices.value = props.poll.own_votes
}

const resultsVisible = computed(() => {
  return (
    !canVote() ||
    currentUser.value?.id === props.author.id ||
    resultsRevealed.value
  )
})

function getOptionName(option: PollOption): string {
  // HTML is cleaned by the server
  return replaceShortcodes(option.title, props.poll.emojis)
}

function getOptionShare(optionIndex: number): number {
  const option = props.poll.options[optionIndex]
  if (props.poll.votes_count === 0) {
    return 0
  } else {
    const share = option.votes_count / props.poll.votes_count * 100
    return Math.round(share)
  }
}

function canVote(): boolean {
  return currentUser.value !== null && !props.poll.expired && !props.poll.voted
}

async function onVote(): Promise<void> {
  const authToken = ensureAuthToken()
  const poll = await vote(authToken, props.poll.id, choices.value)
  emit("poll-updated", poll)
}
</script>

<style scoped lang="scss">
@import "../styles/layout";
@import "../styles/theme";
@import "../styles/mixins";

.post-poll {
  display: flex;
  flex-direction: column;
  gap: calc($block-inner-padding / 2);
}

.poll-option {
  align-items: center;
  border: 1px solid var(--separator-color);
  border-radius: $btn-border-radius;
  display: flex;
  gap: calc($block-inner-padding / 2);
  padding: calc($block-inner-padding / 2);

  label {
    @include emoji-inline;
  }
}

.poll-option-share {
  background-image: linear-gradient(to right, var(--background-color) var(--option-share), rgba(0, 0, 0, 0) var(--option-share));
}

.poll-option-count {
  margin-left: auto;
}

.poll-footer {
  @include block-btn;

  color: var(--secondary-text-color);

  button[type="submit"] {
    margin-right: calc($block-inner-padding / 2);
  }

  span:not(:first-of-type)::before {
    content: "·";
    margin: 0 $whitespace;
  }
}
</style>
