import { useI18n } from "vue-i18n"

import { useClientConfig, ConfigKey } from "@/composables/client-config"

const LANGUAGES = [
  "de",
  "en",
  "nl",
  "zh-Hans",
]

export const LOCALE_MAP = Object.fromEntries(LANGUAGES.map((code) => {
  const nameGenerator = new Intl.DisplayNames(code, { type: "language" })
  return [code, nameGenerator.of(code)]
}))

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
