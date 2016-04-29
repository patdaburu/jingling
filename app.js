/**
 * Created by patdaburu on 4/18/2016.
 * This is the main point of entry for the server.
 */
"use strict";

/* BEFORE BEGINNING:  Review 'Popular Connect/ExpressJS Middleware' */
/* ALSO: Express Router Objects!!  That's the actual way to do this! */
/* CHECK OUT: express.Router http://expressjs.com/en/guide/routing.html
 *                            http://matthewgladney.com/blog/angular/using-regex-with-node-express-router/*/

var express = require('express');
var timeout = require('connect-timeout');

//var ServiceRouter = require('./luyouqi/ServiceRouter');
//var GeocodingServiceRouter = require('./luyouqi/GeocodingServiceRouter');
var luyouqi = require('./luyouqi');


// This is just the basic test code.  Start with connect()!
/*var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
 }).listen(1337, '127.0.0.1');*/

/*var app = express()
 .use('/api', function (req, res, next) {
 // Send an error code.
 //res.status(404).send("These are not the droids you're looking for.");
 // Send a JSON object.
 res.send({
 full_url: req.originalUrl, // the whole, original URL
 rel_url: req.url, // relative to the mount point
 shoe_color: req.query.shoe.color,
 shoe_type: req.query.shoe.type
 });
 });*/


//var app = express();

/** You can use app.param() to load the parameter value for everybody!!! */
/*app.param('username', function (req, res, next, username) {
    req.user = {userId: username};
    next();
});
app.route('/user/:username/:thing')
    .all(function (req, res, next) {
        res.send('Hey, ' + req.user.userId + '. I am ' + req.params.thing + '!');
    });

app.route(/^\/([0-9]+)$/i) // We capture the number...
    .all(function (req, res, next) {
        res.send("That's the number " + req.params[0]); // ...and it becomes params[0]
    });

 app.route('/!*') // You can also use a REGEX!!!
    .all(function (req, res, next) {
        res.write('all\n');
        next();
    })
    .get(function (req, res, next) {
        res.end('thank you for GETing');
    })
    .post(function (req, res, next) {
        res.end('thank you for POSTing');
 });*/

/*var serviceRouter = new ServiceRouter();
 serviceRouter.routeFor(app);
 console.log(serviceRouter.expressRouter);*/

//var geocodingRouter = new GeocodingServiceRouter(app, '/', true);
/*var geocodingRouter = new GeocodingServiceRouter({
 app: app,
 path: '/geocode'
 });
 console.log(geocodingRouter._name);*/

//console.log(luyouqi());
//var gcrouter = luyouqi.geocodeRouter();
//app.use('/geocode', gcrouter);


//var app = luyouqi();
//app.listen(1337);


//var GeocodingProxyRouter = require('./luyouqi/GeocodingProxyRouter');
//var geocodingProxyRouter = new GeocodingProxyRouter();
//var app = express().use('/', geocodingProxyRouter._router).listen(1337);

var Proxy = require('./luyouqi/Proxy');

var proxy = new Proxy();


console.log('Server running at http://127.0.0.1:' + proxy.port);