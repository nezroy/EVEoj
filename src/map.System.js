EVEoj.map.System = EVEoj.map.System || {};
(function () {

var ME = EVEoj.map.System,
	// namespace quick refs
	E = EVEoj,
	M = EVEoj.map,
	
	_P = {}, // private methods
	P = {} // public methods
	;		
ME.P = P;

ME.D = {
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
ME.Create = function (tbl, ID) {	
	var obj,
		sys,
		col
		;
		
	sys = tbl.GetEntry(ID);
	if (!sys) return null;
	obj = E.create(P);
	E.extend(true, obj, ME.D);
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
	
})();

EVEoj.map.SystemIter = EVEoj.map.SystemIter || {};
(function () {

var ME = EVEoj.map.SystemIter,
	// namespace quick refs
	E = EVEoj,
	M = EVEoj.map,
	SYS = EVEoj.map.System,
	
	_P = {}, // private methods
	P = {} // public methods
	;
ME.P = P;

ME.D = {
	// default object properties
	'curidx': 0,
	'tbl': null,
	'keyset': []
};
ME.Create = function (tbl) {
	var obj,
		key
		;

	obj = E.create(P);
	E.extend(true, obj, ME.D);
	obj.tbl = tbl;
	
	for (key in tbl.data) {
		if (!tbl.data.hasOwnProperty(key)) continue;
		obj.keyset.push(key);
	}
	
	return obj;	
};

P.HasNext = function () {
	if (this.curidx < this.keyset.length) return true;
};

P.Next = function () {
	return SYS.Create(this.tbl, this.keyset[this.curidx++]);
};
	
})();
