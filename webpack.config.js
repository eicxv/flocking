// webpack.config.js
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");
module.exports = {
  context: __dirname,
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "main.js",
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: ["source-map-loader"],
      },
    ],
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, "src", "index.html"),
    }),
  ],
};
