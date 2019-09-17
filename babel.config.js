module.exports = {
  presets: [
    "@vue/app",
    "@babel/preset-env",
    // { useBuiltIns: "entry" }
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
  ]
  // ignore: [/\/core-js/]
};
