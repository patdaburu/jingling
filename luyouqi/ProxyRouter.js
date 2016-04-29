/**
 * ProxyRouter
 * @module luyouqi/ProxyRouter
 * @see module:luyouqi/ProxyRouter
 *
 * Created by patdaburu on 4/23/2016.
 */
"use strict";

var _ = require('underscore');
var express = require('express');
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
     * FeatureServerNotYetImplemented
     * {@link http://resources.arcgis.com/en/help/main/10.2/index.html#//0154000002w8000000|What is a feature service?}
     */
    FEATURE_SERVER: 'FeatureServerNotYetImplemented',
    /**
     * Info - ArcGIS Server Information
     */
    REST_INFO: 'Info'
}

/**
 * @param {Object} options - These are the options that define the routing behavior.
 * @param {string} options.serviceUrl - This is the URL of the service to which requests are forwarded.
 * @param {ServiceTypes} options.serviceType - This is the type of the service to which requests are forwarded.
 * @param {number} [options.timeout=10*1000] - How long should the proxy wait before timing out a connection?
 * @param {function({}, function(error, response, body)} [options.request=require('request')] - This is the function used to make HTTP(S) requests.
 * @param {Forwarder} [options.forwarder] - This is the forwarder that handles the actual forwarding of requests.
 * @constructor
 * @see GeocodingProxyRouter
 * @see request
 */
function ProxyRouter(options) {
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        serviceUrl: null,
        serviceType: null,
        timeout: 10 * 1000,
        forwarder: new Forwarder(),
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
     * This is a dictionary of regular expression used by the proxy router.
     * @type {{}}
     * @private
     */
    this._re = {};

    /**
     * This is a regular expression that captures everything in a request's original URL after the service type, not
     * including the query string.
     * @type {RegExp}
     * @private
     */
    this._re.subPath = new RegExp('\\/' + this.serviceType + '\\/?(.*)\\??', 'i'); // TODO: Document this regular expression IN DETAIL!!!

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
                // ...add the default handler for this HTTP method to the default route.
                this._defaultRoute[method](_.bind(this.onRequest, this));
            }
        }, this);
    }
}

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
ProxyRouter.prototype.getRelativePath = function (req) {
    // Match the request's originalUrl property against the regex that captures the subpath.
    var match = this._re.subPath.exec(req.originalUrl);
    // If we found a match...
    if (match) {
        // ...return it.
        return match[1];
    }
    else {
        // TODO: Throw an error.
        console.error('no match!');
    }
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
    req.relativePath = this.getRelativePath(req);
    next();
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
    var to = url.resolve(this.serviceUrl, req.relativePath);
    // Now that we know where's it's going, let the forwarder take it from here.
    this.forwarder.autoForward(req, to, function (err, res, body) {
        // When the forwarder is finished, we need to move on to the next handler.
        next();
    });
}

module.exports = ProxyRouter;

/**
 * These are the defined web service types.
 * @readonly
 * @enum {string}
 */
module.exports.ServiceTypes = ServiceTypes;