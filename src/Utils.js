/* global jQuery: false */
var Promise = require("./Promise");

exports.isBrowser = typeof(window) !== "undefined";

var F = function() {};

exports.create = (typeof Object.create === "function") ?
	Object.create :
	function(o) {
		// object create polyfill (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
		if (arguments.length > 1) throw Error("Second argument not supported");
		if (o === null) throw Error("Cannot set a null [[Prototype]]");
		if (typeof(o) !== "object") throw TypeError("Argument must be an object");
		F.prototype = o;
		return new F();
	};

exports.FormatNum = function(val, fixed) {
	var stringy = [],
		base = String(Math.floor(val)),
		k = -1,
		i = 0,
		decimals;

	fixed = fixed || 0;

	for (i = base.length - 1; i >= 0; i--) {
		if (k % 3 === 0) {
			k = 1;
			stringy.push(",");
		} else if (k == -1) {
			k = 1;
		} else {
			k++;
		}
		stringy.push(base.charAt(i));
	}
	base = "";
	for (i = stringy.length - 1; i >= 0; i--) {
		base = base.concat(stringy[i]);
	}

	if (fixed > 0) {
		decimals = val.toFixed(fixed);
		base += decimals.substring(decimals.length - fixed - 1);
	}

	return base;
};

var ajaxP = function(url, settings, cb) {
	jQuery.ajax(url, settings).done(function(data, status, jqxhr) {
		cb(null, data);
	}).fail(function(jqxhr, status, error) {
		cb(error, null);
	});
};
exports.ajaxP = Promise.promisify(ajaxP);
