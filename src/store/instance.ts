import { ref } from "vue"

import { InstanceInfo, getInstanceInfo } from "@/api/instance"
import { Profile } from "@/api/users"

const instance = ref<InstanceInfo | null>(null)

export function useInstanceInfo() {

  async function loadInstanceInfo(): Promise<void> {
    instance.value = await getInstanceInfo()
  }

  function getActorAddress(profile: Profile): string {
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
    instance,
    loadInstanceInfo,
    getActorAddress,
  }
}
