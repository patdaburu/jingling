/**
 * Proxy
 * @module luyouqi/ProxyRouter
 * @see module:luyouqi/ProxyRouter
 *
 * Created by patdaburu on 4/23/2016.
 */
"use strict";


//curl http://localhost:3030/ArcGIS/rest/services/World/MapServer/?f=json
//http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/0?f=json


var _ = require('underscore');
var express = require('express');
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
 * @param {Object}  [options] - These are the options that define the proxy's behavior.
 * @param {number}  [options.port=3030] - This is the port on which the proxy listens.
 * @param {boolean} [options.autoStart=true] - Should the proxy start listening after it's constructed?
 * @param {number}  [options.connectTimeout=10*1000] - This is the time after which connections time out.
 * @param {Forwarder} [options.forwarder=undefined] - This is the Forwarder instance used by proxy routers to
 * @constructor
 */
function Proxy(options) { // TODO: Take single object parameter!
    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({
        port: 3030,
        autoStart: true,
        connectTimeout: (10 * 1000),
        forwarder: new Forwarder()
    }, options));

    /** This is the Express application that is the basis of this proxy. */
    this._app = express();

    /**
     * Note to the future:  If it's ever desirable to make the routing paths case-sensitive, you can apply a
     * setting to this._app, like so...
     * this._app.set('case sensitive routing', true);
     */

    // Set up the proxy by adding the standard routers.
    this.setup();

    // If we're instructed to auto-start...
    if (this.autoStart) {
        // ...let's start it up!
        this.startup();
    }
}

/**
 * Prepare the proxy to handle requests.
 * @see {@link startup}
 */
Proxy.prototype.setup = function () {

    // TODO:  O, boy! Clean this block UP!!!

//    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0'

//    allowTlsUnauthorized();
//    this.forwarder.proxy = "http://127.0.0.1:8888";

    var arcgisRestServicesPath = '/ArcGIS/rest/services/World_Street_Map/';
    var mapServerProxyRouter = new MapServerProxyRouter({timeout: this.connectTimeout, forwarder: this.forwarder});

    var pathToMapServer = url.resolve(arcgisRestServicesPath, 'MapServer*'); // TODO: Do we need to specify the trailing slash?!!
    console.log(pathToMapServer);
    this._app.use(pathToMapServer, connectTimeout(this.connectTimeout), mapServerProxyRouter.getRouter());


    var restInfoProxyRouter = new RestInfoProxyRouter({timeout: this.connectTimeout, forwarder: this.forwarder});
    // Server info
    this._app.use(
        url.resolve('/ArcGIS/rest/', 'info*'),
        connectTimeout(this.connectTimeout),
        restInfoProxyRouter.getRouter()
    );


    //this.app.use(pathToMapServer, connectTimeout(this.connectTimeout), mapServerProxyRouter.getRouter());
}

/**
 * Start listening for requests.
 * @see {@link setup}
 */
Proxy.prototype.startup = function () {
    this._app.listen(this.port);
}

module.exports = Proxy;

/**
 * Allow HTTPS requests to hosts with self-signed (or otherwise unauthorized) certificates by setting
 * process.env.NODE_TLS_REJECT_UNAUTHORIZED.  This will affect the entire Node environment.
 * {@link See http://stackoverflow.com/questions/17383351/how-to-capture-http-messages-from-request-node-library-with-fiddler}
 */
module.exports.tlsAllowUnauthorized = allowTlsUnauthorized;