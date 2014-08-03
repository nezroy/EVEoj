/* global jQuery: false */
'use strict';

// var extend = require('node.extend');

var F = function () {};

// implementations from external stuff (mostly jQuery) that might theoretically change later
exports.create = (typeof Object.create == 'function')
	? Object.create
	: function (o) {
		// object create polyfill (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create)
		if (arguments.length > 1) throw Error('Second argument not supported');
		if (o === null) throw Error('Cannot set a null [[Prototype]]');
		if (typeof o != 'object') throw TypeError('Argument must be an object');
		F.prototype = o;
		return new F();
	};
/*
ME.extend = $.extend;
ME.deferred = $.Deferred;
ME.ajax = $.ajax;
*/
exports.deferred = jQuery.Deferred;
exports.ajax = jQuery.ajax;
/*
function isBrowser() {
    return typeof(window) !== 'undefined';
}
isBrowser();
*/
exports.isBrowser = typeof(window) !== 'undefined';
exports.FormatNum = function (val, fixed) {
	var stringy = [],
		base = String(Math.floor(val)),
		k = -1,
		i = 0,
		decimals
		;
	
	fixed = fixed || 0;
	
	for (i = base.length - 1; i >= 0; i--) {
		if (k % 3 == 0) {
			k = 1;
			stringy.push(",");
		}
		else if (k == -1) {
			k = 1;
		}
		else {
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
