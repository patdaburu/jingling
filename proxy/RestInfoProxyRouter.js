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
var url = require('url');
var util = require('util');

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

/**
 * This is the standard handler function provided by this class.
 * @param {Request} req - This is the incoming request.
 * @param {Response} res - This is the outgoing reponse.
 * @param {function()} next - Call this function to pass control to the next handler.
 * @see addRoute
 */
RestInfoProxyRouter.prototype.onRequest = function (req, res, next) {

    // To where are we forwarding this request?
    var to = url.resolve(this.serviceUrl, req.relativePathInfo.path);
    // Now that we know where's it's going, let the forwarder take it from here.
    this.forwarder.forward(req, to, _.bind(function (err, res, body) {
        // Now let's try to make some changes to the result returned from the forwarding address...
        try {
            // Parse the body of the response into a JSON object.
            var bodyObj = JSON.parse(body);
            // Now look for each property of the object returned from the forwarding server that contains a URL that
            // points back to that server.
            _.forEach(['soapUrl', 'secureSoapUrl'], function (propertyName) {
                // Match the pattern that captures from the URL: [1] everything before the hostname, [2] the hostname,
                // and [3] everything after the hostname.
                var match = this.re.captureHost.exec(bodyObj[propertyName]);
                // If we found a match...
                if (match) {
                    // Construct the new URL.
                    var newUrl = match[1] + req.headers.host + match[3]; // TODO: R&D, Is using the host header directly reliable?
                    // Log.
                    this.logger.debug(
                        util.format("Changing REST info property '%s' from {%s} to {%s}.",
                            propertyName, bodyObj[propertyName], newUrl));
                    // Now, modify the property's value (which is a URL) to refer to the original request's host.
                    bodyObj[propertyName] = newUrl;
                }
            }, this);
            // Convert the body object back to a string and send it along.
            var result = JSON.stringify(bodyObj);
            // Log.
            this.logger.verbose(result);
            req.res.send(result);
        } catch (ex) { // If the response isn't JSON...
            // Log.
            this.logger.verbose(body);
            req.res.send(body); // ...simply write the body returned to us to the original caller.
        }
        next();
    }, this));
}

module.exports = RestInfoProxyRouter;