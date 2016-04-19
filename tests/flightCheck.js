/**
 * Created by patdaburu on 4/18/2016.
 * These are sample tests to verify that the required test libraries are available.
 */
"use strict";

var should = require('should');
var assert = require('assert');

describe('Test Framework', function () {
    it('should have mocha installed and running.', function () {
        assert.equal(true, true);
    });
    it('should have the should library installed and running for fluent testing.', function () {
        true.should.eql(true);
    });
});