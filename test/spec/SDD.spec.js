"use strict";

var EVEoj = require("../../src/EVEoj.js");

describe("SDD.Create", function() {
	it("returns null for invalid type", function() {
		var SDD_invalid = EVEoj.SDD.Create("notatype");
		expect(SDD_invalid).toBeNull(null);
	});
	it("returns a new object for a valid type", function() {
		var SDD;
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {
				path: "http://eve-oj.dev/sdd/105658"
			});
		} else {
			SDD = EVEoj.SDD.Create("json", {
				path: "D:\\projects\\xyjax\\static\\sdd\\105658"
			});
		}
		expect(SDD).not.toBeNull(null);
		expect(EVEoj.SDD.Source.P.isPrototypeOf(SDD)).toEqual(true);
	});
});