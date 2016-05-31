/* globals window: false */
var isBrowser = typeof(window) !== "undefined";
var exp;

if (isBrowser) {
	exp = window.testprops = {};
} else {
	exp = exports;
}

exp.SDD_file_path = "D:\\projects\\eveoj\\static\\sdd\\201605310";
exp.SDD_URL_path = "http://cf.eve-oj.dev/sdd/201605310";
exp.SDD_version = 201605310;
exp.SDD_verdesc = "YC 118.5";
exp.SDD_schema = 201604290;
