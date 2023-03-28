import { ref } from "vue"

const THEME_STORAGE_KEY = "theme"

enum Theme {
  Light = "light",
  Dark = "dark",
}

const currentTheme = ref(Theme.Light)

export function useTheme() {

  function setTheme(theme: Theme) {
    document.documentElement.setAttribute("data-theme", theme)
    currentTheme.value = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }

  function loadTheme() {
    const theme = localStorage.getItem(THEME_STORAGE_KEY) || Theme.Light
    setTheme(theme as Theme)
  }

  function toggleDarkMode() {
    if (currentTheme.value === Theme.Light) {
      setTheme(Theme.Dark)
    } else {
      setTheme(Theme.Light)
    }
  }

  return {
    loadTheme,
    toggleDarkMode,
  }
}
