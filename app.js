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

var app = express();

/** You can use app.param() to load the parameter value for everybody!!! */
app.param('username', function (req, res, next, username) {
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

app.route('/*') // You can also use a REGEX!!!
    .all(function (req, res, next) {
        res.write('all\n');
        next();
    })
    .get(function (req, res, next) {
        res.end('thank you for GETing');
    })
    .post(function (req, res, next) {
        res.end('thank you for POSTing');
    });

app.listen(1337);

console.log('Server running at http://127.0.0.1:1337');