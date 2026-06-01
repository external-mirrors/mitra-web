import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { fetcher, http } from "@/api/common"

describe("Fetch API wrapper", () => {
  const url = "http://localhost"
  const timeout = AbortSignal.timeout(120000)
  let fetchStub: any

  beforeEach(() => {
    fetchStub = vi.spyOn(fetcher, "fetch")
      .mockImplementation(async () => new Response())
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeout)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("Should set defaults", async () => {
    await http(url)
    expect(fetchStub).to.have.been.calledWith(url, {
      credentials: "same-origin",
      signal: timeout,
    })
  })

  it("Should merge request parameters with defaults", async () => {
    await http(url, { method: "POST" })
    expect(fetchStub).to.have.been.calledWith(url, {
      credentials: "same-origin",
      method: "POST",
      signal: timeout,
    })
  })

  it("Should add Authorization header", async () => {
    await http(url, {
      method: "POST",
      signal: timeout,
      headers: { "Content-Type": "text/plain" },
      authToken: "123",
    })
    expect(fetchStub).to.have.been.calledWith(url, {
      credentials: "same-origin",
      headers: {
        Authorization: "Bearer 123",
        "Content-Type": "text/plain",
      },
      method: "POST",
      signal: timeout,
    })
  })

  it("Should send JSON data", async () => {
    await http(url, {
      method: "POST",
      json: { key: "value" },
      authToken: "123",
    })
    expect(fetchStub).to.have.been.calledWith(url, {
      body: '{"key":"value"}',
      credentials: "same-origin",
      headers: {
        Authorization: "Bearer 123",
        "Content-Type": "application/json",
      },
      method: "POST",
      signal: timeout,
    })
  })
})
