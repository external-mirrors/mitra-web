module.exports = {
  chainWebpack: (config) => {
    // Enable reactivity transform
    // https://github.com/vuejs/rfcs/discussions/369
    config.module
      .rule("vue")
      .use("vue-loader")
      .tap((options) => {
        return {
          ...options,
          reactivityTransform: true,
        }
      })
    if (process.env.NODE_ENV === "production") {
      // Type checker consumes too much memory
      config.plugins.delete("fork-ts-checker")
    }
  },
  lintOnSave: false,
}
