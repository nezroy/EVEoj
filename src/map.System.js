var extend = require("node.extend");
var Utils = require("./Utils");

var P = exports.P = {}; // public methods

exports.D = {
	ID: null,
	name: null,
	regionID: null,
	constellationID: null,
	pos: {
		x: null,
		y: null,
		z: null
	},
	posMax: {
		x: null,
		y: null,
		z: null
	},
	posMin: {
		x: null,
		y: null,
		z: null
	},
	border: null,
	fringe: null,
	corridor: null,
	hub: null,
	international: null,
	regional: null,
	constellation: null,
	contiguous: null,
	security: null,
	sec: null,
	radius: null,
	securityClass: null,
	wormholeClassID: null,
	stationCount: null,
	jumps: null
};
exports.Create = function(tbl, ID) {
	var obj,
		sys,
		col,
		nID;

	nID = parseInt(ID, 10);

	sys = tbl.GetEntry(nID);
	if (!sys) return null;
	obj = Utils.create(P);
	extend(true, obj, exports.D);
	col = tbl.colmap;

	obj.ID = nID;
	obj.name = sys[col.solarSystemName];
	obj.regionID = sys[col.regionID];
	obj.constellationID = sys[col.constellationID];
	obj.pos = {
		x: sys[col.center][0],
		y: sys[col.center][1],
		z: sys[col.center][2]
	};
	obj.posMin = {
		x: sys[col.min][0],
		y: sys[col.min][1],
		z: sys[col.min][2]
	};
	obj.posMax = {
		x: sys[col.max][0],
		y: sys[col.max][1],
		z: sys[col.max][2]
	};
	obj.border = sys[col.border];
	obj.fringe = sys[col.fringe];
	obj.corridor = sys[col.corridor];
	obj.hub = sys[col.hub];
	obj.international = sys[col.international];
	obj.regional = sys[col.regional];
	obj.constellation = sys[col.constellation];
	obj.contiguous = sys[col.contiguous];
	obj.security = sys[col.security];
	obj.sec = (obj.security > 0) ? obj.security.toFixed(1) : "0.0";
	obj.radius = sys[col.radius];
	obj.securityClass = sys[col.securityClass];
	obj.wormholeClassID = sys[col.wormholeClassID];
	obj.stationCount = (sys[col.stationCount]) ? sys[col.stationCount] : 0;
	obj.jumps = sys[col.jumps];

	return obj;
};
