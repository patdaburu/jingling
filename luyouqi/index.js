/**
 * luyouqi
 * @module luyoqui
 */

var express = require('express');
var geocodeRouter = require('./geocode/geocode-router');

// TODO: Document these modules: http://usejsdoc.org/howto-commonjs-modules.html

// TODO: The main function returns an entire express application (augmented to make the routes accessible).
/**
 *
 * @returns {*}
 */
module.exports = function () {

    // TODO: Allow a caller to specify the path under which the routers should be added.
    var app = express();

    // Add the geocode service router to the Express app.
    app.geocodeRouter = geocodeRouter();
    app.use('/geocode', app.geocodeRouter);

    // Return the configure Express app to the caller.
    return app;
}

/**
 *
 */
module.exports.geocodeRouter = require('./geocode/geocode-router');