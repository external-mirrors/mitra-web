import globals from "globals"
import pluginVue from "eslint-plugin-vue"
import vueTsEslintConfig from "@vue/eslint-config-typescript"

export default [
  ...pluginVue.configs["flat/essential"],
  // https://github.com/vuejs/eslint-config-typescript?tab=readme-ov-file#use-as-a-normal-shared-eslint-config-not-recommended
  ...vueTsEslintConfig(),
  {
    files: [
      "**/*.js",
      "**/*.ts",
      "**/*.vue",
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
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
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": [
        "warn",
        {
          allow: ["error"],
        },
      ],
      "no-debugger": "warn",
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
