import { ref } from "vue"

import { updateClientConfig } from "@/api/settings"
import { APP_NAME } from "@/constants"
import { useCurrentUser } from "@/store/user"

enum Theme {
  Light = "light",
  Dark = "dark",
}

const currentTheme = ref(Theme.Light)

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
    const { ensureCurrentUser } = useCurrentUser()
    const currentUser = ensureCurrentUser()
    const clientConfig = currentUser.client_config[APP_NAME] || {}
    const theme = clientConfig.theme || Theme.Light
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
