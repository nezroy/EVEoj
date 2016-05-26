var extend = require("node.extend");
var Const = require("./Const.js");
var Utils = require("./Utils.js");
var System = require("./map.System.js");
var SystemIter = require("./map.SystemIter.js");

var P = exports.P = {}; // public methods for this class

exports.D = {
	// default properties for new instances
	src: null,
	tables: {},
	sysNameMap: {},
	sysNames: [],
	routeGraph: {},
	space: null,
	loaded: false,
	loadingP: null,
	c: {
		jumps: false,
		planets: false,
		moons: false,
		belts: false,
		gates: false,
		stars: false,
		objects: false,
		landmarks: false
	}
};

var sys_cache = null; // a place to put generated systems so we don't keep re-creating them

exports.Create = function(src, type, config) {
	if (!src || typeof src.HasTable != "function") return null;
	if (type != "K" && type != "X" && type != "J") return null;
	var obj = Utils.create(P);
	extend(true, obj, exports.D);
	if (config) extend(true, obj.c, config);
	obj.src = src;
	obj.space = type;

	return obj;
};

function LoadDone(tbl, ctx) {
	var has = 0,
		needs = 0,
		key;

	for (key in this.tables) {
		if (!this.tables.hasOwnProperty(key)) continue;
		needs += this.tables[key].tbl.segments.length;
		if (key == tbl.name) this.tables[key].done = true;
		if (this.tables[key].done) {
			has += this.tables[key].tbl.segments.length;
		}
	}

	if (has >= needs) {
		LoadInit.apply(this);
		this.loadingP.resolve({
			context: ctx,
			map: this
		});
	}
}

function LoadFail(tbl, ctx, status, error) {
	this.loadingP.reject({
		context: ctx,
		map: this,
		status: status,
		error: error
	});
}

function LoadProgress(arg, progress) {
	var has = 0,
		needs = 0,
		key,
		i;

	if (progress === null) return;

	// arg: {context: ctx, table: this, has: done.has, needs: done.needs}
	// ignoring input progress info and counting finished segments ourself
	for (key in this.tables) {
		if (!this.tables.hasOwnProperty(key)) continue;
		needs += this.tables[key].tbl.segments.length;
		for (i = 0; i < this.tables[key].tbl.segments.length; i++) {
			if (this.tables[key].tbl.segments[i].loaded) has++;
		}
	}

	progress({
		context: arg.context,
		map: this,
		has: has,
		needs: needs
	});
}
P.Load = function(opts) {
	var self = this,
		t = this.tables,
		key,
		thenDone,
		thenFail,
		progressFunc = null,
		o = {
			context: null,
			progress: null
		};
	extend(o, opts);

	if (this.loaded) return Utils.deferred().resolve({
		context: o.context,
		map: this
	}).promise;
	if (this.loadingP) return this.loadingP.promise;
	this.loadingP = Utils.deferred();

	// setup required and optional tables
	t["map" + this.space + "Regions"] = false;
	t["map" + this.space + "Constellations"] = false;
	t["map" + this.space + "SolarSystems"] = false;
	if (this.space == "K" || this.space == "X") {
		if (this.c.jumps) {
			t["map" + this.space + "RegionJumps"] = false;
			t["map" + this.space + "ConstellationJumps"] = false;
			t["map" + this.space + "SolarSystemJumps"] = false;
		}
		if (this.c.belts) t["map" + this.space + "Belts"] = false;
		if (this.c.gates) t["map" + this.space + "Gates"] = false;
		if (this.c.landmarks) t.mapLandmarks = false;
	}
	if (this.c.planets) t["map" + this.space + "Planets"] = false;
	if (this.c.moons) t["map" + this.space + "Moons"] = false;
	if (this.c.stars) t["map" + this.space + "Stars"] = false;
	if (this.c.objects) t["map" + this.space + "SolarSystemObjects"] = false;

	thenDone = function(arg) {
		LoadDone.apply(self, [arg.table, arg.context]);
	};
	thenFail = function(arg) {
		LoadFail.apply(self, [arg.table, arg.context, arg.status, arg.error]);
	};
	if (o.progress !== null) {
		progressFunc = function(arg) {
			LoadProgress.apply(self, [arg, o.progress]);
		};
	}
	for (key in t) {
		if (!t.hasOwnProperty(key)) continue;
		t[key] = {
			tbl: this.src.GetTable(key),
			done: false
		};
		if (!t[key].tbl) return this.loadingP.reject({
			context: o.context,
			map: self,
			status: "error",
			error: "source does not contain requested table: " + key
		}).promise;
		t[key].tbl.Load({
			context: o.context,
			progress: progressFunc
		}).then(thenDone, thenFail);
	}

	return this.loadingP.promise;
};

function LoadInit() {
	var systbl = this.tables["map" + this.space + "SolarSystems"].tbl,
		colmap = systbl.colmap,
		solarSystemID,
		toSolarSystemID,
		system,
		i,
		sys;

	sys_cache = {};
	for (solarSystemID in systbl.data) {
		if (!systbl.data.hasOwnProperty(solarSystemID)) continue;
		system = systbl.data[solarSystemID];
		this.sysNameMap[system[colmap.solarSystemName]] = parseInt(solarSystemID, 10);
		this.sysNames.push(system[colmap.solarSystemName]);
		if (this.space != "J") {
			// create the routing graph used for path finding
			sys = {
				jumps: [],
				cont: system[colmap.contiguous],
				sec: system[colmap.security].toFixed(1),
				name: system[colmap.solarSystemName]
			};
			for (i = 0; i < system[colmap.jumps].length; i++) {
				toSolarSystemID = system[colmap.jumps][i];
				if (!systbl.data.hasOwnProperty(toSolarSystemID)) continue;
				sys.jumps.push(toSolarSystemID);
			}
			this.routeGraph[solarSystemID] = sys;
		}
	}
	this.sysNames.sort();
}

P.GetSystem = function(input) {
	var nSystemID,
		sSystemID;

	if (!input) return null;
	if (input.hasOwnProperty("name") && this.sysNameMap.hasOwnProperty(input.name)) nSystemID = this.sysNameMap[input.name];
	else if (input.hasOwnProperty("id")) nSystemID = parseInt(input.id, 10);
	else return null;
	sSystemID = nSystemID.toString(10);

	if (!sys_cache.hasOwnProperty(sSystemID)) {
		sys_cache[sSystemID] = System.Create(this.tables["map" + this.space + "SolarSystems"].tbl, nSystemID);
	}
	return sys_cache[sSystemID];
};

P.GetSystems = function() {
	return SystemIter.Create(this);
	// this.tables["map" + this.space + "SolarSystems"].tbl);
};

P.JumpDist = function(fromID, toID) {
	var systbl = this.tables["map" + this.space + "SolarSystems"].tbl,
		colmap = systbl.colmap,
		x1 = systbl.data[fromID][colmap.center][0],
		x2 = systbl.data[toID][colmap.center][0],
		y1 = systbl.data[fromID][colmap.center][1],
		y2 = systbl.data[toID][colmap.center][1],
		z1 = systbl.data[fromID][colmap.center][2],
		z2 = systbl.data[toID][colmap.center][2],
		dist;

	dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
	return dist / Const.M_per_LY;
};

P.Route = function(fromSystemID, toSystemID, avoidList, avoidLow, avoidHi) {
	var route = [],
		avoids = {},
		sFromID,
		sToID,
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
		dist;

	sFromID = parseInt(fromSystemID, 10).toString(10);
	sToID = parseInt(toSystemID, 10).toString(10);
	if (!this.routeGraph.hasOwnProperty(sFromID) || !this.routeGraph.hasOwnProperty(sToID)) return route;

	// reset the route graph
	for (solarSystemID in this.routeGraph) {
		if (!this.routeGraph.hasOwnProperty(solarSystemID)) continue;
		this.routeGraph[solarSystemID].td = -1;
		this.routeGraph[solarSystemID].prevID = -1;
		this.routeGraph[solarSystemID].visited = false;
	}

	// populate avoid list lookup table
	if (avoidList && avoidList.length > 0) {
		for (i = 0; i < avoidList.length; i++) {
			avoids[avoidList[i]] = true;
		}
	}

	if (sFromID === sToID) return route;

	// swap from/to to match EVE client?
	tmp = sFromID;
	sFromID = sToID;
	sToID = tmp;

	// Dijkstra's to find best route given options provided
	currentID = sFromID;
	this.routeGraph[sFromID].td = 0;
	while (!this.routeGraph[sToID].visited) {
		if (currentID != sFromID) {
			// find next node to try
			test_td = -1;
			testidx = -1;
			for (i = 0; i < testset.length; i++) {
				systemID = testset[i];
				if (this.routeGraph[systemID].visited) continue;
				if (avoids[systemID]) continue;
				sys_td = this.routeGraph[systemID].td;
				if (sys_td > 0 && (test_td == -1 || sys_td < test_td)) {
					currentID = systemID;
					test_td = sys_td;
					testidx = i;
				}
			}
			if (test_td == -1) return route; // no connection
			testset.splice(testidx, 1); // remove the node we just picked from the testset
		}
		for (i = 0; i < this.routeGraph[currentID].jumps.length; i++) {
			nID = this.routeGraph[currentID].jumps[i];
			dist = 1;
			//if (avoidLow && this.routeGraph[nID].sec < 0.5 && this.routeGraph[currentID].sec >= 0.5) dist = 1000;
			if (avoidLow && this.routeGraph[nID].sec < 0.5) dist = 1000;
			//if (avoidHi && this.routeGraph[nID].sec >= 0.5 && this.routeGraph[currentID].sec < 0.5) dist = 1000;
			if (avoidHi && this.routeGraph[nID].sec >= 0.5) dist = 1000;
			td = this.routeGraph[currentID].td + dist;
			if (this.routeGraph[nID].td < 0 || this.routeGraph[nID].td > td) {
				this.routeGraph[nID].td = td;
				this.routeGraph[nID].prevID = currentID;
				testset.push(nID);
			}
		}
		this.routeGraph[currentID].visited = true;
		currentID = 0;
	}

	// get the actual route found
	prevID = this.routeGraph[sToID].prevID;
	while (prevID != sFromID) {
		route.push(parseInt(prevID, 10));
		prevID = this.routeGraph[prevID].prevID;
	}
	route.push(parseInt(sFromID, 10));
	// route.reverse();
	// route.unshift(toSystemID);
	return route;
};
