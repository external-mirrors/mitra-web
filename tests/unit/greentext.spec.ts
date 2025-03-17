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
})
