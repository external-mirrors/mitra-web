<template>
  {{ humanizeDate(date) }}
</template>

<script setup lang="ts">
import { DateTime } from "luxon"
import { onUnmounted, ref } from "vue"
import { useI18n } from "vue-i18n"

const { locale, t } = useI18n({ useScope: "global" })

const props = defineProps<{
  date: string,
  preset?: "full" | "short",
}>()

const currentTime = ref(DateTime.now())
// Triggers re-render every 5 seconds
const clock = setInterval(() => {
  currentTime.value = DateTime.now()
}, 5000)

function humanizeDate(isoDate: string): string {
  const preset = props.preset || "full"
  const date = DateTime.fromISO(isoDate).setLocale(locale.value)
  const now = currentTime.value
  if (now < date) {
    const diff = date.diff(now)
    if (diff.as("minutes") < 60) {
      const minutes = Math.round(diff.as("minutes"))
      return t(`timestamp.${preset}.future_minutes`, { n: minutes }, minutes)
    } else if (diff.as("hours") < 24) {
      const hours = Math.round(diff.as("hours"))
      return t(`timestamp.${preset}.future_hours`, { n: hours }, hours)
    } else if (diff.as("days") < 7) {
      const days = Math.round(diff.as("days"))
      return t(`timestamp.${preset}.future_days`, { n: days }, days)
    } else if (date.year === now.year) {
      return date.toLocaleString({ ...DateTime.DATE_MED, year: undefined })
    } else {
      return date.toLocaleString(DateTime.DATE_MED)
    }
  }
  const diff = now.diff(date)
  if (diff.as("minutes") < 60) {
    const minutes = Math.round(diff.as("minutes"))
    return t(`timestamp.${preset}.past_minutes`, { n: minutes }, minutes)
  } else if (diff.as("hours") < 24) {
    const hours = Math.round(diff.as("hours"))
    return t(`timestamp.${preset}.past_hours`, { n: hours }, hours)
  } else if (diff.as("days") < 7) {
    const days = Math.round(diff.as("days"))
    return t(`timestamp.${preset}.past_days`, { n: days }, days)
  } else if (date.year === now.year) {
    return date.toLocaleString({ ...DateTime.DATE_MED, year: undefined })
  } else {
    return date.toLocaleString(DateTime.DATE_MED)
  }
}

onUnmounted(() => {
  clearInterval(clock)
})
</script>
