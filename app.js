/**
 * Created by patdaburu on 4/18/2016.
 * This is the main point of entry for the server.
 */
"use strict";

// This is just the basic test code.  Start with connect()!
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Hello World\n');
}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337');