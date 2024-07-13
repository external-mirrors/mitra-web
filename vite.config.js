import * as path from "path"
import { fileURLToPath } from "url"

import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import { injectHtml } from "vite-plugin-html"
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite"

import svgLoader from "./src/svg-loader.ts"

// https://vitejs.dev/config/
export default ({ mode }) => {
  // import.meta.env is only available in application code
  const env = loadEnv(mode, process.cwd(), "")
  return defineConfig({
    plugins: [
      vue({
        reactivityTransform: true,
      }),
      // Not needed in Vite 4.2+
      injectHtml({
        injectData: {
          __APP_VERSION__: process.env.npm_package_version,
        },
      }),
      svgLoader(),
      // Optimize build, prevent unsafe-eval
      // https://vue-i18n.intlify.dev/guide/advanced/optimization#how-to-configure
      VueI18nPlugin({
        include: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "@/src/locales/**"),
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
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
