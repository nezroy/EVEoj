/* global jQuery: false */
/* global CCPEVE: false */
"use strict";

var $ = jQuery;

function IGBClick(ev) {
	var corp_id,
		chan,
		cctype,
		trustme,
		trust_req = false,
		href
		;
	
	href = $(this).attr("href");
	if (!href.match(/^eve:/i)) return; // huh.. that's odd
	ev.preventDefault();		

	if (href.match(/^eve:trust:/i)) trust_req = true;
	href = href.replace(/^eve:\s*/i, "").replace(/^trust:\s*/i, "");
	
	/*
	if (typeof(navigator) != 'undefined' && navigator.hasOwnProperty('userAgent') && !navigator.userAgent.match(/EVE\-IGB/)) {
		// straight browser detection for IGB
		return;
	}
	*/
	if (typeof(CCPEVE) == "undefined") {
		// impl based detection for IGB
		return;
	}
	
	corp_id = $(this).data("igb-corpid");
	chan = $(this).data("igb-chan");
	cctype = $(this).data("igb-cctype");
	trustme = $(this).data("igb-trustme");

	if (corp_id && corp_id > 0) CCPEVE.showInfo(2, corp_id);
	if (chan) CCPEVE.joinChannel(chan);
	if (cctype) CCPEVE.createContract(cctype);
	if (trustme) CCPEVE.requestTrust(trustme);	
}

$(function () {
	$("a[href^='eve:']").click(IGBClick);
});	
