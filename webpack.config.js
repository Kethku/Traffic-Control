var path = require('path');

const commonConfig = {
  context: path.resolve('.'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader!awesome-typescript-loader',
        exclude: path.resolve(__dirname, "node_modules")
      }
    ]
  },
  devServer: {
    inline: true,
    hot: true,
    port: 8080
  },
  devtool: "source-map",
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.jsx']
  }
};

const commonOutput = {
  filename: '[name].js',
  devtoolModuleFilenameTemplate: function(info) {
    return "../" + info.resourcePath;
  }
};

module.exports = [
  Object.assign({
    target: 'electron-main',
    entry: {main: './main/main'},
    output: Object.assign({
      path: path.resolve(__dirname, "build"),
      publicPath: '/build/'
    }, commonOutput)
  }, commonConfig),
  Object.assign({
    target: 'electron-renderer',
    entry: {youtubePreload: './renderer/youtubePreload'},
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer"),
      publicPath: '/build/renderer/'
    }, commonOutput)
  }, commonConfig),
  Object.assign({
    target: 'electron-renderer',
    entry: {inputBox: './renderer/inputBox/inputBox'},
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/inputBox"),
      publicPath: '/build/renderer/inputBox'
    }, commonOutput)
  }, commonConfig)
];
