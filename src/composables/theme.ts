import { ref } from "vue"

import { updateClientConfig } from "@/api/settings"
import { useCurrentUser } from "@/composables/user"
import { APP_NAME } from "@/constants"

enum Theme {
  Light = "light",
  Dark = "dark",
}

function defaultTheme(): Theme {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return Theme.Dark
  } else {
    return Theme.Light
  }
}

const currentTheme = ref(defaultTheme())

export function useTheme() {

  function setTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme)
    currentTheme.value = theme
  }

  async function persistTheme(theme: Theme) {
    const {
      ensureAuthToken,
      ensureCurrentUser,
      setCurrentUser,
    } = useCurrentUser()
    const currentUser = ensureCurrentUser()
    let clientConfig = currentUser.client_config[APP_NAME] || {}
    clientConfig = { ...clientConfig, theme }
    const authToken = ensureAuthToken()
    const user = await updateClientConfig(authToken, clientConfig)
    setCurrentUser(user)
  }

  function loadTheme() {
    const { currentUser } = useCurrentUser()
    const clientConfig = currentUser.value?.client_config[APP_NAME] || {}
    const theme = clientConfig.theme || defaultTheme()
    setTheme(theme as Theme)
  }

  async function toggleDarkMode() {
    let theme
    if (currentTheme.value === Theme.Light) {
      theme = Theme.Dark
    } else {
      theme = Theme.Light
    }
    setTheme(theme)
    await persistTheme(theme)
  }

  return {
    loadTheme,
    toggleDarkMode,
  }
}
