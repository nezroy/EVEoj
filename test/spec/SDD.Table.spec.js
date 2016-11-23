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
var promise;

var inv_types_size = 31056;
var inv_seg_count = 7;

var progress_counter;

function progress_track() {
	progress_counter++;
}

describe("SDD.Table.LoadMeta", function() {
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
		expect(SDD).not.toBeNull(null);
		promise = SDD.LoadMeta();
		expect(promise).not.toEqual(null);
		promise.caught(function(ex) {
			fail(ex);
		}).lastly(done);
	});
	it("has valid metainfo", function() {
		expect(SDD.version).toEqual(props.SDD_version);
		expect(SDD.verdesc).toEqual(props.SDD_verdesc);
		expect(SDD.schema).toEqual(props.SDD_schema);
	});
	it("has expected metainfo", function() {
		var table = SDD.GetTable("invTypes");
		var columns = [
			"typeID", "groupID", "typeName", "marketGroupID", "published", "iconID"
		];
		expect(table.name).toEqual("invTypes");
		expect(table.keyname).toEqual("typeID");
		expect(table.columns).toEqual(columns);
		expect(table.segments.length).toEqual(1);
		expect(table.c.index).toEqual(0);
		expect(table.c.published).toEqual(4);
	});
	it("returns false for unknown entries", function() {
		var table = SDD.GetTable("invTypes");
		expect(table.GetEntry(37)).toEqual(false);
		expect(table.GetEntry(60000000)).toEqual(false);
	});
});

describe("SDD.Table invTypes", function() {
	it("loads a valid source asynchronously", function(done) {
		promise = SDD.GetTable("invTypes").Load();
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			console.log(JSON.stringify(ex, null, 1));
			fail(ex);
		}).lastly(done);
	});
	it("has expected data", function() {
		var table = SDD.GetTable("invTypes");
		expect(table.length).toEqual(table.loaded);
		expect(table.length).toEqual(inv_types_size);
	});
	it("returns null for non-existent entries", function() {
		var table = SDD.GetTable("invTypes");
		expect(table.GetEntry(60000000)).toBeNull();
		expect(table.GetEntry("potato")).toBeNull();
	});
	it("returns row for valid entries", function() {
		var table = SDD.GetTable("invTypes");
		var row1 = table.GetEntry("37");
		var row2 = table.GetEntry(37);
		expect(row1).not.toBeNull();
		expect(row2).not.toBeNull();
		expect(row1).toBe(row2);
	});
	it("has expected index data for entry", function() {
		var table = SDD.GetTable("invTypes");
		var row = table.GetEntry(37);
		expect(row.length).toEqual(6);
		expect(row[0]).toEqual(37);
		expect(row[table.c.index]).toEqual(37);
		expect(row[table.c.typeID]).toEqual(37);
	});
	it("has expected column data for entry", function() {
		var table = SDD.GetTable("invTypes");
		var row = table.GetEntry(37);
		expect(row[table.c.groupID]).toEqual(18);
		expect(row[table.c.typeName]).toEqual("Isogen");
		expect(row[table.c.published]).toEqual(true);
		expect(row[table.c.marketGroupID]).toEqual(1857);
		expect(row[table.c.iconID]).toEqual(402);
	});
});

describe("SDD.Table.Load invTypesDesc", function() {
	it("loads a valid segmented source asynchronously", function(done) {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.segments.length).toEqual(inv_seg_count);
		progress_counter = 0;
		promise = table.Load({
			key: 37,
			progress: progress_track
		});
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			fail(ex);
		}).lastly(done);
	});
	it("called progress tracker for partial load", function() {
		expect(progress_counter).toEqual(1);
	});
	it("has expected partial data", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.loaded).toEqual(5000);
		expect(table.length).toEqual(inv_types_size);
		expect(table.segments[0].loaded).toEqual(true);
		expect(table.segments[1].loaded).toEqual(false);
		expect(table.segments[2].loaded).toEqual(false);
		expect(table.segments[3].loaded).toEqual(false);
		expect(table.segments[4].loaded).toEqual(false);
		expect(table.segments[5].loaded).toEqual(false);
	});
	it("returns null for non-existent partial entries", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.GetEntry(1)).toBeNull();
	});
	it("returns false for still unknown entries", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.GetEntry(16966)).toEqual(false);
	});
	it("returns row for valid partial entries", function() {
		var table = SDD.GetTable("invTypesDesc");
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
		var table = SDD.GetTable("invTypesDesc");
		var row = table.GetEntry(37);
		expect(row.length).toEqual(17);
		expect(row[0]).toEqual(37);
		expect(row[table.c.index]).toEqual(37);
		expect(row[table.c.typeID]).toEqual(37);
	});
	it("has expected column data for entry", function() {
		var table = SDD.GetTable("invTypesDesc");
		var row = table.GetEntry(37);
		expect(row[table.c.mass]).toEqual(0);
		expect(row[table.c.volume]).toEqual(0.01);
		expect(row[table.c.capacity]).toEqual(0);
		expect(row[table.c.portionSize]).toEqual(1);
		expect(row[table.c.raceID]).toEqual(null);
		expect(row[table.c.basePrice]).toEqual(128);
		expect(row[table.c.chanceOfDuplicating]).toEqual(0);
		expect(row[table.c.description]).toEqual(
			"Light-bluish crystal, formed by intense pressure deep within large asteroids and moons. Used in electronic and weapon manufacturing. Only found in abundance in a few areas.\r\n\r\nMay be obtained by reprocessing the following ores:\r\n\r\n<color='0xFFFF0000'>0.0</color> security status solar system or lower:\r\n<a href=showinfo:1232>Dark Ochre</a>, <a href=showinfo:17436>Onyx Ochre</a>, <a href=showinfo:17437>Obsidian Ochre</a>\r\n<a href=showinfo:1229>Gneiss</a>, <a href=showinfo:17865>Iridescent Gneiss</a>, <a href=showinfo:17866>Prismatic Gneiss</a>\r\n<a href=showinfo:19>Spodumain</a>, <a href=showinfo:17466>Bright Spodumain</a>, <a href=showinfo:17467>Gleaming Spodumain</a>\r\n\r\n<color='0xFFFF4D00'>0.2</color> security status solar system or lower:\r\n<a href=showinfo:21>Hedbergite</a>, <a href=showinfo:17440>Vitric Hedbergite</a>, <a href=showinfo:17441>Glazed Hedbergite</a>\r\n<a href=showinfo:1231>Hemorphite</a>, <a href=showinfo:17444>Vivid Hemorphite</a>, <a href=showinfo:17445>Radiant Hemorphite</a>\r\n\r\n<color='0xFF00FF00'>0.7</color> security status solar system or lower:\r\n<a href=showinfo:20>Kernite</a>, <a href=showinfo:17452>Luminous Kernite</a>, <a href=showinfo:17453>Fiery Kernite</a>\r\n<a href=showinfo:1227>Omber</a>, <a href=showinfo:17867>Silvery Omber</a>, <a href=showinfo:17868>Golden Omber</a>"
		);
	});
	it("loads remaining segmented data asynchronously", function(done) {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.segments.length).toEqual(inv_seg_count);
		progress_counter = 0;
		promise = table.Load({
			progress: progress_track
		});
		expect(promise).not.toBeNull(null);
		expect(typeof(promise.then)).toEqual("function");
		promise.caught(function(ex) {
			fail(ex);
		}).lastly(done);
	});
	it("called progress tracker for full load", function() {
		expect(progress_counter).toEqual(inv_seg_count - 1);
	});
	it("has expected full data", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.loaded).toEqual(table.length);
		expect(table.length).toEqual(inv_types_size);
		expect(table.segments[0].loaded).toEqual(true);
		expect(table.segments[1].loaded).toEqual(true);
		expect(table.segments[2].loaded).toEqual(true);
		expect(table.segments[3].loaded).toEqual(true);
		expect(table.segments[4].loaded).toEqual(true);
		expect(table.segments[5].loaded).toEqual(true);
	});
	it("returns null for non-existent full entries", function() {
		var table = SDD.GetTable("invTypesDesc");
		expect(table.GetEntry(1)).toBeNull();
	});
	it("returns row for valid full entries", function() {
		var table = SDD.GetTable("invTypesDesc");
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
