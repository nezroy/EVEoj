'use strict';
var extend = require('node.extend');
var Utils = require('./Utils.js');

// var P = exports.P = {}; // public methods

exports.D = {
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
	'corridor': null,
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
};
exports.Create = function (tbl, ID) {	
	var obj,
		sys,
		col
		;
		
	sys = tbl.GetEntry(ID);
	if (!sys) return null;
	obj = Utils.create(P);
	extend(true, obj, exports.D);
	col = tbl.colmap;
	
	obj.ID = ID;
	obj.name = sys[col['solarSystemName']];
	obj.regionID = sys[col['regionId']];
	obj.constellationID = sys[col['constellationID']];
	obj.pos = {'x': sys[col['x']], 'y': sys[col['y']], 'z': sys[col['z']]};
	obj.posMin = {'x': sys[col['xMin']], 'y': sys[col['yMin']], 'z': sys[col['zMin']]};
	obj.posMax = {'x': sys[col['xMax']], 'y': sys[col['yMax']], 'z': sys[col['zMax']]};
	obj.luminosity = sys[col['luminosity']];
	obj.border = sys[col['border']];
	obj.fringe = sys[col['fringe']];
	obj.corridor = sys[col['corridor']];
	obj.hub = sys[col['hub']];
	obj.international = sys[col['international']];
	obj.regional = sys[col['regional']];
	obj.constellation = sys[col['constellation']];
	obj.contiguous = sys[col['contiguous']];
	obj.security = sys[col['security']];
	obj.sec = obj.security.toFixed(1);
	obj.factionID = (sys[col['factionID']] != 0) ? sys[col['factionID']] : null;
	obj.radius = sys[col['radius']];
	obj.sunTypeID = sys[col['sunTypeID']];
	obj.securityClass = sys[col['securityClass']];
	obj.wormholeClassID = sys[col['wormholeClassID']];
	obj.stationCount = (sys[col['stationCount']]) ? sys[col['stationCount']] : 0;

	return obj;
};
