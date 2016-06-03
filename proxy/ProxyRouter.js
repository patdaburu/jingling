/**
 * ProxyRouter
 * @module proxy/ProxyRouter
 */
"use strict";

var _ = require('underscore');
var Logger = require('../log/Logger');
var EventEmitter = require('events').EventEmitter;
var express = require('express');
var inherits = require('util').inherits;
var Forwarder = require('./Forwarder');
var url = require('url');

/**
 * These are the defined web service types.
 * @readonly
 * @enum {string}
 */
var ServiceTypes = {
    /**
     * MapServer
     * {@link http://resources.arcgis.com/en/help/main/10.2/index.html#//0154000002m7000000|What is a map service?}
     */
    MAP_SERVER: 'MapServer',
    /**
     * FeatureServer
     * {@link http://resources.arcgis.com/en/help/main/10.2/index.html#//0154000002w8000000|What is a feature service?}
     */
    FEATURE_SERVER: 'FeatureServer',
    /**
     * Info - ArcGIS Server Information
     */
    REST_INFO: 'Info'
}

/**
 * @class
 * @classdesc This is a base class for classes that know how to perform proxy functions.
 * @param {Object} options - These are the options that define the routing behavior.
 * @param {string} options.serviceUrl - This is the URL of the service to which requests are forwarded.
 * @param {ServiceTypes} options.serviceType - This is the type of the service to which requests are forwarded.
 * @param {number} [options.timeout=10*1000] - How long should the proxy wait before timing out a connection?
 * @param {function({}, function(error, response, body))} [options.request=require('request')] - This is the function used to make HTTP(S) requests.
 * @param {Forwarder} [options.forwarder=new Forwarder()] - This is the forwarder that handles the actual forwarding of requests.
 * @param {Logger} [options.logger=new Logger()] - This is the logger used by the proxy router.
 * @constructor
 * @see GeocodingProxyRouter
 * @see MapServerProxyRouter
 * @see RestInfoProxyRouter
 * @see request
 */
function ProxyRouter(options) {
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        serviceUrl: null,
        serviceType: null,
        timeout: 10 * 1000,
        forwarder: new Forwarder(),
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
     * These are the routes that have been defined for this router.
     * @type {Array}
     * @private
     * @see {Route}
     */
    this._routes = [];

    /**
     * This is a dictionary of regular expression strings and RegExp objects used by the proxy router.
     * @type {Object}
     * @see RegExp
     */
    this.re = {};

    /**
     * This is a regular expression that captures everything in a request's original URL after the service type, not
     * including the query string.
     * @type {RegExp}
     */
    this.re.subPath = new RegExp('\\/' + this.serviceType + '\\/?(.*)\\??', 'i'); // TODO: Document this regular expression IN DETAIL!!!

    /**
     * This is a regular expression pattern (character literal) that can be used to split a sub-path into its parts.
     * @type {RegExp}
     */
    this.re.pathParts = /\//;

    // We now need to construct the regular expression that matches and captures everything before the host,
    // the host itself, and everything after from a URL.
    var serviceUrlHost = url.parse(this.serviceUrl).hostname;
    var serviceUrlHostEscapeDots = serviceUrlHost.replace('.', '\\.');
    // (https?\:\/\/|^)(services\.arcgisonline\.com)([\/$\?].*)
    this.re.captureHost = new RegExp('(https?\\:\\/\\/|^)(' + serviceUrlHostEscapeDots + ')([\\/$\\?].*)', 'i'); // TODO: Document this regular expression IN DETAIL!!!

    /**
     * This is the proxy router's default route path.
     * @type {Route}
     * @private
     */
    this._defaultRoutePath = "/" + this.serviceType + "/?*";
    this._defaultRoute = this.addRoute(this._defaultRoutePath);

    // Let's make sure we have a service type.
    if (!this.serviceType) {
        console.warn("No service type is specified!") // TODO: Log this properly.
    }

    // Let's make sure we have a service URL.
    if (!this.serviceUrl) {
        console.warn("No service URL is specified!"); // TODO: Log this properly.
    }

    // If the caller didn't specify any HTTP methods to handle...
    if (!this.methods) {
        console.warn("No methods were specified!"); // TODO: Log this properly.
    } else { // Otherwise, let's set up the handlers!
        // Iterate over all the known HTTP methods.
        _.each(['get', 'post', 'put', 'delete', 'all'], function (method) {
            // If the methods property contains this HTTP method...
            if (_.intersection(this.methods, [method]).length > 0) {
                // ...figure out what the name for the handler method is based on the method name.
                var handler = 'on' + method.charAt(0).toUpperCase() + method.substr(1);
                // Now, add the default handler for this HTTP method to the default route.
                this._defaultRoute[method](_.bind(this[handler], this));
            }
        }, this);
    }
}

inherits(ProxyRouter, EventEmitter);

/**
 * Get this proxy router's Express/Connect router.
 * @returns {Router}
 */
ProxyRouter.prototype.getRouter = function () {
    return this._router;
}

/**
 * Add a new route to this router.
 * @param {string} path - This is the path the route handles.
 * @returns {Route} - The method returns the route the newly-created route.
 */
ProxyRouter.prototype.addRoute = function (path) {
    // Create the Express/Connect route.
    var route = this._router.route(path);

    // The base class injects a handler for all the methods handled by this route.
    route.all(_.bind(this.onInject, this));

    // Add this route to the collection of routes for this router.
    this._routes.push(route);

    // Return the route to the caller.
    return route;
}

/**
 * Get the part of a request URL's path that is below this router's service path.
 * @param {Request} req - This is the original request.
 * @returns {string} - The method returns the relative path.
 */
ProxyRouter.prototype.getRelativePathInfo = function (req) {
    // We're going to populate an object with information about the relative path.
    var relPathInfo = {};
    // Match the request's originalUrl property against the regex that captures the subpath.
    var match = this.re.subPath.exec(req.originalUrl);
    // If we found a match...
    if (match) {
        // ...it's the path.
        relPathInfo.path = match[1];
        // Also, chop the path up into its constituent pieces.
        relPathInfo.parts = match[1].split(this.re.pathParts);
    }
    else {
        throw {
            message: "The original URL did not match the sub-path pattern."
        };
    }
    // Return the object containing all that relative path information.
    return relPathInfo;
}

/**
 * This is a standard handler function applied to every route created for this proxy.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
ProxyRouter.prototype.onInject = function (req, res, next) {
    // Get the relative path from request (a service of this class) and add it to the request object so that other
    // handlers can use it if they need to.
    req.relativePathInfo = this.getRelativePathInfo(req);

    res.setHeader('Access-Control-Allow-Origin', 'http://www.arcgis.com');
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Vary', 'Origin');


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
ProxyRouter.prototype.onRequest = function (req, res, next) {
    // To where are we forwarding this request?
    var to = url.resolve(this.serviceUrl, req.relativePathInfo.path);
    // Now that we know where's it's going, let the forwarder take it from here.
    this.forwarder.autoForward(req, to, function (err, res, body) {
        // When the forwarder is finished, we need to move on to the next handler (assuming a subclass hasn't
        // opted to deal with that part itself).
        next && next();
    });
}

/**
 * If the proxy router handles all HTTP methods with a common handler, this is the default handler method.  Override
 * this method to modify the proxy's behavior.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
ProxyRouter.prototype.onAll = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the proxy's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
ProxyRouter.prototype.onGet = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the proxy's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
ProxyRouter.prototype.onPost = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the proxy's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing response.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
ProxyRouter.prototype.onPut = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * This is the standard handler for HTTP 'GET' requests.  Override this method to modify the proxy's behavior when
 * 'GET' requests are handled.  The default behavior is to pass the call to onRequest().
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see onRequest
 */
ProxyRouter.prototype.onDelete = function (req, res, next) {
    this.onRequest(req, res, next);
}

/**
 * Destroy the object.
 */
ProxyRouter.prototype.destroy = function () {
    // Let everybody know this is happening.
    this.emit('destroy');
    // Remove all the listeners.
    this.removeAllListeners();
}

module.exports = ProxyRouter;

/**
 * These are the defined web service types.
 * @readonly
 * @enum {string}
 */
module.exports.ServiceTypes = ServiceTypes;