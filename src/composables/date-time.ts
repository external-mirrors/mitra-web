import { DateTime } from "luxon"
import { useI18n } from "vue-i18n"

export function useDateTime() {
  const { locale } = useI18n({ useScope: "global" })

  function formatDate(isoDate: string): string {
    const date = DateTime.fromISO(isoDate).setLocale(locale.value)
    return date.toLocaleString()
  }

  function formatDateTime(isoDate: string): string {
    const date = DateTime.fromISO(isoDate).setLocale(locale.value)
    return date.toLocaleString(DateTime.DATETIME_FULL)
  }

  return {
    formatDate,
    formatDateTime,
  }
}
