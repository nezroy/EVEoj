// var Utils = require('./Utils');
var P = exports.P = {}; // public methods

exports.D = {
	// default object properties
	tables: {},
	version: null,
	verdesc: null,
	schema: null
};

// return promise:
//		reject({context: ctx, source: this, stats: status, error: errmsg});
//		resolve({context: ctx, source: this});
P.LoadMeta = function() {
	return null;
};

P.HasTable = function(tbl) {
	return this.tables.hasOwnProperty(tbl);
};

P.GetTables = function() {
	var tbl_list = [],
		tbl;
	for (tbl in this.tables) {
		if (!this.tables.hasOwnProperty(tbl)) continue;
		tbl_list.push(tbl);
	}

	return tbl_list;
};

P.GetTable = function(tbl) {
	if (!tbl || !this.tables.hasOwnProperty(tbl)) return null;
	return this.tables[tbl];
};