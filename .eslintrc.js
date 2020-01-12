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
    // I have debated whether to use single or double quotes, but I have decided to use double
    // quotes because otherwise it gets too confusing when you are using double quotes in the HTML
    // and <script> and <style> tags and single quotes in the JS code. I will just stick with using
    // double quotes everywhere.
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
