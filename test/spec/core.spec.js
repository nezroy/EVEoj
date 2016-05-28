/* globals window: false */
var isBrowser = typeof(window) !== "undefined";
var EVEoj;
var props;

if (isBrowser) {
	EVEoj = window.EVEoj;
	props = window.testprops;
} else {
	EVEoj = require("../../src/EVEoj");
	props = require("../testprops");
}

describe("core", function() {
	it("has expected version", function() {
		expect(EVEoj.VERSION).toEqual("0.3.0");
	});
});
