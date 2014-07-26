var EVE-Oj = EVE-Oj || {};

EVE-Oj.inv = EVE-Oj.inv || {};
(function ($) {
	var E = EVE-Oj;
    var ME = EVE-Oj.inv;
})(jQuery);

EVE-Oj.inv.item = EVE-Oj.inv.item || {};
(function ($) {
	var E = EVE-Oj;
	var I = EVE-Oj.inv;
    var ME = EVE-Oj.inv.item;
	
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
