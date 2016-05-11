/**
 * Created by patdaburu on 4/18/2016.
 * This is the main point of entry for the server.
 */
"use strict";

var Forwarder = require('./proxy/Forwarder');
var Proxy = require('./proxy/Proxy');
var Logger = require('./log/Logger');
var WinstonLogger = require('./log/WinstonLogger');
var util = require('util');


// Handle uncaught exceptions.
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
    console.log('Stack:', err.stack);
    process.exit(1);
});

/**
 * Create the Proxy (and the classes that support it).
 */
var logger = new WinstonLogger({level: Logger.LogLevels.SILLY}); // This is our logger.
var forwarder = new Forwarder({logger: logger}); // This is our forwarder.

/**
 * Note to the future:  If you're debugging through Fiddler, uncomment the lines below.
 */
//Proxy.allowTlsUnauthorized();
//forwarder.proxy = "http://127.0.0.1:8888";

// Now create the Proxy itself.
var proxy = new Proxy({forwarder: forwarder, logger: logger}); // TODO: Normalize logging setup.


/** http://people.cs.pitt.edu/~alanjawi/cs449/code/shell/UnixSignals.htm */
// Handle operating system signals.
process.on('SIGHUP', function () {
    // TODO: Restart everything.
    console.log('Got SIGHUP.  Ignoring it.');
});

process.on('SIGINT', function () {
    // This is equivalent to
    console.log('Got SIGINT.  Ignoring it.');
    process.exit(2);
});

//process.on('SIGKILL', function () {
//   process.exit(1);
//});

process.on('SIGTERM', function () {
    // This is the normal way to politely ask the program to terminate.
    console.log('Got SIGTERM.  Ignoring it.');
    process.exit(15);
});

process.on('SIGQUIT', function () {
    /**
     * produces a core dump when it terminates the process, just like a program error signal. You can think of this as
     * a program error condition “detected” by the user. [...] Certain kinds of cleanups are best omitted in handling
     * SIGQUIT. For example, if the program creates temporary files, it should handle the other termination requests
     * by deleting the temporary files. But it is better for SIGQUIT not to delete them, so that the user can examine
     * them in conjunction with the core dump.
     */
    console.log('Got SIGQUIT.  Ignoring it.');
    process.exit(3);
});


logger.info(util.format('精灵 Proxy Server is listening on port %d', proxy.port));