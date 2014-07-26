// data source based on JSON files
var EVE-Oj = EVE-Oj || {};
EVE-Oj.data.src_json = EVE-Oj.data.src_json || Object.create(EVE-Oj.data.src_base);
(function ($) {
    var ME = EVE-Oj.data.src_json,
		E = EVE-Oj,
		D = EVE-Oj.data,
		_LoadFileDone,
		_LoadFileFail
		;

	$.extend(true, ME.c, {
		// extend default config
		'cache': true,
		'datatype': 'json'
	});
	ME.metaInf = null;
	ME.jsonfiles = {};
	
	ME.SetConfig = function(p, config, ctx) {
		var that = this;
		if (!config.hasOwnProperty('path') || typeof config['path'] != 'string') {
			p.rejectWith(ctx, [this, 'error', 'path is required']);
			return;
		}
		$.extend(true, this.c, config);
		if (!this.c['datatype'] != 'json' && this.c['datatype'] != 'jsonp') {
			p.rejectWith(ctx, [this, 'error', 'invalid datatype: ' + this.c['datatype']]);
			return;
		}

		$.ajax({
			'dataType': this.c['datatype'],
			'cache': this.c['cache'],
			'jsonp': false,
			'jsonpCallback': 'EVE-Oj_metainf_callback',
			'url': this.c['path'] + '/metainf.' + this.c['datatype']
		}).done(function (data, status, jqxhr) {
			that.metainfDone(data, status, jqxhr, p, ctx);
		}).fail(function (jqxhr, status, error) {
			that.metainfFail(jqxhr, status, error, p, ctx);
		});
	};
	
	ME.metainfDone = function (data, status, jqxhr, p, ctx) {
		var tbl,
			newt,
			i;
	
		if (!data) return p.rejectWith(ctx, [this, 'error', 'invalid data object']);
		if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') return p.rejectWith(ctx, [this, 'error', 'unknown data format']);
		if (!data.hasOwnProperty('schema') || !data.hasOwnProperty('version')) return p.rejectWith(ctx, [this, 'error', 'data has no version information']);
		if (!data.hasOwnProperty('tables') || !data.hasOwnProperty('tables')) return p.rejectWith(ctx, [this, 'error', 'data has no table information']);

		// reset stuff
		// this.metaInf = data;
		this.tables = {};
		this.jsonfiles = {};
		
		for (tbl in data['tables']) {
			if (!data['tables'].hasOwnProperty(tbl)) continue;
			
			// create a new table from our metadata
			newt = D.Table.Create(tbl, this, data['tables'][tbl]);
			this.tables[newt.name] = newt;
			
			// collect a list of json sources
			for (i = 0; i < newt.segments.length; i++) {
				if (this.jsonfiles.hasOwnProperty(newt.segments[i].tag)) continue;
				this.jsonfiles[newt.segments[i].tag] = {'loaded': false, 'p': null};
			}
		}
		
		p.resolveWith(ctx, [this]);
	};
	
	ME.metainfFail = function (jqxhr, status, error, p, ctx) {
		p.rejectWith(ctx, [this, status, error]);
	};
	
	ME.GetMetainf = function (prop) {
		if (!this.metaInf) return null;
		if (!this.metaInf.hasOwnProperty(prop)) return null;
		return this.metaInf[prop];
	};
	
	ME.GetVersion = function () {
		return this.GetMetainf('version');
	};
	
	ME.GetVerdesc = function () {
		return this.GetMetainf('verdesc');
	};
	
	ME.GetSchema = function () {
		return this.GetMetainf('schema');
	};

	_LoadFileDone = function(jsf, data) {
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
	_LoadFileFail = function(jsf, status, error) {
		this.jsonfiles[jsf].p.reject(jsf, status, error);
	};	
	ME.LoadFile = function(jsf) {
		var p,
			self = this;
		if (this.jsonfiles[jsf].loaded) {
			return $.Deferred().resolveWith(null, [jsf, this.jsonfiles[jsf].data]).promise();
		}
		else if (this.jsonfiles[jsf].p != null) {
			return this.jsonfiles[jsf].p.promise();
		}
		else {
			this.jsonfiles[jsf].p = $.Deferred();
			$.ajax({
				'dataType': this.c['datatype'],
				'cache': this.c['cache'],
				'jsonp': false,
				'jsonpCallback': 'EVE-Oj_' + jsf + '_callback',
				'url': this.c['path'] + '/' + jsf + '.' + this.c['datatype']
			})
			.done(function (data, status, jqxhr) { _LoadFileDone.apply(self, [jsf, data]) })
			.fail(function (jqxhr, status, error) { _LoadFileFail.apply(self, [jsf, status, error]) });
			return this.jsonfiles[jsf].p.promise();		
		}	
	};	
	
})(jQuery);
