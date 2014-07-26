var EVE-Oj = EVE-Oj || {};

EVE-Oj.dogma = EVE-Oj.dogma || {};
(function ($) {
	var E = EVE-Oj;
    var ME = EVE-Oj.dogma;
	
	ME.A_name = "n";
	ME.A_bonus = "b";
	ME.A_mass = "m";
	ME.A_agility = "a";
	ME.A_maxVelocity = "mV";
	ME.A_warpSpeedMultiplier = "wSM";
	ME.A_advancedAgility = "aA";
	ME.A_unitID = "u#";
	ME.A_attrID = "a#";
	
})(jQuery);

EVE-Oj.dogma.pilot = EVE-Oj.dogma.pilot || {};
(function ($) {
	var E = EVE-Oj;
	var G = EVE-Oj.dogma;
    var ME = EVE-Oj.dogma.pilot;
	
	ME.name = "no skills";
	ME.skills = {};
	ME.implants = [0,0,0,0,0,0,0,0,0,0];
	
	ME.SetImplant = function (slot, typeID) {
		if (typeof slot !== 'number' || slot < 1 || slot > 10) return false;
		typeID = E.CheckType(typeID);
		if (typeof typeID === 'undefined') return false;
		
		this.implants[slot - 1, typeID];
		return true;
	};
	
	ME.GetImplant = function (slot) {
		if (typeof slot !== 'number' || slot < 1 || slot > 10) return false;
		return this.implants[slot - 1];
	};
})(jQuery);

EVE-Oj.dogma.ship = EVE-Oj.dogma.ship || Object.create(EVE-Oj.inv.item);
(function ($) {
	var E = EVE-Oj;
	var G = EVE-Oj.dogma;
    var ME = EVE-Oj.dogma.ship;
	
	ME.agility = 1.0;
	ME.maxVelocity = 200;
	ME.warpSpeedMultiplier = 1.0;
	ME.advancedAgility = 0;

})(jQuery);
