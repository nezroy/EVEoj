"use strict";

// var Utils = require('./Utils');

exports.Source = require("./SDD.Source.js");
exports.Source.json = require("./SDD.Source.json.js");
exports.Table = require("./SDD.Table.js");

// create a new data source of the type specified with the config provided;
// EVEoj.data.Source.<type> handles the implementation details
exports.Create = function(type, config) {
	if (typeof exports.Source[type] === "undefined" || typeof exports.Source[type].Create !== "function") return null;
	return exports.Source[type].Create(config);
};