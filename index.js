/**
 * jingling
 * @module jingling
 */
"use strict";

var Proxy = require('./proxy/Proxy');

module.exports.log = {};
module.exports.log.Logger = require('./log/Logger');
module.exports.log.WinstonLogger = require('./log/WinstonLogger');

module.exports.proxy = {};
module.exports.proxy.Forwarder = require('./proxy/Forwarder');
module.exports.proxy.GeocodingProxyMiddleware = require('./proxy/GeocodingProxyMiddleware');
module.exports.proxy.MapServerProxyMiddleware = require('./proxy/MapServerProxyMiddleware');
module.exports.proxy.Proxy = require('./proxy/Proxy');
module.exports.proxy.ProxyMiddleware = require('./proxy/ProxyMiddleware');
module.exports.proxy.RestInfoProxyMiddleware = require('./proxy/RestInfoProxyMiddleware');

module.exports = function () {
    return new Proxy();
}
