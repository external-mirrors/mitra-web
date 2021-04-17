const MarkdownIt = require("markdown-it") /* eslint-disable-line @typescript-eslint/no-var-requires */
const MarkdownItLinkAttrs = require("markdown-it-link-attributes") /* eslint-disable-line @typescript-eslint/no-var-requires */

// Default renderer
const markdown = new MarkdownIt({ linkify: true, breaks: true })
  .use(
    MarkdownItLinkAttrs,
    { attrs: { target: "_blank", rel: "noopener" } },
  )

// Minimal renderer
const markdownLite = new MarkdownIt({ linkify: true, breaks: true })
  .disable(["backticks", "emphasis", "strikethrough", "image"])
  .use(
    MarkdownItLinkAttrs,
    { attrs: { target: "_blank", rel: "noopener" } },
  )

export function renderMarkdown(text: string): string {
  return markdown.render(text)
}

export function renderMarkdownLite(text: string): string {
  return markdownLite.renderInline(text)
}
