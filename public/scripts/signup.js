var inputId=[
			'uname',
			'email',
			'pswd',
			'confPswd',
			'zip'
		];  // default form input ids
var formValue=[
	'user name',
	'email',
	'password',
	'confirm password',
	'zip'
];  // default form input values

var initForm = function() {
	for(var i=0; i<inputId.length; i++) {
		setInputValues(inputId[i], formValue[i]);
	}
}

// graceful init and reset for id's input value
var setInputValues = function(id, value) {
	var inputElem=document.getElementById(id);

	// default value
	inputElem.value=value;

	// handle reset of value to default
	inputElem.addEventListener(
		'focus',
		function() { if(this.value === value) this.value=''; },
		false
	);
	inputElem.addEventListener(
		'blur',
		function() { if(this.value === '') this.value=value; },
		false
	);
}

initForm();