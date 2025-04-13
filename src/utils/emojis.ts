export function isEmoji(text: string): boolean {
  let regexp
  try {
    // eslint-disable-next-line prefer-regex-literals
    regexp = new RegExp("^\\p{RGI_Emoji}$", "v")
  } catch (error) {
    // "v" flag not supported
    return false
  }
  return regexp.test(text)
}
