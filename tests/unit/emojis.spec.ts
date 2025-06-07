import { expect } from "chai"
import { replaceShortcodes, CustomEmoji } from "@/api/emojis"
import { replaceTextNodes } from "@/utils/html"

describe("Emojis", () => {
  it("Should insert custom emoji", () => {
    const content = "<span>text<br></span>​:abcd:​<span> </span>"
    const element = document.createElement("div")
    element.innerHTML = content
    const emoji = {
      shortcode: "abcd",
      url: "https://social.example/emoji.png",
    }
    replaceTextNodes(element, (text: string) => {
      return replaceShortcodes(text, [emoji])
    })
    const result = element.innerHTML
    expect(result).to.equal('<span>text<br></span>​<span class="emoji"><img title=":abcd:" alt=":abcd:" src="https://social.example/emoji.png"></span>​<span> </span>')
  })
})
