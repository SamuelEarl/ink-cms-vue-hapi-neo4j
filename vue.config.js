const path = require("path");

module.exports = {
  configureWebpack: {
    entry: path.join(__dirname, "src/client/main.js"),
    devtool: "source-map",
  },
  outputDir: path.join(__dirname, "dist/client"),

  devServer: {
    proxy: "http://localhost:4000"
  },

  chainWebpack: config => {
    const types = ["vue-modules", "vue", "normal-modules", "normal"];
    types.forEach(type => addStyleResource(config.module.rule("stylus").oneOf(type)));
  },

  lintOnSave: false,
};

function addStyleResource (rule) {
  rule.use("style-resource")
    .loader("style-resources-loader")
    .options({
      patterns: [
        path.resolve(__dirname, "./src/client/styles/main.styl"),
      ],
    });
}
