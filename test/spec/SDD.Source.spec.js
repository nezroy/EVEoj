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
var SDD_badpath;
var promise1;
var promise2;

describe("SDD.Source.LoadMeta", function() {
	it("fails on an invalid source", function(done) {
		if (EVEoj.Utils.isBrowser) {
			SDD_badpath = EVEoj.SDD.Create("json", {
				path: "http://eve-oj.dev/sdd/fred"
			});
		} else {
			SDD_badpath = EVEoj.SDD.Create("json", {
				path: "D:\\projects\\xyjax\\static\\sdd\\fred"
			});
		}
		promise1 = SDD_badpath.LoadMeta();
		expect(promise1).not.toBeNull(null);
		expect(typeof(promise1.then)).toEqual("function");
		promise1
			.then(function() {
				fail("load succeeded when it should have failed");
			})
			.caught(function() {})
			.lastly(done);
	});
	it("loads a valid source asynchronously", function(done) {
		if (EVEoj.Utils.isBrowser) {
			SDD = EVEoj.SDD.Create("json", {
				path: props.SDD_URL_path
			});
		} else {
			SDD = EVEoj.SDD.Create("json", {
				path: props.SDD_file_path
			});
		}
		promise2 = SDD.LoadMeta();
		expect(promise2).not.toEqual(null);
		expect(typeof(promise2.then)).toEqual("function");
		promise2.caught(function(ex) {
			fail(ex.error);
		}).lastly(done);
	});
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(props.SDD_version);
		expect(SDD.verdesc).toEqual(props.SDD_verdesc);
		expect(SDD.schema).toEqual(props.SDD_schema);
	});
	it("has expected tables", function() {
		var schema_100038 = [
			"crpActivities", "crpNPCDivisions", "crpNPCCorporations", "agtAgentTypes", "agtAgents",
			"chrAncestries", "chrAttributes", "chrBloodlines", "chrFactions", "chrRaces", "chrCertificates",
			"eveUnits", "dgmAttributeCategories", "dgmAttributeTypes", "dgmEffects", "dgmTypes",
			"invCategories", "invContrabandTypes", "invControlTowerResourcePurposes", "invControlTowerResources",
			"invFlags", "invGroups", "invIcons", "invMarketGroups", "invMetaGroups", "invMetaTypes",
			"invTypeMaterials", "invTypeReactions", "invTypes", "invTypesDesc", "invItems",
			"mapKRegions", "mapKConstellations", "mapKSolarSystems", "mapLandmarks",
			"warCombatZones", "warCombatZoneSystems", "mapKRegionJumps", "mapKConstellationJumps", "mapKSolarSystemJumps",
			"mapKStars", "mapKSolarSystemObjects", "mapKPlanets", "mapKMoons", "mapKBelts", "mapKGates",
			"mapXRegions", "mapXConstellations", "mapXSolarSystems",
			"mapXRegionJumps", "mapXConstellationJumps", "mapXSolarSystemJumps",
			"mapXStars", "mapXSolarSystemObjects", "mapXPlanets", "mapXMoons", "mapXBelts", "mapXGates",
			"mapJRegions", "mapJConstellations", "mapJSolarSystems",
			"mapJStars", "mapJSolarSystemObjects", "mapJPlanets", "mapJMoons",
			"ramActivities", "ramAssemblyLineStations", "ramAssemblyLineTypes",
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
