"use strict";

var extend = require("node.extend");
var Utils = require("./Utils.js");

var P = exports.P = {}; // public methods
exports.D = {
	// default object properties
	curidx: 0,
	map: null,
	keyset: []
};
exports.Create = function(map) {
	var obj,
		key,
		tbl;

	obj = Utils.create(P);
	extend(true, obj, exports.D);
	obj.map = map;
	tbl = map.tables["map" + map.space + "SolarSystems"].tbl;

	for (key in tbl.data) {
		if (!tbl.data.hasOwnProperty(key)) continue;
		obj.keyset.push(key);
	}

	return obj;
};

P.HasNext = function() {
	if (this.curidx < this.keyset.length) return true;
};

P.Next = function() {
	return this.map.GetSystem({
		id: this.keyset[this.curidx++]
	});
};