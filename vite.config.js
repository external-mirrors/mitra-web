import dns from "dns"
import * as path from "path"
import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import { injectHtml } from "vite-plugin-html"

import svgLoader from "./src/svg-loader.ts"

// TODO: switch to 127.0.0.1
dns.setDefaultResultOrder("verbatim")

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
