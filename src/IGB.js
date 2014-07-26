var EVEoj = EVEoj || {};
EVEoj.IGB = EVEoj.IGB || {};
(function ($) {
	var ME = EVEoj.IGB,
		E = EVEoj, 
		
		/* private functions */
		_IGBClick, // basic click handler for IGB scheme
		_Ready // runs when DOM ready fires		
		;
		
	_IGBClick = function (ev) {
		var corp_id,
			chan,
			cctype,
			trustme,
			trust_req = false,
			href
			;
		
		href = $(this).attr('href');
		if (!href.match(/^eve:/i)) return; // huh.. that's odd
		ev.preventDefault();		

		if (href.match(/^eve:trust:/i)) trust_req = true;
		href = href.replace(/^eve:\s*/i, '').replace(/^trust:\s*/i, '');
		
		/*
		if (typeof(navigator) != 'undefined' && navigator.hasOwnProperty('userAgent') && !navigator.userAgent.match(/EVE\-IGB/)) {
			// straight browser detection for IGB
			return;
		}
		*/
		if (typeof(CCPEVE) == 'undefined') {
			// impl based detection for IGB
			return;
		}
		
		corp_id = $(this).data('igb-corpid');
		chan = $(this).data('igb-chan');
		cctype = $(this).data('igb-cctype');		
		trustme = $(this).data('igb-trustme');
	
		if (corp_id && corp_id > 0) CCPEVE.showInfo(2, corp_id);
		if (chan) CCPEVE.joinChannel(chan);
		if (cctype) CCPEVE.createContract(cctype);
		if (trustme) CCPEVE.requestTrust(trustme);	
	};
	
	_Ready = function () {
		$("a[href^='eve:']").click(_IGBClick);	
	};
		
	$(_Ready);	
	
})(jQuery);
