module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/vue3-essential",
    "@vue/standard",
    "@vue/typescript",
  ],
  parserOptions: {
    ecmaVersion: 2020,
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
    "comma-dangle": [
      "error",
      "always-multiline",
    ],
    "space-before-function-paren": ["error", {
      anonymous: "always",
      named: "never",
    }],
    "object-shorthand": "off",
    "padded-blocks": ["error", {
      classes: "always",
    }],
    "vue/multi-word-component-names": "off",
    "no-console": [
      "warn",
      {
        allow: ["error"],
      },
    ],
    "no-debugger": "warn",
  },
  overrides: [
    {
      files: [
        "**/tests/unit/**/*.spec.ts",
      ],
      env: {
        mocha: true,
      },
    },
  ],
}
