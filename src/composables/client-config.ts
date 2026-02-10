import { computed } from "vue"

import { Visibility } from "@/api/posts"
import { updateClientConfig } from "@/api/settings"
import { updateProfile, ClientConfigValue } from "@/api/users"
import { useCurrentUser } from "@/composables/user"
import { APP_NAME } from "@/constants"

export enum ConfigKey {
  Locale = "locale",
  Theme = "theme",
  ContentWarningsEnabled = "contentWarningsEnabled",
  DefaultVisibility = "defaultVisibility",
  CtrlEnterEnabled = "ctrlEnterEnabled",
  ConversationNewTabEnabled = "conversationNewTabEnabled",
  NotificationPollingEnabled = "notificationPollingEnabled",
  ShortPostTimestamp = "shortPostTimestamp",
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

  const shortPostTimestamp = computed(() => {
    return getClientConfigKeyOrDefault(ConfigKey.ShortPostTimestamp, false)
  })

  const notificationPollingEnabled = computed(() => {
    return getClientConfigKeyOrDefault(ConfigKey.NotificationPollingEnabled, false)
  })

  const defaultVisibility = computed<Visibility>(() => {
    const { ensureCurrentUser } = useCurrentUser()
    return ensureCurrentUser().source.privacy
  })

  async function setDefaultVisibility(visibility: Visibility) {
    const { ensureAuthToken, setCurrentUser } = useCurrentUser()
    const authToken = ensureAuthToken()
    const user = await updateProfile(authToken, { source: { privacy: visibility } })
    setCurrentUser(user)
  }

  return {
    getClientConfigKey,
    setClientConfigKey,
    contentWarningsEnabled,
    ctrlEnterEnabled,
    defaultVisibility,
    setDefaultVisibility,
    conversationNewTab,
    shortPostTimestamp,
    notificationPollingEnabled,
  }
}
