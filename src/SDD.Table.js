EVEoj.SDD.Table = EVEoj.SDD.Table || {};
(function () {

var ME = EVEoj.SDD.Table,
	// namespace quick refs
	E = EVEoj,
	SDD = EVEoj.data,
	
	// default object properties
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
	
	_P = {}, // private methods
	P = {} // public methods
	;
			
ME.Create = function (name, src, meta) {
	var obj,
		i,
		keyarr
		;
							
	obj = E.create(P);
	E.extend(true, obj, _D);
	
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
P.GetEntry = function (key) {
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
P.GetValue = function (key, col) {
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

_P.SegLoadDone = function(tag, data, done, p, ctx) {
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
_P.SegLoadFail = function(tag, status, error, p, ctx) {
	p.rejectWith(ctx, [this, status, error]);
};

// load data for this table; returns a deferred promise object as this is an async thing
// if key is provided, loads ONLY the segment containing that key
P.Load = function(opts) {
	var p = E.deferred(),
		self = this,
		all_needs,
		done,
		nkey,
		skey,
		i,
		segment,
		o = {'ctx': null, 'key': null}
		;
	E.extend(o, opts);
	
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
					this.segments[all_needs[i]].p = this.src.LoadTag(this.segments[i].tag);
				}
				this.segments[all_needs[i]].p
					.done(function (tag, data) { _P.SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
					.fail(function (tag, status, error) { _P.SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
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
			.done(function (tag, data) { _P.SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
			.fail(function (tag, status, error) { _P.SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
		
		return p.promise();
	}
};
		
})();

/*
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
*/