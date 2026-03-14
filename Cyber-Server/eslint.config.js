import antfu from "@antfu/eslint-config"

export default antfu(
  {
    vue: false,
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: false
    },
    ignores: ["dist/**", "node_modules/**"]
  },
  {
    rules: {
      "ts/no-use-before-define": "off",
      "node/prefer-global/process": "off",
      "node/no-process-exit": "off",
      "style/comma-dangle": ["error", "never"],
      "style/brace-style": ["error", "1tbs"],
      "regexp/no-unused-capturing-group": "off",
      "no-console": "off",
      "no-debugger": "off",
      "symbol-description": "off",
      "antfu/if-newline": "off",
      "antfu/no-top-level-await": "off",
      "unicorn/no-instanceof-builtins": "off",
      "e18e/ban-dependencies": "off"
    }
  }
)
