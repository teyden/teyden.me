/*
 * This file is subject to the terms and conditions defined in file LICENSE,
 * which is part of this source code package.
 *
 * See the NOTICE file distributed with this work for additional
 * information regarding copyright ownership.
 */
const webpack = require('webpack');
const path = require("path");
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const extractSCSS = new ExtractTextPlugin("[name].css");
const DashboardPlugin = require('webpack-dashboard/plugin');
const argv = require('yargs').argv;
module.exports = function(env) {
    var config = {
        context: path.resolve(__dirname, 'src'),
        entry: {
            VariantStore: "./VariantStoreInit.jsx",
        },
        output: {
            path: (env && env.outputPath) || path.join(__dirname, "dist/variant-store"),
            filename: "[name].bundle.js"
        },
        module: {
            loaders: [
              {
                loader: "babel-loader",
                include: [
                  path.resolve(__dirname, "src"),
                ],
                test: /\.jsx?$/,
                query: {
                  plugins: ['transform-runtime'],
                  presets: ['es2015', 'react'],
                }
              },
              {
                test: /\.s?css$/,
                include: [
                  path.resolve(__dirname, "src"),
                ],
                loader: extractSCSS.extract(["css-loader", "sass-loader"])
              },
              {
                test: /\.(jpg|gif|png|svg|woff|woff2|eot|ttf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file-loader', options: {name: '[name].[ext]'}
              }
            ]
        },
        plugins: [
            extractSCSS,
        ],
    };

    // This is required because of this issue:
    // https://github.com/FormidableLabs/webpack-dashboard/issues/96
    if (argv.watch) {
        config.plugins.unshift(
            new DashboardPlugin()
        );
    }

    return config;
};