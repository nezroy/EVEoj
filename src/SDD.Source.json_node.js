"use strict";

var extend = require("node.extend");
var Source = require("./SDD.Source.js");
var Table = require("./SDD.Table.js");
var Utils = require("./Utils.js");
var fs = require("fs");

var P = exports.P = Utils.create(Source.P); // public methods, inherit from base Source class

exports.D = extend(true, {}, Source.D, {
	// default object properties
	cfg: {},
	jsonfiles: {}
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

	if (!data) return p.reject({
		context: ctx,
		source: this,
		status: "error",
		error: "invalid data object"
	});
	if (!data.hasOwnProperty("formatID") || data.formatID != "1") return p.reject({
		context: ctx,
		source: this,
		status: "error",
		error: "unknown data format"
	});
	if (!data.hasOwnProperty("schema") || !data.hasOwnProperty("version")) return p.reject({
		context: ctx,
		source: this,
		status: "error",
		error: "data has no version information"
	});
	if (!data.hasOwnProperty("tables") || !data.hasOwnProperty("tables")) return p.reject({
		context: ctx,
		source: this,
		status: "error",
		error: "data has no table information"
	});
	this.version = data.version;
	this.schema = data.schema;
	if (data.hasOwnProperty("verdesc")) this.verdesc = data.verdesc;

	// reset stuff
	this.tables = {};
	this.jsonfiles = {};

	for (tbl in data.tables) {
		if (!data.tables.hasOwnProperty(tbl)) continue;

		// create a new table from our metadata
		newt = Table.Create(tbl, this, data.tables[tbl]);
		this.tables[newt.name] = newt;

		// collect a list of json sources
		for (i = 0; i < newt.segments.length; i++) {
			if (this.jsonfiles.hasOwnProperty(newt.segments[i].tag)) continue;
			this.jsonfiles[newt.segments[i].tag] = {
				loaded: false,
				p: null
			};
		}
	}

	p.resolve({
		context: ctx,
		source: this
	});
}

function MetainfFail(jqxhr, status, error, p, ctx) {
	p.reject({
		context: ctx,
		source: this,
		status: status,
		error: error
	});
}

P.LoadMeta = function(ctx) {
	var self = this,
		p = Utils.deferred();

	if (!this.cfg.hasOwnProperty("path") || typeof this.cfg.path != "string") {
		return p.reject({
			context: ctx,
			source: this,
			status: "error",
			error: "path is required"
		}).promise;
	}

	fs.readFile(this.cfg.path + "/metainf.json", "utf8", function(err, contents) {
		var data;

		if (err) {
			MetainfFail.apply(self, [null, "error", err, p, ctx]);
			return;
		}

		try {
			data = JSON.parse(contents);
		} catch (err) {
			MetainfFail.apply(self, [null, "error", err, p, ctx]);
			return;
		}

		MetainfDone.apply(self, [data, null, null, p, ctx]);
	});

	/*
	
	Utils.ajax({
		dataType: this.cfg.datatype,
		cache: this.cfg.cache,
		jsonp: false,
		timeout: this.cfg.timeout,
		jsonpCallback: "EVEoj_metainf_callback",
		url: this.cfg.path + "/metainf." + this.cfg.datatype
	}).then(
		function (data, status, jqxhr) { MetainfDone.apply(self, [data, status, jqxhr, p, ctx]) },
		function (jqxhr, status, error) { MetainfFail.apply(self, [jqxhr, status, error, p, ctx]) }
	);
	*/

	return p.promise;
};

function LoadFileDone(ctx, jsf, data) {
	if (!data || !data.hasOwnProperty("tables")) {
		this.jsonfiles[jsf].p.reject({
			context: ctx,
			tag: jsf,
			status: "error",
			error: "invalid data object"
		});
	} else if (!data.hasOwnProperty("formatID") || data.formatID != "1") {
		this.jsonfiles[jsf].p.reject({
			context: ctx,
			tag: jsf,
			status: "error",
			error: "unknown data format"
		});
	} else {
		this.jsonfiles[jsf].loaded = true;
		this.jsonfiles[jsf].data = data;
		this.jsonfiles[jsf].p.resolve({
			context: ctx,
			tag: jsf,
			data: data
		});
	}
}

function LoadFileFail(ctx, jsf, status, error) {
	this.jsonfiles[jsf].p.reject({
		context: ctx,
		tag: jsf,
		status: status,
		error: error
	});
}
P.LoadTag = function(jsf, ctx) {
	var self = this;
	if (this.jsonfiles[jsf].loaded) {
		return Utils.deferred().resolve({
			tag: jsf,
			data: this.jsonfiles[jsf].data
		}).promise;
	} else if (this.jsonfiles[jsf].p !== null) {
		return this.jsonfiles[jsf].p.promise;
	} else {
		this.jsonfiles[jsf].p = Utils.deferred();

		fs.readFile(this.cfg.path + "/" + jsf + ".json", "utf8", function(err, contents) {
			var data;

			if (err) {
				LoadFileFail.apply(self, [ctx, jsf, "error", err]);
				return;
			}

			try {
				data = JSON.parse(contents);
			} catch (err) {
				LoadFileFail.apply(self, [ctx, jsf, "error", err]);
				return;
			}

			LoadFileDone.apply(self, [ctx, jsf, data]);
		});

		/*
		Utils.ajax({
			dataType: this.cfg.datatype,
			cache: this.cfg.cache,
			jsonp: false,
			timeout: this.cfg.timeout,
			jsonpCallback: "EVEoj_" + jsf + "_callback",
			url: this.cfg.path + "/" + jsf + "." + this.cfg.datatype
		}).then(
			function (data) { LoadFileDone.apply(self, [ctx, jsf, data]) },
			function (jqxhr, status, error) { LoadFileFail.apply(self, [ctx, jsf, status, error]) }
		);
		*/

		return this.jsonfiles[jsf].p.promise;
	}
};