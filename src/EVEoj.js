exports.Const = require("./Const");
exports.Utils = require("./Utils");
exports.SDD = require("./SDD");
exports.map = require("./map");
if (exports.Utils.isBrowser) {
	exports.IGB = require("./IGB");
}

exports.V_MAJOR = 0;
exports.V_MINOR = 3;
exports.V_PATCH = 1;
exports.VERSION = exports.V_MAJOR + "." + exports.V_MINOR + "." + exports.V_PATCH;
