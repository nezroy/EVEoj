'use strict';

var extend = require('node.extend');

exports.Const = require('./Const.js');
exports.Utils = require('./Utils.js');
exports.SDD = require('./SDD.js');
exports.map = require('./map.js');
if (exports.Utils.isBrowser) {
	exports.IGB = require('./IGB.js');
}

exports.V_MAJOR = 0;
exports.V_MINOR = 2;
exports.V_PATCH = 0;
exports.VERSION = exports.V_MAJOR + '.' + exports.V_MINOR + '.' + exports.V_PATCH;
