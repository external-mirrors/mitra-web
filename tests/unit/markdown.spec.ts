import { expect } from "chai"
import { renderMarkdownLite } from "@/utils/markdown"

describe("Render markdown", () => {
  it("Render markdown lite", () => {
    const text = "test **bold** ~~strike~~ with `code` and https://example.com\nand a new line"
    const html = renderMarkdownLite(text)
    expect(html).to.equal('test **bold** ~~strike~~ with `code` and <a href="https://example.com" target="_blank" rel="noopener">https://example.com</a><br>\nand a new line')
  })
})
