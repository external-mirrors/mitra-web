import { DateTime } from "luxon"

export function formatDate(isoDate: string): string {
  const date = DateTime.fromISO(isoDate)
  return date.toLocaleString()
}

export function formatDateTime(isoDate: string): string {
  const date = DateTime.fromISO(isoDate)
  return date.toLocaleString(DateTime.DATETIME_FULL)
}

export function isPastDate(isoDate: string): boolean {
  const date = DateTime.fromISO(isoDate)
  return date < DateTime.now()
}
