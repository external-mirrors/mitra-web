export function escapeHtml(unsafe: string): string {
  // Doesn't escape quotes
  return new Option(unsafe).innerHTML
}

export function replaceTextNodes(
  element: HTMLElement,
  replace: Function,
): void {
  const nodes = []
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT)
  while (walker.nextNode()) {
    nodes.push(walker.currentNode as Text)
  }
  for (const textNode of nodes) {
    if (
      textNode.parentNode !== null &&
      textNode.parentNode !== element &&
      textNode.parentNode.nodeName.toLowerCase() !== "p"
    ) {
      continue
    }
    const textSafe = escapeHtml(textNode.data)
    const html = replace(textSafe)
    const fragment = document.createRange().createContextualFragment(html)
    textNode.replaceWith(fragment)
  }
}
