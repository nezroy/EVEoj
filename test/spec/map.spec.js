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

var progress_counter;

function progress_track() {
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


describe("map", function() {
	it("loads valid metadata asynchronously", function(done) {
		if (isBrowser) {
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

	it("returns null for invalid source", function() {
		var map_invalid = EVEoj.map.Create(null, "W");
		expect(map_invalid).toBeNull(null);
	});

	it("returns null for invalid type", function() {
		var map_invalid = EVEoj.map.Create(SDD, "P");
		expect(map_invalid).toBeNull(null);
	});

	it("returns a new object for a valid type", function() {
		map = EVEoj.map.Create(SDD, "K", {
			planets: true
		});
		expect(map).not.toBeNull(null);
		expect(EVEoj.map.P.isPrototypeOf(map)).toEqual(true);
	});

	it("loads a valid source asynchronously", function(done) {
		progress_counter = 0;
		promise = map.Load({
			progress: progress_track
		});
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			fail(ex.error);
		}).lastly(done);
	});

	it("called progress tracker", function() {
		// if any tables this depends on were previously loaded in other specs, this could become inaccurate
		expect(progress_counter).toEqual(12);
	});

	it("gets systems", function() {
		var sys1 = map.GetSystem({
			name: "Jita"
		});
		var sys2 = map.GetSystem({
			id: 30000142
		});
		var sys3 = map.GetSystem({
			id: "30000142"
		});

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
