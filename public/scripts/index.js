var buttonId=[
		'log',
		'logGmail',
		'sign'
	];  // default button ids

var buttonHref=[
	'home',
	'home',
	'signup'
];  // default button location href

var initPage = function() {
	// set button default location href
	for(var i=0; i<buttonId.length; i++){
		setBtnHref(buttonId[i], buttonHref[i]);
	}
}

var setBtnHref = function(id, href) {
	document.getElementById(id).addEventListener(
		'click',
		function() { location.href=href; },
		false
	);
}

initPage();