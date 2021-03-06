/*global desc, task, jake, fail, complete, directory */

"use strict";

(function () {

    var KARMA_CONFIG = "./build/config/karma.conf.js";
    var KARMA_CONFIG_SMOKE = "./build/config/karma.conf_smoke.js";
    var MOCHA_CONFIG = {
        ui: "bdd",
        reporter: "dot"
    };

    var strict = !process.env.loose;
    var startTime = Date.now();

    var path = require('path');
    var shell = require("shelljs");
    var debug = require('debug')('app:jakefile');
    var karma = require("simplebuild-karma");
    var mocha = require("../util/mocha_runner.js");
    var jshint = require("simplebuild-jshint");
    var jshintConfig = require('../config/jshint.conf.js');
    var paths = require('../config/paths.js');
    var browserify = require("../util/browserify_runner.js");
    var checkVersion = require("../util/version_checker.js");


    //*** CREATE DIRECTORIES

    directory(paths.testDir);
    directory(paths.distDir);


    //*** GENERAL

    desc("Lint and test");
    task("default", ["version", "lint", "test", "build", "docs"], function() {
        var elapsedSeconds = (Date.now() - startTime) / 1000;
        debug("BUILD OK  (" + elapsedSeconds.toFixed(2) + "s)");
    });

    desc("Lint and test");
    task("smoke", ["version", "lint", "testSmoke", "build", "docs"], function() {
        var elapsedSeconds = (Date.now() - startTime) / 1000;
        debug("BUILD OK  (" + elapsedSeconds.toFixed(2) + "s)");
    });

    desc("Delete generated files");
    task("clean", function() {
        shell.rm("-rf", paths.generatedDir);
    });


    //*** CHECK VERSIONS

    desc("Check Node version");
    task("version", function() {
        var version = require("../../package.json").engines.node;
        debug("Checking Node.js version: " + version);
        checkVersion.check({
            name: "Node",
            expected: version,
            actual: process.version,
            strict: strict
        }, complete, fail);
    }, { async: true });


    //*** LINT

    desc("Lint everything");
    task("lint", ["lintNode", "lintClient"]);

    task("lintNode", function() {
        debug("Linting Node.js code: ");
        jshint.checkFiles({
            files: [ "build/**/*.js" ],
            options: jshintConfig.nodeOptions,
            globals: jshintConfig.nodeGlobals
        }, complete, fail);
    }, { async: true });

    task("lintClient", function() {
        debug("Linting browser code: ");
        jshint.checkFiles({
            files: [ "src/**/*.js", 'tests/**/*.js' ],
            options: jshintConfig.clientOptions,
            globals: jshintConfig.clientGlobals
        }, complete, fail);
    }, { async: true });


    //*** TEST

    desc("Start Karma server -- run this first");
    task("karma", function() {
        karma.start({ configFile: KARMA_CONFIG }, complete, fail);
    }, { async: true });

    desc("Run tests");
    task("test", [ "testLib", "testBrowser" ]);

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
            strict:  true,
            capture: ['Firefox'],
            expectedBrowsers: []
        }, complete, fail);
    }, { async: true });

    desc("Run tests including smoke tests");
    task("testSmoke", ["testLib"], function() {
        debug("Testing browser code: ");
        karma.run({
            configFile: KARMA_CONFIG_SMOKE,
            strict: true,
            capture: ['Firefox'],
            expectedBrowsers: []
        }, complete, fail);
    }, { async: true });


    //*** BUILD

    desc("Build distribution package");
    task("build", [ "lint", "prepDistDir", "buildClient" ]);

    task("prepDistDir", function() {
        debug("Preparing dist dir");
        shell.rm("-rf", paths.distDir);
    });

    task("buildClient", [ paths.distDir, "bundleClientJs" ], function() {
        debug("Copying client code: .");
        shell.cp("-R", paths.webixDir, paths.distDir);
        shell.cp(paths.srcDir + "/*.html", paths.distDir);
    });

    task("bundleClientJs", [ paths.distDir ], function() {
        debug("Bundling browser code with Browserify: .");
        browserify.bundle({
            entry: paths.entryPoint,
            outfile: paths.distBundle,
            options: {
                debug: true
            }
        }, complete, fail);
    }, { async: true });


    //*** DOCUMENTATION

    desc("Generate the documentation");
    task("docs", function() {
        var cmd = "node_modules/.bin/jsdoc -r -c build/config/jsdoc.conf.json -d docs".replace(/\//g, path.sep);
        debug(cmd);
        shell.rm("-rf", "docs");
        jake.exec(cmd, { async: true }, complete);
    });

})();
