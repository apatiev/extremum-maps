/* global __dirname, require, module */

const env = require('yargs').argv.env;

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

var libraryName = 'extremum-maps';

var outputJsFile;
var outputCssFile;
var plugins = [ ];

if (env === 'build') {
    outputJsFile = libraryName + '.min.js';
    outputCssFile = libraryName + '.min.css';

    plugins.push(new UglifyJsPlugin({minimize: true}));
    plugins.push(new OptimizeCssAssetsPlugin());

} else {
    outputJsFile = libraryName + '.js';
    outputCssFile = libraryName + '.css';
}

plugins.push(new ExtractTextPlugin(outputCssFile));

const config = {
    entry: ['whatwg-fetch', __dirname + '/src/index.js'],
    devtool: 'source-map',
    output: {
        path: __dirname + '/lib',
        filename: outputJsFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' })
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
                loader: 'file-loader',
                options: {
                    'name': 'images/[name].[ext]'
                }
            },
            {
                test: /(\.jsx|\.js)$/,
                exclude: /node_modules/
            },
            {
                test: /(\.jsx|\.js)$/,
                loader: 'eslint-loader',
                exclude: /node_modules/
            }
        ]
    },
    plugins: plugins
};

module.exports = config;
