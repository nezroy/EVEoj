/* global Promise: false */
var isBrowser = typeof(window) !== "undefined";
var req_browser_ignore = require;
if (isBrowser) {
	// in browser, BlueBird embedded already by uglify
	//console.log("in browser require utils");
	//console.log("Promise: " + Promise);
	module.exports = Promise;
	//module.exports = require("bluebird");
} else {
	// bluebird required in a way that browserify will ignore (since using custom built for standalone)    
	module.exports = req_browser_ignore("bluebird");
}
