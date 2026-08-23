import { useInstanceInfo } from "@/composables/instance"
import { useCurrentUser } from "@/composables/user"

export function useGuards() {
  function canViewFederatedTimeline(): boolean {
    const { instance } = useInstanceInfo()
    const { isAdmin } = useCurrentUser()
    const federatedTimelineRestricted = instance.value?.configuration.timelines_access.live_feeds.remote === "restricted"
    return !federatedTimelineRestricted || isAdmin()
  }

  return {
    canViewFederatedTimeline,
  }
}
