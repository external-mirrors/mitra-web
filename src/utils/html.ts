export function escapeHtml(unsafe: string): string {
  // Doesn't escape quotes
  return new Option(unsafe).innerHTML
}

export function replaceTextNodes(
  element: HTMLElement,
  replace: (text: string) => string,
): void {
  const nodes = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text)
  }
  const allowedTags = [
    "i",
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "div",
  ]
  for (const textNode of nodes) {
    // Don't replace if parent tag is not in allowlist
    if (
      textNode.parentNode !== null &&
      textNode.parentNode !== element &&
      !allowedTags.includes(textNode.parentNode.nodeName.toLowerCase())
    ) {
      continue
    }
    const textSafe = escapeHtml(textNode.data)
    const html = replace(textSafe)
    const fragment = document.createRange().createContextualFragment(html)
    textNode.replaceWith(fragment)
  }
}
