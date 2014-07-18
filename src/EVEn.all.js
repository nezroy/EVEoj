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
// data source based on a pre-set JS object
var EVEn = EVEn || {};
EVEn.data.src_object = EVEn.data.src_object || Object.create(EVEn.data.src_base);
(function ($) {
    var ME = EVEn.data.src_object,
		E = EVEn,
		D = EVEn.data
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
var EVEn = EVEn || {};
EVEn.IGB = EVEn.IGB || {};
(function ($) {
	var ME = EVEn.IGB,
		E = EVEn, 
		
		/* private functions */
		_IGBClick, // basic click handler for IGB scheme
		_Ready // runs when DOM ready fires		
		;
		
	_IGBClick = function (ev) {
		var corp_id,
			chan,
			cctype,
			trustme,
			trust_req = false,
			href
			;
		
		href = $(this).attr('href');
		if (!href.match(/^eve:/i)) return; // huh.. that's odd
		ev.preventDefault();		

		if (href.match(/^eve:trust:/i)) trust_req = true;
		href = href.replace(/^eve:\s*/i, '').replace(/^trust:\s*/i, '');
		
		/*
		if (typeof(navigator) != 'undefined' && navigator.hasOwnProperty('userAgent') && !navigator.userAgent.match(/EVE\-IGB/)) {
			// straight browser detection for IGB
			return;
		}
		*/
		if (typeof(CCPEVE) == 'undefined') {
			// impl based detection for IGB
			return;
		}
		
		corp_id = $(this).data('igb-corpid');
		chan = $(this).data('igb-chan');
		cctype = $(this).data('igb-cctype');		
		trustme = $(this).data('igb-trustme');
	
		if (corp_id && corp_id > 0) CCPEVE.showInfo(2, corp_id);
		if (chan) CCPEVE.joinChannel(chan);
		if (cctype) CCPEVE.createContract(cctype);
		if (trustme) CCPEVE.requestTrust(trustme);	
	};
	
	_Ready = function () {
		$("a[href^='eve:']").click(_IGBClick);	
	};
		
	$(_Ready);	
	
})(jQuery);
var EVEn = EVEn || {};
EVEn.map = EVEn.map || {};
(function ($) {
    var ME = EVEn.map,
		E = EVEn,
		_LYPM = 9.4605284e+15,
		_D = { // default properties for new instances
			'src': null,
			'sysNameMap': {},
			'sysNames': [],
			'routeGraph': {},
			'space': null,
			'c': {
				'jumps': false,
				'planets': false,
				'moons': false,
				'belts': false,
				'gates': false,
				'celestials': false,
				'statistics': false,
				'landmarks': false
			}
		},
		_P = {} // public methods for this class
		;
	
	ME.Create = function(src, type, config, ctx) {
		if (type != 'J' && type != 'K' && type != 'W') return null;
		var map = Object.create(_P);
		$.extend(true, map, _D);
		map.src = src;
		map.space = type;
		return map.SetConfig(config, ctx);
	};
	
	_P.SetConfig = function(config, ctx) {
		var p = $.Deferred(),
			required = [],
			that = this
			;
		
		if (!this.src || typeof this.src.HasTable != 'function') p.rejectWith(ctx, [that, 'error', 'invalid source']).promise();
		if (!this.space || (this.space != 'W' && this.space != 'K' && this.space != 'J')) return p.rejectWith(ctx, [that, 'error', 'invalid space designation']).promise();
		if (config) $.extend(true, this.c, config);
			
		// check for required and optional sources
		required.push('map' + this.space + 'Regions', 'map' + this.space + 'Constellations', 'map' + this.space + 'SolarSystems', 'map' + this.space + 'SolarSystemJumps');
		if (this.space == 'K' || this.space == 'J') {
			if (this.c['jumps']) required.push('mapRegionJumps', 'mapConstellationJumps', 'mapJumps');
			if (this.c['belts']) required.push('map' + this.space + 'Belts');
			if (this.c['gates']) required.push('map' + this.space + 'Gates');
			if (this.c['landmarks']) required.push('mapLandmarks');
		}
		if (this.c['planets']) required.push('map' + this.space + 'Planets');
		if (this.c['moons']) required.push('map' + this.space + 'Moons');
		if (this.c['celestials']) required.push('map' + this.space + 'Celestials');
		if (this.c['statistics']) required.push('map' + this.space + 'CelestialStatistics');
	
		this.src.LoadTables(required).done(function () {
			that.LoadDone();
			p.resolveWith(ctx, [that]);
		}).fail(function (jqxhr, status, error) {
			p.rejectWith(ctx, [that, 'error', error]);
		});
		
		return p.promise();
	};
	
	_P.LoadDone = function () {
		// create a map of system names to IDs for fast reverse lookups
		var systbl = this.src.tables['map' + this.space + 'SolarSystems']['d'],
			colmap = this.src.tables['map' + this.space + 'SolarSystems']['colmap'],
			solarSystemID,
			toSolarSystemID,
			system,
			jumptblnm,
			jumptbl,
			sys
			;
			
		for (solarSystemID in systbl) {
			if (!systbl.hasOwnProperty(solarSystemID)) continue;
			system = systbl[solarSystemID];
			this.sysNameMap[system[colmap['solarSystemName']]] = solarSystemID;
			this.sysNames.push(system[colmap['solarSystemName']]);
			jumptblnm = false;
			if (this.space != 'W') jumptblnm = 'map' + this.space + 'SolarSystemJumps';
			if (jumptblnm && this.src.HasTable(jumptblnm)) {
				// create the routing graph used for path finding
				sys = {
					'jumps': [],
					'cont': system[colmap['contiguous']],
					'sec': system[colmap['security']].toFixed(1),
					'name': system[colmap['solarSystemName']]
				};
				jumptbl = this.src.tables[jumptblnm]['d'][solarSystemID];
				for (toSolarSystemID in jumptbl) {
					if (!jumptbl.hasOwnProperty(toSolarSystemID)) continue;
					sys['jumps'].push(toSolarSystemID);
				}
				this.routeGraph[solarSystemID] = sys;
			}
		}
		this.sysNames.sort();
	};
	
	_P.GetSystem = function (input) {
		var systemID,
			system
			;
			
		if (!input) return null;
		if (input.hasOwnProperty('name') && this.sysNameMap.hasOwnProperty(input['name'])) systemID = this.sysNameMap[input['name']];
		else if (input.hasOwnProperty('id')) systemID = input['id'];
		else return null;
		
		system = ME.System.Create();
		if (system.LoadID(this.src, 'map' + this.space + 'SolarSystems', systemID)) return system;
		return null;
	};
	
	_P.GetSystems = function () {
		return ME.SystemIter.Create(this.src, 'map' + this.space + 'SolarSystems');
	};	
	
	_P.JumpDist = function (fromID, toID) {
		var systbl = this.src.tables['map' + this.space + 'SolarSystems']['d'],
			colmap = this.src.tables['map' + this.space + 'SolarSystems']['colmap'],
			x1 = systbl[fromID][colmap['x']],
			x2 = systbl[toID][colmap['x']],			
			y1 = systbl[fromID][colmap['y']],
			y2 = systbl[toID][colmap['y']],
			z1 = systbl[fromID][colmap['z']],
			z2 = systbl[toID][colmap['z']],
			dist
			;
				
		dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
		return dist/_LYPM;
	};

	_P.Route = function (fromSystemID, toSystemID, avoidList, avoidLow, avoidHi) {
		var route = [],
			avoids = {},
			solarSystemID,
			currentID,
			systemID,
			nID,
			prevID,
			sys_td,
			td,
			i,
			tmp,
			testset = [],
			test_td,
			testidx,
			dist
			;
			
		if (!this.routeGraph.hasOwnProperty(fromSystemID) || !this.routeGraph.hasOwnProperty(toSystemID)) return route;

		// reset the route graph
		for (solarSystemID in this.routeGraph) {
			if (!this.routeGraph.hasOwnProperty(solarSystemID)) continue;
			this.routeGraph[solarSystemID]['td'] = -1;
			this.routeGraph[solarSystemID]['prevID'] = -1;
			this.routeGraph[solarSystemID]['visited'] = false;
		}
		
		// populate avoid list lookup table
		if (avoidList && avoidList.length > 0) {
			for (i = 0; i < avoidList.length; i++) {
				avoids[avoidList[i]] = true;
			}
		}
		
		if (fromSystemID == toSystemID) return route;
		
		// swap from/to to match EVE client?
		tmp = fromSystemID; fromSystemID = toSystemID; toSystemID = tmp;
		
		// Dijkstra's to find best route given options provided
		currentID = fromSystemID;
		this.routeGraph[fromSystemID]['td'] = 0;	
		while (!this.routeGraph[toSystemID]['visited']) {
			if (currentID != fromSystemID) {
				// find next node to try
				test_td = -1;
				testidx = -1;
				for (i = 0; i < testset.length; i++) {
					systemID = testset[i];
					if (this.routeGraph[systemID]['visited']) continue;
					if (avoids[systemID]) continue;
					sys_td = this.routeGraph[systemID]['td'];
					if (sys_td > 0 && (test_td == -1 || sys_td < test_td)) {
						currentID = systemID;
						test_td = sys_td;
						testidx = i;
					}
				}
				if (test_td == -1) return route; // no connection
				testset.splice(testidx, 1); // remove the node we just picked from the testset
			}
			for (i = 0; i < this.routeGraph[currentID]['jumps'].length; i++) {
				nID = this.routeGraph[currentID]['jumps'][i];
				dist = 1;
				if (avoidLow && this.routeGraph[nID]['sec'] < 0.5 && this.routeGraph[currentID]['sec'] >= 0.5) dist = 1000;
				if (avoidHi && this.routeGraph[nID]['sec'] >= 0.5 && this.routeGraph[currentID]['sec'] < 0.5) dist = 1000;
				td = this.routeGraph[currentID]['td'] + dist;
				if (this.routeGraph[nID]['td'] < 0 || this.routeGraph[nID]['td'] > td) {
					this.routeGraph[nID]['td'] = td;
					this.routeGraph[nID]['prevID'] = currentID;
					testset.push(nID);
				}	
			}
			this.routeGraph[currentID]['visited'] = true;
			currentID = 0;
		}
		
		// get the actual route found
		prevID = this.routeGraph[toSystemID]['prevID'];
		while (prevID != fromSystemID) {
			route.push(prevID);
			prevID = this.routeGraph[prevID]['prevID'];
		}
		route.push(fromSystemID);
		// route.reverse();
		// route.unshift(toSystemID);
		return route;
	};	

})(jQuery);
var EVEn = EVEn || {};
EVEn.map = EVEn.map || {};
EVEn.map.System = EVEn.map.System || {};
(function ($) {
    var ME = EVEn.map.System,
		E = EVEn,
		M = EVEn.map,
		_D = {
			'ID': null,
			'name': null,
			'regionID': null,
			'constellationID': null,
			'pos': {'x': null, 'y': null, 'z': null},
			'posMax': {'x': null, 'y': null, 'z': null},
			'posMin': {'x': null, 'y': null, 'z': null},
			'luminosity': null,
			'border': null,
			'fringe': null,
			'corrider': null,
			'hub': null,
			'international': null,
			'regional': null,
			'constellation': null,
			'contiguous': null,
			'security': null,
			'sec': null,
			'factionID': null,
			'radius': null,
			'sunTypeID': null,
			'securityClass': null,
			'wormholeClassID': null,
			'stationCount': null		
		},
		_P = {}
		;		
	
	ME.Create = function () {
		var obj = Object.create(_P);
		$.extend(true, obj, _D);
		return obj;
	};
	
	_P.LoadID = function (src, table, ID) {
		var col,
			sys
			;
		
		if (!src || !table || !ID) return false;
		if (!src.HasTable(table)) return false;
		
		if (!src.tables[table]['d'].hasOwnProperty(ID)) return false;
		col = src.tables[table]['colmap'];
		sys = src.tables[table]['d'][ID];
		
		this.ID = ID;
		this.name = sys[col['solarSystemName']];
		this.regionID = sys[col['regionId']];
		this.constellationID = sys[col['constellationID']];
		this.pos = {'x': sys[col['x']], 'y': sys[col['y']], 'z': sys[col['z']]};
		this.posMin = {'x': sys[col['xMin']], 'y': sys[col['yMin']], 'z': sys[col['zMin']]};
		this.posMax = {'x': sys[col['xMax']], 'y': sys[col['yMax']], 'z': sys[col['zMax']]};
		this.luminosity = sys[col['luminosity']];
		this.border = sys[col['border']];
		this.fringe = sys[col['fringe']];
		this.corridor = sys[col['corridor']];
		this.hub = sys[col['hub']];
		this.international = sys[col['international']];
		this.regional = sys[col['regional']];
		this.constellation = sys[col['constellation']];
		this.contiguous = sys[col['contiguous']];
		this.security = sys[col['security']];
		this.sec = this.security.toFixed(1);
		this.factionID = (sys[col['factionID']] != 0) ? sys[col['factionID']] : null;
		this.radius = sys[col['radius']];
		this.sunTypeID = sys[col['sunTypeID']];
		this.securityClass = sys[col['securityClass']];
		this.wormholeClassID = sys[col['wormholeClassID']];
		this.stationCount = (sys[col['stationCount']]) ? sys[col['stationCount']] : 0;
		
		return true;
	};	
	
})(jQuery);

EVEn.map.SystemIter = EVEn.map.SystemIter || {};
(function ($) {
    var ME = EVEn.map.SystemIter,
		E = EVEn,
		M = EVEn.map,
		S = EVEn.map.System,
		_D = {
			'curidx': 0,
			'src': null,
			'tbl': null,
			'keyset': []
		},
		_P = {}
	;
	
	ME.Create = function (src, tbl) {
		var obj,
			key
			;

		if (!src || !src.HasTable(tbl)) return null;

		obj = Object.create(_P),			
		$.extend(true, obj, _D);
		obj.src = src;
		obj.tbl = tbl;
		
		for (key in src.tables[tbl]['d']) {
			if (!src.tables[tbl]['d'].hasOwnProperty(key)) continue;
			obj.keyset.push(key);
		}
		
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
