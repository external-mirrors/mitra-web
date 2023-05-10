import { expect } from "chai"
import { shallowMount } from "@vue/test-utils"

import Avatar from "@/components/Avatar.vue"

describe("Avatar.vue", () => {
  it("Renders component", () => {
    const profile = { avatar: "https://test.com" }
    const wrapper = shallowMount(Avatar as any, { props: { profile } })
    expect(wrapper.text()).to.include("")
  })
})
