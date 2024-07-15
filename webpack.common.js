const path = require("path");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

console.log(process.env.REACT_APP_BUILD_TARGET)

module.exports = {
    mode: 'development',
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist/backend"),
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {from: 'public', to: '../'}
            ]
        }),
        new webpack.ProvidePlugin({
            "React": "react"
        }),
        new webpack.DefinePlugin({
            'REACT_APP_BUILD_TARGET': JSON.stringify(process.env.REACT_APP_BUILD_TARGET || 'frontend'),
            'NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ],
    module: {
        rules: [
            {
                test: /.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: ["@babel/preset-env", "@babel/preset-react"],
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }
        ],
    },
};