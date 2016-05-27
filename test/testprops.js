/* globals window: false */
var isBrowser = typeof(window) !== "undefined";
var exp;

if (isBrowser) {
	exp = window.testprops = {};
} else {
	exp = exports;
}

exp.SDD_file_path = "D:\\projects\\xyjax\\static\\sdd\\201604290";
exp.SDD_URL_path = "http://static.xyjax.dev/sdd/201604290";
exp.SDD_version = 201604290;
exp.SDD_verdesc = "Citadel 1.1";
exp.SDD_schema = 201604290;
