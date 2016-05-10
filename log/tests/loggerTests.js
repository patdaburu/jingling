/**
 * Created by patdaburu on 5/10/2016.
 */
"use strict";

var _ = require('underscore');
var should = require('should');
var Logger = require('../Logger');

// Logger Class Test
describe('Logger', function () {
    // Constructor Tests
    describe('constructor', function () {
        // No constructor options are provided.
        describe('without options', function () {
            var logger = new Logger();
            it('should have default logging level (ERROR).', function () {
                logger.level.should.eql(Logger.LogLevels.ERROR);
            });
        });
        // Constructor options are provided.
        describe('with options', function () {
            // Iterate over the enumerated logging levels.
            for (var logLevel in Logger.LogLevels) {
                // Get the actual value for this level.
                var level = Logger.LogLevels[logLevel];
                // Construct a new Logger, assigning this level.
                var logger = new Logger({level: level});
                // Now let's make sure the logger has the correct level.
                it('should have the log level specified at construction.', function () {
                    level.should.eql(logger.level);
                });
            }
        });
    });
});