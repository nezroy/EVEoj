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

describe("map.System", function() {
	it("loads valid metadata asynchronously", function(done) {
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
	it("loads a valid source asynchronously", function(done) {
		promise = map.Load();
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			fail(ex.error);
		}).lastly(done);
	});
});

describe("map.System systems", function() {
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

	it("have expected name", function() {
		expect(sys1.name).toEqual("Amarr");
		expect(sys2.name).toEqual("Olide");
		expect(sys3.name).toEqual("Olin");
		expect(sys4.name).toEqual("X-PQEX");
	});

	it("have expected contiguity data", function() {
		expect(sys1.contiguous).toEqual(true);
		expect(sys2.contiguous).toEqual(false);
		expect(sys3.contiguous).toEqual(false);
		expect(sys4.contiguous).toEqual(false);
	});

	it("have expected truesec", function() {
		expect(sys1.security).toEqual(1);
		expect(sys2.security).toEqual(0.7416);
		expect(sys3.security).toEqual(0.311446);
		expect(sys4.security).toEqual(-0.540927);
	});

	it("have expected security", function() {
		expect(sys1.sec).toEqual("1.0");
		expect(sys2.sec).toEqual("0.7");
		expect(sys3.sec).toEqual("0.3");
		expect(sys4.sec).toEqual("0.0");
	});

	it("have expected posMin.y", function() {
		expect(sys1.posMin.y).toEqual(40238358304938660);
		expect(sys2.posMin.y).toEqual(-12701098420635534);
		expect(sys3.posMin.y).toEqual(-2618156629040208);
		expect(sys4.posMin.y).toEqual(75485681880991120);
	});

	it("have expected posMax.x", function() {
		expect(sys1.posMax.x).toEqual(-204748335941305250);
		expect(sys2.posMax.x).toEqual(-200296649701113180);
		expect(sys3.posMax.x).toEqual(-298025094269374000);
		expect(sys4.posMax.x).toEqual(154669319414762560);
	});

	it("have expected pos.z", function() {
		expect(sys1.pos.z).toEqual(-57621278902421040);
		expect(sys2.pos.z).toEqual(8548456481539123);
		expect(sys3.pos.z).toEqual(-31784751461509644);
		expect(sys4.pos.z).toEqual(96773224779781040);
	});

});
