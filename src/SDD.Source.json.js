EVEoj.SDD.Source.json = EVEoj.SDD.Source.json || {};
(function () {

var ME = EVEoj.SDD.Source.json,
	// namespace quick refs
	E = EVEoj,
	SDD = EVEoj.SDD,
		
	_P = {}, // private methods
	P = E.create(SDD.Source.P) // public methods, inherit from base Source class
	;
ME.P = P;

ME.D = E.extend(true, {}, SDD.Source.D, {
	// default object properties
	'cfg': {
		'cache': true,
		'datatype': 'json'
	},
	'jsonfiles': {}
});
ME.Create = function(config) {
	var obj = E.create(P);
	E.extend(true, obj, ME.D);
	obj.Config(config);
	return obj;
};

P.Config = function(config) {
	E.extend(this.cfg, config);
};

_P.MetainfDone = function (data, status, jqxhr, p, ctx) {
	var tbl,
		newt,
		i;

	if (!data) return p.rejectWith(ctx, [this, 'error', 'invalid data object']);
	if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') return p.rejectWith(ctx, [this, 'error', 'unknown data format']);
	if (!data.hasOwnProperty('schema') || !data.hasOwnProperty('version')) return p.rejectWith(ctx, [this, 'error', 'data has no version information']);
	if (!data.hasOwnProperty('tables') || !data.hasOwnProperty('tables')) return p.rejectWith(ctx, [this, 'error', 'data has no table information']);
	this.version = data['version'];
	this.schema = data['schema'];
	if (data.hasOwnProperty('verdesc')) this.verdesc = data['verdesc'];

	// reset stuff
	this.tables = {};
	this.jsonfiles = {};
	
	for (tbl in data['tables']) {
		if (!data['tables'].hasOwnProperty(tbl)) continue;
		
		// create a new table from our metadata
		newt = SDD.Table.Create(tbl, this, data['tables'][tbl]);
		this.tables[newt.name] = newt;
		
		// collect a list of json sources
		for (i = 0; i < newt.segments.length; i++) {
			if (this.jsonfiles.hasOwnProperty(newt.segments[i].tag)) continue;
			this.jsonfiles[newt.segments[i].tag] = {'loaded': false, 'p': null};
		}
	}
	
	p.resolveWith(ctx, [this]);
};

_P.MetainfFail = function (jqxhr, status, error, p, ctx) {
	p.rejectWith(ctx, [this, status, error]);
};

P.LoadMeta = function(ctx) {
	var self = this,
		p = E.deferred()
		;
		
	if (!this.cfg.hasOwnProperty('path') || typeof this.cfg['path'] != 'string') {
		return p.rejectWith(ctx, [this, 'error', 'path is required']).promise();
	}
	if (!this.cfg['datatype'] != 'json' && this.cfg['datatype'] != 'jsonp') {
		return p.rejectWith(ctx, [this, 'error', 'invalid datatype: ' + this.cfg['datatype']]).promise();
	}

	E.ajax({
		'dataType': this.cfg['datatype'],
		'cache': this.cfg['cache'],
		'jsonp': false,
		'jsonpCallback': 'EVEoj_metainf_callback',
		'url': this.cfg['path'] + '/metainf.' + this.cfg['datatype']
	}).done(function (data, status, jqxhr) {
		_P.MetainfDone.apply(self, [data, status, jqxhr, p, ctx]);
	}).fail(function (jqxhr, status, error) {
		_P.MetainfFail.apply(self, [jqxhr, status, error, p, ctx]);
	});
	
	return p.promise();
};

_P.LoadFileDone = function(jsf, data) {
	if (!data || !data.hasOwnProperty('tables')) {
		this.jsonfiles[jsf].p.reject(jsf, 'error', 'invalid data object');
	}
	else if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') {
		this.jsonfiles[jsf].p.reject(jsf, 'error', 'unknown data format');
	}
	else {
		this.jsonfiles[jsf].loaded = true;
		this.jsonfiles[jsf].data = data;
		this.jsonfiles[jsf].p.resolve(jsf, data);
	}
};
_P.LoadFileFail = function(jsf, status, error) {
	this.jsonfiles[jsf].p.reject(jsf, status, error);
};	
P.LoadTag = function(jsf) {
	var self = this;
	if (this.jsonfiles[jsf].loaded) {
		return E.deferred().resolveWith(null, [jsf, this.jsonfiles[jsf].data]).promise();
	}
	else if (this.jsonfiles[jsf].p != null) {
		return this.jsonfiles[jsf].p.promise();
	}
	else {
		this.jsonfiles[jsf].p = E.deferred();
		E.ajax({
			'dataType': this.cfg['datatype'],
			'cache': this.cfg['cache'],
			'jsonp': false,
			'jsonpCallback': 'EVEoj_' + jsf + '_callback',
			'url': this.cfg['path'] + '/' + jsf + '.' + this.cfg['datatype']
		})
		.done(function (data, status, jqxhr) { _P.LoadFileDone.apply(self, [jsf, data]) })
		.fail(function (jqxhr, status, error) { _P.LoadFileFail.apply(self, [jsf, status, error]) });
		return this.jsonfiles[jsf].p.promise();		
	}	
};	
	
})();
