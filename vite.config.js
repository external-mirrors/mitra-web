import * as path from "path"
import { fileURLToPath } from "url"

import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"

import svgLoader from "./src/svg-loader.ts"

// https://v5.vite.dev/guide/api-plugin.html#transformindexhtml
function customCSSPlugin() {
  return {
    name: "custom-css",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        return [{
          tag: "link",
          attrs: {
            // Load custom stylesheet
            rel: "stylesheet",
            href: "/assets/custom.css",
          },
          injectTo: "head",
        }]
      },
    },
  }
}

// https://vitejs.dev/config/
export default ({ mode }) => {
  // import.meta.env is only available in application code
  const env = loadEnv(mode, process.cwd(), "")
  return defineConfig({
    plugins: [
      vue(),
      svgLoader(),
      // Optimize build, prevent unsafe-eval
      // https://vue-i18n.intlify.dev/guide/advanced/optimization#how-to-configure
      VueI18nPlugin({
        include: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "@/src/locales/**"),
      }),
      customCSSPlugin(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.APP_VERSION": JSON.stringify(process.env.npm_package_version),
    },
    server: {
      port: env.VITE_PORT,
    },
    test: {
      environment: "jsdom",
      globals: true,
      watch: false,
    },
  })
}
