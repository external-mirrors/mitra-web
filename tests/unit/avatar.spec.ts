import { expect } from "chai"
import { shallowMount } from "@vue/test-utils"

// Import doesn't work because of sass-loader (SassError: Can't find stylesheet to import)
// import Avatar from "@/components/Avatar.vue"

describe("Avatar.vue", () => {
  // Not working due to Vue bug https://github.com/vuejs/vue-next/issues/3590
  /*
  it.skip("Renders component", () => {
    const profile = { avatar: "https://test.com" }
    const wrapper = shallowMount(Avatar as any, { props: { profile } })
    expect(wrapper.text()).to.include("")
  })
  */
})
