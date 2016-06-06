/**
 * Proxy
 * @module proxy/Proxy
 */
"use strict";

var _ = require('underscore');
var AuthMiddleware = require('../auth/AuthMiddleware');
var express = require('express');
var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var FeatureServerProxyRouter = require('./FeatureServerProxyRouter');
var Logger = require('../log/Logger');
var MapServerProxyRouter = require('./MapServerProxyRouter');
var RestInfoProxyRouter = require('./RestInfoProxyRouter');
var Forwarder = require('./Forwarder');
var connectTimeout = require('connect-timeout');
var url = require('url');

/**
 * Allow HTTPS request to hosts with self-signed (or otherwise unauthorized) certificates by setting
 * process.env.NODE_TLS_REJECT_UNAUTHORIZED.  This will affect the entire Node environment.
 * {@link See http://stackoverflow.com/questions/17383351/how-to-capture-http-messages-from-request-node-library-with-fiddler}
 */
var allowTlsUnauthorized = function () {
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'
}

/**
 * @class
 * @classdesc A proxy is the host for proxy routers.
 * @param {Object}  [options] - These are the options that define the proxy's behavior.
 * @param {number}  [options.port=3030] - This is the port on which the proxy listens.
 * @param {boolean} [options.autoStart=true] - Should the proxy start listening after it's constructed?
 * @param {number}  [options.connectTimeout=10*1000] - This is the time after which connections time out.
 * @param {number}  [options.keepAlive=30*1000] - This is how long a connection socket can remain open.
 * @param {Forwarder} [options.forwarder=undefined] - This is the Forwarder instance used by proxy routers to forward
 *                                                    requests.
 * @param {Logger} [options.forwarder=undefined] - This is the logger used by the proxy.
 * @constructor
 */
function Proxy(options) {
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        port: 3030,
        autoStart: true,
        connectTimeout: (10 * 1000),
        keepAlive: (30 * 1000),
        forwarder: new Forwarder(),
        logger: new Logger()
    }, options));
    
    /** This is the Express application that is the basis of this proxy. */
    this._app = express();

    /**
     * Note to the future:  If it's ever desirable to make the routing paths case-sensitive, you can apply a
     * setting to this._app, like so...
     * this._app.set('case sensitive routing', true);
     */

    /**
     * This is an array of all the proxy routers used by this proxy.
     * @readonly
     * @type {ProxyRouter[]}
     * @see module:ProxyRouter
     */
    this.proxyRouters = [];

    // Set up the proxy by adding the standard routers.
    this.setup();

    // If we're instructed to auto-start...
    if (this.autoStart) {
        // ...let's start it up!
        this.startup();
    }
}

inherits(Proxy, EventEmitter);

/**
 * Prepare the proxy to handle requests.
 * @see {@link startup}
 */
Proxy.prototype.setup = function () {



    // Set up the 'Auth' Middleware.
    var amw = new AuthMiddleware();
//    this._app.use('/theonion', amw.getHandler());
    this._app.use(
        '/',
        connectTimeout(this.connectTimeout),
        amw.getRouter());


    // Set up the MapServer proxy.
    var mapServerProxyRouter = new MapServerProxyRouter({
        timeout: this.connectTimeout,
        forwarder: this.forwarder,
        logger: this.logger
    });
    this._app.use(
        '/ArcGIS/rest/services/Banana/', /* Note: Don't include MapServer */
        connectTimeout(this.connectTimeout),
        mapServerProxyRouter.getRouter());
    this.proxyRouters.push(mapServerProxyRouter);

    // Set up the ArcGIS Server Info proxy.
    var restInfoProxyRouter = new RestInfoProxyRouter({
        serviceUrl: 'http://pv-installtest6:6080/ArcGIS/rest/info/',
        timeout: this.connectTimeout,
        forwarder: this.forwarder,
        logger: this.logger
    });
    this._app.use(
        '/ArcGIS/rest/',
        connectTimeout(this.connectTimeout),
        restInfoProxyRouter.getRouter()
    );
    this.proxyRouters.push(restInfoProxyRouter);

    // Set up the FeatureServer proxy.
    var featureServerProxyRouter = new FeatureServerProxyRouter({
        serviceUrl: 'http://pv-installtest6:6080/arcgis/rest/services/Shoreline_BirdSightings/FeatureServer/',
        timeout: this.connectTimeout,
        forwarder: this.forwarder,
        logger: this.logger
    });
    this._app.use(
        '/ArcGIS/rest/services/Shoreline_BirdSightings/', /* Note: Don't include FeatureServer */
        connectTimeout(this.connectTimeout),
        featureServerProxyRouter.getRouter()
    );
    this.proxyRouters.push(featureServerProxyRouter);

}

/**
 * Start listening for requests.
 * @see {@link setup}
 */
Proxy.prototype.startup = function () {
    // Start listening.
    this._server = this._app.listen(this.port);

    // Whenever the server makes a new connection...
    var onServerConnection = this._server.on(
        'connection',
        _.bind(function (socket) {
            // TODO: Log or otherwise meter this.
            // ...set the 'keep-alive' duration on the socket.
            socket.setTimeout(this.keepAlive);

            // We need a callback that will...
            var onProxyDestroy = function () {
                // Log...
                this.logger.debug("A socket is being destroyed because the Proxy instance was destroyed.");
                // ...destroy this socket...
                socket.destroy();
            }
            // ...when the proxy is destroyed.
            this.once('destroy', onProxyDestroy);
            // Log the listener count in case we need to look for memory leaks.
            this.logger.debug(
                "Listener count for Proxy 'destroy' event is now: " +
                EventEmitter.listenerCount(this, 'destroy'));
            // But when the socket is closed...
            socket.once('close', _.bind(function () {
                // ...we no longer need to worry about closing it when the proxy is destroyed.
                this.removeListener('destroy', onProxyDestroy);
                // Log the listener count in case we need to look for memory leaks.
                this.logger.debug(
                    "Listener count for Proxy 'destroy' event is now: " +
                    EventEmitter.listenerCount(this, 'destroy'));
            }, this));
        }, this));
    // Unhook this event handler when the proxy is destroyed.
    this.once('destroy', function () {
        onServerConnection.remove();
    });
}

/**
 * Destroy the object.
 */
Proxy.prototype.destroy = function () {
    // Let everybody know this is happening.
    this.emit('destroy');
    // Null out the large object references.
    this._app = null;
    // Destroy all of the proxy routers.
    _.each(this.proxyRouters, function (proxyRouter) {
        proxyRouter.destroy();
    });
    // Null out the reference to the server.
    this._server = null;
    // Remove all the listeners.
    this.removeAllListeners();
}

module.exports = Proxy;

/**
 * Allow HTTPS requests to hosts with self-signed (or otherwise unauthorized) certificates by setting
 * process.env.NODE_TLS_REJECT_UNAUTHORIZED.  This will affect the entire Node environment.
 * {@link See http://stackoverflow.com/questions/17383351/how-to-capture-http-messages-from-request-node-library-with-fiddler}
 */
module.exports.allowTlsUnauthorized = allowTlsUnauthorized;