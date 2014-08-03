'use strict';

// var Utils = require('./Utils');
var P = exports.P = {}; // public methods

exports.D = {
	// default object properties
	'tables': {},
	'version': null,
	'verdesc': null,
	'schema': null
};

// return promise:
//		rejectWith(ctx, [this, status, errmsg]);
//		resolveWith(ctx, [this]);
P.LoadMeta = function(ctx) {
	/* p.rejectWith(ctx, [this, 'error', 'not implemented']);
	return p.promise(); */
};

P.HasTable = function (tbl) {
	return this.tables.hasOwnProperty(tbl);
};

P.GetTables = function () {
	var tbl_list = [],
		tbl
		;
	for (tbl in this.tables) {
		if (!this.tables.hasOwnProperty(tbl)) continue;
		tbl_list.push(tbl);
	}
	
	return tbl_list;
};

P.GetTable = function (tbl) {
	if (!tbl || !this.tables.hasOwnProperty(tbl)) return null;
	return this.tables[tbl];
};
