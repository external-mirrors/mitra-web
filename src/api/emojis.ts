export interface CustomEmoji {
  shortcode: string,
  url: string,
}

export function replaceShortcodes(text: string, emojis: CustomEmoji[]): string {
  // Regex must match the one used at backend
  return text.replace(/:([a-zA-Z0-9._-]+):/g, (match, shortcode) => {
    const emoji = emojis.find((emoji) => {
      return emoji.shortcode === shortcode
    })
    if (emoji) {
      return `<span class="emoji"><img title=":${emoji.shortcode}:" alt=":${emoji.shortcode}:" src="${emoji.url}"></span>`
    } else {
      return match
    }
  })
}
