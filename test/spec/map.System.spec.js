"use strict";

var EVEoj = require("../../src/EVEoj.js");

var SDD;
var map;
var promise;

var promise_done;
var promise_fail;
function promise_wait() {
	if (promise_done) return true;
	return false;
}
function promise_thenDone() {
	promise_done = true;
	promise_fail = false;
}
function promise_thenFail() {
	promise_done = true;
	promise_fail = true;
}

describe("map.System setup", function() {
	it("loads a valid source", function() {
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {path: "http://eve-oj.dev/sdd/100370"});
		}
		else {
			SDD = EVEoj.SDD.Create("json", {path: "D:\\projects\\xyjax\\static\\sdd\\100370"});
		}
		expect(SDD).not.toBeNull(null);
		promise = SDD.LoadMeta();
		expect(promise).not.toEqual(null);
		promise_done = false;
		promise_fail = undefined;
		promise.then(promise_thenDone, promise_thenFail);
    });	
});

describe("map.System setup", function() {
	it("succeeds asynchronously", function() {
		waitsFor(promise_wait, 2500);
		runs(function() {
			expect(promise_done).toEqual(true);
			expect(promise_fail).toBeDefined();
			expect(promise_fail).toEqual(false);
		});
	});
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(100370);
		expect(SDD.verdesc).toEqual("Crius 1.6");
		expect(SDD.schema).toEqual(100038);
	});
	it("returns a new object for a valid type", function() {
		map = EVEoj.map.Create(SDD, "K");
        expect(map).not.toBeNull(null);
		expect(EVEoj.map.P.isPrototypeOf(map)).toEqual(true);
	});
    it("returns a promise", function() {
		promise = map.Load();
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise_done = false;
		promise_fail = undefined;
		promise.then(promise_thenDone, promise_thenFail);
    });
});

describe("map.System setup", function() {
	it("succeeds asynchronously", function() {
		waitsFor(promise_wait, 10000);
		runs(function() {
			expect(promise_done).toEqual(true);
			expect(promise_fail).toBeDefined();
			expect(promise_fail).toEqual(false);
		});
	});
});

describe("map.System", function() {
	var sys1;
	var sys2;
	var sys3;
	var sys4;
	
	beforeEach(function() {
		sys1 = map.GetSystem({name: "Amarr"});
		sys2 = map.GetSystem({name: "Olide"});
		sys3 = map.GetSystem({name: "Olin"});
		sys4 = map.GetSystem({name: "X-PQEX"});
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
