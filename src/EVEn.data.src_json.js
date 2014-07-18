// data source based on JSON files
var EVEn = EVEn || {};
EVEn.data.src_json = EVEn.data.src_json || Object.create(EVEn.data.src_base);
(function ($) {
    var ME = EVEn.data.src_json,
		E = EVEn,
		D = EVEn.data
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
			'jsonpCallback': 'EVEn_metainf_callback',
			'url': this.c['path'] + '/metainf.' + this.c['datatype']
		}).done(function (data, status, jqxhr) {
			that.metainfDone(data, status, jqxhr, p, ctx);
		}).fail(function (jqxhr, status, error) {
			that.metainfFail(jqxhr, status, error, p, ctx);
		});
	};
	
	ME.metainfDone = function (data, status, jqxhr, p, ctx) {
		var tbl,
			i;
	
		if (!data) return p.rejectWith(ctx, [this, 'error', 'invalid data object']);
		if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') return p.rejectWith(ctx, [this, 'error', 'unknown data format']);
		if (!data.hasOwnProperty('schema') || !data.hasOwnProperty('version')) return p.rejectWith(ctx, [this, 'error', 'data has no version information']);
		if (!data.hasOwnProperty('tables') || !data.hasOwnProperty('tables')) return p.rejectWith(ctx, [this, 'error', 'data has no table information']);

		// reset stuff
		this.metaInf = data;
		this.tables = {};
		this.jsonfiles = {};
		
		for (tbl in data['tables']) {
			if (!data['tables'].hasOwnProperty(tbl)) continue;
			this.tables[tbl] = {'loaded': false};
			$.extend(true, this.tables[tbl], data['tables'][tbl]); // copying metainf for this table into its table def
			this.jsonfiles[this.tables[tbl]['j']] = {
				'loaded': false
			};
			if (this.tables[tbl]['c'] && this.tables[tbl]['c'].length > 0) {
				this.tables[tbl]['colmap'] = {};
				for (i = 0; i < this.tables[tbl]['c'].length; i++) {
					this.tables[tbl]['colmap'][this.tables[tbl]['c'][i]] = i;
				}
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
		
	ME.LoadTables = function (tables, ctx) {
		var p = $.Deferred(),
			tbl,
			jsf,
			i,
			missing = [],
			jsonfiles = {}
			;
			
		for (i = 0; i < tables.length; i++) {
			tbl = tables[i];
			if (!this.HasTable(tbl)) missing.push(tbl);
			if (this.tables[tbl]['loaded']) continue; // great, nothing to do
			jsf = this.tables[tbl]['j'];
			if (this.jsonfiles[jsf]['loaded']) {
				if (this.jsonfiles[jsf]['d'][tbl].hasOwnProperty('s')) {
					// don't know what to do with segments yet
					p.rejectWith(ctx, [this, 'error', 'i dunno what to do with segments yet']);
					return p.promise();
				}
				this.tables[tbl]['d'] = this.jsonfiles[jsf][tbl]['d'];
				this.tables[tbl]['loaded'] = true;
			}
			else {
				jsonfiles[jsf] = false;
			}			
		}
		if (missing.length > 0) {
			p.rejectWith(ctx, [this, 'error', 'source does not provide required tables: ' + missing.join(', ')]);
			return p.promise();
		}
		
		// load necessary json files		
		for (jsf in jsonfiles) {
			if (!jsonfiles.hasOwnProperty(jsf)) continue;
			$.ajax({
				'dataType': this.c['datatype'],
				'cache': this.c['cache'],
				'jsonp': false,
				'jsonpCallback': 'EVEn_' + jsf + '_callback',
				'url': this.c['path'] + '/' + jsf + '.' + this.c['datatype']
			}).done(ME.FileDoneFactory(this, jsonfiles, jsf, p, ctx)).fail(ME.FileFailFactory(this, jsonfiles, jsf, p, ctx));
		}
		
		return p.promise();
	};
	
	ME.FileDoneFactory = function(that, jsonfiles, jsf, p, ctx) {
		return function (data, status, jqxhr) {
			that.FileDone(data, status, jqxhr, jsonfiles, jsf, p, ctx);
		};	
	};
	ME.FileDone = function (data, status, jqxhr, jsonfiles, jsf, p, ctx) {
		var tbl,
			complete = 1,
			fail = 0,
			count = 1,
			file
			;
	
		jsonfiles[jsf] = 'fail';
		
		if (!data) return p.rejectWith(ctx, [this, 'error', 'invalid data object']);			
		if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') return p.rejectWith(ctx, [this, 'error', 'unknown data format']);
				
		for (tbl in data) {
			if (!this.HasTable(tbl)) continue;
			if (data[tbl].hasOwnProperty('s')) {
				// don't know what to do with segments yet
				return p.rejectWith(ctx, [this, 'error', 'i dunno what to do with segments yet']);
			}
			this.tables[tbl]['d'] = data[tbl]['d'];
			this.tables[tbl]['loaded'] = true;			
		}
		this.jsonfiles[jsf]['d'] = data;
		this.jsonfiles[jsf]['loaded'] = true;
		
		jsonfiles[jsf] = true;
		
		for (file in jsonfiles) {
			if (!jsonfiles.hasOwnProperty(file)) continue;
			if (file == jsf) continue;
			count++;
			if (jsonfiles[file]) {
				if (jsonfiles[file] != 'fail') complete++;
				else fail++;
			}
		}
		
		if (complete == count) {
			p.resolveWith(ctx);
		}
		else if (fail == 0) {
			p.notifyWith(ctx, [this, count, complete]);
		}
	};
	
	ME.FileFailFactory = function (that, jsonfiles, jsf, p, ctx) {
		return function (jqxhr, status, error) {
			that.FileFail(jqxhr, status, error, jsonfiles, jsf, p, ctx);
		};
	};
	ME.FileFail = function (jqxhr, status, error, jsonfiles, jsf, p, ctx) {
		jsonfiles[jsf] = 'fail';
		p.rejectWith(ctx, [this, status, error]);
	};
	
})(jQuery);
