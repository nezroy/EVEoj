// data source based on a pre-set JS object
var EVEoj = EVEoj || {};
EVEoj.data.src_object = EVEoj.data.src_object || Object.create(EVEoj.data.src_base);
(function ($) {
    var ME = EVEoj.data.src_object,
		E = EVEoj,
		D = EVEoj.data
		;
	
	ME.metaInf = null;
	
	ME.SetConfig = function(p, config, ctx) {
		var obj;
		
		if (!config.hasOwnProperty('obj') || typeof config['obj'] != 'object') {
			p.rejectWith(ctx, [this, 'error', 'obj is required']);
			return;
		}
		$.extend(true, this.c, config);
		obj = this.c['obj'];
		
		if (!obj.hasOwnProperty('metainf')) {
			p.rejectWith(ctx, [this, 'error', 'obj is missing metainf']);
			return;
		}
		if (!obj.hasOwnProperty('data')) {
			p.rejectWith(ctx, [this, 'error', 'obj is missing data']);
			return;
		}
		
		this.metainfDone(obj['metainf'], p, ctx);
	};
	
	ME.metainfDone = function (data, p, ctx) {
		var tbl;
	
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
			$.extend(true, this.tables[tbl], data['tables'][tbl]);
			this.jsonfiles[this.tables[tbl]['j']] = {
				'loaded': false
			};
		}
		
		p.resolveWith(ctx, [this]);
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
			data = this.c['obj']['data'],
			missing = [],
			i,
			tbl
			;
		
		if (!data) return p.rejectWith(ctx, [this, 'error', 'invalid data object']);			
		if (!data.hasOwnProperty('formatID') || data['formatID'] != '1') return p.rejectWith(ctx, [this, 'error', 'unknown data format']);

		for (i = 0; i < tables.length; i++) {
			tbl = tables[i];
			if (!this.HasTable(tbl)) missing.push(tbl);
			if (this.tables[tbl]['loaded']) continue; // great, nothing to do
			if (!this.c['obj']['data'].hasOwnProperty(tbl)) {
				missing.push(tbl);
			}
			else {
				this.tables[tbl]['d'] = this.c['obj']['data'][tbl]['d'];
				this.tables[tbl]['loaded'] = true;
			}
		}
		if (missing.length > 0) {
			p.rejectWith(ctx, [this, 'error', 'source does not provide required tables: ' + missing.join(', ')]);
			return p.promise();
		}
		
		p.resolveWith(ctx);
		
		return p.promise();
	};	
})(jQuery);
