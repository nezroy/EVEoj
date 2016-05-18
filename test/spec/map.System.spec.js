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

var SDD;
var map;
var promise;

describe("map.System setup", function() {
	it("loads a valid source", function(done) {
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
		promise = SDD.LoadMeta();
		expect(promise).not.toEqual(null);
		promise.caught(function(ex) {
			fail(ex.error);
		}).lastly(done);
	});
});

describe("map.System setup", function() {
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(props.SDD_version);
		expect(SDD.verdesc).toEqual(props.SDD_verdesc);
		expect(SDD.schema).toEqual(props.SDD_schema);
	});
	it("returns a new object for a valid type", function() {
		map = EVEoj.map.Create(SDD, "K");
		expect(map).not.toBeNull(null);
		expect(EVEoj.map.P.isPrototypeOf(map)).toEqual(true);
	});
	it("returns a promise", function(done) {
		promise = map.Load();
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			fail(ex.error);
		}).lastly(done);
	});
});

describe("map.System", function() {
	var sys1;
	var sys2;
	var sys3;
	var sys4;

	beforeEach(function() {
		sys1 = map.GetSystem({
			name: "Amarr"
		});
		sys2 = map.GetSystem({
			name: "Olide"
		});
		sys3 = map.GetSystem({
			name: "Olin"
		});
		sys4 = map.GetSystem({
			name: "X-PQEX"
		});
		expect(sys1).not.toBeNull();
		expect(sys2).not.toBeNull();
		expect(sys3).not.toBeNull();
		expect(sys4).not.toBeNull();
	});

	it("has expected name", function() {
		expect(sys1.name).toEqual("Amarr");
		expect(sys2.name).toEqual("Olide");
		expect(sys3.name).toEqual("Olin");
		expect(sys4.name).toEqual("X-PQEX");
	});

	it("has expected contiguity data", function() {
		expect(sys1.contiguous).toEqual(true);
		expect(sys2.contiguous).toEqual(false);
		expect(sys3.contiguous).toEqual(false);
		expect(sys4.contiguous).toEqual(false);
	});

	it("has expected truesec", function() {
		expect(sys1.security).toEqual(1);
		expect(sys2.security).toEqual(0.7416);
		expect(sys3.security).toEqual(0.311446);
		expect(sys4.security).toEqual(-0.540927);
	});

	it("has expected security", function() {
		expect(sys1.sec).toEqual("1.0");
		expect(sys2.sec).toEqual("0.7");
		expect(sys3.sec).toEqual("0.3");
		expect(sys4.sec).toEqual("0.0");
	});

	it("has expected posMin.y", function() {
		expect(sys1.posMin.y).toEqual(4.02384e+016);
		expect(sys2.posMin.y).toEqual(-1.27011e+016);
		expect(sys3.posMin.y).toEqual(-2.61816e+015);
		expect(sys4.posMin.y).toEqual(7.54857e+016);
	});
});
