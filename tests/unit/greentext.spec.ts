import { expect } from "chai"
import { addGreentext } from "@/utils/greentext"
import { replaceTextNodes } from "@/utils/html"

describe("Greentext", () => {
  it("Should add greentext class", () => {
    const text = "test<br>&gt;greentext1<br>abc<br>&gt;greentext2<br>xyz"
    const element = document.createElement("p")
    element.innerHTML = text
    replaceTextNodes(element, addGreentext)
    const result = element.innerHTML
    expect(result).to.equal('test<br><span class="greentext">&gt;greentext1</span><br>abc<br><span class="greentext">&gt;greentext2</span><br>xyz')
  })

  it("Should add greentext class if there is a single space after >", () => {
    const text = "test<br>&gt; a"
    const element = document.createElement("p")
    element.innerHTML = text
    replaceTextNodes(element, addGreentext)
    const result = element.innerHTML
    expect(result).to.equal('test<br><span class="greentext">&gt; a</span>')
  })

  it("Should not add greentext class if there is no text", () => {
    const text = "<span>a</span> &gt; <span>b</span>"
    const element = document.createElement("p")
    element.innerHTML = text
    replaceTextNodes(element, addGreentext)
    const result = element.innerHTML
    expect(result).to.equal(text)
  })
})
