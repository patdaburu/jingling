/**
 * Created by patdaburu on 5/10/2016.
 */
"use strict";

var _ = require('underscore');
var should = require('should');
var Logger = require('../Logger');

// Logger Class Tests
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
    // Create a logger that will log messages at any level.
    describe('logging at the silly level', function () {
        // Create the wide open ("silly") logger.
        var sillyLogger = new Logger({level: Logger.LogLevels.SILLY});
        // Method tests.
        describe('write()', function () {
            it('should write.', function () {
                sillyLogger.write('foo');
            });
        });
        describe('critical()', function () {
            it('should log a critical.', function () {
                sillyLogger.critical('foo');
            });
        });
        describe('error()', function () {
            it('should log an error.', function () {
                sillyLogger.error('foo');
            });
        });
        describe('warning()', function () {
            it('should log a warning.', function () {
                sillyLogger.warning('foo');
            });
        });
        describe('info()', function () {
            it('should log info.', function () {
                sillyLogger.info('foo');
            });
        });
        describe('verbose()', function () {
            it('should log verbose.', function () {
                sillyLogger.verbose('foo');
            });
        });
        describe('debug()', function () {
            it('should log debugging info.', function () {
                sillyLogger.debug('foo');
            });
        });
        describe('silly()', function () {
            it('should log silly.', function () {
                sillyLogger.silly('foo');
            });
        });
    });
    // Create a logger that only logs at the default level(ERROR) and send messages above that level.
    describe("not logging above the logger's level", function () {
        // Create a logger with the default logging level.
        var errorLogger = new Logger();
        // Log a message at the "silly" level.
        describe('silly()', function () {
            it('should not log silly.', function () {
                errorLogger.silly('nothing');
            });
        });
    });
    // Create a logger with logging turned off and log at any level.
    describe("not logging above the logger's level", function () {
        // Create a logger with the default logging level.
        var noneLogger = new Logger({level: Logger.LogLevels.NONE});
        // Log a message at the "error" level.
        describe('error()', function () {
            it('should not log.', function () {
                noneLogger.error('nothing');
            });
        });
    });
});