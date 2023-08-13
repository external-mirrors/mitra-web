import { expect } from "chai"
import { encodeMultibase, hexToBytes } from "@/utils/encodings"

describe("Encodings", () => {
  it("Should convert hex string to bytes", () => {
    const hexString = "48656C6C6F20576F726C6421"
    const bytes = hexToBytes(hexString)
    const expectedBytes = Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
    expect(bytes).to.deep.equal(expectedBytes)
  })

  it("Should convert bytes to mulitbase string", () => {
    const bytes = Uint8Array.from([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100, 33])
    const multistring = encodeMultibase(bytes)
    const expectedMultistring = "z2NEpo7TZRRrLZSi2U"
    expect(multistring).to.equal(expectedMultistring)
  })
})
