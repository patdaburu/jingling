/**
 * A Logger is the base class for different types of loggers that may redirect logging info in different ways.
 * @module log/Logger
 * @see module:log/WinstonLogger
 */
"use strict";

var _ = require('underscore');

/**
 * These are the defined logging levels.
 * @readonly
 * @enum {number}
 */
var LogLevels = {
    /**
     * Logging is disabled.
     */
    NONE: 0,
    /**
     * This severity level indicates unrecoverable errors.
     */
    CRITICAL: 1,
    /**
     * This severity level indicates recoverable errors.
     */
    ERROR: 2,
    /**
     * This severity level indicates unusual circumstances that deserve human attention, but which do not constitute
     * behavioral errors.
     */
    WARNING: 3,
    /**
     * This severity level indicates general information.
     */
    INFO: 4,
    /**
     * This is the severity level of extensive messages that may be of interest to an administrator of the sytem.
     */
    VERBOSE: 5,
    /**
     * This is the severity level of extensive messages that may be of interest not only to administrators, but
     * developers as well.
     */
    DEBUG: 6,
    /**
     * This is the severity level of messages that people would need to see only in unusual circumstances.
     */
    SILLY: 7
};

/**
 * @class
 * @classdesc A Logger is the base class for different types of loggers that may redirect logging info in different
 *            ways.
 * @param {Object}  [options] - These are the options that define the logger's behavior.
 * @param {number}  [options.level=LogLevels.ERROR] - This is the port on which the proxy listens.
 * @param options
 * @constructor
 */
function Logger(options) {
    _.extend(this, _.extend({
        level: LogLevels.ERROR
    }, options));
}

/**
 * The write() method is intended to allow a Logger object to function as the logging stream for an Express app.
 * @param {String} message This is the message to log.
 * @param {*} encoding This is the encoding of the message string.
 * @see express
 * {@link} http://tostring.it/2014/06/23/advanced-logging-with-nodejs/
 */
Logger.prototype.write = function (message, encoding) {
    this.log(message);
}

/**
 * This is the internal message that determines whether or not a message should be logged before passing it off to
 * the log() method.
 * @param {String} message This is the message to log.
 * @param {LogLevels} level This is the severity level of the message.
 * @param {Object} options These are additional options pertinent to the log message.
 * @private
 */
Logger.prototype._log = function (message, level, options) {
    // If this logger isn't presently in the business of logging anything...
    if (!this.level || this.level == LogLevels.NONE) {
        // ...we're finished here.
        return;
    }
    else if (level <= this.level) { // Otherwise, if we're logging at or below this level...
        // ...let the logger do its thing.
        this.log(message, level, options);
    }
}

/**
 * Override this method in subclasses to perform logging actual logging operations.
 * @param {String} message This is the message to log.
 * @param {LogLevels} level This is the severity level of the message.
 * @param {Object} options These are additional options pertinent to the log message.
 */
Logger.prototype.log = function (message, level, options) {
    if (level <= LogLevels.ERROR) {
        console.error(message);
    }
    else if (level <= LogLevels.WARNING) {
        console.warn(message);
    }
    else {
        console.info(message);
    }
}

/**
 * Log a critical message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.CRITICAL
 */
Logger.prototype.critical = function (message, options) {
    this._log(message, LogLevels.CRITICAL, options);
}

/**
 * Log an error message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.ERROR
 */
Logger.prototype.error = function (message, options) {
    this._log(message, LogLevels.ERROR, options);
}

/**
 * Log a warning message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.WARNING
 */
Logger.prototype.warning = function (message, options) {
    this._log(message, LogLevels.WARNING, options);
}

/**
 * Log an informational message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.INFO
 */
Logger.prototype.info = function (message, options) {
    this._log(message, LogLevels.INFO, options);
}

/**
 * Log a verbose operational message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.VERBOSE
 */
Logger.prototype.verbose = function (message, options) {
    this._log(message, LogLevels.VERBOSE, options);
}

/**
 * Log a deep, deep debugging message.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.DEBUG
 */
Logger.prototype.debug = function (message, options) {
    this._log(message, LogLevels.DEBUG, options);
}

/**
 * Log a message that under all but the most unusual of circumstances, nobody would ever need to see.
 * @param {String} message This is the message to log.
 * @param {Object} options These are additional options pertinent to the log message.
 * @see LogLevels.SILLY
 * {@link} https://github.com/winstonjs/winston
 */
Logger.prototype.silly = function (message, options) {
    this._log(message, LogLevels.SILLY, options);
}

module.exports = Logger;

module.exports.LogLevels = LogLevels;
