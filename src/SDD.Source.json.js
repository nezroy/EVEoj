var Utils = require("./Utils");
var req_browser_ignore = require;

if (Utils.isBrowser) {
	// AJAX-based JSON loader; only for browserify/standalone version
	module.exports = require("./SDD.Source.json_browser.js");
} else {
	// nodeFS based JSON loader; required in a way that browserify will ignore
	module.exports = req_browser_ignore("./SDD.Source.json_node.js");
}