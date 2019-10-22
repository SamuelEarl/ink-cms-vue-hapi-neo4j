module.exports = {
  env: {
    client: {
      presets: [
        "@vue/app",
      ],
      // plugins: [
      //   "@babel/plugin-syntax-dynamic-import"
      // ]
    },
    server: {
      presets: [
        "@babel/preset-env",
      ],
      plugins: [
        ["@babel/plugin-transform-runtime", {
          corejs: 2,
        }]
      ]
    }
  }
};
