export function resizeTextArea(textarea: HTMLTextAreaElement) {
  const x = window.scrollX
  const y = window.scrollY
  textarea.style.height = "0px"
  textarea.style.height = `${textarea.scrollHeight}px`
  // Restore scroll position (helps when textarea is at the bottom of the viewport)
  window.scrollTo(x, y)
}

// TODO: use https://developer.mozilla.org/en-US/docs/Web/CSS/field-sizing
// WARNING: Chrome scrolls textarea when Enter is pressed: https://issues.chromium.org/issues/41477953
export function setupAutoResize(textarea: HTMLTextAreaElement) {
  textarea.style.height = `${textarea.scrollHeight}px`
  textarea.style.overflowY = "hidden"
  textarea.addEventListener("input", () => {
    resizeTextArea(textarea)
  }, false)
}
