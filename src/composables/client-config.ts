import { computed } from "vue"

import { updateClientConfig } from "@/api/settings"
import { useCurrentUser } from "@/composables/user"
import { APP_NAME } from "@/constants"

export enum ConfigKey {
  Theme = "theme",
  ContentWarningsEnabled = "contentWarningsEnabled",
}

export function useClientConfig() {

  function getClientConfigKey(key: ConfigKey): any {
    const { currentUser } = useCurrentUser()
    const clientConfig = currentUser.value?.client_config[APP_NAME] || {}
    const value = clientConfig[key]
    return value
  }

  async function setClientConfigKey(key: ConfigKey, value: any) {
    const {
      ensureAuthToken,
      ensureCurrentUser,
      setCurrentUser,
    } = useCurrentUser()
    const currentUser = ensureCurrentUser()
    const clientConfig = currentUser.client_config[APP_NAME] || {}
    clientConfig[key] = value
    const authToken = ensureAuthToken()
    const user = await updateClientConfig(authToken, clientConfig)
    setCurrentUser(user)
  }

  const contentWarningsEnabled = computed(() => {
    return getClientConfigKey(ConfigKey.ContentWarningsEnabled) ?? true
  })

  return {
    getClientConfigKey,
    setClientConfigKey,
    contentWarningsEnabled,
  }
}
