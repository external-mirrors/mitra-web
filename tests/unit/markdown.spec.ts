import { expect } from "chai"
import { renderMarkdownLite } from "@/utils/markdown"

describe("Render markdown", () => {
  it("Render markdown lite", () => {
    const text = "test **bold** test *italic* test ~~strike~~ with `code`, <span>html</span> and https://example.com\nnew line\n\ntwo new lines and a list:\n- item 1\n- item 2\n\ncode block:\n```\nlet test\ntest = 1\n```"
    const html = renderMarkdownLite(text)
    expect(html).to.equal('test <strong>bold</strong> test <em>italic</em> test ~~strike~~ with <code>code</code>, &lt;span&gt;html&lt;/span&gt; and <a href="https://example.com" target="_blank" rel="noopener">https://example.com</a><br>new line<br><br>two new lines and a list:<br>- item 1<br>- item 2<br><br>code block:<br><code>let test test = 1</code>')
  })
})
