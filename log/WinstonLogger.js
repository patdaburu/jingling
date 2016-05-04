/**
 * WinstonLogger
 * @module log/WinstonLogger
 * @see module:log/Logger
 * {@link} https://github.com/winstonjs/winston
 * {@link} http://tostring.it/2014/06/23/advanced-logging-with-nodejs/
 *
 * Created by patdaburu on 5/3/2016.
 */
"use strict";

var _ = require('underscore');
var inherits = require('util').inherits;
var Logger = require('./Logger');
var winston = require('winston');

/**
 *
 * @param {Logger.LogLevels} logLevel - This is the enumerated LogLevel value you want to convert to a winston severity.
 * @returns {String} The function returns a winston severity level.
 */
var ToWinstonSeverity = function (logLevel) {
    switch (logLevel) {
        case Logger.LogLevels.CRITICAL:
        case Logger.LogLevels.ERROR:
            return 'error';
        case Logger.LogLevels.WARNING:
            return 'warn';
        case Logger.LogLevels.INFO:
            return 'info';
        case Logger.LogLevels.VERBOSE:
            return 'verbose';
        case Logger.LogLevels.DEBUG:
            return 'debug';
        case Logger.LogLevels.SILLY:
            return 'silly'
        default:
            return 'info';
    }
}

/**
 * @param {Object} [options] - These are the options that determine the logger's behavior.
 * @param {Array} [options.transports] - These are the winston transports
 * @constructor
 * {@link} https://github.com/winstonjs/winston
 */
function WinstonLogger(options) {
    // Let the base class do it's thing.
    Logger.call(this,
        _.extend({ // Mix in the default arguments before passing the arguments to the parent.
            // The default transport lists just writes to the console.
            transports: [
                new winston.transports.Console({handleExceptions: true, colorize: true})
            ]
        }, options));

    // TODO: Find out what the 'json' property of a transport is for?

    // Iterate over all of the transports.
    _.each(this.transports, function (transport) {
        // If a transport doesn't define the 'level' property...
        if (!transport.level) {
            // ...set it to the winston equivalent of this logger's level.
            transport.level = ToWinstonSeverity(this.level);
        }
    }, this);

    /**
     * This is the winston logger interest that handles actual message transport.
     * @type {winston.Logger}
     * @private
     */
    this._winstonLogger = new winston.Logger({
        transports: this.transports
    });
}

inherits(WinstonLogger, Logger);

/**
 * This override passes logging messages to the winston logger instance.
 * @param {String} message This is the message to log.
 * @param {LogLevels} level This is the severity level of the message.
 * @param {Object} options These are additional options pertinent to the log message.
 */
Logger.prototype.log = function (message, level, options) {
    // Pass the message on to the winston logger.
    this._winstonLogger.log(ToWinstonSeverity(level), message);
}

module.exports = WinstonLogger;
