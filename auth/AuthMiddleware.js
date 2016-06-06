/**
 * AuthMiddleware
 * @module auth/AuthMiddleware
 */
"use strict";

var _ = require('underscore');
var Logger = require('../log/Logger');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var inherits = require('util').inherits;
var util = require('util');

/**
 * @class
 * @classdesc This is a base class for objects that can perform identity management functions like authenticating a user
 *            and enumerating permissions.
 * @param {Object} options - These are the options that define the middleware behavior.
 * @param {number} [options.timeout=10*1000] - How long should the proxy wait before timing out a connection?
 * @param {Logger} [options.logger=new Logger()] - This is the logger used by the middleware.
 * @param {string[]} [options.methods=['all']] - These are the HTTP methods subject to this middleware.
 * @constructor
 */
function AuthMiddleware(options) {
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        timeout: 10 * 1000,
        logger: new Logger(),
        methods: ['all']
    }, options));

    /**
     * This is the Express/Connect router on which this proxy router's behavior is based.
     * @type {express.Router}
     * @private
     */
    this._router = express.Router();

    /**
     * This is the primary route.
     * @type {Route}
     * @private
     */
    this._route = this._router.route('*'); // The middleware applies to every path under which it's mounted.

    // The base class injects a handler for all the methods handled by this route.
    this._route.all(_.bind(this.onInject, this));

    // If the caller didn't specify any HTTP methods to handle...
    if (!this.methods) {
        // Log this!
        this.logger.warn(util.format('%s specifies no HTTP methods to handle!', this.constructor.name));
    } else { // Otherwise, let's set up the handlers!
        // Iterate over all the known HTTP methods.
        _.each(['get', 'post', 'put', 'delete', 'all'], function (method) {
            // If the methods property contains this HTTP method...
            if (_.intersection(this.methods, [method]).length > 0) {
                // ...figure out what the name for the handler method is based on the method name.
                var handler = 'on' + method.charAt(0).toUpperCase() + method.substr(1);
                // Now, add the default handler for this HTTP method to the default route.
                this._route[method](_.bind(this[handler], this));
            }
        }, this);
    }
}

inherits(AuthMiddleware, EventEmitter);

/**
 * Get this middleware's Express/Connect router. "A Router instance is a complete middleware and routing system;
 * for this reason, it is often referred to as a 'mini-app'."
 * @returns {express.Router}
 * {@link http://expressjs.com/en/guide/routing.html|Express Routing}
 */
AuthMiddleware.prototype.getRouter = function () {
    return this._router;
}

/**
 * This is a standard handler function applied to every route created for this proxy.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
AuthMiddleware.prototype.onInject = function (req, res, next) {
    // TODO: Inject additional authentication/authorization information into the request here.
    console.log("--> AuthMiddleware.onInject()");

    // If we've been given the next handler, let's call it.
    next && next();
}

/**
 * This is the standard handler function provided by this class.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
AuthMiddleware.prototype.onRequest = function (req, res, next) {
    // TODO: By default, should we simply reject everything?
    console.log("--> AuthMiddleware.onRequest()");

    // If we've been given the next handler, let's call it.
    next && next();
}

/**
 * If the middleware handles all HTTP methods with a common handler, this is the default handler method.  Override
 * this method to modify the middleware's behavior.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
AuthMiddleware.prototype.onAll = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the middleware's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
AuthMiddleware.prototype.onGet = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the middleware's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
AuthMiddleware.prototype.onPost = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the middleware's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
AuthMiddleware.prototype.onPut = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the middleware's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
AuthMiddleware.prototype.onDelete = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * Destroy the object.
 */
AuthMiddleware.prototype.destroy = function () {
    // Let everybody know this is happening.
    this.emit('destroy');
    // Remove all the listeners.
    this.removeAllListeners();
}

module.exports = AuthMiddleware;
