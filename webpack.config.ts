import * as path from 'path';
import * as HtmlWebpackPlugin from 'html-webpack-plugin';
import * as webpack from 'webpack';
var nodeExternals = require('webpack-node-externals');
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

var genericPlugins = [
  new ForkTsCheckerWebpackPlugin({
    checkSyntacticErrors: true
  })
];

function generateConfig(plugins = genericPlugins): webpack.Configuration {
  return {
    context: path.resolve('.'),
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [
            { loader: 'cache-loader' },
            {
              loader: 'thread-loader',
              options: {
                works: require('os').cpus().length - 1
              }
            },
            // {
            //   loader: 'babel-loader',
            //   options: {
            //     cacheDirectory: true,
            //     presets: [
            //       "react",
            //       [
            //         "es2015",
            //         {
            //           "modules": false
            //         }
            //       ],
            //       "es2016"
            //     ]
            //   }
            // },
            {
              loader: 'ts-loader',
              options: {
                happyPackMode: true
              }
            }
          ]
        }, {
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
      extensions: ['.ts', '.tsx', '.js', '.css']
    },
    node: {__dirname: false},
    plugins: plugins
  }
}

function generateRendererConfig(plugins = genericPlugins) {
  return Object.assign({
    target: 'electron-renderer',
    externals: [
      (function () {
        var IGNORES = [
          'electron'
        ];
        return function (_context: any, request: string, callback: any) {
          if (IGNORES.indexOf(request) >= 0) {
            return callback(null, "require('" + request + "')");
          }
          return callback();
        };
      })()
    ]
  }, generateConfig(plugins));
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
    entry: ['./main/main'],
    // externals: [nodeExternals()],
    output: Object.assign({
      path: path.resolve(__dirname, "build"),
      publicPath: '/'
    }, commonOutput)
  }, generateConfig()),
  Object.assign({
    entry: ['./renderer/youtubePreload'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer"),
      publicPath: '/renderer/'
    }, commonOutput)
  }, generateRendererConfig()),
  Object.assign({
    entry: ['./renderer/inputBox/inputBox'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/inputBox"),
      publicPath: '/renderer/inputBox/'
    }, commonOutput),
  }, generateRendererConfig([
      new HtmlWebpackPlugin({
        title: 'Traffic Control Input',
        filename: 'inputBox.html'
      })
    ].concat(genericPlugins))),
  Object.assign({
    entry: ['./renderer/entryRenderer/entryRenderer'],
    output: Object.assign({
      path: path.resolve(__dirname, "build/renderer/entryRenderer"),
      publicPath: '/renderer/entryRenderer/'
    }, commonOutput),
  }, generateRendererConfig([
      new HtmlWebpackPlugin({
        title: 'Traffic Control Input',
        filename: 'entryRenderer.html'
      }),
    ].concat(genericPlugins)))
];
