/**
 * Created by patdaburu on 4/18/2016.
 * This is the main point of entry for the server.
 */
"use strict";

/* BEFORE BEGINNING:  Review 'Popular Connect/ExpressJS Middleware' */

var express = require('express');

// This is just the basic test code.  Start with connect()!
/*var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
 }).listen(1337, '127.0.0.1');*/

var app = express()
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
    });

app.listen(1337);

console.log('Server running at http://127.0.0.1:1337');