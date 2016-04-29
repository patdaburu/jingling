/**
 * ProxyRouter
 * @module luyouqi/Forwarder
 * @see module:luyouqi/Forward
 *
 * Created by patdaburu on 4/28/2016.
 */
"use strict";

var _ = require('underscore');
var devNull = require('dev-null');
var request = require('request');
var url = require('url');

/**
 * Copy all the headers in the source response over to the destination response.
 * @param {Response} destination
 * @param {Response} source
 * @returns The method returns the destination.
 */
var extendResHeaders = function (destination, source) {
    /**
     * Note to the future:  http.js lower-cases all of the headers in response.headers for easier comparison when
     * extracting the values.  For our purposes, however, we want to faithfully transcribe the headers returned
     * from the forwarded request.  The rawHeaders value contains what we want, but it's just an array in which
     * the even-numbered indexes are the names, and the following odd-numbered indexes are the corresponding
     * values.  So, we need to loop through them like so...
     */
    for (var i = 0; i < source.rawHeaders.length; i = i + 2) {
        // Don't copy the 'Content-Length' header.
        if (source.rawHeaders[i].toLowerCase() == 'content-length') {  // If these checks grow, we should work out
            continue;                                                  // a more efficient way handle them.
        }
        // TODO: For *very* verbose logging, we should note all of headers we're copying over.
        destination.set(source.rawHeaders[i], source.rawHeaders[i + 1]);
    }
    // If we need to add additional headers, this would be the place.
    // destination.set('Another-Header', 'Header Value Goes Here!');

    // Return the destination headers to the caller (in case they're chaining these calls).
    return destination;
}

/**
 * This is the name of a property on the process.env object that controls Node modules' behavior when making HTTPS
 * requests to servers with self-signed (or otherwise unauthorized) certificates.
 * @type {string}
 */
var NODE_TLS_REJECT_UNAUTHORIZED = 'NODE_TLS_REJECT_UNAUTHORIZED';

/**
 * Inspect the Node environment to see if it's configured to allow us to forward requests successfully through a
 * proxy.
 * {@link See http://stackoverflow.com/questions/17383351/how-to-capture-http-messages-from-request-node-library-with-fiddler}
 */
var proxyEnvCheck = function () {
    // If we're forwarding HTTPS calls to servers with self-signed certificates, there is a property on process.env
    // that must be set for it to work properly.
    if (process.env[NODE_TLS_REJECT_UNAUTHORIZED] != '0') {
        // TODO: Log this, or warn properly.
        var tlsRejectUnauthPropertyName = "process.env." + NODE_TLS_REJECT_UNAUTHORIZED;
        console.warn(tlsRejectUnauthPropertyName + " = " + process.env[NODE_TLS_REJECT_UNAUTHORIZED]);
        console.warn("If you are forwarding calls to services with self-signed certificates, set the value of " +
            tlsRejectUnauthPropertyName + " to '0' or call Proxy.tlsAllowUnauthorized().");
    }
}

/**
 * @param {Object} [options] - These are the options that define the forwarding behavior.
 * @param {number} [options.timeout=10*1000] - This is how long a request can linger before it times out.
 * @param {String} [options.proxy=null] - This is the URL of the proxy throw which requests are forwarded.
 * @constructor
 */
function Forwarder(options) { // TODO: Take single object parameter!
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        timeout: 10 * 1000,
        proxy: null
    }, options));
    // If the forwarder has been constructed to use a proxy to forward requests...
    if (this.proxy) {
        // ...we should perform a few checks.
        proxyEnvCheck();
    }
}

/**
 * Forward a request to another URL and let the forwarder automatically respond to the original request with the
 * forwarding server's response.
 * @param {Request} req - This is the request to forward.
 * @param {String}  to - This is the URL to which the request should be forwarded.
 * @param {function(err, res, body)} [callback] - This function is called when the forward is complete.
 * @param {Object} [options] - Supply options to pass to the request() function.  These will override the options
 *                             calculated by the forward() method.
 * @see request
 * @see forward
 */
Forwarder.prototype.autoForward = function (req, to, callback, options) {

    console.log("GEMINI: " + req.originalUrl + "->" + to); // TODO: Remove this logging statement.

    // We are calling the forward() method and passing the original request's Response object as the write stream
    // so that forward will just pipe whatever returns to it.
    this.forward(req, to, callback, req.res, options);
}

/**
 * Forward an incoming request to another URL.
 *
 * @param {Request} [req] - This is the request you want to forward on.
 * @param {string}  [to] - This is the url to which you want to forward the request.
 * @param {function(err, res, body)} [callback=undefined] - This is the callback called when the request is completed.
 * @param {stream.Writable} [resStream] - This is a writable stream to which the contents of the response from the
 *                                        forwarded address is written.
 * @param {Object} [options=undefined] - You can optionally supply options to pass to request() that override those calculated by the forwarder.
 */
Forwarder.prototype.forward = function (req, to, callback, resStream, options) {
    // TODO: Log this activity!

    // Clone the headers from the original request.
    var headers = _.clone(req.headers);
    // Replace the 'host' header (which would refer to this machine) with the hostname to which we're forwarding the
    // request.
    headers.host = url.parse(to).hostname;
    // Get the query string parameters from the original request so that we can pass them on.
    var qs = req.query;
    // Create the request() options.
    var _options = {
        url: to,
        timeout: this.timeout,
        method: req.method,
        headers: headers,
        qs: qs
    };

    // If the caller has supplied request options to override the ones we have set...
    if (options) {
        // ...mix 'em in now.
        _.extend(_options, options);
    }

    // If we're passing our request through yet another proxy (like, say, Fiddler)...
    if (this.proxy) {
        // ...the proxy URL needs to be added to the options we pass to request().
        _options.proxy = this.proxy;
    }

    // If we aren't supplied with a stream, pipe everything to a NOOP writable stream.
    var _resStream = resStream ? resStream : devNull();

    // Use the request module to forward the request.
    try {
        req.pipe(request(_options, function (ferr, fres, fbody) {

            // If the request to the forwarding address elicits an error...
            if (ferr) {
                // TODO: Take action on errors.
                console.dir(ferr);
            }

            // If the caller supplied a callback...
            if (callback) {
                // ...call it now!
                callback(ferr, fres, fbody);
            }
        })).pipe(_resStream);
    }
    catch (err) { // If something went wrong with the request...
        // TODO: Log this!
        // If the caller supplied a callback...
        if (callback) {
            // ...they need to know the truth.
            callback(err);
        }
    }
}

module.exports = Forwarder;


