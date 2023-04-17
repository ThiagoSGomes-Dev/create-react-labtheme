/**
 * Copyright (c) 2023-present, https://github.com/ThiagoSGomes-Dev
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
"use strict";

const path = require("path");

module.exports = {
    mode: "none",
    entry: path.join(__dirname, "src", "index.js"),
    watch: false,
    watchOptions: {
        aggregateTimeout: 600,
        ignored: [__dirname, "node_modules", "webpack.config.js", "labThemeErrorOverlay.js"]
    },
    output: {
        path: path.join(__dirname, ".."),
        filename: "labThemeErrorOverlay.js",
        library: "labThemeErrorOverlay",
        libraryTarget: "umd"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: path.join(__dirname, "src"),
                use: "babel-loader"
            }
        ]
    }
};
