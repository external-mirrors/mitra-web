export function isEmoji(text: string): boolean {
  let regexp
  try {
    regexp = new RegExp("^\\p{RGI_Emoji}$", "v")
  } catch {
    // "v" flag not supported
    return false
  }
  return regexp.test(text)
}
