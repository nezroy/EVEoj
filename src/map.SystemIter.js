'use strict';

var extend = require('node.extend');
var Utils = require('./Utils.js');
var System = require('./map.System.js');

var P = exports.P = {}; // public methods
exports.D = {
	// default object properties
	'curidx': 0,
	'tbl': null,
	'keyset': []
};
exports.Create = function (tbl) {
	var obj,
		key
		;

	obj = Utils.create(P);
	extend(true, obj, exports.D);
	obj.tbl = tbl;
	
	for (key in tbl.data) {
		if (!tbl.data.hasOwnProperty(key)) continue;
		obj.keyset.push(key);
	}
	
	return obj;	
};

P.HasNext = function () {
	if (this.curidx < this.keyset.length) return true;
};

P.Next = function () {
	return System.Create(this.tbl, this.keyset[this.curidx++]);
};
