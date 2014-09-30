"use strict";

var EVEoj = require("../../src/EVEoj.js");

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
		if (EVEoj.Utils.isBrowser) {
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
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {path: "http://eve-oj.dev/sdd/105658"});
		}
		else {
			SDD = EVEoj.SDD.Create("json", {path: "D:\\projects\\xyjax\\static\\sdd\\105658"});
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
		expect(SDD.version).toEqual(105658);
		expect(SDD.verdesc).toEqual("Oceanus 1.0");
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
