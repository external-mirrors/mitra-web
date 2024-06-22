import { useI18n } from "vue-i18n"

import { useClientConfig, ConfigKey } from "@/composables/client-config"

export const SUPPORTED_LOCALES = {
  en: "English",
  fr: "Français",
}

export function useLocales() {
  const { availableLocales, locale, setLocaleMessage } = useI18n({ useScope: "global" })
  const { getClientConfigKey, setClientConfigKey } = useClientConfig()

  async function loadLocaleMessages(locale: string) {
    const messages = await import(`@/locales/${locale}.json`)
    setLocaleMessage(locale, messages.default)
  }

  function getPreferredLocale(): string {
    const value = getClientConfigKey(ConfigKey.Locale) || "en"
    return value as string
  }

  async function changeLocale(newLocale: string) {
    if (!availableLocales.includes(newLocale)) {
      await loadLocaleMessages(newLocale)
    }
    locale.value = newLocale
  }

  async function changePreferredLocale(newLocale: string) {
    await changeLocale(newLocale)
    await setClientConfigKey(
      ConfigKey.Locale,
      newLocale,
    )
  }

  return {
    getPreferredLocale,
    changeLocale,
    changePreferredLocale,
  }
}
