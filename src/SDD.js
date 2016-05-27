// var Utils = require('./Utils');

exports.Source = require("./SDD.Source");
exports.Source.json = require("./SDD.Source.json");
exports.Table = require("./SDD.Table");

// create a new data source of the type specified with the config provided;
// EVEoj.data.Source.<type> handles the implementation details
exports.Create = function(type, config) {
	if (typeof exports.Source[type] === "undefined" || typeof exports.Source[type].Create !== "function") return null;
	return exports.Source[type].Create(config);
};
