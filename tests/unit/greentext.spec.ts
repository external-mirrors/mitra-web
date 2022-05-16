import { expect } from "chai"
import { addGreentext } from "@/utils/greentext"

describe("Greentext", () => {
  it("Should add greentext class", () => {
    const text = "test<br>&gt;greentext1<br>abc<br>&gt;greentext2<br>xyz"
    const result = addGreentext(text)
    expect(result).to.equal('test<br><span class="greentext">&gt;greentext1</span><br>abc<br><span class="greentext">&gt;greentext2</span><br>xyz')
  })
})
