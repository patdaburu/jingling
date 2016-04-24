/**
 * Created by patdaburu on 4/24/2016.
 */

var serviceRouter = require('../service-router');

module.exports = function () {
    // Start with a standard Express router object pre-configured by the service-router module.
    var router = serviceRouter();

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

    // Return the router.
    return router;

}