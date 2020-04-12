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
            proxy: {
                '/r': {
                    onProxyReq: (proxyReq, req, res) => {
                        // proxyReq.setHeader('origin', null);
                        // console.log(proxyReq)
                    },
                    onProxyRes: (proxyRes, req, res) => {
                        console.log(proxyRes.statusCode)
                        // console.log(proxyReq)
                    },
                    onError: (err) => {
                        console.log(err)
                    },

                    // router: (req) => {
                    //     //console.log('router', req)
                    //     return {
                    //         protocol: 'https:', // The : is required
                    //         host: 'github.com',
                    //         port: 443
                    //     };
                    // },

                    target: 'https://www.github.com/',
                    pathRewrite: {
                        '^/r/github.com': ''
                    },
                    headers: {
                        'host': 'www.github.com',
                        'origin': null
                    },
                    changeOrigin: true, // target是域名的话，需要这个参数，
                    secure: true, // 设置支持https协议的代理
                }
            },
            compress: true,
            historyApiFallback: true,
            hot: true,
            open: true,
            overlay: true,
            port: port,
            stats: {
                verbose: true
            }
        }
    });
}