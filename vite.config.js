import * as path from "path"
import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import { injectHtml } from "vite-plugin-html"

// https://vitejs.dev/config/
export default ({ mode }) => {
  // "import.meta" is not available in the configured target environment ("es2015")
  // This bug could have been fixed in a newer version of Vite
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
  })
}
