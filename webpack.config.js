'use strict';

const nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './src/horse-client.ts',
    output: {
        filename: 'horse-client.js',
        libraryTarget: 'this'
    },
    optimization: {
        minimize: false
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    externals: [nodeExternals()]
};