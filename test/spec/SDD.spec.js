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

describe("SDD.Create", function() {
	it("returns null for invalid type", function() {
		var SDD_invalid = EVEoj.SDD.Create("notatype");
		expect(SDD_invalid).toBeNull(null);
	});
	it("returns a new object for a valid type", function() {
		var SDD;
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {
				path: props.SDD_URL_path
			});
		} else {
			SDD = EVEoj.SDD.Create("json", {
				path: props.SDD_file_path
			});
		}
		expect(SDD).not.toBeNull(null);
		expect(EVEoj.SDD.Source.P.isPrototypeOf(SDD)).toEqual(true);
	});
});
