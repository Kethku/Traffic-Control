"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
var ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
var genericPlugins = [
    new ForkTsCheckerWebpackPlugin({
        checkSyntacticErrors: true
    })
];
function generateConfig(plugins = genericPlugins) {
    return {
        mode: "development",
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
        node: { __dirname: false },
        plugins: plugins
    };
}
function generateRendererConfig(plugins = genericPlugins) {
    return Object.assign({
        target: 'electron-renderer',
        externals: [
            (function () {
                var IGNORES = [
                    'electron'
                ];
                return function (_context, request, callback) {
                    if (IGNORES.indexOf(request) >= 0) {
                        return callback(null, "require('" + request + "')");
                    }
                    return callback();
                };
            })()
        ]
    }, generateConfig(plugins));
}
const commonOutput = {
    filename: '[name].js',
    devtoolModuleFilenameTemplate: function (info) {
        return "../" + info.resourcePath;
    }
};
module.exports = [
    Object.assign({
        target: 'electron-main',
        entry: ['./server/main'],
        output: Object.assign({
            path: path.resolve(__dirname, "build"),
            publicPath: '/'
        }, commonOutput),
        externals: fs.readdirSync("node_modules").map((mod) => "commonjs " + mod)
    }, generateConfig()),
    Object.assign({
        entry: ['./inputBox/inputBox'],
        output: Object.assign({
            path: path.resolve(__dirname, "build/inputBox"),
            publicPath: '/inputBox/'
        }, commonOutput),
    }, generateRendererConfig([
        new HtmlWebpackPlugin({
            title: 'Traffic Control Input',
            filename: 'inputBox.html'
        })
    ].concat(genericPlugins)))
];
//# sourceMappingURL=webpack.config.js.map