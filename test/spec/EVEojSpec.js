"use strict";

var EVEoj = require("../../src/EVEoj.js");

describe("EVEoj", function() {
    it("EVEoj.VERSION test", function() {
        expect(EVEoj.VERSION).toEqual("0.2.0");
    });
});

/*
describe("HelloUnderscore", function() {
    it("hello() should escape 'hello & hi' when called", function() {
        expect(HelloWorld.helloUnderscore()).toEqual("hello &amp; hi");
    });
});
*/
