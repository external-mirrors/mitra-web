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
  .disable([
    "blockquote",
    "list",
    "heading",
    "lheading",
    "hr",
    "strikethrough",
    "image",
  ])

// Remove \n from output
markdownLite.renderer.rules.hardbreak = () => "<br>"
markdownLite.renderer.rules.softbreak = () => "<br>"
markdownLite.renderer.rules.paragraph_close = () => "</p>"
const default_fence_rule = markdownLite.renderer.rules.fence
markdownLite.renderer.rules.fence = (...args: any[]) => {
  return default_fence_rule(...args).trim()
}

export function renderMarkdown(text: string): string {
  return markdown.render(text)
}

export function renderMarkdownLite(text: string): string {
  return markdownLite.render(text)
}

export function renderMarkdownLiteInline(text: string): string {
  return markdownLite.renderInline(text)
}
