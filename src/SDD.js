EVEoj.SDD = EVEoj.SDD || {};
(function () {

var ME = EVEoj.SDD,
	E = EVEoj
	;

// create a new data source of the type specified with the config provided;
// EVEoj.data.Source.<type> handles the implementation details
ME.Create = function(type, config) {
	if (typeof ME.Source[type] == 'undefined' || typeof ME.Source[type].Create != 'function') return null;
	return ME.Source[type].Create(config);
};
	
})();
