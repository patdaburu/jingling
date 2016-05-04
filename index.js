/**
 * jingling
 * @module jingling
 */
"use strict";

var Proxy = require('./proxy/Proxy');

module.exports.Forwarder = require('./proxy/Forwarder');
module.exports.GeocodingProxyRouter = require('./proxy/GeocodingProxyRouter');
module.exports.MapServerProxyRouter = require('./proxy/MapServerProxyRouter');
module.exports.Proxy = require('./proxy/Proxy');
module.exports.ProxyRouter = require('./proxy/ProxyRouter');
module.exports.RestInfoProxyRouter = require('./proxy/RestInfoProxyRouter');

module.exports = function () {
    return new Proxy();
}
