EVEoj.SDD.Source = EVEoj.SDD.Source || {};
(function () {

var ME = EVEoj.SDD.Source,
	// namespace quick refs
	E = EVEoj,
	SDD = EVEoj.SDD,

	_P = {}, // private methods
	P = {} // public methods
	;
ME.P = P;

ME.D = {
	// default object properties
	'tables': {},
	'version': null,
	'verdesc': null,
	'schema': null
};
P.Create = function(config) { return null; };

// return promise:
//		rejectWith(ctx, [this, status, errmsg]);
//		resolveWith(ctx, [this]);
P.LoadMeta = function(ctx) {
	p.rejectWith(ctx, [this, 'error', 'not implemented']);
	return p.promise();
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
		
})();
