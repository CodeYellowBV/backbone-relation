// Note some browser launchers should be installed before using karma start.
// For example:
// npm install karma-firefox-launcher
// karma start --browsers=Firefox
module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['qunit'],

        // list of files / patterns to load in the browser
        files: [
            'backbone/test/vendor/jquery.js',
            'backbone/test/vendor/json2.js',
            'backbone/test/vendor/underscore.js',
            'backbone/backbone.js',
            'dist/backbone-relation.js',
            'backbone/test/setup/*.js',
            'backbone/test/*.js',
            'test/*.js',
        ],

        // Manually add plugins so it finds our local karma-coverage;
        // without this,it searches only in backbone/node_modules
        plugins: [
            'karma-qunit',
            'karma-phantomjs-launcher',
            'karma-babel-preprocessor',
            'karma-coverage',
        ],

        // test results reporter to use
        // possible values: 'dots', 'progress', 'coverage'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress', 'coverage'],

        preprocessors: {
            // files that should show up in the coverage report
            'dist/*.js': ['coverage'],
            'test/**/*.js': ['babel'],
        },

        coverageReporter: {
            reporters: [
                { type: 'html', subdir: 'report-html' },
                { type: 'lcov', subdir: 'report-lcov' },
            ],
        },

        // web server port
        port: 9877,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // See http://stackoverflow.com/a/27873086/1517919
        customLaunchers: {
            Chrome_sandbox: {
                base: 'Chrome',
                flags: ['--no-sandbox'],
            },
        },
    });
};
