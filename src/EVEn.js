// object create polyfill (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) throw Error('Second argument not supported');
            if (o === null) throw Error('Cannot set a null [[Prototype]]');
            if (typeof o != 'object') throw TypeError('Argument must be an object');
            F.prototype = o;
            return new F();
        };
    })();
}

var EVEn = EVEn || {};
(function ($) {
    var ME = EVEn;
	
	ME.FormatNum = function (val, fixed) {
		var stringy = [],
			base = String(Math.floor(val)),
			k = -1,
			i = 0,
			decimals
			;
		
		fixed = fixed || 0;
		
		for (i = base.length - 1; i >= 0; i--) {
			if (k % 3 == 0) {
				k = 1;
				stringy.push(",");
			}
			else if (k == -1) {
				k = 1;
			}
			else {
				k++;
			}
			stringy.push(base.charAt(i));
		}
		base = "";
		for (i = stringy.length - 1; i >= 0; i--) {
			base = base.concat(stringy[i]);
		}		
		
		if (fixed > 0) {
			decimals = val.toFixed(fixed);
			base += decimals.substring(decimals.length - fixed - 1);
		}
		
		return base;
	};	
})(jQuery);

EVEn.data = EVEn.data || {};
(function ($) {
	var ME = EVEn.data,
		E = EVEn
		;
	
	ME.lastErr;

	ME.CreateSource = function(type, config, ctx) {
		var p = $.Deferred();
		if (typeof EVEn.data['src_' + type] == 'undefined') {
			p.rejectWith(null, [null, 'error', 'unrecognized source type']);
			return p.promise();
		}
		Object.create(EVEn.data['src_' + type]).SetConfig(p, config, ctx);
		return p.promise();
	};
	
})(jQuery);

/*
EVEn.data.Table = EVEn.data.Table || {};
(function ($) {
    var ME = EVEn.data.Table,
		E = EVEn,
		D = EVEn.data,
		_D = {
			'src': null,
			'name': null
		},
		_P = {}
		;
		
	ME.Create = function (src, tbl) {
		var obj;
		
		if (!src || !src.HasTable(tbl)) return null;
						
		obj = Object.create(_P);
		$.extend(true, obj, _D);
		
		obj.src = src['tables'][tbl];
		obj.name = tbl;
		
		return obj;
	};
	
	_P.GetValue = function (row, col, def) {
		if (!this.src['d'].hasOwnProperty(row)) return def;
		if (!this.src['colmap'].hasOwnProperty(col)) return def;
		return this.src['d'][row][this.src['colmap'][col]];
	};
		
})(jQuery);
*/

/**
Data sources must implement:
SetConfig(p, config, ctx)
LoadTables(table_list, ctx) -> jQuery.Deferred.promise
...
*/
// data source base class
EVEn.data.src_base = EVEn.data.src_base || {};
(function ($) {
    var ME = EVEn.data.src_base,
		E = EVEn,
		D = EVEn.data
		;
		
	ME.c = {};
	ME.tables = {};
	
	ME.SetConfig = function(p, config, ctx) {
		p.rejectWith(ctx, [this, 'error', 'not implemented']);
		// p.resolveWith(ctx, [this]);
		return p.promise();
	};
	
	ME.HasTable = function (table) {
		return this.tables.hasOwnProperty(table);
	};
	
	ME.GetTables = function () {
		var tbl_list = [],
			tbl
			;
		for (tbl in this.tables) {
			if (!this.tables.hasOwnProperty(tbl)) continue;
			tbl_list.push(tbl);
		}
		
		return tbl_list;
	};
	
	/*
	ME.GetTable = function (tbl) {
		var table;
		
		if (!tbl || !this.HasTable(tbl)) return null;
		return D.Table.Create(this, tbl);		
	};
	*/
	
	ME.LoadTables = function (tables, ctx) {
		var p = $.Deferred();
		p.rejectWith(ctx, [this, 'error', 'not implemented']);
		// p.resolveWith(ctx);
		return p.promise();
	}
	
})(jQuery);

/*
// data source based on AJAX calls to an API of some kind
EVEn.data.src_api = EVEn.data.src_api || Object.create(EVEn.data.src_base);
(function ($) {
    var ME = EVEn.data.src_api,
		E = EVEn,
		D = EVEn.data
		;	
})(jQuery);
*/
