import globals from "globals";
import js from "@eslint/js";
import html from "eslint-plugin-html";
import jsonc from "eslint-plugin-jsonc";

export default [
  js.configs.recommended,
  {
    files: ["**/*.html"],
    plugins: { html },
  },
  ...jsonc.configs["flat/recommended-with-json"],
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.vitest,
        __APP_VERSION__: "readonly"
      },
    },
    rules: {
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
      "no-console": "off",
      "no-empty": ["error", { "allowEmptyCatch": true }]
    },
  },
  {
    ignores: ["dist/", "node_modules/", "server/node_modules/"]
  }
];
