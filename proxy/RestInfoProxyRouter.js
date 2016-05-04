/**
 * RestInfoProxyRouter
 * @module proxy/RestInfoProxyRouter
 * @see module:proxy/ProxyRouter
 *
 * Created by patdaburu on 4/29/2016.
 */
"use strict";

var _ = require('underscore');
var inherits = require('util').inherits;
var ProxyRouter = require('./ProxyRouter'); // http://blog.modulus.io/node.js-tutorial-how-to-use-request-module

/**
 * @param {Object} [options] - These are the options that define the routing behavior.
 * @param {number} [options.defaultPath=/] - This is the path on which the default router is mounted.
 * @param {string} [options.serviceUrl] - This is the URL of the service to which requests are forwarded.
 * @constructor
 * @extends ProxyRouter
 */
function RestInfoProxyRouter(options) {
    ProxyRouter.call(this,
        _.extend({ // Mix in the default arguments before passing the arguments to the parent.
            defaultPath: '/',
            serviceUrl: "http://services.arcgisonline.com/ArcGIS/rest/info/",
            serviceType: ProxyRouter.ServiceTypes.REST_INFO
        }, options));
}

inherits(RestInfoProxyRouter, ProxyRouter);

module.exports = RestInfoProxyRouter;