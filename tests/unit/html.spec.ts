import { describe, expect, it } from "vitest"
import { escapeHtml } from "@/utils/html"

describe("Escape HTML", () => {
  it("Should escape quotes", () => {
    const text = "text\" 'text"
    const result = escapeHtml(text)
    expect(result).to.equal("text&quot; &#39;text")
  })
})
