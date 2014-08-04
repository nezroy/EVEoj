"use strict";

var EVEoj = require("../../src/EVEoj.js");

describe("core", function() {
    it("has expected version", function() {
        expect(EVEoj.VERSION).toEqual("0.2.0");
    });
});
