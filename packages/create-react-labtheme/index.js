#!/usr/bin/env node

"use strict";

var chalk = require("chalk");

var currentNodeVersion = process.versions.node;
var semver = currentNodeVersion.split(".");
var major = semver[0];

if (major < 8) {
    console.error(chalk.red(`You are running Node ${currentNodeVersion}.`));
    console.error(chalk.red("Create React LAB Theme requires Node 8 or higher."));
    console.error(chalk.red("Please update your version of Node."));
    process.exit(1);
}

require("./createReactLabTheme");
