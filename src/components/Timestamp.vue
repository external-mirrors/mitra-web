<template>
  {{ humanizeDate(date) }}
</template>

<script setup lang="ts">
import { DateTime } from "luxon"
import { useI18n } from "vue-i18n"

const { t } = useI18n({ useScope: "global" })

defineProps<{
  date: string,
}>()

function humanizeDate(isoDate: string): string {
  const date = DateTime.fromISO(isoDate)
  const now = DateTime.now()
  const diff = now.diff(date)
  if (diff.as("minutes") < 60) {
    const minutes = Math.round(diff.as("minutes"))
    return t("post.timestamp_minutes", { n: minutes }, minutes)
  } else if (diff.as("hours") < 24) {
    const hours = Math.round(diff.as("hours"))
    return t("post.timestamp_hours", { n: hours }, hours)
  } else if (diff.as("days") < 7) {
    const days = Math.round(diff.as("days"))
    return t("post.timestamp_days", { n: days }, days)
  } else if (date.year === now.year) {
    return date.toFormat("dd LLL")
  } else {
    return date.toFormat("dd LLL y")
  }
}
</script>
