'use strict';

var extend = require('node.extend');
var Utils = require('./Utils');

var P = exports.P = {}; // public methods
			
// default object properties
exports.D = {
	'src': null, // the EVEoj.SDD.Source that owns this table
	'name': null, // the name of this table
	'keyname': null, // the primary key name
	'columns': [], // the list of columns
	'colmap': {}, // a reverse lookup map for column indexes
	'c': null, // shortcut to colmap
	'colmeta': {}, // a map of metainfo about each complex column
	'subkeys': [], // any subkeys (this implies a nested entry structure)
	'data': {}, // the data for this table (shallow references into raw data from source)
	'segments': [], // the segment information for this table
	'length': 0, // the total number of entries in this table
	'loaded': 0 // the total number of currently loaded entries
};
exports.Create = function (name, src, meta) {
	var obj,
		i,
		keyarr
		;
							
	obj = Utils.create(P);
	extend(true, obj, exports.D);
	
	// sort out relevant metadata details
	obj.src = src;
	obj.name = name;
	
	// determine the source(s) of this table's data
	if (meta.hasOwnProperty('j')) {
		// only one segment and it is stored with other stuff
		obj.segments.push({ 'min': 0, 'max': -1, 'tag': meta['j'], 'loaded': false, 'p': null });
	}
	else if (meta.hasOwnProperty('s')) {
		//  at least one segment that is stored independently
		for (i = 0; i < meta['s'].length; i++) {
			obj.segments.push({ 'min': meta['s'][i][1], 'max': meta['s'][i][2], 'tag': name + '_' + meta['s'][i][0], 'loaded': false, 'p': null });
		}
	}
		
	// find out the key info for this table
	if (meta.hasOwnProperty('k')) {
		keyarr = meta['k'].split(':');
		obj.keyname = keyarr.shift();
		for (i = 0; i < keyarr.length; i++) obj.subkeys.push(keyarr[i]);
	}
	
	// add keys to the column definition
	if (obj.keyname) obj.columns.push(obj.keyname);
	else obj.columns.push('index');
	for (i = 0; i < obj.subkeys.length; i++) {
		obj.columns.push(obj.subkeys[i]);
	}

	// add meta columns to column definition
	if (meta.hasOwnProperty('c')) {
		for (i = 0; i < meta['c'].length; i++) obj.columns.push(meta['c'][i]);
	}
	
	// create a reverse lookup map for columns
	for (i = 0; i < obj.columns.length; i++) obj.colmap[obj.columns[i]] = i;
	obj.colmap['index'] = 0;
	obj.c = obj.colmap;
	
	// grab the colmeta extra info
	if (meta.hasOwnProperty('m')) {		
		extend(true, obj.colmeta, meta['m']);
	}

	// grab the length
	if (meta.hasOwnProperty('l')) {
		obj.length = meta['l'];
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
	if (this.data.hasOwnProperty(skey)) return this.data[skey];
	
	// if we don't have this key, determine if we ought to by now
	for (i = 0; i < this.segments.length; i++) {
		if (nkey >= this.segments[i].min && (nkey <= this.segments[i].max || this.segments[i].max == -1)) {
			if (this.segments[i].loaded) return null; // the key should be in this segment
			else return false; // the segment isn't loaded yet
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

function UnshiftIndexes(data, indexes) {
	var key, i;
	for (key in data) {
		if (!data.hasOwnProperty(key)) return;
		if (!data[key]) return;
		indexes.push(parseInt(key));
		if (data[key] instanceof Array) {
			for (i = indexes.length - 1; i >= 0; i--) {
				data[key].unshift(indexes[i]);
			}
		}
		else UnshiftIndexes(data[key], indexes);
		indexes.pop();
	}
}
function SegLoadDone(tag, data, done, p, ctx) {
	var i, key;
	done.has++;
	for (i = 0; i < this.segments.length; i++) {
		if (this.segments[i].tag != tag) continue;
		if (data['tables'].hasOwnProperty(this.name) && data['tables'][this.name].hasOwnProperty('d')) {		
			if (!data['tables'][this.name].hasOwnProperty('U')) {
				// put the indexes into the first columns of every row
				UnshiftIndexes(data['tables'][this.name]['d'], []);
				data['tables'][this.name]['U'] = true;
			}
			extend(this.data, data['tables'][this.name]['d']);
			if (data['tables'][this.name].hasOwnProperty('L')) {
				this.loaded += data['tables'][this.name]['L'];
			}
			else if (done.needs == 1) {
				this.loaded = this.length;
			}
		}
		break;
	}	
	if (done.has >= done.needs) p.resolveWith(ctx, [this]);
	else p.notifyWith(ctx, [this, done.has, done.needs]);
}
function SegLoadFail(tag, status, error, p, ctx) {
	p.rejectWith(ctx, [this, status, error]);
}

// load data for this table; returns a deferred promise object as this is an async thing
// if key is provided, loads ONLY the segment containing that key
P.Load = function(opts) {
	var p = Utils.deferred(),
		self = this,
		all_needs,
		done,
		nkey,
		skey,
		i,
		segment,
		o = {'ctx': null, 'key': null}
		;
	extend(o, opts);
	
	if (o.key === null) {
		// load all segments
		all_needs = [];
		for (i = 0; i < this.segments.length; i++) {
			if (!this.segments[i].loaded) {
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
					.done(function (tag, data) { SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
					.fail(function (tag, status, error) { SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
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
		if (segment.loaded) return p.resolveWith(o.ctx, [this]).promise();
		
		if (segment.p == null) segment.p = this.src.LoadTag(segment.tag);
		done = {'needs': 1, 'has': 0};
		segment.p
			.done(function (tag, data) { SegLoadDone.apply(self, [tag, data, done, p, o.ctx]) })
			.fail(function (tag, status, error) { SegLoadFail.apply(self, [tag, status, error, p, o.ctx]) });
		
		return p.promise();
	}
};

P.ColIter = function (colname) {
	var colnum;
	if (this.colmap.hasOwnProperty(colname)) {
		colnum = this.colmap[colname];
		return function (e) { return e[colnum] };
	}
	else return function (e) { return undefined };	
};

P.ColPred = function (colname, compare, value) {
	var colnum;
	if (this.colmap.hasOwnProperty(colname)) {
		colnum = this.colmap[colname];
		if (compare == '==' || compare == 'eq') return function (e) { return e[colnum] == value};
		if (compare == '!=' || compare == 'ne') return function (e) { return e[colnum] != value};
		if (compare == '===' || compare == 'seq') return function (e) { return e[colnum] === value};
		if (compare == '!==' || compare == 'sne') return function (e) { return e[colnum] !== value};
		else if (compare == '>' || compare == 'gt') return function (e) { return e[colnum] > value};
		else if (compare == '>=' || compare == 'gte') return function (e) { return e[colnum] >= value};
		else if (compare == '<' || compare == 'lt') return function (e) { return e[colnum] < value};
		else if (compare == '<=' || compare == 'lte') return function (e) { return e[colnum] < value};
	}
	else return function (e) { return false };	
};
