/* globals window: false */
var isBrowser = typeof(window) !== "undefined";
var exp;

if (isBrowser) {
    exp = window.testprops = {};
}
else {
    exp = exports;
}

exp.SDD_file_path = "D:\\projects\\xyjax\\static\\sdd\\109795";
exp.SDD_URL_path = "http://static.xyjax.dev/sdd/109795";
exp.SDD_version = 109795;
exp.SDD_verdesc = "Proteus 1.0";
exp.SDD_schema = 109013;
