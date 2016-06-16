/*global desc, task, jake, fail, complete, directory */
"use strict";


(function () {

    var startTime = Date.now();

    var shell = require("shelljs");

    var debug = require('debug')('Jakefile');

    var karma = require("simplebuild-karma");
    var mocha = require("../util/mocha_runner.js");

    var jshint = require("simplebuild-jshint");
    var jshintConfig = require('../config/jshint.conf.js');

    var paths = require('../config/paths.js');

    var browserify = require("../util/browserify_runner.js");
    var version = require("../util/version_checker.js");

    var KARMA_CONFIG = "./build/config/karma.conf.js";
    var MOCHA_CONFIG = {
        ui: "bdd",
        reporter: "dot"
    };

    var strict = !process.env.loose;


    //*** GENERAL

    desc("Lint and test");
    task("default", ["version", "lint", "test"], function() {
        var elapsedSeconds = (Date.now() - startTime) / 1000;
        console.log("\n\nBUILD OK  (" + elapsedSeconds.toFixed(2) + "s)");
    });

    desc("Start server (for manual testing)");
    task("run", [ "build" ], function() {
        console.log("Starting server. Press Ctrl-C to exit.");
        jake.exec("node " + paths.distDir + "/run.js 5000", { interactive: true }, complete);
    }, { async: true });

    desc("Delete generated files");
    task("clean", function() {
        shell.rm("-rf", paths.generatedDir);
    });



    //*** LINT

    desc("Lint everything");
    task("lint", ["lintNode", "lintClient"]);

    task("lintNode", function() {
        debug("Linting Node.js code: ");
        jshint.checkFiles({
            files: [ "src/*.js", "src/lib/**/*.js", "build/**/*.js" ],
            options: jshintConfig.nodeOptions,
            globals: jshintConfig.nodeGlobals
        }, complete, fail);
    }, { async: true });

    task("lintClient", function() {
        debug("Linting browser code: ");
        jshint.checkFiles({
            files: [ "src/ui/**/*.js" ],
            options: jshintConfig.clientOptions,
            globals: jshintConfig.clientGlobals
        }, complete, fail);
    }, { async: true });


    //*** TEST

    desc("Start Karma server -- run this first");
    task("karma", function() {
        karma.start(KARMA_CONFIG, complete, fail);
    }, { async: true });

    desc("Run tests");
    task("test", [ "testLib", "testBrowser", "testSmoke" ]);

    task("testLib", [ paths.testDir ], function() {
        debug("Testing Node.js code: ");
        mocha.runTests({
            files: [ "tests/lib/**/*.js" ],
            options: MOCHA_CONFIG
        }, complete, fail);
    }, { async: true });

    task("testBrowser", function() {
        debug("Testing browser code: ");
        karma.run({
            configFile: KARMA_CONFIG,
            strict: true,
            capture: ['Firefox'],
            expectedBrowsers: []
        }, complete, fail);
    }, { async: true });

    task("testSmoke", [ "build" ], function() {
        debug("Running local smoke tests: ");
        mocha.runTests({
            files: [ "tests/smoke/**/*.js" ],
            options: MOCHA_CONFIG
        }, complete, fail);
    }, { async: true });


    //*** CHECK VERSIONS

    desc("Check Node version");
    task("version", function() {
        debug("Checking Node.js version: .");
        version.check({
            name: "Node",
            expected: require("../../package.json").engines.node,
            actual: process.version,
            strict: strict
        }, complete, fail);
    }, { async: true });


    //*** CREATE DIRECTORIES

    directory(paths.testDir);
    directory(paths.uiDistDir);

})();

    