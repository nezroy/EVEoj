"use strict";

var EVEoj = require("../../src/EVEoj.js");
var Utils = require("../../src/Utils.js");

var SDD;
var SDD_badpath;
var promise1;
var promise2;

var promise1_done;
var promise2_done;
var promise1_fail;
var promise2_fail;
function promise1_wait() {
	if (promise1_done) return true;
	return false;
}
function promise1_thenDone() {
	promise1_done = true;
	promise1_fail = false;
}
function promise1_thenFail() {
	promise1_done = true;
	promise1_fail = true;
}
function promise2_wait() {
	if (promise2_done) return true;
	return false;
}
function promise2_thenDone() {
	promise2_done = true;
	promise2_fail = false;
}
function promise2_thenFail() {
	promise2_done = true;
	promise2_fail = true;
}

describe("SDD.Source.LoadMeta", function() {
    it("returns a promise for a bad path", function() {
		if (Utils.isBrowser) {
			SDD_badpath = EVEoj.SDD.Create("json", {path: "http://eve-oj.dev/sdd/fred"});
		}
		else {
			SDD_badpath = EVEoj.SDD.Create("json", {path: "D:\\projects\\xyjax\\static\\sdd\\fred"});
		}
		promise1 = SDD_badpath.LoadMeta();
		expect(promise1).not.toBeNull(null);
		expect(typeof(promise1.then)).toEqual("function");
		promise1_done = false;
		promise1_fail = undefined;
		promise1.then(promise1_thenDone, promise1_thenFail);
    });
    it("returns a promise", function() {
		if (Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {path: "http://eve-oj.dev/sdd/100370"});
		}
		else {
			SDD = EVEoj.SDD.Create("json", {path: "D:\\projects\\xyjax\\static\\sdd\\100370"});
		}
		promise2 = SDD.LoadMeta();
		expect(promise2).not.toEqual(null);
		expect(typeof(promise2.then)).toEqual("function");
		promise2_done = false;
		promise2_fail = undefined;
		promise2.then(promise2_thenDone, promise2_thenFail);
    });	
});

describe("SDD.Source", function() {
	it("fails asynchronously for a bad path", function() {
		waitsFor(promise1_wait, 2500);
		runs(function() {
			expect(promise1_done).toEqual(true);
			expect(promise1_fail).toBeDefined();
			expect(promise1_fail).toEqual(true);
		});
	});
	it("succeeds asynchronously", function() {
		waitsFor(promise2_wait, 2500);
		runs(function() {
			expect(promise2_done).toEqual(true);
			expect(promise2_fail).toBeDefined();
			expect(promise2_fail).toEqual(false);
		});
	});
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(100370);
		expect(SDD.verdesc).toEqual("Crius 1.6");
		expect(SDD.schema).toEqual(100038);
	});
	it("has expected tables", function() {
		var schema_100038 = [
			"crpActivities", "crpNPCDivisions", "crpNPCCorporations", "agtAgentTypes", "agtAgents",
			"chrAncestries", "chrAttributes", "chrBloodlines", "chrFactions", "chrRaces", "chrCertificates",
			"eveUnits", "dgmAttributeCategories", "dgmAttributeTypes", "dgmEffects", "dgmTypes",
			"invCategories", "invContrabandTypes", "invControlTowerResourcePurposes", "invControlTowerResources",
			"invFlags", "invGroups", "invIcons", "invMarketGroups", "invMetaGroups", "invMetaTypes",
			"invTypeMaterials", "invTypeReactions", "invTypes", "invTypesDesc", "invItems",
			"mapLandmarks", "mapKRegions", "mapKConstellations", "mapKSolarSystemJumps", "mapKSolarSystems",
			"mapJRegions", "mapJConstellations", "mapJSolarSystemJumps", "mapJSolarSystems",
			"mapWRegions", "mapWConstellations", "mapWSolarSystems", "mapRegionJumps",
			"mapConstellationJumps", "mapJumps", "warCombatZoneSystems", "warCombatZones",
			"mapKCelestials", "mapKCelestialStatistics", "mapKPlanets", "mapKBelts", "mapKMoons",
			"mapKGates", "mapJCelestials", "mapJCelestialStatistics", "mapJPlanets", "mapJBelts",
			"mapJMoons", "mapJGates", "mapWCelestials", "mapWCelestialStatistics", "mapWPlanets",
			"mapWMoons", "ramActivities", "ramAssemblyLineStations", "ramAssemblyLineTypes",
			"ramInstallationTypeContents", "ramBlueprints", "staServices", "staOperations",
			"staStationTypes", "staStations"
			];
		var table_list = SDD.GetTables();
		expect(table_list).toEqual(schema_100038);
	});
	it("returns null for invalid tables", function() {
		expect(SDD.GetTable("potato")).toBeNull();
	});
	it("returns valid tables", function() {
		var table = SDD.GetTable("invTypes");
		expect(table).not.toBeNull();
		expect(EVEoj.SDD.Table.P.isPrototypeOf(table)).toEqual(true);
	});
});

/*
describe("SDD.Table pre-load", function() {
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

describe("SDD.Table.Load", function() {
    it("returns a promise", function() {
		promise1 = SDD.GetTable("invTypes").Load();
		expect(promise1).not.toBeNull(null);
		expect(typeof(promise1.then)).toEqual("function");
		promise1_done = false;
		promise1_fail = undefined;
		promise1.then(promise1_thenDone, promise1_thenFail);
    });
});

describe("SDD.Table", function() {
	var table;
	
	beforeEach(function() {
		table = SDD.GetTable("invTypes");
	});

	it("succeeds asynchronously", function() {
		waitsFor(promise1_wait, 2500);
		runs(function() {
			expect(promise1_done).toEqual(true);
			expect(promise1_fail).toBeDefined();
			expect(promise1_fail).toEqual(false);
		});
	});
	it("has expected data", function() {
		expect(table.length).toEqual(table.loaded);
		expect(table.length).toEqual(21771);
	});
	it("returns null for non-existent entries", function() {
		expect(table.GetEntry(60000000)).toBeNull();
		expect(table.GetEntry("potato")).toBeNull();
	});
	it("returns row for valid entries", function() {
		var row1 = table.GetEntry("37");
		var row2 = table.GetEntry(37);
		expect(row1).not.toBeNull();
		expect(row2).not.toBeNull();
		expect(row1).toBe(row2);
	});
	it("has expected index data for entry", function() {
		var row = table.GetEntry(37);
		expect(row.length).toEqual(13);
		expect(row[0]).toEqual(37);
		expect(row[table.c.index]).toEqual(37);
		expect(row[table.c.typeID]).toEqual(37);
	});
	it("has expected column data for entry", function() {
		var row = table.GetEntry(37);
		expect(row[table.c.groupID]).toEqual(18);
		expect(row[table.c.typeName]).toEqual("Isogen");
		expect(row[table.c.mass]).toEqual(0);
		expect(row[table.c.volume]).toEqual(0.01);
		expect(row[table.c.capacity]).toEqual(0);
		expect(row[table.c.portionSize]).toEqual(1);
		expect(row[table.c.raceID]).toEqual(0);
		expect(row[table.c.basePrice]).toEqual(128.00);
		expect(row[table.c.published]).toEqual(true);
		expect(row[table.c.marketGroupID]).toEqual(1857);
		expect(row[table.c.chanceOfDuplicating]).toEqual(0);
		expect(row[table.c.iconID]).toEqual(402);
	});
});

describe("SDD.Table.Load partial", function() {
    it("returns a promise", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.segments.length).toEqual(3);
		promise1 = table.Load({key: 37});
		expect(promise1).not.toBeNull(null);
		expect(typeof(promise1.then)).toEqual("function");
		promise1_done = false;
		promise1_fail = undefined;
		promise1.then(promise1_thenDone, promise1_thenFail);
    });
});

describe("SDD.Table partial", function() {
	var table;
	
	beforeEach(function() {
		table = SDD.GetTable("invTypesDesc");
	});

	it("succeeds asynchronously", function() {
		waitsFor(promise1_wait, 2500);
		runs(function() {
			expect(promise1_done).toEqual(true);
			expect(promise1_fail).toBeDefined();
			expect(promise1_fail).toEqual(false);
		});
	});
	it("has expected data", function() {
		expect(table.loaded).toEqual(7500);
		expect(table.length).toEqual(21771);
		expect(table.segments[0].loaded).toEqual(true);
		expect(table.segments[1].loaded).toEqual(false);
	});
	it("returns null for non-existent entries", function() {
		expect(table.GetEntry(1)).toBeNull();
	});
	it("returns false for still unknown entries", function() {
		expect(table.GetEntry(16966)).toEqual(false);
	});
	it("returns row for valid entries", function() {
		var row1 = table.GetEntry("37");
		var row2 = table.GetEntry(37);
		expect(row1).toBeDefined();
		expect(row2).toBeDefined();
		expect(row1).not.toBeNull();
		expect(row2).not.toBeNull();
		expect(row1).not.toBe(false);
		expect(row2).not.toBe(false);
		expect(row1).toBe(row2);
	});
	it("has expected index data for entry", function() {
		var row = table.GetEntry(37);
		expect(row.length).toEqual(3);
		expect(row[0]).toEqual(37);
		expect(row[table.c.index]).toEqual(37);
		expect(row[table.c.typeID]).toEqual(37);
	});
	it("has expected column data for entry", function() {
		var row = table.GetEntry(37);
		expect(row[table.c.description]).toEqual("Light-bluish crystal, formed by intense pressure deep within large asteroids and moons. Used in electronic and weapon manufacturing. Only found in abundance in a few areas.\n\nMay be obtained by reprocessing the following ores:\n\n<color='0xFFFF0000'>0.0</color> security status solar system or lower:\n<a href=showinfo:1229>Gneiss</a>, <a href=showinfo:17865>Iridescent Gneiss</a>, <a href=showinfo:17866>Prismatic Gneiss</a>\n\n<color='0xFFFF4D00'>0.2</color> security status solar system or lower:\n<a href=showinfo:21>Hedbergite</a>, <a href=showinfo:17440>Vitric Hedbergite</a>, <a href=showinfo:17441>Glazed Hedbergite</a>\n<a href=showinfo:1231>Hemorphite</a>, <a href=showinfo:17444>Vivid Hemorphite</a>, <a href=showinfo:17445>Radiant Hemorphite</a>\n\n<color='0xFF00FF00'>0.7</color> security status solar system or lower:\n<a href=showinfo:20>Kernite</a>, <a href=showinfo:17452>Luminous Kernite</a>, <a href=showinfo:17453>Fiery Kernite</a>\n<a href=showinfo:1227>Omber</a>, <a href=showinfo:17867>Silvery Omber</a>, <a href=showinfo:17868>Golden Omber</a>");
		expect(row[table.c.yamldata].hasOwnProperty("iconID")).toEqual(true);
		expect(row[table.c.yamldata].iconID).toEqual(402);
	});
});

describe("SDD.Table.Load remaining", function() {
    it("returns a promise", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.segments.length).toEqual(3);
		promise1 = table.Load();
		expect(promise1).not.toBeNull(null);
		expect(typeof(promise1.then)).toEqual("function");
		promise1_done = false;
		promise1_fail = undefined;
		promise1.then(promise1_thenDone, promise1_thenFail);
    });
});

describe("SDD.Table remaining", function() {
	var table;
	
	beforeEach(function() {
		table = SDD.GetTable("invTypesDesc");
	});

	it("succeeds asynchronously", function() {
		waitsFor(promise1_wait, 2500);
		runs(function() {
			expect(promise1_done).toEqual(true);
			expect(promise1_fail).toBeDefined();
			expect(promise1_fail).toEqual(false);
		});
	});
	it("has expected data", function() {
		expect(table.loaded).toEqual(table.length);
		expect(table.length).toEqual(21771);
		expect(table.segments[0].loaded).toEqual(true);
		expect(table.segments[1].loaded).toEqual(true);
		expect(table.segments[2].loaded).toEqual(true);
	});
	it("returns null for non-existent entries", function() {
		expect(table.GetEntry(1)).toBeNull();
	});
	it("returns false for still unknown entries", function() {
	});
	it("returns row for valid entries", function() {
		var row1 = table.GetEntry("37");
		var row2 = table.GetEntry(37);
		var row3 = table.GetEntry(16966);
		var row4 = table.GetEntry(367230);
		expect(row1).toBeDefined();
		expect(row2).toBeDefined();
		expect(row3).toBeDefined();
		expect(row4).toBeDefined();
		expect(row1).not.toBeNull();
		expect(row2).not.toBeNull();
		expect(row3).not.toBeNull();
		expect(row4).not.toBeNull();
		expect(row1).not.toBe(false);
		expect(row2).not.toBe(false);
		expect(row3).not.toBe(false);
		expect(row4).not.toBe(false);
	});
});
*/