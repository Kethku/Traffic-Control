import * as path from 'path';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';

const commonConfig: webpack.Configuration = {
  context: path.resolve('.'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader!awesome-typescript-loader',
        exclude: path.resolve(__dirname, "node_modules")
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader',
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
  },
  node: {__dirname: false}
};

const commonOutput: webpack.Output = {
  filename: '[name].js',
  devtoolModuleFilenameTemplate: function(info) {
    return "../" + info.resourcePath;
  }
};

const rendererConfig: webpack.Configuration = Object.assign({
  target: 'electron-renderer'
}, commonConfig);

module.exports:  = [
  Object.assign({
    target: 'electron-main',
    entry: ['./main/main', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build"),
      publicPath: '/'
    }, commonOutput)
  }, commonConfig),
  Object.assign({
    entry: ['./renderer/youtubePreload', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer"),
      publicPath: '/renderer/'
    }, commonOutput)
  }, rendererConfig),
  Object.assign({
    entry: ['./renderer/inputBox/inputBox', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/inputBox"),
      publicPath: '/renderer/inputBox/'
    }, commonOutput),
    plugins: [new HtmlWebpackPlugin({
      title: 'Traffic Control Input',
      filename: 'inputBox.html'
    })]
  }, rendererConfig)
];
