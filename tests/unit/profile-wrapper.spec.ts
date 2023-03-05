import { expect } from "chai"
import { defaultProfile, ProfileWrapper } from "@/api/users"

describe("ProfileWrapper", () => {
  it("Replace invisible characters", () => {
    const hidden = "​"
    expect(hidden.length).to.equal(1)
    const profile = new ProfileWrapper({
      ...defaultProfile(),
      username: "test",
      display_name: hidden,
    })
    expect(profile.getDisplayName()).to.equal("test")
  })
})
