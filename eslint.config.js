import globals from "globals"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  ...compat.extends("plugin:vue/vue3-essential", "@vue/standard", "@vue/typescript"),
  {
    files: [
      "**/*.js",
      "**/*.ts",
      "**/*.vue",
    ],
    // TODO: ignoring doesn't work
    // ignores: []
    languageOptions: {
      globals: {
        ...globals.node,
      },
      ecmaVersion: 2020,
      sourceType: "module",
    },
    rules: {
      quotes: [
        "error",
        "double",
        {
          avoidEscape: true,
        },
      ],
      camelcase: "off",
      "comma-dangle": ["error", "always-multiline"],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
        },
      ],
      "object-shorthand": "off",
      "padded-blocks": [
        "error",
        {
          classes: "always",
        },
      ],
      "vue/multi-word-component-names": "off",
      "no-console": [
        "warn",
        {
          allow: ["error"],
        },
      ],
      "no-debugger": "warn",

      // TODO: broken rules
      "@typescript-eslint/no-unused-vars": "off",
      "vue/valid-v-for": "off",
    },
  },
  {
    files: ["**/tests/unit/**/*.spec.ts"],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
]
