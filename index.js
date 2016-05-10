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
module.exports.proxy.GeocodingProxyRouter = require('./proxy/GeocodingProxyRouter');
module.exports.proxy.MapServerProxyRouter = require('./proxy/MapServerProxyRouter');
module.exports.proxy.Proxy = require('./proxy/Proxy');
module.exports.proxy.ProxyRouter = require('./proxy/ProxyRouter');
module.exports.proxy.RestInfoProxyRouter = require('./proxy/RestInfoProxyRouter');

module.exports = function () {
    return new Proxy();
}
