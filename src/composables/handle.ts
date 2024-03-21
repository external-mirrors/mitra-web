import { Mention } from "@/api/posts"
import { Profile } from "@/api/users"
import { useInstanceInfo } from "@/composables/instance"

export function useActorHandle() {
  const { instance } = useInstanceInfo()

  function getActorAddress(profile: Profile | Mention): string {
    if (profile.acct.includes("@")) {
      // Remote account
      return `${profile.acct}`
    }
    if (instance.value === null) {
      return `${profile.username}`
    }
    return `${profile.username}@${instance.value.uri}`
  }

  return {
    getActorAddress,
  }
}
