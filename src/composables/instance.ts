import { ref } from "vue"

import { BlockchainInfo, InstanceInfo, getInstanceInfo } from "@/api/instance"
import { Mention } from "@/api/posts"
import { Profile } from "@/api/users"

const instance = ref<InstanceInfo | null>(null)

export function useInstanceInfo() {

  async function loadInstanceInfo(): Promise<void> {
    instance.value = await getInstanceInfo()
  }

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

  function getBlockchainInfo(): BlockchainInfo | null {
    return instance.value?.blockchains[0] || null
  }

  return {
    instance,
    loadInstanceInfo,
    getActorAddress,
    getBlockchainInfo,
  }
}
