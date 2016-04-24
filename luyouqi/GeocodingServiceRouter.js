/**
 * Created by patdaburu on 4/23/2016.
 */

var inherits = require('util').inherits;
var ServiceRouter = require('./ServiceRouter');

function GeocodingServiceRouter(args) {
    ServiceRouter.call(this, args);

}

inherits(GeocodingServiceRouter, ServiceRouter);

GeocodingServiceRouter.prototype._initRouter = function (router) {
    // Add additional stuff to the router.
    router.route('/')
        .get(function (req, res, next) {
            res.send('thanks for the GET (geocoder)');
        })
        .post(function (req, res, next) {
            res.send('thanks for the POST (geocoder)');
        })
        .put(function (req, res, next) {
            res.send('thanks for the PUT (geocoder)');
        })
        .delete(function (req, res, next) {
            res.send('thanks for the DELETE (geocoder)');
        });
}

module.exports = GeocodingServiceRouter;