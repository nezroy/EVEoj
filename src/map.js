var EVEoj = EVEoj || {};
EVEoj.map = EVEoj.map || {};
(function ($) {
    var ME = EVEoj.map,
		E = EVEoj,
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
		return dist/E.M_per_LY;
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
