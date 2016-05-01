/**
 * jingling
 * @module jingling
 */
"use strict";

var Proxy = require('./luyouqi/Proxy');

module.exports.Forwarder = require('./luyouqi/Forwarder');
module.exports.GeocodingProxyRouter = require('./luyouqi/GeocodingProxyRouter');
module.exports.MapServerProxyRouter = require('./luyouqi/MapServerProxyRouter');
module.exports.Proxy = require('./luyouqi/Proxy');
module.exports.ProxyRouter = require('./luyouqi/ProxyRouter');
module.exports.RestInfoProxyRouter = require('./luyouqi/RestInfoProxyRouter');

module.exports = function () {
    return new Proxy();
}
