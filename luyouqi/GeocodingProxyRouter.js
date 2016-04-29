/**
 * GeocodingProxyRouter
 * @module luyouqi/GeocodingProxyRouter
 * @see module:luyouqi/ProxyRouter
 * 
 * Created by patdaburu on 4/23/2016.
 */
"use strict";

// TODO: The name of this class should be GeocodeServerProxy

// http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer

var _ = require('underscore');
var inherits = require('util').inherits;
var request = require('request');
var ProxyRouter = require('./ProxyRouter');

/**
 * @param {Object} [args] - These are the options that define the routing behavior.
 * @param {number} [args.defaultPath=/] - This is the path on which the default router is mounted.
 * @constructor
 * @extends ProxyRouter
 */
function GeocodingServiceRouter(args) {
    ProxyRouter.call(this,
        _.extend({ // Mix in the default arguments before passing the arguments to the parent.
            defaultPath: '/geocode'
        }, args));


    this.defaultRoute.get(this.onGet);
    this.defaultRoute.post(this.onPost);

}

inherits(GeocodingServiceRouter, ProxyRouter);

/*GeocodingServiceRouter.prototype.init = function(){
 // Call the parent class' implementation.
 console.log("in the sub class");
 GeocodingServiceRouter.super_.prototype._init.call(this, route);
 console.log("in the sub class again");

 var defaultRoute = this.getDefaultRoute();
 defaultRoute.get(this.onGet);
 defaultRoute.post(this.onPost);
 }*/


GeocodingServiceRouter.prototype.onGet = function (req, res, next) {
    //res.send('thanks for the GET (geocoder) SRSLY!!');
    console.log("We'll try to GET!");

    var url = "http://www.yahoo.com";
    // use a timeout value of 10 seconds
    var timeoutInMilliseconds = 10 * 1000
    var opts = {
        url: url,
        timeout: timeoutInMilliseconds
    };

    request(opts, function (err, res2, body) {
        if (err) {
            console.dir(err);
            res.send("An error occurred!");
        }
        var statusCode = res2.statusCode;
        //res.send("Status code was " + statusCode);
        res.send(res2.body);
    });
}

GeocodingServiceRouter.prototype.onPost = function (req, res, next) {
    res.send('thanks for the POST (geocoder)');
}

/*GeocodingServiceRouter.prototype.onPut = function(req, res, next){
 res.send('thanks for the PUT (geocoder)');
 }

 GeocodingServiceRouter.prototype.onDelete = function(req, res, next){
 res.send('thanks for the DELETE (geocoder)');
 }*/

module.exports = GeocodingServiceRouter;