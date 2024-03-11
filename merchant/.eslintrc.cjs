module.exports = {
  env: {
    browser: true,
    es2022: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  overrides: [],
  settings: {
    react: {
      version: "detect",
    },
  },
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  plugins: ["react", "prefer-arrow"],
  rules: {
    camelcase: "off",
    "react/react-in-jsx-scope": "off",
    "prefer-arrow/prefer-arrow-functions": [
      "error",
      {
        disallowPrototype: true,
        singleReturnOnly: false,
        classPropertiesAllowed: false,
      },
    ],
    "no-console": "off",
    indent: [
      "error",
      2,
      {
        SwitchCase: 1,
      },
    ],
    "linebreak-style": ["error", "unix"],
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
};
