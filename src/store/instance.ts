import { ref } from "vue"

import { InstanceInfo, getInstanceInfo } from "@/api/instance"

const instance = ref<InstanceInfo | null>(null)

export function useInstanceInfo() {

  async function loadInstanceInfo(): Promise<void> {
    instance.value = await getInstanceInfo()
  }

  return {
    instance,
    loadInstanceInfo,
  }
}
