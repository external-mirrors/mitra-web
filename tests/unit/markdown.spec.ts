import { expect } from "chai"
import {
  renderMarkdownLite,
  renderMarkdownLiteInline,
} from "@/utils/markdown"

describe("Render markdown", () => {
  const text = "# heading\n\ntest **bold** test *italic* test ~~strike~~ with `code`, <span>html</span> and https://example.com\nnew line\n\ntwo new lines and a list:\n- item 1\n- item 2\n\n>greentext\n\n---\n\nimage: ![logo](logo.png)\n\ncode block:\n```\nlet test\ntest = 1\n```"

  it("Render markdown lite", () => {
    const html = renderMarkdownLite(text)
    expect(html).to.equal('<p># heading</p><p>test <strong>bold</strong> test <em>italic</em> test ~~strike~~ with <code>code</code>, &lt;span&gt;html&lt;/span&gt; and <a href="https://example.com">https://example.com</a><br>new line</p><p>two new lines and a list:<br>- item 1<br>- item 2</p><p>&gt;greentext</p><p>---</p><p>image: !<a href="logo.png">logo</a></p><p>code block:</p><pre><code>let test\ntest = 1\n</code></pre>')
  })

  it("Render markdown lite inline", () => {
    const html = renderMarkdownLiteInline(text)
    expect(html).to.equal('# heading<br><br>test <strong>bold</strong> test <em>italic</em> test ~~strike~~ with <code>code</code>, &lt;span&gt;html&lt;/span&gt; and <a href="https://example.com">https://example.com</a><br>new line<br><br>two new lines and a list:<br>- item 1<br>- item 2<br><br>&gt;greentext<br><br>---<br><br>image: !<a href="logo.png">logo</a><br><br>code block:<br><code>let test test = 1</code>')
  })
})
