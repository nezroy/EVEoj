var EVEn = EVEn || {};

EVEn.inv = EVEn.inv || {};
(function ($) {
	var E = EVEn;
    var ME = EVEn.inv;
})(jQuery);

EVEn.inv.item = EVEn.inv.item || {};
(function ($) {
	var E = EVEn;
	var I = EVEn.inv;
    var ME = EVEn.inv.item;
	
	ME.ID = null;
	ME.groupID = null;
	ME.name = null;
	ME.desc = null;
	ME.mass = 0;
	ME.volume = 0.0;
	ME.capacity = 0;
	ME.portionSize = 1;
	ME.raceID = null;
	ME.basePrice = 0.0;
	ME.published = false;
	ME.marketGroupID = null;
	ME.chanceOfDuplicating = 0.0;
	
	ME.LoadFromObj = function (obj) {
		if (typeof obj !== 'object') return false;
		
		
		
		
		if (typeof typeID === 'number') typeID = "" + typeID;
		if (typeof typeID !== 'string') return false;
		
		
	};

})(jQuery);
