module.exports = {
  root: true,
  env: {
    node: true
  },
  "extends": [
    "plugin:vue/essential",
    "eslint:recommended"
  ],
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "indent": [ "error", 2 ],
    "linebreak-style": [ "error", "unix" ],
    "quotes": [ "error", "double" ],
    "semi": [ "error", "always" ],
    "arrow-body-style": "off",
    "brace-style": ["error", "stroustrup", { "allowSingleLine": true }],
    "no-unsafe-finally": "off"
  },
  parserOptions: {
    parser: "babel-eslint"
  }
}
