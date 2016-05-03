/**
 * MapServerProxyRouter
 * @module luyouqi/MapServerProxyRouter
 * @see module:luyouqi/ProxyRouter
 *
 * Created by patdaburu on 4/23/2016.
 */
"use strict";

var _ = require('underscore');
var inherits = require('util').inherits;
var ProxyRouter = require('./ProxyRouter'); // http://blog.modulus.io/node.js-tutorial-how-to-use-request-module

// This import has been added temporarily to perform a test.
var fs = require('fs');

/**
 * @param {Object} [options] - These are the options that define the routing behavior.
 * @param {number} [options.defaultPath=/] - This is the path on which the default router is mounted.
 * @param {string} [options.serviceUrl] - This is the URL of the service to which requests are forwarded.
 * @constructor
 * @extends ProxyRouter
 */
function MapServerProxyRouter(options) {
    ProxyRouter.call(this,
        _.extend({ // Mix in the default arguments before passing the arguments to the parent.
            defaultPath: '/',
            serviceUrl: "http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/",
            serviceType: ProxyRouter.ServiceTypes.MAP_SERVER
        }, options));
}

inherits(MapServerProxyRouter, ProxyRouter);

/**
 * This is the standard handler function provided by this class.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
MapServerProxyRouter.prototype.onRequest = function (req, res, next) {

    /** BEGIN KITTEN SERVER TEST */
    if (req.relativePathInfo) {
        console.log(req.relativePathInfo.parts);
    }
    if (req.relativePathInfo.parts[0] == 'tile' && req.relativePathInfo.parts[1] == '5') {
        console.log("They want a tile!");

        res.sendFile('C:\\tmp\\test_tile.jpg');
        //res.writeHead(200, {'Content-Type': 'image/jpeg'});
        //fs.createReadStream('test_tile.jpg').pipe(res);
        return;
    }
    /** END KITTEN SERVER TEST */

    // This override is here temporarily as an example of calling the parent class when using util/inherits.
    this.constructor.super_.prototype.onRequest.call(this, req, res, next);
}

module.exports = MapServerProxyRouter;