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

var EVEoj = EVEoj || {};
(function ($) {
    var ME = EVEoj;
	
	ME.MPLY = 9.4605284e+15; // meters per lightyear
	ME.MPAU = 1; // meters per AU
	
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

EVEoj.data = EVEoj.data || {};
(function ($) {
	var ME = EVEoj.data,
		E = EVEoj
		;
	
	ME.NOT_LOADED = {'not_loaded': 'unique object id'};
	ME.NOT_FOUND = {'not_found': 'unique object id'};
	
	// create a new data source of the type specified with the config provided;
	// EVEoj.data.src_<type> handles the actual implementation details
	ME.Create = function(type, config, ctx) {
		var p = $.Deferred();
		if (typeof EVEoj.data['src_' + type] == 'undefined') {
			p.rejectWith(null, [null, 'error', 'unrecognized source type']);
			return p.promise();
		}
		Object.create(EVEoj.data['src_' + type]).SetConfig(p, config, ctx);
		return p.promise();
	};
	
})(jQuery);

EVEoj.data.Table = EVEoj.data.Table || {};
(function ($) {
    var ME = EVEoj.data.Table,
		E = EVEoj,
		D = EVEoj.data,
		_D = {
			'src': null, // the EVEoj.data source that created this table
			'name': null, // the name of this table
			'keyname': null, // the primary key name
			'columns': [], // the list of columns
			'colmap': {}, // a reverse lookup map for column indexes
			'subkeys': [], // any subkeys (this implies a nested entry structure)
			'indexes': [], // indexes available for secondary entry lookups
			'segments': [] // the data for this table, in segments
		},
		_P = {},
		_SegLoadDone,
		_SegLoadFail
		;
				
	ME.Create = function (name, src, meta) {
		var obj,
			i,
			keyarr
			;
								
		obj = Object.create(_P);
		$.extend(true, obj, _D); // default properties
		
		// sort out relevant metadata details
		obj.src = src;
		obj.name = name;
		
		// determine the source(s) of this table's data
		if (meta.hasOwnProperty('j')) {
			// only one segment and it is stored with other stuff
			obj.segments.push({ 'min': 0, 'max': -1, 'tag': meta['j'], 'data': false, 'p': null });
		}
		else if (meta.hasOwnProperty('s')) {
			//  at least one segment that is stored independently
			for (i = 0; i < meta['s'].length; i++) {
				obj.segments.push({ 'min': meta['s'][i][1], 'max': meta['s'][i][2], 'tag': name + '_' + meta['s'][i][0], 'data': false, 'p': null });
			}
		}
		
		// if this table has a column array, create a reverse lookup map for it
		if (meta.hasOwnProperty('c') && meta['c'].length > 0) {
			obj.columns.push(meta['c']);
			for (i = 0; i < meta['c'].length; i++) obj.colmap[meta['c'][i]] = i;
		}
		
		// find out the key info for this table
		if (meta.hasOwnProperty('k')) {
			keyarr = meta['k'].split(':');
			obj.keyname = keyarr.shift();
			obj.subkeys.push(keyarr);
		}
		
		if (meta.hasOwnProperty('i')) {
			obj.indexes = obj.meta['i'];
		}
		
		return obj;
	};
	
	// get the entry for the key provided; all keys must be numeric values for segmentation
	_P.GetEntry = function (key) {
		var i,
			nkey,
			skey;
		
		// get a guaranteed numeric and guaranteed string version of the key; numeric
		// is for segment comparison, string is for object property lookup
		nkey = parseInt(key);
		if (isNaN(nkey)) return null;
		skey = nkey.toString(10);		
		for (i = 0; i < this.segments.length; i++) {
			if (nkey >= this.segments[i].min && (nkey <= this.segments[i].max || this.segments[i].max == -1)) {
				// the key should be in this segment
				if (this.segments[i].data) {
					// the segment is loaded, so either we have this key or it doesn't exist
					if (this.segments[i].data.hasOwnProperty(skey)) return this.segments[i].data[skey];
					else return null;
				}
				else return false; // the segment isn't not loaded yet
			}
		}
		
		return null;		
	};		

	// get the value for the key (or entry array) and column provided
	_P.GetValue = function (key, col) {
		var entry;
		if (key instanceof Array) entry = key;
		else entry = this.GetEntry(key);
		if (entry === null || entry === false) return entry;
		if (isNaN(col)) {
			if (!this.colmap.hasOwnProperty(col)) return null;
			col = this.colmap[col];
		}
		return entry[col];
	};
	
	_SegLoadDone = function(tag, data, done, p, ctx) {
		var i;
		done.has++;
		for (i = 0; i < this.segments.length; i++) {
			if (this.segments[i].tag != tag) continue;
			this.segments[i].data = data;
			break;
		}
		if (done.has >= done.needs) p.resolveWith(ctx, [this]);
		else p.notifyWith(ctx, [this, done.has, done.needs]);
	};
	_SegLoadFail = function(tag, status, error, p, ctx) {
		p.rejectWith(ctx, [this, status, error]);
	};
	
	// load data for this table; returns a deferred promise object as this is an async thing
	// if key is provided, loads ONLY the segment containing that key
	_P.Load = function(opts) {
		var p = $.Deferred(),
			self = this,
			all_needs,
			done,
			nkey,
			skey,
			i,
			segment,
			o = {'ctx': null, 'key': null}
			;
		$.extend(true, o, opts);
		
		if (o.key === null) {
			// load all segments
			all_needs = [];
			for (i = 0; i < this.segments.length; i++) {
				if (!this.segments[i].data) {
					// this segment not yet loaded
					all_needs.push(i);
				}
			}
			done = {'needs': all_needs.length, 'has': 0};
			if (all_needs.length > 0) {
				for (i = 0; i < all_needs.length; i++) {
					if (!this.segments[all_needs[i]].p) {
						// this segment not pending load
						this.segments[all_needs[i]].p = this.src.LoadFile(this.segments[i].tag);
					}
					this.segments[all_needs[i]].p
						.done(function (tag, data) { _SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
						.fail(function (tag, status, error) { _SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
				}
				return p.promise();
			}
			else {
				p.resolveWith(o.ctx, [this]);
				return p.promise();
			}	
		}
		else {
			// determine which segment the key is in
			nkey = parseInt(o.key);
			if (isNaN(nkey)) {
				p.rejectWith(o.ctx, [this, 'badkey', 'invalid key; not numeric']);
				return this.p.promise();
			}
			skey = nkey.toString(10);
			segment = -1;
			for (i = 0; i < this.segments.length; i++) {
				if (nkey >= this.segments[i].min && (nkey <= this.segments[i].max || this.segments[i].max == -1)) {
					// the key should be in this segment
					segment = this.segments[i];
					break;
				}
			}
			
			if (segment === -1) return p.rejectWith(o.ctx, [this, 'badkey', 'invalid key; no segment contains it']).promise();			
			if (segment.data) return p.resolveWith(o.ctx, [this]).promise();
			
			if (segment.p == null) segment.p = this.src.LoadFile(segment.tag);			
			done = {'needs': 1, 'has': 0};
			segment.p
				.done(function (tag, data) { _SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
				.fail(function (tag, status, error) { _SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
			
			return p.promise();
		}
	};
		
})(jQuery);

EVEoj.data.EntryIter = EVEoj.data.EntryIter || {};
(function ($) {
    var ME = EVEoj.data.EntryIter,
		E = EVEoj,
		D = EVEoj.data,
		_D = {
			'curidx': 0,
			'curseg': 0,
			'tbl': null
		},
		_P = {}
	;
	
	ME.Create = function (tbl) {
		var obj
			;

		obj = Object.create(_P),			
		$.extend(true, obj, _D);
		obj.tbl = tbl;
		
		return obj;	
	};
	
	_P.HasNext = function () {
		if (this.curidx < this.keyset.length) return true;
	};
	
	_P.Next = function () {
		var sys;
			
		sys = S.Create();
		if (!sys.LoadID(this.src, this.tbl, this.keyset[this.curidx])) sys = null;
		this.curidx++;
		return sys;
	};
	
})(jQuery);


/**
Data sources must implement:
SetConfig(p, config, ctx)
LoadTables(table_list, ctx) -> jQuery.Deferred.promise
...
*/
// data source base class
EVEoj.data.src_base = EVEoj.data.src_base || {};
(function ($) {
    var ME = EVEoj.data.src_base,
		E = EVEoj,
		D = EVEoj.data
		;
		
	ME.c = {};
	ME.tables = {};
	
	ME.SetConfig = function(p, config, ctx) {
		p.rejectWith(ctx, [this, 'error', 'not implemented']);
		// p.resolveWith(ctx, [this]);
		return p.promise();
	};
	
	ME.HasTable = function (tbl) {
		return this.tables.hasOwnProperty(tbl);
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
	
	ME.GetTable = function (tbl) {
		var table;
		
		if (!tbl || !this.tables.hasOwnProperty(tbl)) return null;
		return this.tables[tbl];
	};
	
	/*
	ME.LoadTables = function (tables, ctx) {
		var p = $.Deferred();
		p.rejectWith(ctx, [this, 'error', 'not implemented']);
		// p.resolveWith(ctx);
		return p.promise();
	}
	*/
	
})(jQuery);

/*
// data source based on AJAX calls to an API of some kind
EVEoj.data.src_api = EVEoj.data.src_api || Object.create(EVEoj.data.src_base);
(function ($) {
    var ME = EVEoj.data.src_api,
		E = EVEoj,
		D = EVEoj.data
		;	
})(jQuery);
*/
