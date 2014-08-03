'use strict';

var Utils = require('./Utils');
var req_browser_ignore = require;
		
if (Utils.isBrowser) {
	module.exports = require('./SDD.Source.json_browser.js');
}
else {
	module.exports = req_browser_ignore('./SDD.Source.json_node.js');
}
