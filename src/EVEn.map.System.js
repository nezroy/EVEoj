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
