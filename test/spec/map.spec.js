"use strict";

var EVEoj = require("../../src/EVEoj.js");

var SDD;
var map;
var promise;

var promise_done;
var promise_fail;
var progress_counter;
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
function progress_track() {
	// console.info("progress tracker, has: " + arg.has + " needs: " + arg.needs);
	progress_counter++;
}

var jitaID = 30000142;
var amarrID = 30002187;
var dodixieID = 30002659;
var xcfn6ID = 30000882;
var niarjaID = 30003504;
var jita_amarr_short = [
	30000144, 30000139, 30002791, 30002788, 30002789, 30003504, 30003503, 30003491, 30002187
];
var jita_amarr_hi = jita_amarr_short;
var jita_amarr_avoid = [
	30000144, 30000139, 30002802, 30002801, 30002800, 30002768, 30002765, 30002764, 30002761, 30004972, 30004970,
	30002633, 30002634, 30002641, 30002681, 30002682, 30002048, 30002049, 30002053, 30002543, 30002544, 30002568,
	30002529, 30002530, 30002507, 30002509, 30000004, 30000005, 30000002, 30002973, 30002969, 30002974, 30002972,
	30002971, 30002970, 30002963, 30002964, 30002991, 30002994, 30003545, 30003548, 30003525, 30003523, 30003522,
	30002187
];
var jita_amarr_low = [
	30000138, 30001379, 30001376, 30002813, 30002809, 30002807, 30004985, 30004980, 30004979, 30005000, 30004999,
	30005008, 30004990, 30004991, 30004992, 30002728, 30002726, 30002725, 30002727, 30002729, 30002730, 30003478,
	30003479, 30003480, 30004136, 30004121, 30004119, 30004117, 30004118, 30004120, 30005241, 30005239, 30005237,
	30005236, 30005031, 30005030, 30005035, 30005036, 30005038, 30002187
];
var jita_dodixie_short = [
	30000138, 30001379, 30001376, 30002813, 30002809, 30002811, 30002812, 30005334, 30005331, 30005203, 30002661,
	30002659
];
var jita_dodixie_hi = [
	30000144, 30000139, 30002802, 30002801, 30002800, 30002768, 30002765, 30002764, 30002761, 30004972, 30004970,
	30002633, 30002634, 30002655, 30002659
];
var jita_dodixie_low = [
	30000138, 30001379, 30001376, 30002813, 30002809, 30002807, 30004985, 30004980, 30004979, 30005000, 30004993,
	30002640, 30002661, 30002659
];

describe("map setup", function() {
	it("loads a valid source", function() {
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {path: "http://eve-oj.dev/sdd/105658"});
		}
		else {
			SDD = EVEoj.SDD.Create("json", {path: "D:\\projects\\xyjax\\static\\sdd\\105658"});
		}
		expect(SDD).not.toBeNull(null);
		promise = SDD.LoadMeta();
		expect(promise).not.toEqual(null);
		promise_done = false;
		promise_fail = undefined;
		promise.then(promise_thenDone, promise_thenFail);
    });	
});

describe("map setup", function() {
	it("succeeds asynchronously", function() {
		waitsFor(promise_wait, 2500);
		runs(function() {
			expect(promise_done).toEqual(true);
			expect(promise_fail).toBeDefined();
			expect(promise_fail).toEqual(false);
		});
	});
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(105658);
		expect(SDD.verdesc).toEqual("Oceanus 1.0");
		expect(SDD.schema).toEqual(100038);
	});
});

describe("map.Create", function() {
    it("returns null for invalid source", function() {
		var map_invalid = EVEoj.map.Create(null, "W");
        expect(map_invalid).toBeNull(null);
    });
    it("returns null for invalid type", function() {
		var map_invalid = EVEoj.map.Create(SDD, "P");
        expect(map_invalid).toBeNull(null);
    });
	it("returns a new object for a valid type", function() {
		map = EVEoj.map.Create(SDD, "K", {planets: true});
        expect(map).not.toBeNull(null);
		expect(EVEoj.map.P.isPrototypeOf(map)).toEqual(true);
	});
});

/*
describe("map pre-load", function() {
	var table;
	
	beforeEach(function() {
		table = SDD.GetTable("invTypes");
	});
	
	it("has expected metainfo", function() {
		var table = SDD.GetTable("invTypes");
		var columns = [
			"typeID", "groupID", "typeName", "mass", "volume", "capacity", "portionSize",
			"raceID", "basePrice", "published", "marketGroupID", "chanceOfDuplicating", "iconID"
		];
		expect(table.name).toEqual("invTypes");
		expect(table.keyname).toEqual("typeID");
		expect(table.columns).toEqual(columns);
		expect(table.segments.length).toEqual(1);
		expect(table.c.index).toEqual(0);
		expect(table.c.published).toEqual(9);
	});
	it("returns false for unknown entries", function() {
		expect(table.GetEntry(37)).toEqual(false);
		expect(table.GetEntry(60000000)).toEqual(false);
	});
	
});
*/

describe("map.Load", function() {
    it("returns a promise", function() {
		progress_counter = 0;
		promise = map.Load({progress: progress_track});
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise_done = false;
		promise_fail = undefined;
		promise.then(promise_thenDone, promise_thenFail);
    });
});

describe("map", function() {
	it("succeeds asynchronously", function() {
		waitsFor(promise_wait, 10000);
		runs(function() {
			expect(promise_done).toEqual(true);
			expect(promise_fail).toBeDefined();
			expect(promise_fail).toEqual(false);
		});
	});
	
	it("called progress tracker", function() {
		// if any tables this depends on were previously loaded in other specs, this could become inaccurate
		expect(progress_counter).toEqual(20);
	});
	
	it("gets systems", function() {
		var sys1 = map.GetSystem({name: "Jita"});
		var sys2 = map.GetSystem({id: 30000142});
		var sys3 = map.GetSystem({id: "30000142"});
		
		expect(sys1).not.toBeNull();
		expect(sys2).not.toBeNull();
		expect(sys3).not.toBeNull();
		expect(sys1).toBe(sys2);
		expect(sys2).toBe(sys3);
		expect(sys1.name).toEqual("Jita");
	});

	it("can iterate through systems", function() {
		var iter = map.GetSystems();
		var sys_count = 0;
		var sys_n1 = null;
		var sys_n2 = null;
		var sys = null;
		
		while (iter.HasNext()) {
			sys = iter.Next();
			sys_count++;
			if (sys_count == 373) sys_n1 = sys.name;
			else if (sys_count == 4710) sys_n2 = sys.name;
		}
		
		expect(sys_count).toEqual(5201);
		expect(sys_n1).toEqual("0-G8NO");
		expect(sys_n2).toEqual("1-NJLK");
	});
	
	it("plots Jita to Jita", function() {
		var route = map.Route(jitaID, jitaID, [], false, false);
		expect(route).toEqual([]);
	});

	it("plots Jita to Amarr, shortest", function() {
		var route = map.Route(jitaID, amarrID, [], false, false);
		expect(route).toEqual(jita_amarr_short);
	});

	it("plots Jita to Amarr, hisec", function() {
		var route = map.Route(jitaID, amarrID, [], true, false);
		expect(route).toEqual(jita_amarr_hi);
	});

	it("plots Jita to Amarr, lowsec", function() {
		var route = map.Route(jitaID, amarrID, [], false, true);
		expect(route).toEqual(jita_amarr_low);
	});

	it("plots Jita to Amarr, avoid Niarja", function() {
		var route = map.Route(jitaID, amarrID, [niarjaID], true, false);
		expect(route).toEqual(jita_amarr_avoid);
	});
	
	it("plots Jita to Dodixie, shortest", function() {
		var route = map.Route(jitaID, dodixieID, [], false, false);
		expect(route).toEqual(jita_dodixie_short);
	});

	it("plots Jita to Dodixie, hisec", function() {
		var route = map.Route(jitaID, dodixieID, [], true, false);
		expect(route).toEqual(jita_dodixie_hi);
	});

	it("plots Jita to Dodixie, lowsec", function() {
		var route = map.Route(jitaID, dodixieID, [], false, true);
		expect(route).toEqual(jita_dodixie_low);
	});

	it("plots Jita to Dodixie, lowsec", function() {
		var route = map.Route(jitaID, dodixieID, [], false, true);
		expect(route).toEqual(jita_dodixie_low);
	});
	
	it("finds jump distance Jita to X-CFN6", function() {
		var dist = map.JumpDist(jitaID, xcfn6ID);
		expect(dist.toFixed(3)).toEqual("15.197");
	});
	
});
