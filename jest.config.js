module.exports = {
  preset: "vite-jest",
  globals: {
    __APP_VERSION__: true,
    __VUE_APP_BACKEND_URL__: true,
  },
  // @vue/test-utils doesn't work with vite-jest
  modulePathIgnorePatterns: ["avatar.spec.ts"],
}
