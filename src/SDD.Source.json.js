'use strict';

var extend = require('node.extend');
var Source = require('./SDD.Source');
var Table = require('./SDD.Table');
var Utils = require('./Utils');
		
var P = exports.P = Utils.create(Source.P); // public methods, inherit from base Source class

exports.D = extend(true, {}, Source.D, {
	// default object properties
	'cfg': {
		'cache': true,
		'datatype': 'json',
		'timeout': 0
	},
	'jsonfiles': {}
});

exports.Create = function(config) {
	var obj = Utils.create(P);
	extend(true, obj, exports.D);
	obj.Config(config);
	return obj;
};

P.Config = function(config) {
	extend(this.cfg, config);
};

function MetainfDone(data, status, jqxhr, p, ctx) {
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
		newt = Table.Create(tbl, this, data['tables'][tbl]);
		this.tables[newt.name] = newt;
		
		// collect a list of json sources
		for (i = 0; i < newt.segments.length; i++) {
			if (this.jsonfiles.hasOwnProperty(newt.segments[i].tag)) continue;
			this.jsonfiles[newt.segments[i].tag] = {'loaded': false, 'p': null};
		}
	}
	
	p.resolveWith(ctx, [this]);
}

function MetainfFail(jqxhr, status, error, p, ctx) {
	p.rejectWith(ctx, [this, status, error]);
}

P.LoadMeta = function(ctx) {
	var self = this,
		p = Utils.deferred()
		;
		
	if (!this.cfg.hasOwnProperty('path') || typeof this.cfg['path'] != 'string') {
		return p.rejectWith(ctx, [this, 'error', 'path is required']).promise();
	}
	if (this.cfg['datatype'] != 'json' && this.cfg['datatype'] != 'jsonp') {
		return p.rejectWith(ctx, [this, 'error', 'invalid datatype: ' + this.cfg['datatype']]).promise();
	}

	Utils.ajax({
		'dataType': this.cfg['datatype'],
		'cache': this.cfg['cache'],
		'jsonp': false,
		'timeout': this.cfg['timeout'],
		'jsonpCallback': 'EVEoj_metainf_callback',
		'url': this.cfg['path'] + '/metainf.' + this.cfg['datatype']
	}).done(function (data, status, jqxhr) {
		MetainfDone.apply(self, [data, status, jqxhr, p, ctx]);
	}).fail(function (jqxhr, status, error) {
		MetainfFail.apply(self, [jqxhr, status, error, p, ctx]);
	});
	
	return p.promise();
};

function LoadFileDone(ctx, jsf, data) {
	if (!data || !data.hasOwnProperty('tables')) {
		this.jsonfiles[jsf].p.rejectWith(ctx, [jsf, 'error', 'invalid data object']);
	}
	else if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') {
		this.jsonfiles[jsf].p.rejectWith(ctx, [jsf, 'error', 'unknown data format']);
	}
	else {
		this.jsonfiles[jsf].loaded = true;
		this.jsonfiles[jsf].data = data;
		this.jsonfiles[jsf].p.resolveWith(ctx, [jsf, data]);
	}
}
function LoadFileFail(ctx, jsf, status, error) {
	this.jsonfiles[jsf].p.rejectWith(ctx, [jsf, status, error]);
}
P.LoadTag = function(jsf, ctx) {
	var self = this;
	if (this.jsonfiles[jsf].loaded) {
		return Utils.deferred().resolveWith(null, [jsf, this.jsonfiles[jsf].data]).promise();
	}
	else if (this.jsonfiles[jsf].p != null) {
		return this.jsonfiles[jsf].p.promise();
	}
	else {
		this.jsonfiles[jsf].p = Utils.deferred();
		Utils.ajax({
			'dataType': this.cfg['datatype'],
			'cache': this.cfg['cache'],
			'jsonp': false,
			'timeout': this.cfg['timeout'],
			'jsonpCallback': 'EVEoj_' + jsf + '_callback',
			'url': this.cfg['path'] + '/' + jsf + '.' + this.cfg['datatype']
		})
		.done(function (data, status, jqxhr) { LoadFileDone.apply(self, [ctx, jsf, data]) })
		.fail(function (jqxhr, status, error) { LoadFileFail.apply(self, [ctx, jsf, status, error]) });
		return this.jsonfiles[jsf].p.promise();		
	}	
};
