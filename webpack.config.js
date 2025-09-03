const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Add HtmlWebpackPlugin
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    })
  );

  return config;
};
