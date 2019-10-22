module.exports = {
  env: {
    client: {
      presets: [
        "@vue/app",
      ],
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
