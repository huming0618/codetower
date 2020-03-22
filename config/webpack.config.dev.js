'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const helpers = require('./helpers');
const commonConfig = require('./webpack.config.common');
const environment = require('./env/dev.env');
const port = process.env.DEV_SERVER_PORT || 8080

module.exports = env => {
    return merge(commonConfig, {
        mode: 'development',
        devtool: 'inline-source-map',
        // devtool: 'cheap-module-eval-source-map',
        output: {
            path: helpers.root('dist'),
            publicPath: '/',
            filename: 'js/[name].bundle.js',
            chunkFilename: 'js/[id].chunk.js'
        },
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                chunks: 'all'
            }
        },
        plugins: [
            new webpack.EnvironmentPlugin(environment),
            new webpack.HotModuleReplacementPlugin(),
            new FriendlyErrorsPlugin()
        ],
        devServer: {
            compress: true,
            historyApiFallback: true,
            hot: true,
            open: true,
            overlay: true,
            port: port,
            stats: {
                normal: true
            }
        }
    });
}