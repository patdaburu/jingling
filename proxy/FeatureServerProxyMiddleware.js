/**
 * FeatureServerProxyMiddleware
 * @module proxy/FeatureServerProxyMiddleware
 */
"use strict";

var _ = require('underscore');
var inherits = require('util').inherits;
var ProxyMiddleware = require('./ProxyMiddleware'); // http://blog.modulus.io/node.js-tutorial-how-to-use-request-module

/**
 * @param {Object} [options] - These are the options that define the routing behavior.
 * @param {number} [options.defaultPath=/] - This is the path on which the default router is mounted.
 * @param {string} [options.serviceUrl] - This is the URL of the service to which requests are forwarded.
 * @param {Forwarder} [options.forwarder=new Forwarder()] - This is the forwarder that handles the actual forwarding of requests.
 * @param {Logger} [options.logger=new Logger()] - This is the logger used by the proxy router.
 * @constructor
 * @extends ProxyMiddleware
 */
function FeatureServerProxyMiddleware(options) {
    ProxyMiddleware.call(this,
        _.extend({ // Mix in the default arguments before passing the arguments to the parent.
            defaultPath: '/',
            serviceUrl: "https://sampleserver6.arcgisonline.com/arcgis/rest/services/LocalGovernment/Recreation/FeatureServer/",
            serviceType: ProxyMiddleware.ServiceTypes.FEATURE_SERVER
        }, options));
}

inherits(FeatureServerProxyMiddleware, ProxyMiddleware);

/**
 * This is a standard handler function applied to every route created for this proxy.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
FeatureServerProxyMiddleware.prototype.onInject = function (req, res, next) {
    // This is an example of calling the parent constructor, but not moving on to the next router (notice that we
    // don't pass the "next" function up.
    this.constructor.super_.prototype.onInject.call(this, req, res);
    /**
     * Do additional stuff here.
     */
    // Now move on to the next handler.
    next();
}

/**
 * This is the standard handler function provided by this class.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
FeatureServerProxyMiddleware.prototype.onRequest = function (req, res, next) {
    // This override is here temporarily as an example of calling the parent class when using util/inherits.
    this.constructor.super_.prototype.onRequest.call(this, req, res, next);
}

module.exports = FeatureServerProxyMiddleware;
