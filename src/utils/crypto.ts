export function generateRandomString(len: number): string {
  const arr = new Uint8Array(len / 2)
  window.crypto.getRandomValues(arr)
  return Array.from(arr, (val) => val.toString(16).padStart(2, "0")).join("")
}
