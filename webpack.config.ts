import * as path from 'path';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';
import { TsConfigPathsPlugin } from 'awesome-typescript-loader';

function generateConfig(options?: any): webpack.Configuration {
  return {
    context: path.resolve('.'),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          loader: 'awesome-typescript-loader',
          exclude: path.resolve(__dirname, "node_modules"),
          query: options
        }, {
          test: /\.css$/,
          loader: 'style-loader!css-loader',
          exclude: path.resolve(__dirname, "node_modules")
        }
      ]    },
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
  }
}

function generateRendererConfig(options?: any) {
  return Object.assign({
    target: 'electron-renderer',
    externals: [
      (function () {
        var IGNORES = [
          'electron'
        ];
        return function (context: any, request: string, callback: any) {
          if (IGNORES.indexOf(request) >= 0) {
            return callback(null, "require('" + request + "')");
          }
          return callback();
        };
      })()
    ]
  }, generateConfig(options));
}

const commonOutput: webpack.Output = {
  filename: '[name].js',
  devtoolModuleFilenameTemplate: function(info) {
    return "../" + info.resourcePath;
  }
};

module.exports = [
  Object.assign({
    target: 'electron',
    entry: ['./main/main', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build"),
      publicPath: '/'
    }, commonOutput)
  }, generateConfig({"include": [ "./main/**/*" ]})),
  Object.assign({
    entry: ['./renderer/youtubePreload', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer"),
      publicPath: '/renderer/'
    }, commonOutput)
  }, generateRendererConfig({"include": [ "./renderer/youtubePreload.ts" ]})),
  Object.assign({
    entry: ['./renderer/inputBox/inputBox', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/inputBox"),
      publicPath: '/renderer/inputBox/'
    }, commonOutput),
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Traffic Control Input',
        filename: 'inputBox.html'
      })
    ]
  }, generateRendererConfig({"include": [ "./renderer/inputBox/**/*" ]})),
  Object.assign({
    entry: ['./renderer/entryRenderer/entryRenderer', 'babel-polyfill'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/entryRenderer"),
      publicPath: '/renderer/entryRenderer/'
    }, commonOutput),
    plugins: [
      new HtmlWebpackPlugin({
        title: 'Traffic Control Input',
        filename: 'entryRenderer.html'
      }),
    ]
  }, generateRendererConfig({"include": [ "./renderer/entryRenderer/**/*" ]}))
];
