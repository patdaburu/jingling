/**
 * Created by patdaburu on 4/23/2016.
 */

//var module = require('module');
var express = require('express');
var _ = require('underscore');

function ServiceRouter(args) { // TODO: Take single object parameter!
    //this._app = app;
    //this._path = path;
    //this._name = "parent class";
//    this.app = args.app;
//    this.path = args.path;
//    this.autoStart = args.autoStart;

    this._name = "parent class";

    // Mix the args with defaults, then with this object.
    _.extend(this, _.extend({autoStart: true}, args));

    this._router = express.Router();
    // Give the subclasses a chance to modify the router.
    this._initRouter(this._router);

    if (args.autoStart) {
        this.start();
    }

}

ServiceRouter.prototype._initRouter = function (router) {
    // NO-OP
    // TODO: Perhaps we need a warning here?
}

ServiceRouter.prototype.start = function () {
    console.log('starting! ' + this.path);
    this.app.use(this.path, this._router);
}


module.exports = ServiceRouter;