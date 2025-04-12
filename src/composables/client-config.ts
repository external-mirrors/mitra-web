import { computed } from "vue"

import { Visibility } from "@/api/posts"
import { updateClientConfig } from "@/api/settings"
import { ClientConfigValue } from "@/api/users"
import { useCurrentUser } from "@/composables/user"
import { APP_NAME } from "@/constants"

export enum ConfigKey {
  Locale = "locale",
  Theme = "theme",
  ContentWarningsEnabled = "contentWarningsEnabled",
  DefaultVisibility = "defaultVisibility",
  CtrlEnterEnabled = "ctrlEnterEnabled",
  ConversationNewTabEnabled = "conversationNewTabEnabled",
}

export function useClientConfig() {

  function getClientConfigKey(
    key: ConfigKey,
  ): ClientConfigValue | undefined {
    const { currentUser } = useCurrentUser()
    const clientConfig = currentUser.value?.client_config[APP_NAME] || {}
    const value = clientConfig[key]
    return value
  }

  function getClientConfigKeyOrDefault<T extends ClientConfigValue>(
    key: ConfigKey,
    defaultValue: T,
  ): T {
    const value = getClientConfigKey(key) ?? defaultValue
    return value as T
  }

  async function setClientConfigKey(
    key: ConfigKey,
    value: ClientConfigValue,
  ) {
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
    return getClientConfigKeyOrDefault(ConfigKey.ContentWarningsEnabled, true)
  })

  const ctrlEnterEnabled = computed(() => {
    return getClientConfigKeyOrDefault(ConfigKey.CtrlEnterEnabled, false)
  })

  const conversationNewTab = computed(() => {
    return getClientConfigKeyOrDefault(ConfigKey.ConversationNewTabEnabled, false)
  })

  const defaultVisibility = computed<Visibility>(() => {
    return getClientConfigKeyOrDefault(ConfigKey.DefaultVisibility, Visibility.Public)
  })

  return {
    getClientConfigKey,
    setClientConfigKey,
    contentWarningsEnabled,
    ctrlEnterEnabled,
    defaultVisibility,
    conversationNewTab,
  }
}
