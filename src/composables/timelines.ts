import { ref } from "vue"
import { Post } from "@/api/posts"

interface TimelineState {
    posts: Post[],
    offset: number,
    marker: string | null,
}

const homeTimelineState = ref<TimelineState | null>(null)

export function useTimelineState() {
  return {
    homeTimelineState,
  }
}
