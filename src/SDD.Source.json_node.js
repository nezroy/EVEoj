var extend = require("node.extend"),
	Source = require("./SDD.Source"),
	Table = require("./SDD.Table"),
	Utils = require("./Utils"),
	fs = require("fs"),
	Promise = require("./Promise");

var readFileP = Promise.promisify(fs.readFile);

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

function MetainfDone(data, status, jqxhr, ctx) {
	var tbl,
		newt,
		i;

	if (!data) return Promise.reject(new Error("invalid data object"));
	if (!data.hasOwnProperty("formatID") || data.formatID != "1") return Promise.reject(new Error("unknown data format"));
	if (!data.hasOwnProperty("schema") || !data.hasOwnProperty("version")) return Promise.reject(new Error("data has no version information"));
	if (!data.hasOwnProperty("tables") || !data.hasOwnProperty("tables")) return Promise.reject(new Error("data has no table information"));
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

	return Promise.resolve({
		context: ctx,
		source: this
	});
}

P.LoadMeta = function(ctx) {
	var self = this;

	if (!this.cfg.hasOwnProperty("path") || typeof this.cfg.path != "string") {
		return Promise.reject(new Error("path is required"));
	}

	return readFileP(this.cfg.path + "/metainf.json", "utf8").then(function(contents) {
		var data;

		try {
			data = JSON.parse(contents);
		} catch (err) {
			return Promise.reject(err);
		}

		return MetainfDone.apply(self, [data, null, null, ctx]);
	}).caught(function(err) {
		return Promise.reject(err);
	});
};

function LoadFileDone(res, rej, ctx, jsf, data) {
	if (!data || !data.hasOwnProperty("tables")) {
		return rej(new Error("invalid data object"));
	} else if (!data.hasOwnProperty("formatID") || data.formatID != "1") {
		return rej(new Error("unknown data format"));
	} else {
		this.jsonfiles[jsf].loaded = true;
		this.jsonfiles[jsf].data = data;
		return res({
			context: ctx,
			tag: jsf,
			data: data
		});
	}
}

P.LoadTag = function(jsf, ctx) {
	var self = this;
	if (this.jsonfiles[jsf].loaded) {
		return Promise.resolve({
			tag: jsf,
			data: this.jsonfiles[jsf].data
		});
	} else if (this.jsonfiles[jsf].p !== null) {
		return this.jsonfiles[jsf].p;
	} else {
		this.jsonfiles[jsf].p = new Promise(function(res, rej) {
			fs.readFile(self.cfg.path + "/" + jsf + ".json", "utf8", function(err, contents) {
				var data;

				if (err) {
					return rej(err);
				}

				try {
					data = JSON.parse(contents);
				} catch (err) {
					return rej(err);
				}

				LoadFileDone.apply(self, [res, rej, ctx, jsf, data]);
			});
		});

		return this.jsonfiles[jsf].p;
	}
};
