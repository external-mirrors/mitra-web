export function addGreentext(text: string): string {
  // Allows up to 2 whitespaces
  const greentextRegexp = /^(\s*&gt; {0,2}[^\s].*)/gm
  return text.replace(greentextRegexp, '<span class="greentext">$1</span>')
}

export function addRedtext(text: string): string {
  // Excludes HTML tags
  const redtextRegexp = /^(\s*&lt; ?[^\s]((?!&gt;).)*$)/gm
  return text.replace(redtextRegexp, '<span class="redtext">$1</span>')
}
