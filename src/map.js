EVEoj.map = EVEoj.map || {};
(function () {

var ME = EVEoj.map,
	// namespace quick refs
	E = EVEoj,
	
	_P = {}, // private methods
	P = {} // public methods for this class
	;
ME.P = P;
	
ME.D = {
	// default properties for new instances
	'src': null,
	'tables': {},
	'sysNameMap': {},
	'sysNames': [],
	'routeGraph': {},
	'space': null,
	'loaded': false,
	'loadingP': null,
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
};
	
ME.Create = function(src, type, config) {
	if (!src || typeof src.HasTable != 'function') return null;
	if (type != 'J' && type != 'K' && type != 'W') return null;
	var obj = E.create(P);
	E.extend(true, obj, ME.D);
	if (config) E.extend(true, obj.c, config);
	obj.src = src;
	obj.space = type;
	
	return obj;
};

_P.LoadDone = function (tbl, ctx) {
	var has = 0,
		needs = 0,
		key
		;
	
	for (key in this.tables) {
		needs++;
		if (key == tbl.name) this.tables[key].done = true;
		if (this.tables[key].done) has++;
	}
	
	if (has >= needs) {
		_P.LoadInit.apply(this);
		this.loadingP.resolveWith(ctx, [this]);
	}
	else this.loadingP.notifyWith(ctx, [this, has, needs]);
};
_P.LoadFail = function (tbl, ctx, status, error) {
	this.loadingP.rejectWith(ctx, [this, status, error]);
};
P.Load = function(ctx) {
	var self = this,
		t = this.tables,
		key
		;

	if (this.loaded) return E.deferred().resolveWith(ctx, [this]).promise();
	if (this.loadingP) return this.loadingP.promise();
	this.loadingP = E.deferred();
	
	// setup required and optional tables
	t['map' + this.space + 'Regions'] = false;
	t['map' + this.space + 'Constellations'] = false;
	t['map' + this.space + 'SolarSystems'] = false;
	if (this.space == 'K' || this.space == 'J') {
		t['map' + this.space + 'SolarSystemJumps'] = false;
		if (this.c['jumps']) {
			t['mapRegionJumps'] = false;
			t['mapConstellationJumps'] = false;
			t['mapJumps'] = false;
		}
		if (this.c['belts']) t['map' + this.space + 'Belts'] = false;
		if (this.c['gates']) t['map' + this.space + 'Gates'] = false;		
		if (this.c['landmarks']) t['mapLandmarks'] = false;
	}
	if (this.c['planets']) t['map' + this.space + 'Planets'] = false;
	if (this.c['moons']) t['map' + this.space + 'Moons'] = false;
	if (this.c['celestials']) t['map' + this.space + 'Celestials'] = false;
	if (this.c['statistics']) t['map' + this.space + 'CelestialStatistics'] = false;

	for (key in t) {
		if (!t.hasOwnProperty(key)) continue;
		t[key] = {'tbl': this.src.GetTable(key), 'done': false };
		if (!t[key].tbl) return this.loadingP.rejectWith(ctx, [self, 'error', 'source does not contain requested table: ' + key]).promise();
		t[key].tbl.Load()
			.done(function (tbl) { _P.LoadDone.apply(self, [tbl, ctx]) })
			.fail(function (tbl, status, err) { _P.LoadFail.apply(self, [tbl, ctx, status, err]) });
	}	
	
	return this.loadingP.promise();
};

_P.LoadInit = function () {
	var systbl = this.tables['map' + this.space + 'SolarSystems'].tbl,
		colmap = systbl.colmap,
		solarSystemID,
		toSolarSystemID,
		system,
		jumptblnm,
		jumptbl,
		sys
		;
		
	for (solarSystemID in systbl.data) {
		if (!systbl.data.hasOwnProperty(solarSystemID)) continue;
		system = systbl.data[solarSystemID];
		this.sysNameMap[system[colmap['solarSystemName']]] = solarSystemID;
		this.sysNames.push(system[colmap['solarSystemName']]);
		jumptblnm = false;
		if (this.space != 'W') jumptblnm = 'map' + this.space + 'SolarSystemJumps';
		if (jumptblnm && this.tables.hasOwnProperty(jumptblnm)) {
			// create the routing graph used for path finding
			sys = {
				'jumps': [],
				'cont': system[colmap['contiguous']],
				'sec': system[colmap['security']].toFixed(1),
				'name': system[colmap['solarSystemName']]
			};
			jumptbl = this.tables[jumptblnm].tbl.data[solarSystemID];
			for (toSolarSystemID in jumptbl) {
				if (!jumptbl.hasOwnProperty(toSolarSystemID)) continue;
				sys['jumps'].push(toSolarSystemID);
			}
			this.routeGraph[solarSystemID] = sys;
		}
	}
	this.sysNames.sort();
};

P.GetSystem = function (input) {
	var systemID,
		system
		;
		
	if (!input) return null;
	if (input.hasOwnProperty('name') && this.sysNameMap.hasOwnProperty(input['name'])) systemID = this.sysNameMap[input['name']];
	else if (input.hasOwnProperty('id')) systemID = input['id'];
	else return null;
	
	system = ME.System.Create(this.tables['map' + this.space + 'SolarSystems'].tbl, systemID);
	return system;
};

P.GetSystems = function () {
	return ME.SystemIter.Create(this.tables['map' + this.space + 'SolarSystems'].tbl);
};	

P.JumpDist = function (fromID, toID) {
	var systbl = this.tables['map' + this.space + 'SolarSystems'].tbl,
		colmap = systbl.colmap,
		x1 = systbl.data[fromID][colmap['x']],
		x2 = systbl.data[toID][colmap['x']],			
		y1 = systbl.data[fromID][colmap['y']],
		y2 = systbl.data[toID][colmap['y']],
		z1 = systbl.data[fromID][colmap['z']],
		z2 = systbl.data[toID][colmap['z']],
		dist
		;
			
	dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
	return dist/E.M_per_LY;
};

P.Route = function (fromSystemID, toSystemID, avoidList, avoidLow, avoidHi) {
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

})();
