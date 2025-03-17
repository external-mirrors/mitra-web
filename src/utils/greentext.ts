export function addGreentext(text: string): string {
  const greentextRegexp = /^(\s*&gt;.+)/gm
  return text.replace(greentextRegexp, '<span class="greentext">$1</span>')
}
