import { DateTime } from "luxon"

export function isPastDate(isoDate: string): boolean {
  const date = DateTime.fromISO(isoDate)
  return date < DateTime.now()
}
