import { BACKEND_URL } from "@/constants"

import { handleResponse, http } from "./common"

export interface CustomEmoji {
  shortcode: string,
  url: string,
}

export function getEmojiShortcode(name: string): string {
  return `:${name}:`
}

export function replaceShortcodes(text: string, emojis: CustomEmoji[]): string {
  // Regex must match the one used at backend
  return text.replace(/:([a-zA-Z0-9._+-]+):/g, (match, shortcode) => {
    const emoji = emojis.find((emoji) => {
      return emoji.shortcode === shortcode
    })
    if (emoji) {
      // See also: EmojiImage component
      return `<span class="emoji"><img title=":${emoji.shortcode}:" alt=":${emoji.shortcode}:" src="${emoji.url}"></span>`
    } else {
      return match
    }
  })
}

export async function getCustomEmojis(): Promise<CustomEmoji[]> {
  const url = `${BACKEND_URL}/api/v1/custom_emojis`
  const response = await http(url, {
    method: "GET",
  })
  const data = await handleResponse(response)
  return data
}

export interface Emoji {
  // name (without colons)
  name: string,
  // unicode text or shortcode
  text: string,
  url: string | null,
}

export async function getEmojis(): Promise<Emoji[]> {
  const { gemoji } = await import("gemoji")
  const unicodeEmojis = gemoji
    .filter((gemoji) => gemoji.names.length > 0)
    .map((gemoji) => {
      return {
        name: gemoji.names[0],
        text: gemoji.emoji,
        url: null,
      }
    })
  const _customEmojis = await getCustomEmojis()
  const customEmojis = _customEmojis.map(emoji => {
    return {
      name: emoji.shortcode,
      text: getEmojiShortcode(emoji.shortcode),
      url: emoji.url,
    }
  })
  const emojis = [...unicodeEmojis, ...customEmojis]
  emojis.sort((a, b) => a.name.localeCompare(b.name))
  return emojis
}
