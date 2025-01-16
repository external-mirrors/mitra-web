export function debounce(
  func: (...args: unknown[]) => void,
  delay = 100,
): (...args: unknown[]) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: unknown[]) => {
    clearTimeout(timeout)
    // Requires `noImplicitThis: false`
    timeout = setTimeout(() => { func.apply(this, args) }, delay)
  }
}
