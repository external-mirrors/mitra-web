export interface CustomEmoji {
  shortcode: string,
  url: string,
}

export function replaceShortcodes(text: string, emojis: CustomEmoji[]): string {
  return text.replace(/:([\w.]+):/g, (match, shortcode) => {
    const emoji = emojis.find((emoji) => {
      return emoji.shortcode === shortcode
    })
    if (emoji) {
      return `<img class="emoji" title=":${emoji.shortcode}:" alt=":${emoji.shortcode}:" src="${emoji.url}">`
    } else {
      return match
    }
  })
}
